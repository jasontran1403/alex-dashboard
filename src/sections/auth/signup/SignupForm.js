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

export default function LoginForm2() {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [refferal, setRefferal] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const handleClick = () => {
    if (email === "" || password === "" || firstName === "" || lastName === "" || refferal === "") {
      Swal.fire({
        title: "Vui lòng nhập thông tin bắt buộc để đăng ký!",
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
    // if (!isValidRefferall(refferal)) {
    //   Swal.fire({
    //     title: "ID không hợp lệ, vui lòng thử lại!",
    //     icon: "error",
    //     timer: 3000,
    //     position: 'center',
    //     showConfirmButton: false
    //   })
    //   return;
    // }

    const data = JSON.stringify({
      "firstname": firstName,
      "lastname": lastName,
      "email": email,
      "password": password,
      "refferal": refferal
    });

    const config = {
      method: 'post',
      url: `${prod}/api/v1/auth/register`,
      headers: {
        'Content-Type': 'application/json'
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        if (response.status === 200) {
          Swal.fire({
            title: "Đăng ký thành công!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            navigate('/login', { replace: true });
          });
        } else if (response.status === 226) {
          Swal.fire({
            title: "Email đã tồn tại!",
            icon: "error",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          })
        }
      })
      .catch(error => {
        if (error.response.status === 404) {
          Swal.fire({
            title: "Người giới thiệu không tồn tại trong hệ thống, vui lòng thử lại!",
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
        <TextField name="firstname" type="text" label="Firstname" onChange={(e) => { setFirstName(e.target.value) }} />
        <TextField name="lastname" type="text" label="Lastname" onChange={(e) => { setLastName(e.target.value) }} />
        <TextField name="email" type="text" label="Email address" onChange={(e) => { setEmail(e.target.value) }} />


        <TextField onChange={(e) => { setPassword(e.target.value) }}
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField name="refferal" type="text" label="Refferal" onChange={(e) => { setRefferal(e.target.value) }} />

      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
