// @mui
import PropTypes from 'prop-types';
import { alpha, styled } from '@mui/material/styles';
import { Card, Typography } from '@mui/material';
// utils
import { fShortenNumber, fCurrency,fCurrencyUSD } from '../../../utils/formatNumber';
// components
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------

const StyledIcon = styled('div')(({ theme }) => ({
  margin: 'auto',
  display: 'flex',
  borderRadius: '50%',
  alignItems: 'center',
  width: theme.spacing(8),
  height: theme.spacing(8),
  justifyContent: 'center',
  marginBottom: theme.spacing(3),
}));

// ----------------------------------------------------------------------

AppWidgetSummaryUSD.propTypes = {
  color: PropTypes.string,
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  total: PropTypes.number.isRequired,
  sx: PropTypes.object,
};

export default function AppWidgetSummaryUSD({ title, total, icon, color = 'primary', sx, ...other }) {
  return (
    <div className='card__wrapper'>
    <div className='card__header'>
      <div className='commission-background card__header-wrapper'>
      <Iconify className='card__header-icon' icon={icon} width={24} height={24} />
        <button className='card__header-btn'>+</button>
      </div>
    </div>

    <div className='card__body'>
      <h3>{fCurrencyUSD(total)}</h3>
    </div>

    <div className='card__footer'>
      {title}
    </div>
  </div>
  );
}
