import React from 'react';
import { Alert } from 'react-bootstrap';
import { BsExclamationTriangle } from 'react-icons/bs';

function NoMetarAvailable() {
  return (
    <Alert variant="warning" className="align-middle">
      <BsExclamationTriangle className="me-1" />
      No METAR available
    </Alert>
  );
}

export default NoMetarAvailable;
