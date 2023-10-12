import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Swal from 'sweetalert2';
import Iconify from '../../../components/iconify';
import { prod, dev } from "../../../utils/env";

// ----------------------------------------------------------------------

export default function ForgotForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const handleGetCode = () => {
    if (email === "") {
      Swal.fire({
        title: "Vui lòng nhập email để nhận mã xác thực!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      })
      return;
    }
    if (!isValidEmail(email)) {
      Swal.fire({
        title: "Email không hợp lệ, vui lòng thử lại!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      })
      return;
    }
    const data = JSON.stringify({
      "email": email
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/auth/getCode`,
      headers: {
        'Content-Type': 'application/json'
      },
      "data": data
    };

    axios.request(config)
      .then((response) => response.data)
      .then(result => {
        if (result === "Email không tồn tại!") {
          Swal.fire({
            title: "Email không tồn tại, xin vui lòng thử lại!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          })
        } else if (result === "OK") {
          Swal.fire({
            title: "Mã xác thực đã được gửi về email, vui lòng kiểm tra email!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
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
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
  }

  const handleClick = () => {
    if (email === "" || newPassword === "" || confirmPassword === "" || code === "") {
      Swal.fire({
        title: "Vui lòng nhập thông tin bắt buộc để khôi phục mật khẩu!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      })
      return;
    }
    if (!isValidEmail(email)) {
      Swal.fire({
        title: "Email không hợp lệ, vui lòng thử lại!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      })
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        title: "Xác nhận mật khẩu không trùng với mật khẩu mới!",
        icon: "error",
        timer: 3000,
        position: 'center',
        showConfirmButton: false
      })
      return;
    }

    const data = JSON.stringify({
      "email": email,
      "newPassword": newPassword,
      "code": code
    });

    const config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `${prod}/api/v1/auth/forgot-password`,
      headers: {
        'Content-Type': 'application/json'
      },
      "data": data
    };

    axios.request(config)
      .then((response) => response.data)
      .then(result => {
        if (result === "Mã xác thực không chính xác!") {
          Swal.fire({
            title: "Mã xác thực không chính xác, xin vui lòng thử lại!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          })
        } else if (result === "OK") {
          Swal.fire({
            title: "Khôi phục mật khẩu thành công!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            navigate('/login', { replace: true });
          })
        }
      })
      .catch((error) => {
        if (error.response.status === 404) {
          Swal.fire({
            title: "Email không tồn tại, xin vui lòng thử lại!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          })
        } else {
          Swal.fire({
            title: "Có lỗi xảy ra, vui lòng thử lại sau!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          })
        }
      });

  };

  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  function isValidRefferall(id) {
    const idRegex = /^[0-9]+$/;
    return idRegex.test(id);
  }
  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" type="text" label="Email address" onChange={(e) => { setEmail(e.target.value) }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end" onClick={handleGetCode}>
                <IconButton edge="end">
                  <Iconify icon={'logos:google-gmail'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField onChange={(e) => { setNewPassword(e.target.value) }}
          name="newPassword"
          label="New Password"
          type={showPassword1 ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword1(!showPassword1)} edge="end">
                  <Iconify icon={showPassword1 ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField onChange={(e) => { setConfirmPassword(e.target.value) }}
          name="confirmPassword"
          label="New Password"
          type={showPassword2 ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword2(!showPassword2)} edge="end">
                  <Iconify icon={showPassword2 ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField name="code" type="text" label="Recovery code" onChange={(e) => { setCode(e.target.value) }} />

      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Recovery
      </LoadingButton>
    </>
  );
}
