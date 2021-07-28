import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { GoMarkGithub } from 'react-icons/go';

function Credits() {
  return (
    <Container>
      <Row>
        <Col>
          <span className="text-muted">
            Made by
            {' '}
            <a href="https://alrico.es" target="_blank" rel="noreferrer">Alberto Rico</a>
            . Source code available at
            {' '}
            <a href="https://github.com/alrico88/metarr" target="_blank" rel="noreferrer">
              <GoMarkGithub />
              {' '}
              Github
            </a>
          </span>
        </Col>
      </Row>
    </Container>
  );
}

export default Credits;
