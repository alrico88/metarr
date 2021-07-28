import PropTypes from 'prop-types';

// eslint-disable-next-line import/prefer-default-export
export const runways = PropTypes.arrayOf(PropTypes.shape({
  ident: PropTypes.string,
  bearing: PropTypes.number,
  surface: PropTypes.string,
  length: PropTypes.number,
  width: PropTypes.number,
}));
