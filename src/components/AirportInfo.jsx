import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Col, Row, Table,
} from 'react-bootstrap';
import { processNumber } from 'number-helper-functions';
import MetarInfo from './MetarInfo';
import InfoTableRow from './InfoTableRow';
import ParsedMetarInfo from './ParsedMetarInfo';
import { runways as runwaysProp } from '../commonProps';
import NoMetarAvailable from './NoMetarAvailable';
import AirportNotFound from './AirportNotFound';
import Loader from './Loader';

function AirportInfo({
  icao, name, elevation, metar, runways, runwaysList, loading, show,
}) {
  const niceElevation = useMemo(() => processNumber(elevation, 0), [elevation]);

  let cardContent;

  if (icao === '') {
    cardContent = <AirportNotFound />;
  } else {
    cardContent = (
      <Table striped borderless responsive className="mb-0">
        <tbody>
          <InfoTableRow alignRight title="ICAO" value={icao} />
          <InfoTableRow alignRight title="Airport name" value={name} />
          <InfoTableRow alignRight title="Elevation" value={`${niceElevation}ft.`} />
          <InfoTableRow alignRight title="Runways" value={runways} />
        </tbody>
      </Table>
    );
  }

  const card = (
    <Card>
      <Card.Body className="p-0">
        {
          cardContent
          }
      </Card.Body>
    </Card>
  );

  return show && (
    <>
      <Row className="py-2">
        <Col md={5} sm={12}>
          <h5 className="fw-bold">Airport info:</h5>
          {
            loading
              ? <Loader />
              : card
          }
        </Col>
      </Row>
      <Row className="py-2">
        <Col>
          <h5 className="fw-bold">METAR:</h5>
          {
            loading && <Loader />
          }
          {
            (!loading && metar !== '') && <MetarInfo metar={metar} />
          }
          {
            (!loading && metar === '') && <NoMetarAvailable />
          }
        </Col>
      </Row>
      <Row className="py-2">
        <Col>
          <h5 className="fw-bold">Parsed METAR:</h5>
          {
            loading && <Loader />
          }
          {
            (!loading && metar !== '') && <ParsedMetarInfo metar={metar} runways={runwaysList} />
          }
          {
            (!loading && metar === '') && <NoMetarAvailable />
          }
        </Col>
      </Row>
    </>
  );
}

AirportInfo.propTypes = {
  icao: PropTypes.string,
  name: PropTypes.string,
  elevation: PropTypes.number,
  metar: PropTypes.string,
  runways: PropTypes.number,
  runwaysList: runwaysProp,
  loading: PropTypes.bool.isRequired,
  show: PropTypes.bool.isRequired,
};

AirportInfo.defaultProps = {
  icao: '',
  name: '',
  elevation: 0,
  metar: '',
  runways: 0,
  runwaysList: [],
};

export default AirportInfo;
