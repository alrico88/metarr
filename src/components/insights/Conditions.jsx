import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import fcParser from 'aewx-metar-parser';
import { processNumber } from 'number-helper-functions';
import { Card, Col, Table } from 'react-bootstrap';
import { BsSun } from 'react-icons/bs';
import SimpleChooser from '../SimpleChooser';
import InfoTableRow from '../InfoTableRow';

function Conditions({
  metar, showMetar, temperature, dewpoint,
}) {
  const flightConditions = useMemo(() => {
    let text = '';
    let color = 'black';

    if (showMetar) {
      text = fcParser(metar).flight_category;

      switch (text) {
        case 'VFR':
          color = '#4caf50';
          break;
        case 'MVFR':
          color = '#F6C244';
          break;
        case 'IFR':
          color = '#ff5722';
          break;
        default:
          color = '#d32f2f';
      }
    }
    return {
      text,
      color,
    };
  }, [showMetar, metar]);

  const tempUnitsOpts = [
    {
      text: 'ºC',
      value: 'celsius',
    },
    {
      text: 'ºF',
      value: 'fahrenheit',
    },
  ];
  const [tempUnits, setTempUnits] = useState('celsius');

  const humidity = useMemo(() => {
    const temp = temperature.celsius;
    const dewPoint = dewpoint.celsius;

    const calc = Math.exp(
      (17.625 * dewPoint) / (243.04 + dewPoint),
    ) / Math.exp(
      (17.625 * temp) / (243.04 + temp),
    );

    return processNumber(calc * 100, 1);
  }, [temperature, dewpoint]);

  return (
    <Col lg={4} md={6} sm={12} className="insightCard">
      <Card>
        <Card.Header>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <BsSun className="me-2" />
              Conditions
            </div>
            <div>
              <SimpleChooser
                onSelection={setTempUnits}
                selected={tempUnits}
                options={tempUnitsOpts}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table responsive borderless className="mb-0">
            <tbody>
              <InfoTableRow
                title="Flight conditions"
                value={flightConditions.text}
                valueColor={flightConditions.color}
                alignRight
              />
              <InfoTableRow
                title="Temperature"
                value={temperature[tempUnits]}
                alignRight
              />
              <InfoTableRow
                title="Dew point"
                value={dewpoint[tempUnits]}
                alignRight
              />
              <InfoTableRow
                title="Humidity"
                value={`${humidity}%`}
                alignRight
              />
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
}

Conditions.propTypes = {
  temperature: PropTypes.shape({
    celsius: PropTypes.number,
    fahrenheit: PropTypes.number,
  }).isRequired,
  dewpoint: PropTypes.shape({
    celsius: PropTypes.number,
    fahrenheit: PropTypes.number,
  }).isRequired,
  showMetar: PropTypes.bool.isRequired,
  metar: PropTypes.string.isRequired,
};

export default Conditions;
