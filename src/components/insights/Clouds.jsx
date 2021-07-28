import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Table } from 'react-bootstrap';
import { BsCloud } from 'react-icons/bs';
import EmptyState from '../EmptyState';

function Clouds({ clouds }) {
  const content = useMemo(
    () => (clouds.length > 0
      ? clouds.map(({ altitude, meaning }) => (
        <tr key={altitude + meaning}>
          <td>{meaning}</td>
          <td className="font-monospace">{altitude}</td>
        </tr>
      ))
      : <EmptyState text="No clouds" colspan={2} />),
    [clouds],
  );

  return (
    <Col lg={4} md={6} sm={1} className="insightCard">
      <Card>
        <Card.Header>
          <BsCloud className="me-2" />
          Clouds
        </Card.Header>
        <Card.Body className="p-0">
          <Table striped bordered responsive className="mb-0">
            <thead className="table-light">
              <tr>
                <th>Condition</th>
                <th>Elevation (feet)</th>
              </tr>
            </thead>
            <tbody>
              { content}
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
}

Clouds.propTypes = {
  clouds: PropTypes.arrayOf(PropTypes.shape({
    altitude: PropTypes.number,
    meaning: PropTypes.string,
  })).isRequired,
};

export default Clouds;
