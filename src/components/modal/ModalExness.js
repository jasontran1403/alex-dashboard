import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { Button, FormGroup, FormLabel, Input, Typography } from '@mui/material';
import Swal from 'sweetalert2';
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

export default function ModalExness({ isOpen, onClose }) {
    const navigate = useNavigate();
    const [currentEmail] = useState(localStorage.getItem("email") ? localStorage.getItem("email") : "");
    const [currentAccessToken] = useState(localStorage.getItem("access_token") ? localStorage.getItem("access_token") : "");
    const [exnessId, setExnessId] = useState("");

    const handleSubmit = () => {
        onClose();
        if (exnessId === "") {
            Swal.fire({
                title: "Vui lòng nhập exness id!",
                icon: "error",
                timer: 3000,
                position: 'center',
                showConfirmButton: false
            });
            return;
        }

        const data = JSON.stringify({
            "email": currentEmail,
            "exness": exnessId,
            "type": 1
        });

        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${prod}/api/v1/secured/update-exness`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${currentAccessToken}`
            },
            "data": data
        };

        axios.request(config)
            .then((response) => {
                if (response.data.status === 200) {
                    Swal.fire({
                        title: response.data.message,
                        icon: "success",
                        timer: 3000,
                        position: 'center',
                        showConfirmButton: false
                    }).then(() => {
                        window.location.reload();
                    });
                } else if (response.data.status === 226) {
                    Swal.fire({
                        title: response.data.message,
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
                    <Typography variant="h4" gutterBottom>
                        Add Exness ID
                    </Typography>
                    <Input value={exnessId} name="exness" onChange={(e) => { setExnessId(e.target.value) }} type="text" placeholder="Enter exness id..." autoComplete='false' />
                    <Button onClick={handleSubmit}>Add</Button>
                </Box>
            </Modal>
        </div>
    );
}