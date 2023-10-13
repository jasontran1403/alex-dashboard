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

export default function Profile() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");

  useEffect(() => {
    const data = JSON.stringify({
      "email": currentEmail
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-info`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentAccessToken}`
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
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

  }, [currentEmail]);

  const handleSubmit = () => {
    if (firstName === "" || lastName === "") {
      Swal.fire({
        title: "All information is required!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      });
      return;
    }

    const data = JSON.stringify({
      "email": currentEmail,
      "firstName": firstName,
      "lastName": lastName
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/edit-info`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentAccessToken}`
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        if (response.data === "OK") {
          Swal.fire({
            title: "Update information successful",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            window.location.reload();
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
            localStorage.clear();
            navigate('/login', { replace: true });
          });
        }
      });

  };
  return (
    <>
      <Helmet>
        <title> Profile </title>
      </Helmet>

      <Container>
        <StyledContent>
          <Stack spacing={3}>
            <TextField className="input-profile-email" name="email" type="text" value={currentEmail} readOnly />
            <TextField name="firstName" type="text" value={firstName} onChange={(e) => { setFirstName(e.target.value) }} />
            <TextField name="lastName" type="text" value={lastName} onChange={(e) => { setLastName(e.target.value) }} />
            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
              Update profile
            </LoadingButton>
          </Stack>
        </StyledContent>
      </Container>
    </>
  );
}
