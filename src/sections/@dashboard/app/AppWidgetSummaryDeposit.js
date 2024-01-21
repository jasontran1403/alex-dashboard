// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fShortenNumber, fCurrency } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------



export default function AppWidgetSummaryDeposit({ title, total, icon, color = 'primary', sx, ...other }) {
  return (
    <div className='card__wrapper'>
      <div className='card__header'>
        <div className='deposit-background card__header-wrapper'>
          <Iconify className='deposit-icon card__header-icon' icon={icon} width={24} height={24} />
          <button className='deposit-icon card__header-btn'>+</button>
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
