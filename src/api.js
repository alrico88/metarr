import axios from 'axios';
import get from 'lodash/get';
import cacheGetter from './cacheGetter';

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

  const cacheKey = `${icao}_airportinfo`;

  return cacheGetter(cacheKey, call, {
    amount: 15,
    time: 'minutes',
  });
}

/**
 * Gets METAR for an ICAO
 *
 * @param {string} icao
 * @return {Promise<string>}
 */
export function getMetar(icao) {
  const call = async () => {
    const res = await axios.get(`https://avwx.rest/api/metar/${icao}?options=&airport=true&reporting=true&format=json&onfail=cache`, apiConfig);

    return get(res, 'data.sanitized', '');
  };

  const cacheKey = `${icao}_metar`;

  return cacheGetter(cacheKey, call);
}

/**
 * Gets the nearest airport to coordinates
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<NearestAirport[]>}
 */
export async function getAirportsNearby(latitude, longitude) {
  const call = async () => {
    const res = await axios.get(`https://avwx.rest/api/station/near/${latitude},${longitude}?n=10&airport=true&reporting=true&format=json`, apiConfig);

    return res.data;
  };

  const cacheKey = `${latitude + longitude}_nearest`;

  return cacheGetter(cacheKey, call);
}
