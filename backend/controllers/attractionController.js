const { validationResult } = require('express-validator');
const Attraction = require('../models/Attraction');
const Review = require('../models/Review');

const CREATED_BY_FIELDS = 'name email';

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const resolveImageUrl = (req, existingImageUrl) => {
  if (req.file) {
    return `/uploads/images/${req.file.filename}`;
  }

  if (typeof req.body.imageUrl === 'string') {
    const trimmed = req.body.imageUrl.trim();
    return trimmed;
  }

  return existingImageUrl;
};

const buildAttractionPayload = (payload) => ({
  cityId: payload.cityId,
  name: payload.name,
  description: payload.description,
  location: payload.location,
  category: payload.category,
  imageUrl: payload.imageUrl,
  latitude: normalizeNumber(payload.latitude),
  longitude: normalizeNumber(payload.longitude),
  timings: payload.timings,
  ticketPrice: payload.ticketPrice,
  bestTimeToVisit: payload.bestTimeToVisit,
  travelTips: payload.travelTips,
});

const canManageAttraction = (doc, user) =>
  Boolean(user && (user.role === 'admin' || (doc.createdBy && doc.createdBy.toString() === user._id.toString())));

const parseLimit = (value, max = 200) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.min(parsed, max);
};

const attachReviewStats = async (attractions) => {
  if (!attractions.length) {
    return attractions;
  }

  const attractionIds = attractions.map((item) => item._id);
  const reviewStats = await Review.aggregate([
    {
      $match: {
        attractionId: { $in: attractionIds },
      },
    },
    {
      $group: {
        _id: '$attractionId',
        averageRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  const statsMap = reviewStats.reduce((acc, item) => {
    acc[item._id.toString()] = {
      averageRating: Number(item.averageRating.toFixed(1)),
      reviewCount: item.reviewCount,
    };
    return acc;
  }, {});

  return attractions.map((item) => {
    const doc = item.toObject ? item.toObject() : item;
    const stats = statsMap[item._id.toString()] || { averageRating: 0, reviewCount: 0 };
    return { ...doc, ...stats };
  });
};

const getAttractions = async (req, res) => {
  try {
    const query = {};
    const limit = parseLimit(req.query.limit);
    const includeOwner = req.query.includeOwner !== 'false';
    if (req.query.cityId) {
      query.cityId = req.query.cityId;
    }
    if (req.query.q) {
      const search = req.query.q.trim();
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }
    if (req.query.category) {
      query.category = { $regex: req.query.category.trim(), $options: 'i' };
    }

    let attractionsQuery = Attraction.find(query)
      .populate('cityId', 'cityName country state latitude longitude')
      .sort({ createdAt: -1 });

    if (includeOwner) {
      attractionsQuery = attractionsQuery.populate('createdBy', CREATED_BY_FIELDS);
    }

    if (limit) {
      attractionsQuery = attractionsQuery.limit(limit);
    }

    const attractions = await attractionsQuery.lean();
    const enrichedAttractions = await attachReviewStats(attractions);
    res.json(enrichedAttractions);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch attractions' });
  }
};

const getAttractionById = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id)
      .populate('cityId', 'cityName country state latitude longitude')
      .populate('createdBy', CREATED_BY_FIELDS);
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }
    const [enrichedAttraction] = await attachReviewStats([attraction]);
    res.json(enrichedAttraction);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load attraction details' });
  }
};

const createAttraction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    cityId,
    name,
    description,
    location,
    category,
    latitude,
    longitude,
    timings,
    ticketPrice,
    bestTimeToVisit,
    travelTips,
  } = req.body;

  try {
    const attraction = await Attraction.create({
      ...buildAttractionPayload({
        cityId,
        name,
        description,
        location,
        category,
        imageUrl: resolveImageUrl(req, undefined),
        latitude,
        longitude,
        timings,
        ticketPrice,
        bestTimeToVisit,
        travelTips,
      }),
      createdBy: req.user._id,
    });
    const populatedAttraction = await Attraction.findById(attraction._id)
      .populate('cityId', 'cityName country state latitude longitude')
      .populate('createdBy', CREATED_BY_FIELDS);
    const [enrichedAttraction] = await attachReviewStats([populatedAttraction]);
    res.status(201).json(enrichedAttraction);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create attraction' });
  }
};

const updateAttraction = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }
    if (!canManageAttraction(attraction, req.user)) {
      return res.status(403).json({ message: 'You can only edit places added by you' });
    }

    Object.assign(
      attraction,
      buildAttractionPayload({
        ...req.body,
        imageUrl: resolveImageUrl(req, attraction.imageUrl),
      })
    );
    await attraction.save();

    const populatedAttraction = await Attraction.findById(attraction._id)
      .populate('cityId', 'cityName country state latitude longitude')
      .populate('createdBy', CREATED_BY_FIELDS);
    const [enrichedAttraction] = await attachReviewStats([populatedAttraction]);
    res.json(enrichedAttraction);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update attraction' });
  }
};

const deleteAttraction = async (req, res) => {
  try {
    const attraction = await Attraction.findById(req.params.id);
    if (!attraction) {
      return res.status(404).json({ message: 'Attraction not found' });
    }
    if (!canManageAttraction(attraction, req.user)) {
      return res.status(403).json({ message: 'You can only delete places added by you' });
    }
    await attraction.deleteOne();
    res.json({ message: 'Attraction removed' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete attraction' });
  }
};

module.exports = {
  getAttractions,
  getAttractionById,
  createAttraction,
  updateAttraction,
  deleteAttraction,
};
