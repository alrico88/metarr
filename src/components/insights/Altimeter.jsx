import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Table } from 'react-bootstrap';
import { BsClockFill } from 'react-icons/bs';
import InfoTableRow from '../InfoTableRow';

function Altimeter({ altimeter }) {
  return (
    <Col lg={4} md={6} sm={1} className="insightCard">
      <Card>
        <Card.Header>
          <BsClockFill className="me-2" />
          Altimeter
        </Card.Header>
        <Card.Body>
          <Table responsive borderless className="mb-0">
            <tbody>
              <InfoTableRow alignRight title="Inches" value={altimeter.inches} />
              <InfoTableRow alignRight title="Millibars" value={altimeter.millibars} />
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
}

Altimeter.propTypes = {
  altimeter: PropTypes.shape({
    inches: PropTypes.number,
    millibars: PropTypes.number,
  }).isRequired,
};

export default Altimeter;
