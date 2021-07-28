import React from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Table } from 'react-bootstrap';
import { BiCloudRain } from 'react-icons/bi';
import EmptyState from '../EmptyState';

function Weather({ weather }) {
  const tableContent = weather.length > 0
    ? weather
      .map(({ descriptor, precipitation, intensity }) => (
        <tr key={precipitation + descriptor + intensity}>
          <td>{precipitation || '--'}</td>
          <td>{descriptor}</td>
          <td>{intensity}</td>
        </tr>
      ))
    : <EmptyState text="No special weather" colspan={3} />;

  return (
    <Col lg={4} md={6} sm={1} className="insightCard">
      <Card>
        <Card.Header>
          <BiCloudRain className="me-2" />
          Weather phenomena
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Precipitation</th>
                <th>Description</th>
                <th>Intensity</th>
              </tr>
            </thead>
            <tbody>
              { tableContent}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
}

Weather.propTypes = {
  weather: PropTypes.arrayOf(PropTypes.shape({
    descriptor: PropTypes.string,
    intensity: PropTypes.string,
    precipitation: PropTypes.string,
  })).isRequired,
};

export default Weather;
