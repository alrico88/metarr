import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import parser from 'metar-parser';
import Masonry from 'react-masonry-component';
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

  const masonryOptions = {
    percentPosition: true,
  };

  return (
    <Masonry className="row" options={masonryOptions}>
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
    </Masonry>
  );
}

ParsedMetarInfo.propTypes = {
  metar: PropTypes.string.isRequired,
  runways: runwaysProp.isRequired,
};

export default ParsedMetarInfo;
