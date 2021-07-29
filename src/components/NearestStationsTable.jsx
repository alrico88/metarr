import { Table } from 'react-bootstrap';
import React from 'react';
import PropTypes from 'prop-types';
import NearestStationsRow from './NearestStationsRow';

function NearestStationsTable({ nearbyStations, onGetInfo }) {
  return (
    <Table
      bordered
      striped
      responsive
      className="font-monospace mb-4 align-middle"
      size="sm"
    >
      <tbody>
        {nearbyStations.map(({ station, bearing, nautical_miles: nauticalMiles }) => (
          <NearestStationsRow
            icao={station.icao}
            name={station.name}
            bearing={bearing}
            distance={nauticalMiles}
            key={station.icao}
            onGetInfo={onGetInfo}
          />
        ))}
      </tbody>
    </Table>
  );
}

NearestStationsTable.propTypes = {
  nearbyStations: PropTypes.arrayOf(PropTypes.shape({
    station: PropTypes.shape({
      icao: PropTypes.string,
      name: PropTypes.string,
    }),
    bearing: PropTypes.number,
    nauticalMiles: PropTypes.number,
  })).isRequired,
  onGetInfo: PropTypes.func.isRequired,
};

export default NearestStationsTable;
