const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const hasDuplicateName = async (name) => {
  const normalizedName = name.trim();
  const existingUser = await User.findOne({
    name: { $regex: `^${escapeRegExp(normalizedName)}$`, $options: 'i' },
  });

  return Boolean(existingUser);
};

const serializeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  authProvider: user.authProvider,
  isVerified: user.isVerified,
  phone: user.phone,
  phoneVerified: user.phoneVerified,
  profileImage: user.profileImage,
  bio: user.bio,
  location: user.location,
  createdAt: user.createdAt,
});

const registerUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  const { name, email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedName = name.trim();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (await hasDuplicateName(normalizedName)) {
      return res.status(400).json({ message: 'Profile name already taken, use another one' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: 'local',
      isVerified: true,
    });

    res.status(201).json({
      message: 'Account created successfully.',
      user: serializeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (user.authProvider === 'google' && !user.password) {
      return res.status(401).json({ message: 'This account uses Google sign-in. Please continue with Google.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.json({
      user: serializeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

const googleSignIn = async (req, res) => {
  const { credential } = req.body;

  if (!process.env.GOOGLE_CLIENT_ID) {
    return res.status(500).json({ message: 'Google sign-in is not configured on the server.' });
  }

  if (!credential) {
    return res.status(400).json({ message: 'Google credential is required' });
  }

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const normalizedEmail = payload?.email?.trim().toLowerCase();

    if (!payload || !normalizedEmail) {
      return res.status(400).json({ message: 'Unable to read Google account details' });
    }

    if (!payload.email_verified) {
      return res.status(401).json({ message: 'Google account email is not verified' });
    }

    const requestedName = payload.name || normalizedEmail.split('@')[0];

    let user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      const duplicateName = await User.findOne({
        name: { $regex: `^${escapeRegExp(requestedName.trim())}$`, $options: 'i' },
      });

      if (duplicateName) {
        return res.status(400).json({ message: 'Profile name already taken, use another one' });
      }

      user = await User.create({
        name: requestedName.trim(),
        email: normalizedEmail,
        authProvider: 'google',
        googleId: payload.sub,
        isVerified: true,
        profileImage: payload.picture,
      });
    } else {
      user.googleId = user.googleId || payload.sub;
      user.authProvider = user.authProvider === 'local' && user.password ? 'local' : 'google';
      user.isVerified = true;
      if (!user.profileImage && payload.picture) {
        user.profileImage = payload.picture;
      }
      await user.save();
    }

    res.json({
      user: serializeUser(user),
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error('Google sign-in failed:', error.message);
    res.status(401).json({
      message: process.env.NODE_ENV === 'production' ? 'Google sign-in failed. Please try again.' : `Google sign-in failed: ${error.message}`,
    });
  }
};

const getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, googleSignIn, getProfile };
