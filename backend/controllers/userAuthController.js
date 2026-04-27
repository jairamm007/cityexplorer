const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateProfileNameSuggestions } = require('../utils/profileNameSuggestions');
const { isProfileNameTaken, normalizeProfileName, toProfileNameKey } = require('../utils/profileName');
const { generateToken } = require('../utils/jwt');

const googleClient = process.env.GOOGLE_CLIENT_ID ? new OAuth2Client(process.env.GOOGLE_CLIENT_ID) : null;

const isLocalPlaceholderGoogleId = (value) => typeof value === 'string' && value.startsWith('local:');

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
  const normalizedName = normalizeProfileName(name);

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    if (await isProfileNameTaken(normalizedName)) {
      const suggestions = await generateProfileNameSuggestions(normalizedName);
      return res.status(400).json({
        message: 'Profile name already taken, use another one',
        suggestions,
      });
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
    console.error('Registration failed:', error.message);

    if (error.code === 11000) {
      if (error.keyPattern?.email) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      if (error.keyPattern?.nameKey) {
        const suggestions = await generateProfileNameSuggestions(normalizedName);
        return res.status(400).json({
          message: 'Profile name already taken, use another one',
          suggestions,
        });
      }

      if (error.keyPattern?.googleId) {
        return res.status(400).json({ message: 'Account identity conflict. Please try again.' });
      }
    }

    res.status(500).json({ message: 'Unable to create account. Please try again.' });
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

  const { identifier, password } = req.body;
  const normalizedIdentifier = normalizeProfileName(identifier);
  const normalizedEmail = normalizedIdentifier.toLowerCase();
  const normalizedNameKey = toProfileNameKey(normalizedIdentifier);
  try {
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { nameKey: normalizedNameKey }],
    });
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
      if (await isProfileNameTaken(requestedName)) {
        const suggestions = await generateProfileNameSuggestions(requestedName);
        return res.status(400).json({
          message: 'Profile name already taken, use another one',
          suggestions,
        });
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
      user.googleId = !user.googleId || isLocalPlaceholderGoogleId(user.googleId) ? payload.sub : user.googleId;
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

const checkProfileNameAvailability = async (req, res) => {
  const requestedName = normalizeProfileName(req.query.name);
  const excludeUserId = req.user?.id || req.user?._id || null;

  if (!requestedName) {
    return res.status(400).json({ message: 'Profile name is required' });
  }

  try {
    const taken = await isProfileNameTaken(requestedName, excludeUserId);
    const suggestions = taken ? await generateProfileNameSuggestions(requestedName) : [];

    res.json({
      available: !taken,
      name: requestedName,
      suggestions,
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to check profile name' });
  }
};

const getProfile = (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authorized' });
  }
  res.json({ user: req.user });
};

module.exports = { registerUser, loginUser, googleSignIn, checkProfileNameAvailability, getProfile };
