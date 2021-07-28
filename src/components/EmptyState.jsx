import React from 'react';
import PropTypes from 'prop-types';

function EmptyState({ text, colspan }) {
  return (
    <tr className="text-center">
      <td colSpan={colspan}>{text}</td>
    </tr>
  );
}

EmptyState.propTypes = {
  text: PropTypes.string.isRequired,
  colspan: PropTypes.number.isRequired,
};

export default EmptyState;
