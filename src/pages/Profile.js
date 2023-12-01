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
  const [bio, setBio] = useState("");
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
  const [refCode, setRefCode] = useState("");

  
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
        setRefCode(response.data.refCode);
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
        } else if (error.response.status === 410) {
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
        } else {
          console.log(error.response);
        }
      });

  }, []);


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
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${currentAccessToken}`
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        console.log(response.data);
        setFirstName(response.data.firstName);
        setLastName(response.data.lastName);
        setBio(response.data.bio);
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

  }, [currentEmail]);

  useEffect(() => {
    const config = {
      method: 'get',
      url: `${prod}/api/v1/secured/avatar/${currentEmail}`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`
      }
    };

    axios(config)
      .then((response) => {
        // Chuyển dữ liệu blob thành URL cho hình ảnh
        if (response.data === "") {
          setImage("assets/images/avatars/25.jpg");
          localStorage.setItem("image", "assets/images/avatars/25.jpg");
        } else {
          setImage(response.data);
          localStorage.setItem("image", response.data);
        }
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
      "lastName": lastName,
      "bio": bio,
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
            // localStorage.clear();
            // navigate('/login', { replace: true });
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
      url: `${prod}/api/v1/secured/upload-avatar`,
      headers: {
        'Authorization': `Bearer ${currentAccessToken}`,
      },
      "data": data,
    };

    axios(config)
      .then((response) => {
        localStorage.setItem("image", response.data);
        setImage(response.data);
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
                <div className = "profile-img">
                <Button className="avatar-btn" fullWidth component="label" >      
                  <img src={image || "assets/images/avatars/25.jpg"} alt="profile-img" />

                  <div className="overlay">
                    <div className="text">Change Avatar </div>
                  </div> 
                <VisuallyHiddenInput type="file" onChange={(e) => { handleFileSelect(e) }} />
                
                </Button>                            
                </div>
               

              </div>
              <div className="menu">
                <div className="opener"><span /><span /><span /></div>
              </div>
              <h2 className="name">{firstName} {lastName} </h2>
              <div className="title">IEA Users</div>
              <div className="actions">
                  <div className="follow-info">
                      <h2><a href="#"><span>First Name</span><small > {firstName} </small></a></h2>
                      <h2><a href="#"><span>Refcode</span><small>{refCode}</small></a></h2>
                  </div>
                  <div className="follow-info">
                      <h2><a href="#"><span>Last Name</span><small>{lastName}</small></a></h2>
                      <h2><a href="#"><span>Mail</span><small>{currentEmail}</small></a></h2>
                  </div>
                
              </div>
              <div className="desc">{bio}</div>
            </div>


            <h3 className='profile-title'> Update profile</h3>
            <TextField placeholder='Enter your Email' className="input-profile-email" name="email" type="text" value={currentEmail} readOnly />
            <TextField placeholder='Enter your FirstName ' name="firstName" type="text" value={firstName || ''}  onChange={(e) => { setFirstName(e.target.value) }  } />
            <TextField placeholder= 'Enter your lastname' name="lastname" type="text" value={lastName || ''} onChange={(e) => { setLastName(e.target.value) }} />
            <TextField placeholder= 'Enter your lastname' name="bio" type="text" value={bio || ''} onChange={(e) => { setBio(e.target.value) }} />


            <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
              Update profile
            </LoadingButton>
          </Stack>
        </StyledContent>
      </Container>
    </>
  );
}
