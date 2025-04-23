import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Typography,
    Paper,
    Grid,
} from "@mui/material";
import NavigationBar from "../components/NavigationBar";

const getBaseUrl = () => localStorage.getItem("api_base_url") || "http://localhost:8000/api";

const CallView = () => {
    const [calledOrders, setCalledOrders] = useState([]);

    const fetchCalledOrders = async () => {
        try {
            const res = await axios.get(`${getBaseUrl()}/calls`);
            setCalledOrders(res.data);
        } catch (err) {
            console.error("呼び出し取得失敗:", err);
        }
    };

    useEffect(() => {
        fetchCalledOrders();
        const interval = setInterval(fetchCalledOrders, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <NavigationBar title="呼出画面" />

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    お呼び出し中の注文番号
                </Typography>

                {calledOrders.length === 0 ? (
                    <Typography align="center" sx={{ mt: 4 }}>
                        現在呼び出し中の注文はありません
                    </Typography>
                ) : (
                    <Grid container spacing={3} justifyContent="center" sx={{ mt: 2 }}>
                        {calledOrders.map((order) => (
                            <Grid item xs={6} sm={4} md={3} key={order.id}>
                                <Paper elevation={4} sx={{
                                    p: 3,
                                    textAlign: "center",
                                    backgroundColor: "#fff8e1",
                                    border: "2px solid #ff9800"
                                }}>
                                    <Typography variant="h3">#{order.id}</Typography>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                )}
            </Container>
        </>
    );
};

export default CallView;