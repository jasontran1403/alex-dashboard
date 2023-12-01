import * as React from 'react';
import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Container, Typography, Divider, Button, Link, Stack, IconButton, InputAdornment, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import Swal from 'sweetalert2';
import { styled } from '@mui/material/styles';
import Iconify from "../iconify";
import Label from '../label';
import { prod, dev } from "../../utils/env";

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

export default function ModalChangePassword({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [faCode, setFaCode] = useState("");
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = () => {
        onClose();
        if (newPassword === "" && confirmPassword === "") {
            Swal.fire({
                title: "New password and Confirm new password is required!",
                icon: "error",
                timer: 3000,
                position: 'center',
                showConfirmButton: false
            });
        } else if (newPassword !== confirmPassword) {
            Swal.fire({
                title: "New password and Confirm new password must be matched!",
                icon: "error",
                timer: 3000,
                position: 'center',
                showConfirmButton: false
            });
        } else {
            const data = JSON.stringify({
                "email": currentEmail,
                "password": newPassword,
                "code": faCode
            });

            const config = {
                method: 'post',
                maxBodyLength: Infinity,
                url: `${prod}/api/v1/secured/change-password`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${currentAccessToken}`
                },
                "data": data
            };

            axios.request(config)
                .then((response) => {
                    if (response.data === "Thay đổi mật khẩu thành công!") {
                        Swal.fire({
                            title: response.data,
                            icon: "success",
                            timer: 3000,
                            position: 'center',
                            showConfirmButton: false
                        }).then(() => {
                            window.location.reload();
                        });
                    } else if (response.data === "Mã 2FA không chính xác!") {
                        Swal.fire({
                            title: response.data,
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
                            localStorage.clear();
                            navigate('/login', { replace: true });
                        });
                    }
                });

        }
    };

    return (
        <div>
            <Modal
                open={isOpen}
                onClose={onClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >

                <Box sx={style} className="flex">
                    <Stack spacing={3}>
                        <TextField onChange={(e) => { setNewPassword(e.target.value) }}
                            name="newPassword"
                            label="New password"
                            type={showNewPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                            <Iconify icon={showNewPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField onChange={(e) => { setConfirmPassword(e.target.value) }}
                            name="confirmNewPassword"
                            label="Confirm new password"
                            type={showConfirmPassword ? 'text' : 'password'}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
                                            <Iconify icon={showConfirmPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <TextField name="facode" type="text" label="2FA Code" onChange={(e) => { setFaCode(e.target.value) }} />
                    </Stack>

                    <LoadingButton fullWidth size="large" type="submit" variant="contained" onClick={handleSubmit}>
                        Change password
                    </LoadingButton>
                </Box>
            </Modal>
        </div>
    );
}