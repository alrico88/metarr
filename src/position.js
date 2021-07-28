import { processNumber } from 'number-helper-functions';

/**
 * Gets the user position using HTML5
 * @returns {Promise<GeolocationPosition>}
 */
export function getUserPosition() {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition((position, error) => {
      if (error) {
        reject(error);
      } else {
        resolve(position);
      }
    });
  });
}

/**
 * Converts bearing to azimuth 0-364
 * @param {number} bearing
 * @returns {number}
 */
export function bearingToAzimuth(bearing) {
  const corrected = bearing < 0 ? 360 + bearing : bearing;

  return processNumber(corrected, 0);
}
