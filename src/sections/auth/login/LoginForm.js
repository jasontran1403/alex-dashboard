import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// @mui
import { Link, Stack, IconButton, InputAdornment, TextField, Checkbox } from '@mui/material';
import { LoadingButton } from '@mui/lab';
// components
import Swal from 'sweetalert2';
import Iconify from '../../../components/iconify';
import { prod, dev } from "../../../utils/env";

// ----------------------------------------------------------------------

export default function LoginForm() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  

  const handleClick = () => {
    if (email === "" || password === "") {
      Swal.fire({
        title: "Vui lòng nhập id và mật khẩu để đăng nhập!",
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
      "email": email,
      "password": password
    });

    const config = {
      method: 'post',
      url: `${prod}/api/v1/auth/authenticate`,
      headers: {
        'Content-Type': 'application/json'
      },
      "data": data
    };

    axios.request(config)
      .then((response) => {
        if (response.status === 200) {
          localStorage.setItem("email", email);
          localStorage.setItem("access_token", response.data.access_token);
          Swal.fire({
            title: "Đăng nhập thành công!",
            icon: "success",
            timer: 3000,
            position: 'center',
            showConfirmButton: false
          }).then(() => {
            navigate('/dashboard', { replace: true });
          });
        }
      })
      .catch((error) => {
        Swal.fire({
          title: "Tài khoản không hợp lệ!",
          icon: "error",
          timer: 3000,
          position: 'center',
          showConfirmButton: false
        })
      });

  };

  function isValidEmail(email) {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(email);
  }

  return (
    <>
      <Stack spacing={3}>
        <TextField name="email" type="email" label="Email address" onChange={(e) => {setEmail(e.target.value)}}/>

        <TextField onChange={(e) => {setPassword(e.target.value)}}
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
      </Stack>

      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ my: 2 }}>
        <Link href={"/forgot"} variant="subtitle2" underline="hover">
          Forgot password?
        </Link>
      </Stack>

      <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleClick}>
        Login
      </LoadingButton>
    </>
  );
}
