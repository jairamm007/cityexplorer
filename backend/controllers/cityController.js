const { validationResult } = require('express-validator');
const City = require('../models/City');
const { resolveUploadedImageUrl } = require('../utils/resolveUploadedImageUrl');
const { normalizePersistedImageUrl } = require('../utils/imageUrl');
const { ALLOWED_CITY_NAMES, getAllowedCityQuery, isAllowedCityName } = require('../utils/allowedCities');

const CREATED_BY_FIELDS = 'name email';

const normalizeNumber = (value) => {
  if (value === '' || value === null || value === undefined) {
    return undefined;
  }
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const resolveImageUrl = async (req, existingImageUrl) => {
  if (req.file) {
    const uploadedUrl = await resolveUploadedImageUrl(req.file);
    return uploadedUrl || existingImageUrl;
  }

  if (typeof req.body.imageUrl === 'string') {
    return normalizePersistedImageUrl(req.body.imageUrl);
  }

  return existingImageUrl;
};

const buildCityPayload = (payload) => ({
  cityName: payload.cityName,
  country: payload.country,
  state: payload.state,
  location: payload.location,
  description: payload.description,
  imageUrl: payload.imageUrl,
  latitude: normalizeNumber(payload.latitude),
  longitude: normalizeNumber(payload.longitude),
});

const canManageCity = (doc, user) =>
  Boolean(user && (user.role === 'admin' || (doc.createdBy && doc.createdBy.toString() === user._id.toString())));

const parseLimit = (value, max = 200) => {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return Math.min(parsed, max);
};

const getCities = async (req, res) => {
  try {
    const search = req.query.q ? req.query.q.trim() : '';
    const limit = parseLimit(req.query.limit);
    const includeOwner = req.query.includeOwner !== 'false';
    const queryParts = [getAllowedCityQuery()];

    if (search) {
      queryParts.push({
        $or: [
          { cityName: { $regex: search, $options: 'i' } },
          { country: { $regex: search, $options: 'i' } },
        ],
      });
    }

    const query = queryParts.length > 1 ? { $and: queryParts } : queryParts[0];

    let citiesQuery = City.find(query).sort({ createdAt: -1 });

    if (includeOwner) {
      citiesQuery = citiesQuery.populate('createdBy', CREATED_BY_FIELDS);
    }

    if (limit) {
      citiesQuery = citiesQuery.limit(limit);
    }

    const cities = await citiesQuery.lean();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ message: 'Unable to fetch cities' });
  }
};

const getCityById = async (req, res) => {
  try {
    const city = await City.findById(req.params.id).populate('createdBy', CREATED_BY_FIELDS);
    if (!city || !isAllowedCityName(city.cityName)) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.json(city);
  } catch (error) {
    res.status(500).json({ message: 'Unable to load city details' });
  }
};

const createCity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    cityName,
    country,
    state,
    location,
    description,
    latitude,
    longitude,
  } = req.body;

  if (!isAllowedCityName(cityName)) {
    return res.status(400).json({ message: `Cities are limited to: ${ALLOWED_CITY_NAMES.join(', ')}` });
  }

  try {
    const city = await City.create({
      ...buildCityPayload({
        cityName,
        country,
        state,
        location,
        description,
        imageUrl: await resolveImageUrl(req, undefined),
        latitude,
        longitude,
      }),
      createdBy: req.user._id,
    });
    const populatedCity = await City.findById(city._id).populate('createdBy', CREATED_BY_FIELDS);
    res.status(201).json(populatedCity);
  } catch (error) {
    res.status(500).json({ message: 'Unable to create city' });
  }
};

const updateCity = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  if (!isAllowedCityName(req.body.cityName)) {
    return res.status(400).json({ message: `Cities are limited to: ${ALLOWED_CITY_NAMES.join(', ')}` });
  }

  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (!canManageCity(city, req.user)) {
      return res.status(403).json({ message: 'You can only edit cities added by you' });
    }

    Object.assign(
      city,
      buildCityPayload({
        ...req.body,
        imageUrl: await resolveImageUrl(req, city.imageUrl),
      })
    );
    await city.save();

    const populatedCity = await City.findById(city._id).populate('createdBy', CREATED_BY_FIELDS);
    res.json(populatedCity);
  } catch (error) {
    res.status(500).json({ message: 'Unable to update city' });
  }
};

const deleteCity = async (req, res) => {
  try {
    const city = await City.findById(req.params.id);
    if (!city) {
      return res.status(404).json({ message: 'City not found' });
    }
    if (!canManageCity(city, req.user)) {
      return res.status(403).json({ message: 'You can only delete cities added by you' });
    }

    await city.deleteOne();
    res.json({ message: 'City removed' });
  } catch (error) {
    res.status(500).json({ message: 'Unable to delete city' });
  }
};

module.exports = { getCities, getCityById, createCity, updateCity, deleteCity };
