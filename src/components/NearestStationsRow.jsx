import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

function NearestStationsRow({
  icao, name, distance, bearing, onGetInfo,
}) {
  function handleClick() {
    onGetInfo(icao);
  }

  return (
    <tr>
      <td>{icao}</td>
      <td>{name}</td>
      <td>
        {bearing}
        º
      </td>
      <td>
        {distance}
        nm.
      </td>
      <td className="text-center">
        <Button size="sm" variant="primary" onClick={handleClick}>Get info</Button>
      </td>
    </tr>
  );
}

NearestStationsRow.propTypes = {
  icao: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  bearing: PropTypes.number.isRequired,
  distance: PropTypes.number.isRequired,
  onGetInfo: PropTypes.func.isRequired,
};

export default NearestStationsRow;
