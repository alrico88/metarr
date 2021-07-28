import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, Col, Row, Table,
} from 'react-bootstrap';
import { processNumber } from 'number-helper-functions';
import { BiWind, FaArrowUp } from 'react-icons/all';
import SimpleChooser from '../SimpleChooser';
import { runways as runwaysProp } from '../../commonProps';
import { bearingToAzimuth } from '../../position';

function feetToMeters(feet) {
  return feet / 3.281;
}

function Wind({ wind, runways }) {
  const [windUnits, setWindUnits] = useState('speedKt');

  const windUnitsOpts = [
    {
      text: 'ms/s',
      value: 'speedMps',
    },
    {
      text: 'Knots',
      value: 'speedKt',
    },
  ];

  const windSpeed = useMemo(() => wind[windUnits], [windUnits, wind]);
  const windUnitsText = useMemo(
    () => windUnitsOpts.find((d) => d.value === windUnits).text,
    [windUnits],
  );

  const windText = useMemo(
    () => (wind.direction === 'VRB' ? 'Variable' : `${wind.direction}º`),
    [wind],
  );

  const runwaysTable = (
    <Table striped bordered responsive className="mb-0" size="sm">
      <thead className="table-light">
        <tr>
          <th>Rwy.</th>
          <th>Surface</th>
          <th>Length</th>
          <th>Width</th>
          <th>Wind</th>
        </tr>
      </thead>
      <tbody>
        {
          runways.map(({
            ident, bearing, surface, length, width,
          }) => {
            const lengthInKm = processNumber(feetToMeters(length) / 1000, 1);
            const widthInM = processNumber(feetToMeters(width), 1);

            let runwayWind = '??';

            if (wind.direction !== 'VRB') {
              const runwayWindBearing = bearingToAzimuth(wind.direction - bearing) - 180;

              runwayWind = <FaArrowUp style={{ rotate: `${runwayWindBearing}deg` }} />;
            }

            return (
              <tr key={ident}>
                <td>{ident}</td>
                <td>{surface}</td>
                <td>
                  {lengthInKm}
                  {' '}
                  km.
                </td>
                <td>
                  {widthInM}
                  {' '}
                  m.
                </td>
                <td className="text-center">
                  {runwayWind}
                </td>
              </tr>
            );
          })
        }
      </tbody>
    </Table>
  );

  return (
    <Col lg={4} md={6} sm={12} className="insightCard">
      <Card>
        <Card.Header>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <BiWind className="me-2" />
              Wind
            </div>
            <div>
              <SimpleChooser
                onSelection={setWindUnits}
                selected={windUnits}
                options={windUnitsOpts}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          <Row className="mb-2">
            <Col>
              <div className="p-3">
                <Row>
                  <Col>
                    <h5 className="fw-bold">Speed:</h5>
                    <p className="mb-0 font-monospace">
                      {windSpeed}
                      {' '}
                      {windUnitsText}
                    </p>
                  </Col>
                  <Col>
                    <h5 className="fw-bold">Coming from:</h5>
                    <p className="mb-0 font-monospace">
                      {windText}
                    </p>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
          <Row>
            <Col>
              {runwaysTable}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Col>
  );
}

Wind.propTypes = {
  wind: PropTypes.shape({
    speedKt: PropTypes.number,
    speedMps: PropTypes.number,
    direction: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }).isRequired,
  runways: runwaysProp.isRequired,
};

export default Wind;
