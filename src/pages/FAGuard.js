import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Container, Stack, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Swal from 'sweetalert2';
import Iconify from '../components/iconify';
import { prod, dev } from "../utils/env";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
};

const StyledContent = styled('div')(({ theme }) => ({
  margin: 'auto',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
}));

const StyledProductImg = styled('img')({
  top: 0,
  width: '40%',
  height: '40%',
  objectFit: 'cover',
  margin: 'auto',
});

export default function FAGuard() {
  const navigate = useNavigate();
  const [faCode, setFaCode] = useState("");
  const [isInstalled, setIsInstalled] = useState(false);
  const [installQR, setInstallQR] = useState("");
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = () => {
    const config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/showQR/${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios.request(config)
      .then((response) => {
        if (response.data[0] === "false") {
          setIsInstalled(false);
        } else if (response.data[0] === "true") {
          setIsInstalled(true);
        }
        setInstallQR(response.data[1]);
      })
      .catch((error) => {
        if (error.response.status === 403) {
          Swal.fire({
            title: "An error occured",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: "Session is ended, please login again !",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            localStorage.clear();
            navigate('/login', { replace: true });
          });
        }
      });
  };

  useEffect(() => {
    setIsLoading(true);

    fetchData();

    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return (() => {
      clearTimeout(timeout);
    });
  }, []);

  const handleEnabled = () => {
    if (faCode === "") {
      return;
    }
    const data = JSON.stringify({
      "email": currentEmail,
      "code": faCode
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/enable`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentAccessToken}`
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        if (response.data === "Enabled Success") {
          Swal.fire({
            title: "2FA installation is successful!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            window.location.reload();
          })
        } else if (response.data === "Enabled Failed") {
          Swal.fire({
            title: "2FA Code is invalid!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          Swal.fire({
            title: "An error occured",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: "Session is ended, please login again !",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            // localStorage.clear();
            // navigate('/login', { replace: true });
          });
        }
      });

  };

  const handleDisabled = () => {
    if (faCode === "") {
      return;
    }
    const data = JSON.stringify({
      "email": currentEmail,
      "code": faCode
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/disable`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentAccessToken}`
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        console.log(response.data);
        if (response.data === "Disabled Success") {
          Swal.fire({
            title: "2FA uninstallation is successful!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            window.location.reload();
          })
        } else if (response.data === "Disabled Failed") {
          Swal.fire({
            title: "2FA Code is invalid!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        }
      })
      .catch((error) => {
        if (error.response.status === 403) {
          Swal.fire({
            title: "An error occured",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          });
        } else {
          Swal.fire({
            title: "Session is ended, please login again !",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            // localStorage.clear();
            // navigate('/login', { replace: true });
          });
        }
      });
  };

  return (
    <>
      <Helmet>
        <title> 2FA Guard </title>
        <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />

      </Helmet>

      <Container>
        <StyledContent>
          {isInstalled ? <Stack spacing={3}>
            <TextField name="faCode" type="text" placeholder="Enter 6-digits..." onChange={(e) => { setFaCode(e.target.value) }} />
            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleDisabled}>
              Disable 2FA
            </LoadingButton>
          </Stack> : <Stack spacing={3}>
            {installQR ? (
              <StyledProductImg alt={"2FA-installation"} src={installQR} />
            ) : (
              ""
            )}
            <TextField
              name="faCode"
              type="text"
              placeholder="Enter 6-digits..."
              onChange={(e) => { setFaCode(e.target.value) }}
            />
            <LoadingButton
              fullWidth
              size="large"
              type="submit"
              variant="contained"
              onClick={handleEnabled}
            >
              Enable 2FA
            </LoadingButton>
          </Stack>}
        </StyledContent>
      </Container>
    </>
  );
}
