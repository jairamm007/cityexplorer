const { validationResult } = require('express-validator');
const User = require('../models/User');
const City = require('../models/City');
const Attraction = require('../models/Attraction');

const buildCountMap = (items) =>
  items.reduce((acc, item) => {
    if (item._id) {
      acc[item._id.toString()] = item.count;
    }
    return acc;
  }, {});

const getUsers = async (req, res) => {
  try {
    const [users, cityCounts, attractionCounts] = await Promise.all([
      User.find({})
        .select('-password -verificationToken -resetPasswordToken')
        .sort({ createdAt: -1 }),
      City.aggregate([
        { $match: { createdBy: { $ne: null } } },
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
      ]),
      Attraction.aggregate([
        { $match: { createdBy: { $ne: null } } },
        { $group: { _id: '$createdBy', count: { $sum: 1 } } },
      ]),
    ]);

    const cityCountMap = buildCountMap(cityCounts);
    const attractionCountMap = buildCountMap(attractionCounts);

    res.json(
      users.map((user) => ({
        ...user.toObject(),
        cityCount: cityCountMap[user._id.toString()] || 0,
        attractionCount: attractionCountMap[user._id.toString()] || 0,
      }))
    );
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch users' });
  }
};

const updateUserRole = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      errors: errors.array(),
    });
  }

  try {
    const userId = req.params.id;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.role = req.body.role;
    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user role' });
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot delete your own account from admin tools' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete user' });
  }
};

module.exports = { getUsers, updateUserRole, deleteUser };