import React, { useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import CheapRuler from 'cheap-ruler';
import { processNumber } from 'number-helper-functions';
import PropTypes from 'prop-types';
import { getAirportsNearby } from '../api';
import { bearingToAzimuth, getUserPosition } from '../position';
import NearestStationsTable from './NearestStationsTable';
import NearbyStationsMap from './NearbyStationsMap';
import Loader from './Loader';

function NearestStations({ onGetInfo }) {
  const [nearby, setNearby] = useState([]);

  const [userPosition, setPosition] = useState({
    latitude: null,
    longitude: null,
  });

  const [loading, setLoading] = useState(false);

  const nearbyStations = useMemo(() => {
    if (nearby.length === 0) {
      return [];
    }

    /**
     *
     * @type {NearestAirport[]}
     */
    const typed = nearby;

    const ruler = new CheapRuler(typed[0].station.latitude);

    return typed.map((item) => {
      const { latitude, longitude } = item.station;
      const bearing = ruler.bearing(
        [userPosition.longitude, userPosition.latitude],
        [longitude, latitude],
      );

      return {
        ...item,
        bearing: bearingToAzimuth(bearing),
        nautical_miles: processNumber(item.nautical_miles, 1),
      };
    });
  }, [nearby]);

  async function searchNearest() {
    try {
      setLoading(true);

      const position = await getUserPosition();
      const { coords } = position;
      setPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      const list = await getAirportsNearby(coords.latitude, coords.longitude);

      setNearby(list);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    searchNearest();
  }, []);

  const content = (
    <Row className="align-items-start">
      <Col>
        <NearestStationsTable
          onGetInfo={onGetInfo}
          nearbyStations={nearbyStations}
        />
      </Col>
      <Col lg={4}>
        <NearbyStationsMap
          onGetInfo={onGetInfo}
          nearbyStations={nearbyStations}
          userPosition={userPosition}
        />
      </Col>
    </Row>
  );

  const loader = (
    <Row>
      <Col className="text-center">
        <Loader />
      </Col>
    </Row>
  );

  return (
    loading ? loader : content
  );
}

NearestStations.propTypes = {
  onGetInfo: PropTypes.func.isRequired,
};

export default NearestStations;
