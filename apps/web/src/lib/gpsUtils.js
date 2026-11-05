
/**
 * Calculates the great-circle distance between two GPS coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of the first point.
 * @param {number} lng1 - Longitude of the first point.
 * @param {number} lat2 - Latitude of the second point.
 * @param {number} lng2 - Longitude of the second point.
 * @returns {number} The distance in meters.
 * @throws {Error} If any of the coordinates are invalid numbers.
 */
export const calculateHaversineDistance = (lat1, lng1, lat2, lng2) => {
  if (isNaN(lat1) || isNaN(lng1) || isNaN(lat2) || isNaN(lng2)) {
    throw new Error('Invalid coordinates provided for distance calculation.');
  }

  const R = 6371e3; // Earth's radius in meters
  const toRadians = (deg) => (deg * Math.PI) / 180;
  
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lng2 - lng1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return Math.round(R * c);
};

/**
 * Default verification radius for a bin pickup, in metres.
 * Kept deliberately forgiving because phone GPS is rarely accurate to a few metres.
 */
export const GEOFENCE_RADIUS_METERS = 50;

/**
 * The most extra slack (in metres) we will add for a poor GPS reading.
 * Without a cap, a very poor reading could make the geofence meaningless.
 */
export const MAX_ACCURACY_BUFFER_METERS = 30;

/**
 * Expands the base radius by the device's reported GPS accuracy, up to a cap.
 * @param {number} radiusMeters - Base radius in metres.
 * @param {number} accuracyMeters - Accuracy reported by the Geolocation API.
 * @returns {number} The effective radius in metres.
 */
export const getEffectiveGeofenceRadius = (radiusMeters = GEOFENCE_RADIUS_METERS, accuracyMeters = 0) => {
  const accuracy = Number.isFinite(accuracyMeters) && accuracyMeters > 0 ? accuracyMeters : 0;
  return radiusMeters + Math.min(accuracy, MAX_ACCURACY_BUFFER_METERS);
};

/**
 * Checks if a driver is within a specified radius of a citizen's location.
 * @param {number} driverLat - Driver's current latitude.
 * @param {number} driverLng - Driver's current longitude.
 * @param {number} citizenLat - Citizen's target latitude.
 * @param {number} citizenLng - Citizen's target longitude.
 * @param {number} radiusMeters - The allowed distance threshold in meters.
 * @param {number} accuracyMeters - Optional GPS accuracy to add as tolerance.
 * @returns {boolean} True if the distance is less than or equal to the effective radius.
 */
export const isWithinGeofence = (driverLat, driverLng, citizenLat, citizenLng, radiusMeters, accuracyMeters = 0) => {
  if (typeof radiusMeters !== 'number' || radiusMeters < 0) {
    throw new Error('Invalid radius provided.');
  }
  const distance = calculateHaversineDistance(driverLat, driverLng, citizenLat, citizenLng);
  return distance <= getEffectiveGeofenceRadius(radiusMeters, accuracyMeters);
};

/**
 * Retrieves the current GPS location from the browser's Geolocation API.
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: number}>}
 */
export const getGPSLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = 'An unknown error occurred while retrieving location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }
        reject(new Error(errorMessage));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
