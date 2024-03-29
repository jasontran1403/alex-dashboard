// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fShortenNumber, fCurrency } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

AppWidgetSummary.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  sx: PropTypes.object,
};

export default function AppWidgetSummary({ title, total, icon, color = 'primary', sx, ...other }) {
  return (
    <div className='card__wrapper'>
      <div className='card__header'>
        <div className='card__header-wrapper'>
          <Iconify className='card__header-icon' icon={icon} width={24} height={24} />
          <button className='card__header-btn'>+</button>
        </div>
      </div>

      <div className='card__body'>
        <h3>{fCurrency(total)}</h3>
      </div>

      <div className='card__footer'>
        {title}
      </div>
    </div>
  );
}
