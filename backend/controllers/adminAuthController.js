const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const City = require('../models/City');
const Attraction = require('../models/Attraction');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
};

const bootstrapAdmin = async () => {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    return null;
  }

  const bcryptHash = await bcrypt.hash(adminPassword, 10);
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (existingAdmin) {
    existingAdmin.name = adminName;
    existingAdmin.password = bcryptHash;
    existingAdmin.role = 'admin';
    existingAdmin.authProvider = 'local';
    existingAdmin.isVerified = true;
    await existingAdmin.save();
    return existingAdmin;
  }

  return User.create({
    name: adminName,
    email: adminEmail,
    password: bcryptHash,
    authProvider: 'local',
    role: 'admin',
    isVerified: true,
  });
};

const serializeAdminUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  profileImage: user.profileImage || '',
  role: user.role,
  authProvider: user.authProvider,
  isVerified: user.isVerified,
  createdAt: user.createdAt,
});

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isDuplicateProfileName = async (name, userId) => {
  const normalizedName = name.trim();
  const existingUser = await User.findOne({
    _id: { $ne: userId },
    name: { $regex: `^${escapeRegExp(normalizedName)}$`, $options: 'i' },
  });

  return Boolean(existingUser);
};

const adminLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  const { email, password } = req.body;
  const normalizedEmail = email.trim().toLowerCase();
  const bootstrapEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const bootstrapPassword = process.env.ADMIN_PASSWORD;

  try {
    const user = await User.findOne({ email: normalizedEmail });
    if (user && user.role === 'admin' && user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Admin credentials are invalid' });
      }

      return res.json({
        user: serializeAdminUser(user),
        token: generateToken(user._id),
      });
    }

    if (bootstrapEmail && bootstrapPassword && normalizedEmail === bootstrapEmail && password === bootstrapPassword) {
      const adminUser = await bootstrapAdmin();

      return res.json({
        user: serializeAdminUser(adminUser),
        token: generateToken(adminUser._id),
      });
    }

    if (!user || user.role !== 'admin' || !user.password) {
      return res.status(401).json({ message: 'Admin credentials are invalid' });
    }

    return res.status(401).json({ message: 'Admin credentials are invalid' });
  } catch (error) {
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

const getAdminProfile = (req, res) => {
  res.json({ user: serializeAdminUser(req.user) });
};

const updateAdminProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  const { name, profileImage } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (await isDuplicateProfileName(trimmedName, req.user.id)) {
        return res.status(400).json({ message: 'Profile name already taken, use another one' });
      }

      user.name = trimmedName;
    }

    if (profileImage !== undefined) {
      user.profileImage = profileImage;
    }

    await user.save();

    res.json({
      message: 'Admin profile updated successfully',
      user: serializeAdminUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update admin profile' });
  }
};

const uploadAdminProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image to upload' });
    }

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    user.profileImage = `/uploads/images/${req.file.filename}`;
    await user.save();

    res.json({
      message: 'Admin profile image uploaded successfully',
      profileImage: user.profileImage,
      user: serializeAdminUser(user),
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to upload admin profile image' });
  }
};

const updateAdminPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(404).json({ message: 'Admin user not found' });
    }

    if (!user.password) {
      return res.status(400).json({ message: 'Password-based login is not enabled for this account' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.authProvider = 'local';
    await user.save();

    res.json({ message: 'Admin password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update admin password' });
  }
};

const getAdminOverview = async (req, res) => {
  try {
    const [userCount, adminCount, cityCount, attractionCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      City.countDocuments(),
      Attraction.countDocuments(),
    ]);

    res.json({
      totals: {
        users: userCount,
        admins: adminCount,
        cities: cityCount,
        attractions: attractionCount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to load admin overview' });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  updateAdminProfile,
  uploadAdminProfileImage,
  updateAdminPassword,
  getAdminOverview,
};