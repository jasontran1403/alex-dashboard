import axios from "axios";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// @mui
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton, Popover } from '@mui/material';
// mocks_
import Swal from 'sweetalert2';
import { prod, dev } from "../../../utils/env";

import ModalChangePassword from '../../../components/changePassword';

const MENU_OPTIONS = [
  {
    label: 'Home',
    icon: 'eva:home-fill',
  },
  {
    label: 'Change Password',
    icon: 'eva:person-fill',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const [email] = useState(localStorage.getItem("email"));
  const [currentAccessToken] = useState(localStorage.getItem("access_token"));
  const [open, setOpen] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
  const [image,setImage] = useState("")
  


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

  const handleCloseModal = () => {
    setIsModalOpen(false);
  }

  const navigate = useNavigate();
  const handleOpen = (event) => {
    setOpen(event.currentTarget);
  };

  const handleClose = (e) => {
    setOpen(false);
    if (e === "Change Password") {
      setIsModalOpen(true);
    }
  };

  const handleLogout = () => {
    const data = JSON.stringify({
      "access_token": localStorage.getItem("access_token")
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/auth/logout`,
      headers: {
        'Content-Type': 'application/json'
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        if (response.data === "OK") {
          Swal.fire({
            title: "Đăng xuất thành công!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            handleClose();
            localStorage.clear();
            navigate('/login', { replace: true });
          })
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
        }
      });


  }
  return (
    <>
      <IconButton
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={image} alt="photoURL" />
      </IconButton>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 0,
            mt: 1.5,
            ml: 0.75,
            width: 180,
            '& .MuiMenuItem-root': {
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
            {email}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {email}
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} onClick={() => { handleClose(option.label) }}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>


        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleLogout} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </Popover>
      <ModalChangePassword isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
