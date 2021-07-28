import axios from 'axios';
import cacheGetter from './cache';

const apiConfig = {
  headers: {
    Authorization: `Token ${import.meta.env.VITE_API_TOKEN}`,
  },
};

/**
 * Gets airport data
 * @param {string} icao
 * @returns {Promise<any>}
 */
export function getAirportData(icao) {
  const call = async () => {
    const res = await axios.get(`https://api.flightplandatabase.com/nav/airport/${icao}`);

    return res.data;
  };

  const cacheKey = `${icao}_metar`;

  return cacheGetter(cacheKey, call, {
    amount: 15,
    time: 'minutes',
  });
}

/**
 * Gets the nearest airport to coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<NearestAirports[]>}
 */
export async function getAirportsNearby(latitude, longitude) {
  const call = async () => {
    const res = await axios.get(`https://avwx.rest/api/station/near/${latitude},${longitude}?n=10&airport=true&reporting=true&format=json`, apiConfig);

    return res.data;
  };

  const cacheKey = `${latitude + longitude}_nearest`;

  return cacheGetter(cacheKey, call);
}
