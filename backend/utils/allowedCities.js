const ALLOWED_CITY_NAMES = [
  'Vijayawada',
  'Mangalagiri',
  'Kolkata',
  'Chennai',
  'Bangalore',
  'Vizag',
  'Mumbai',
  'Delhi',
  'Hyderabad',
];

const ALLOWED_CITY_NAME_SET = new Set(ALLOWED_CITY_NAMES.map((name) => name.toLowerCase()));

const normalizeCityName = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '');

const isAllowedCityName = (value) => ALLOWED_CITY_NAME_SET.has(normalizeCityName(value));

const getAllowedCityQuery = () => ({
  cityName: { $in: ALLOWED_CITY_NAMES },
});

module.exports = {
  ALLOWED_CITY_NAMES,
  getAllowedCityQuery,
  isAllowedCityName,
};