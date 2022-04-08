import PropTypes from 'prop-types';
import React from 'react';
import {
  Button, Col, Form, InputGroup, Row,
} from 'react-bootstrap';
import { BsSearch, BsFillCursorFill } from 'react-icons/bs';

function Search({
  icao, changeIcao, onSearch, onGetNearest,
}) {
  function handleInput(e) {
    changeIcao(e.target.value.toUpperCase());
  }

  function handleSearch() {
    onSearch(icao);
  }

  function handleSubmit(e) {
    e.preventDefault();
    handleSearch();
  }

  return (
    <Row className="py-2">
      <Col>
        <Row>
          <Col>
            <h5 className="fw-bold">Enter an airport:</h5>
          </Col>
        </Row>
        <Row>
          <Col className="my-1">
            <h6>By ICAO:</h6>
            <Form onSubmit={handleSubmit}>
              <Form.Group>
                <InputGroup>
                  <Form.Control type="text" onChange={handleInput} value={icao} className="bg-white" />
                  <Button type="button" onClick={handleSearch} className="align-middle">
                    <BsSearch className="me-1" />
                    Search
                  </Button>
                </InputGroup>
              </Form.Group>
            </Form>
          </Col>
          <Col lg={3} md={6} className="my-1">
            <h6>Search nearest:</h6>
            <Button onClick={onGetNearest} variant="primary" className="w-100">
              <BsFillCursorFill className="me-1" />
              Get 10 nearest stations
            </Button>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}

Search.propTypes = {
  onSearch: PropTypes.func.isRequired,
  icao: PropTypes.string.isRequired,
  changeIcao: PropTypes.func.isRequired,
  onGetNearest: PropTypes.func.isRequired,
};

export default Search;
