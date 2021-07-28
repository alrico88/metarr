import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

function InfoTableRow({
  title, value, valueColor, alignRight,
}) {
  const dataClass = useMemo(() => classNames({
    'font-monospace': true,
    'text-end': alignRight,
  }), [alignRight]);

  const valueCellStyle = useMemo(() => {
    const style = {};

    if (valueColor !== '') {
      style.color = valueColor;
    }

    return style;
  }, [valueColor]);

  return (
    <tr>
      <td className="fw-bold">{title}</td>
      <td className={dataClass} style={valueCellStyle}>{value}</td>
    </tr>
  );
}

InfoTableRow.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  alignRight: PropTypes.bool,
  valueColor: PropTypes.string,
};

InfoTableRow.defaultProps = {
  alignRight: false,
  value: '',
  valueColor: '',
};

export default InfoTableRow;
