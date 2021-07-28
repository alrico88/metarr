import React, { useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { Row } from 'react-bootstrap';
import parser from 'metar-parser';
import Masonry from 'masonry-layout';
import Visibility from './insights/Visibility';
import Weather from './insights/Weather';
import Altimeter from './insights/Altimeter';
import Clouds from './insights/Clouds';
import Wind from './insights/Wind';
import Conditions from './insights/Conditions';
import { runways as runwaysProp } from '../commonProps';

function ParsedMetarInfo({ metar, runways }) {
  const showMetar = useMemo(() => metar !== '', [metar]);

  const parsedMetar = useMemo(() => {
    if (showMetar) {
      return parser(metar);
    }
    return {};
  }, [metar, showMetar]);

  useEffect(() => {
    // eslint-disable-next-line no-new
    new Masonry('.masonryGrid', { percentPosition: true });
  });

  return (
    <Row className="masonryGrid">
      <Conditions
        metar={metar}
        temperature={parsedMetar.temperature}
        showMetar={showMetar}
        dewpoint={parsedMetar.dewpoint}
      />
      <Wind wind={parsedMetar.wind} runways={runways} />
      <Clouds clouds={parsedMetar.clouds} />
      <Altimeter altimeter={parsedMetar.altimeter} />
      <Visibility visibility={parsedMetar.visibility} cavok={parsedMetar.cavok} />
      <Weather weather={parsedMetar.weather} />
    </Row>
  );
}

ParsedMetarInfo.propTypes = {
  metar: PropTypes.string.isRequired,
  runways: runwaysProp.isRequired,
};

export default ParsedMetarInfo;
