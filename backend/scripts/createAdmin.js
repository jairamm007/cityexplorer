const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const createLocalAuthIdentity = () => {
  const _id = new mongoose.Types.ObjectId();
  return { _id, googleId: `local:${_id}` };
};

const createAdmin = async () => {
  const adminName = process.env.ADMIN_NAME;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminName || !adminEmail || !adminPassword) {
    console.error('ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD are required.');
    process.exit(1);
  }

  try {
    await connectDB();

    const normalizedEmail = adminEmail.trim().toLowerCase();
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      existingUser.name = adminName;
      existingUser.password = hashedPassword;
      existingUser.role = 'admin';
      existingUser.authProvider = 'local';
      existingUser.isVerified = true;
      await existingUser.save();
      console.log(`Updated existing user ${normalizedEmail} to admin.`);
    } else {
      await User.create({
        ...createLocalAuthIdentity(),
        name: adminName,
        email: normalizedEmail,
        password: hashedPassword,
        authProvider: 'local',
        role: 'admin',
        isVerified: true,
      });
      console.log(`Created admin account ${normalizedEmail}.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Unable to create admin account:', error.message);
    process.exit(1);
  }
};

createAdmin();
