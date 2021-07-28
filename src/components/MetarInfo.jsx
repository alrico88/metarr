import React, { useMemo } from 'react';
import {
  Alert, Col, Row,
} from 'react-bootstrap';
import PropTypes from 'prop-types';

function MetarInfo({ metar }) {
  const showMetar = useMemo(() => metar !== '', [metar]);

  return showMetar && (
  <Row>
    <Col>
      <Alert variant="info" className="font-monospace mb-0">{metar}</Alert>
    </Col>
  </Row>
  );
}

MetarInfo.propTypes = {
  metar: PropTypes.string,
};

MetarInfo.defaultProps = {
  metar: '',
};

export default MetarInfo;
