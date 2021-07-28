import React from 'react';
import PropTypes from 'prop-types';
import { Nav } from 'react-bootstrap';

function SimpleChooser({ options, selected, onSelection }) {
  function handleClick(value) {
    return function clickFunc(e) {
      e.preventDefault();

      onSelection(value);
    };
  }

  return (
    <Nav activeKey={selected} as="ul" className="justify-content-end">
      {
      options.map(({ value, text }) => (
        <Nav.Item key={value}>
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <Nav.Link
            onClick={handleClick(value)}
            eventKey={value}
            className="customNavLink"
          >
            {text}
          </Nav.Link>
        </Nav.Item>
      ))
    }
    </Nav>
  );
}

SimpleChooser.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({
    text: PropTypes.string,
    value: PropTypes.string,
  })).isRequired,
  selected: PropTypes.string.isRequired,
  onSelection: PropTypes.func.isRequired,
};

export default SimpleChooser;
