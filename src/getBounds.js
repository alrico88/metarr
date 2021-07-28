/* eslint-disable no-param-reassign */

export default function getBounds(dataset) {
  const init = {
    minLat: null, minLon: null, maxLat: null, maxLon: null,
  };

  const {
    minLon, minLat, maxLon, maxLat,
  } = dataset.reduce((agg, item) => {
    const { latitude, longitude } = item.station;

    if (latitude < agg.minLat || !agg.minLat) {
      agg.minLat = latitude;
    }

    if (latitude > agg.maxLat || !agg.maxLat) {
      agg.maxLat = latitude;
    }

    if (longitude < agg.minLon || !agg.minLon) {
      agg.minLon = longitude;
    }

    if (longitude > agg.maxLon || !agg.maxLon) {
      agg.maxLon = longitude;
    }

    return agg;
  }, init);

  return [[minLat, minLon], [maxLat, maxLon]];
}
