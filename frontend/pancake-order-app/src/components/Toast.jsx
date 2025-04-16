// components/Toast.jsx
import React from "react";
import { Snackbar, Alert } from "@mui/material";

const Toast = ({ open, message, severity = "info", onClose }) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={3000}
            onClose={onClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
            <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }} elevation={6} variant="filled">
                {message}
            </Alert>
        </Snackbar>
    );
};

export default Toast;
