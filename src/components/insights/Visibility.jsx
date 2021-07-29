import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Card, Col, Table } from 'react-bootstrap';
import get from 'lodash/get';
import { BsEyeFill } from 'react-icons/bs';
import SimpleChooser from '../SimpleChooser';
import InfoTableRow from '../InfoTableRow';

function Visibility({ visibility, cavok }) {
  const isUnlimited = useMemo(() => (get(visibility, 'meters') === 9999), [visibility]);

  const [units, setUnits] = useState('meters');

  const unitOpts = [
    {
      text: 'm.',
      value: 'meters',
    },
    {
      text: 'miles',
      value: 'miles',
    },
  ];

  const distance = useMemo(
    () => (isUnlimited ? 'Unlimited' : get(visibility, units)),
    [units, visibility],
  );

  return (
    <Col lg={4} md={6} sm={12} className="insightCard">
      <Card>
        <Card.Header>
          <div className="d-flex align-items-center">
            <div className="flex-grow-1">
              <BsEyeFill className="me-2" />
              Visibility
            </div>
            <div>
              <SimpleChooser
                onSelection={setUnits}
                selected={units}
                options={unitOpts}
              />
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <Table borderless responsive className="mb-0">
            <tbody>
              <InfoTableRow title="CAVOK" value={cavok.toString()} alignRight />
              {
                cavok === false && <InfoTableRow title="Distance" value={distance} alignRight />
              }
            </tbody>
          </Table>
        </Card.Body>
      </Card>
    </Col>
  );
}

Visibility.propTypes = {
  visibility: PropTypes.shape({
    feet: PropTypes.number,
    meters: PropTypes.number,
    kilometers: PropTypes.number,
    miles: PropTypes.number,
  }),
  cavok: PropTypes.bool.isRequired,
};

Visibility.defaultProps = {
  visibility: {},
};

export default Visibility;
