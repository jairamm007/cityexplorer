const User = require('../models/User');
const Attraction = require('../models/Attraction');
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');

const populatedUserQuery = (userId) =>
  User.findById(userId)
    .select('-password -verificationToken -resetPasswordToken')
    .populate('favoriteDestinations', 'cityName country imageUrl')
    .populate({
      path: 'favoriteAttractions',
      select: 'name category location imageUrl ticketPrice cityId',
      populate: {
        path: 'cityId',
        select: 'cityName country',
      },
    })
    .populate({
      path: 'plannedTrips.attractionId',
      select: 'name category location imageUrl ticketPrice cityId',
      populate: {
        path: 'cityId',
        select: 'cityName country',
      },
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

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await populatedUserQuery(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, bio, phone, location, profileImage } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name !== undefined) {
      const trimmedName = name.trim();

      if (await isDuplicateProfileName(trimmedName, req.user.id)) {
        return res.status(400).json({ message: 'Profile name already taken, use another one' });
      }

      user.name = trimmedName;
    }
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) {
      const trimmedPhone = phone.trim();
      if (trimmedPhone !== (user.phone || '')) {
        user.phoneVerified = false;
      }
      user.phone = trimmedPhone;
    }
    if (location !== undefined) user.location = location;
    if (profileImage !== undefined) user.profileImage = profileImage;

    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);

    res.json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while updating password' });
  }
};

// Add city to favorites
const addFavoriteCity = async (req, res) => {
  const { cityId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.favoriteDestinations.some((id) => id.toString() === cityId)) {
      user.favoriteDestinations.push(cityId);
      await user.save();
    }

    const updatedUser = await populatedUserQuery(req.user.id);

    res.json({ message: 'City added to favorites', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove city from favorites
const removeFavoriteCity = async (req, res) => {
  const { cityId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteDestinations = user.favoriteDestinations.filter(
      (id) => id.toString() !== cityId
    );
    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);

    res.json({ message: 'City removed from favorites', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select an image to upload' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profileImage = `/uploads/images/${req.file.filename}`;
    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);

    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: user.profileImage,
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error while uploading profile image' });
  }
};

const addFavoriteAttraction = async (req, res) => {
  const { attractionId } = req.body;

  try {
    const [user, attraction] = await Promise.all([
      User.findById(req.user.id),
      Attraction.findById(attractionId),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    if (!user.favoriteAttractions.some((id) => id.toString() === attractionId)) {
      user.favoriteAttractions.push(attractionId);
      await user.save();
    }

    const updatedUser = await populatedUserQuery(req.user.id);
    res.json({ message: 'Attraction added to favorites', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removeFavoriteAttraction = async (req, res) => {
  const { attractionId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.favoriteAttractions = user.favoriteAttractions.filter(
      (id) => id.toString() !== attractionId
    );
    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);
    res.json({ message: 'Attraction removed from favorites', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const addPlannedTrip = async (req, res) => {
  const { attractionId, visitDate, travelers, notes, bookingStatus } = req.body;

  try {
    const [user, attraction] = await Promise.all([
      User.findById(req.user.id),
      Attraction.findById(attractionId),
    ]);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }

    const alreadyPlanned = user.plannedTrips.some(
      (trip) => trip.attractionId.toString() === attractionId
    );

    if (alreadyPlanned) {
      return res.status(400).json({ message: 'This place is already in your plans' });
    }

    user.plannedTrips.push({
      attractionId,
      visitDate: visitDate || undefined,
      travelers: travelers || 1,
      notes: notes || '',
      bookingStatus: bookingStatus === 'booked' ? 'booked' : 'saved',
      bookedAt: new Date(),
    });
    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);
    res.status(201).json({ message: 'Place added to your plans', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const removePlannedTrip = async (req, res) => {
  const { tripId } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.plannedTrips = user.plannedTrips.filter((trip) => trip._id.toString() !== tripId);
    await user.save();

    const updatedUser = await populatedUserQuery(req.user.id);
    res.json({ message: 'Place removed from your plans', user: updatedUser });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const deleteUserAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error while deleting account' });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  uploadProfileImage,
  updatePassword,
  addFavoriteCity,
  removeFavoriteCity,
  addFavoriteAttraction,
  removeFavoriteAttraction,
  addPlannedTrip,
  removePlannedTrip,
  deleteUserAccount,
};
