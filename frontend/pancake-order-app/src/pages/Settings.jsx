import React, { useState, useEffect } from "react";
import {
    Container,
    Typography,
    TextField,
    Button,
    Box
} from "@mui/material";
import NavigationBar from "../components/NavigationBar";

const Settings = () => {
    const [apiUrl, setApiUrl] = useState("");

    // 起動時に localStorage から読み込み（なければデフォルト）
    useEffect(() => {
        const storedUrl = localStorage.getItem("api_base_url");
        setApiUrl(storedUrl || "http://localhost:8000/api");
    }, []);

    const handleSave = () => {
        localStorage.setItem("api_base_url", apiUrl);
        alert("API URLを保存しました！");
    };

    return (
        <>
            <NavigationBar title="設定" />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>API 接続設定</Typography>

                <TextField
                    label="APIベースURL"
                    fullWidth
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    sx={{ mt: 2 }}
                    helperText="例: http://localhost:8000/api"
                />

                <Box sx={{ mt: 3 }}>
                    <Button variant="contained" color="primary" onClick={handleSave}>
                        保存
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default Settings;
