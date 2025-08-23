const googleMaps = require('@google/maps').createClient({
  key: process.env.GOOGLE_MAPS_API_KEY,
  Promise: Promise
});

module.exports = {
  getDistance: (origin, destination) => googleMaps.distanceMatrix({ origins: [origin], destinations: [destination] }).asPromise()
};