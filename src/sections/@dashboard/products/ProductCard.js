import PropTypes from 'prop-types';
// @mui
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
// components
import Label from '../../../components/label';
import { ColorPreview } from '../../../components/color-utils';

// ----------------------------------------------------------------------

const StyledProductImg = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute',
});

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object,
};

export default function ShopProductCard({ product, onProductClick }) {
  const { email, referrer, price, image } = product;
  return (
    <Card style={{ cursor: "pointer" }} onClick={() => onProductClick(product.email, product.referrer)} >
      <Box sx={{ pt: '100%', position: 'relative' }}>
        <StyledProductImg alt={`/assets/images/avatars/avatar_8.jpg`} src={image ? `data:image/png;base64,${image}` : `/assets/images/avatars/avatar_8.jpg`} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Typography variant="subtitle1" noWrap>
          User: {email}
        </Typography>

        <Typography variant="subtitle1" noWrap>
          Total Commission: {fCurrency(price)}
        </Typography>
      </Stack>
    </Card>
  );
}
