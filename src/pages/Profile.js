import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Container, Stack, TextField, Button } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Swal from 'sweetalert2';
import FormData from 'form-data';
import Iconify from '../components/iconify';
import { prod, dev } from "../utils/env";

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});


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
  const [image, setImage] = useState("");
  const [fileSelected, setFileSelected] = useState(null);

  useEffect(() => {
    const data = JSON.stringify({
      "email": currentEmail
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/secured/get-info`,
      responseType: 'blob',
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

  useEffect(() => {
    const config = {
      method: 'get',
      url: `${prod}/api/v1/secured/avatar/${currentEmail}`,
      responseType: 'blob',
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios(config)
      .then((response) => {
        // Chuyển dữ liệu blob thành URL cho hình ảnh
        const imgUrl = URL.createObjectURL(response.data);
        localStorage.setItem("image", imgUrl);
        setImage(imgUrl);
      })
      .catch((error) => {
        console.log(error);
      });

  }, []);

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

  const handleFileSelect = (e) => {
    const data = new FormData();
    data.append('file', e.target.files[0]);
    data.append('email', currentEmail);

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      responseType: 'blob',
      url: `${prod}/api/v1/secured/upload-avatar`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`,
      },
      "data": data,
    };

    axios(config)
      .then((response) => {
        const imgUrl = URL.createObjectURL(response.data);
        localStorage.setItem("image", imgUrl);
        setImage(imgUrl);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <>
      <Helmet>
        <title> Profile </title>
        <link rel='icon' type='image/x-icon' href='/assets/logo.svg' />

      </Helmet>

      <Container>
        <StyledContent>
          <Stack spacing={3}>
            <div className="card">

              <div className="banner">
                <Button fullWidth component="label" color={"warning"}>
                  <img className="profile-img" src={image || "assets/images/avatars/25.jpg"} alt="profile-img" />
                  <VisuallyHiddenInput type="file" onChange={(e) => { handleFileSelect(e) }} />
                </Button>

              </div>
              <div className="menu">
                <div className="opener"><span /><span /><span /></div>
              </div>
              <h2 className="name">{firstName} {lastName} </h2>
              <div className="title">IEA Users</div>
              <div className="actions">
                <div className="follow-info">
                  <h2><a href="#"><span>Name</span><small > {firstName} </small></a></h2>
                  <h2><a href="#"><span>Refcode</span><small>123456</small></a></h2>
                </div>
                <div className="follow-info">
                  <h2><a href="#"><span>Phone</span><small>Alex</small></a></h2>
                  <h2><a href="#"><span>Mail</span><small>{currentEmail}</small></a></h2>
                </div>
              </div>
              <div className="desc">Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.</div>
            </div>


            <h3 className='profile-title'> Update profile</h3>
            <TextField className="input-profile-email" name="email" type="text" value={currentEmail} readOnly />
            <TextField name="firstName" type="text" value={firstName || ''} onChange={(e) => { setFirstName(e.target.value) }} />
            <TextField name="lastName" type="text" value={lastName || ''} onChange={(e) => { setLastName(e.target.value) }} />

            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
              Update profile
            </LoadingButton>
          </Stack>
        </StyledContent>
      </Container>
    </>
  );
}
