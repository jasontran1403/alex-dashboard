import { Helmet } from 'react-helmet-async';
// @mui
import { styled } from '@mui/material/styles';
import { Link, Container, Typography, Divider, Stack, Button } from '@mui/material';
// hooks
import useResponsive from '../hooks/useResponsive';
// components
import Logo from '../components/logo';
import Iconify from '../components/iconify';
// sections
import { SignupForm } from '../sections/auth/signup';

// ----------------------------------------------------------------------

const StyledRoot = styled('div')(({ theme }) => ({
  [theme.breakpoints.up('md')]: {
    display: 'flex',
  },
}));

const StyledSection = styled('div')(({ theme }) => ({
  width: '100%',
  maxWidth: 480,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  boxShadow: theme.customShadows.card,
  backgroundColor: theme.palette.background.default,
}));

const StyledContent = styled('div')(({ theme }) => ({
  maxWidth: 480,
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  justifyContent: 'center',
  flexDirection: 'column',
  padding: theme.spacing(12, 0),
}));

// ----------------------------------------------------------------------

export default function SignupPage() {
  const mdUp = useResponsive('up', 'md');

  return (
    <>
      <Helmet>
        <title> Sign Up </title>
        <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />

      </Helmet>

      <StyledRoot id = "abc">
        <a href= {"/login"}> <img className='logo-img' src="/assets/logo.png" alt="logo-img" /> </a>

        <Container maxWidth="sm">
          <StyledContent>
            <Typography variant="h4" gutterBottom>
              Sign up to Something
            </Typography>

            <Typography variant="body2" sx={{ mb: 5 }}>
              Already have an account? {''}
              <Link href={"/login"} variant="subtitle2" style={{ cursor: "pointer" }}>Sign in</Link>
            </Typography>
            <SignupForm />
          </StyledContent>
        </Container>
      </StyledRoot>
    </>
  );
}
