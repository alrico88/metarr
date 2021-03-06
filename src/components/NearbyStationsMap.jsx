import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  MapContainer, Marker, TileLayer, Tooltip, useMap,
} from 'react-leaflet';
import L, { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import getBounds from '../getBounds';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
});

L.Marker.prototype.options.icon = DefaultIcon;

const mapConfig = {
  style: {
    minHeight: '400px',
    height: '100%',
  },
  attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

function MapController({ bounds }) {
  const map = useMap();

  useEffect(() => {
    map.fitBounds(bounds);
  }, [bounds]);

  return null;
}

const userIcon = new Icon({
  iconUrl: 'crosshair.png',
  iconSize: [40, 40],
});

function NearbyStationsMap({ nearbyStations, userPosition, onGetInfo }) {
  const showMap = useMemo(() => nearbyStations.length > 0, [nearbyStations]);

  const bounds = useMemo(() => {
    if (nearbyStations.length > 0) {
      return getBounds(nearbyStations);
    }

    return [[-180, -180], [180, 180]];
  }, [nearbyStations]);

  return (
    showMap
    && (
    <MapContainer
      center={[0, 0]}
      zoom={12}
      style={mapConfig.style}
    >
      <MapController bounds={bounds} />
      <TileLayer
        attribution={mapConfig.attribution}
        url={mapConfig.url}
      />
      {nearbyStations.map(({ station }) => (
        <Marker
          key={station.icao}
          position={[station.latitude, station.longitude]}
          eventHandlers={{
            click: () => onGetInfo(station.icao),
          }}
        >
          <Tooltip>{station.icao}</Tooltip>
        </Marker>
      ))}
      {
        userPosition.latitude !== null
        && (
        <Marker
          position={[userPosition.latitude, userPosition.longitude]}
          icon={userIcon}
        />
        )
      }
    </MapContainer>
    )
  );
}

NearbyStationsMap.propTypes = {
  nearbyStations: PropTypes.arrayOf(PropTypes.shape({
    station: PropTypes.shape({
      icao: PropTypes.string,
      name: PropTypes.string,
    }),
    bearing: PropTypes.number,
    nauticalMiles: PropTypes.number,
  })).isRequired,
  onGetInfo: PropTypes.func.isRequired,
  userPosition: PropTypes.shape({
    latitude: PropTypes.number,
    longitude: PropTypes.number,
  }),
};

NearbyStationsMap.defaultProps = {
  userPosition: {
    latitude: null,
    longitude: null,
  },
};

export default NearbyStationsMap;
