import React, { useEffect, useState } from "react";
import {
    Container, Typography, Box, Grid, Card, CardContent,
    CardActions, Button, Stack, TextField, Paper
} from "@mui/material";
import axios from "axios";
import NavigationBar from "../components/NavigationBar";
import Toast from "../components/Toast";

const OrderForm = () => {
    const [menuList, setMenuList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [cash, setCash] = useState("");
    const [change, setChange] = useState(null);

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState("info");

    useEffect(() => {
        axios.get("http://localhost:8000/api/menu").then((res) => {
            setMenuList(res.data);
            const initQuantities = {};
            res.data.forEach((item) => {
                initQuantities[item.id] = 0;
            });
            setQuantities(initQuantities);
        });
    }, []);

    useEffect(() => {
        const total = calculateTotal();
        const val = parseInt(cash);
        if (!isNaN(val)) {
            setChange(val - total);
        } else {
            setChange(null);
        }
    }, [cash]);

    const handleQuantityChange = (id, delta) => {
        setQuantities((prev) => ({
            ...prev,
            [id]: Math.max(0, (prev[id] || 0) + delta),
        }));
    };

    const calculateTotal = () => {
        return menuList.reduce((sum, item) => {
            return sum + item.price * (quantities[item.id] || 0);
        }, 0);
    };

    const handleSubmit = async () => {
        const total = calculateTotal();
        const parsedCash = parseInt(cash);

        if (cash === "" || isNaN(parsedCash)) {
            showToast("預かり金を入力してください", "error");
            return;
        }
        if (parsedCash < total) {
            showToast("預かり金が不足しています", "error");
            return;
        }

        const items = Object.entries(quantities)
            .filter(([_, qty]) => qty > 0)
            .map(([menu_id, quantity]) => ({
                menu_id: parseInt(menu_id),
                quantity,
            }));

        if (items.length === 0) {
            showToast("1つ以上の商品を選択してください", "error");
            return;
        }

        await axios.post("http://localhost:8000/api/order", { items });
        showToast("注文を送信しました！", "success");

        // 初期化
        setQuantities(Object.fromEntries(Object.keys(quantities).map(k => [k, 0])));
        setCash("");
        setChange(null);
    };

    const showToast = (message, severity = "info") => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };

    const total = calculateTotal();

    return (
        <>
            <NavigationBar title="注文画面" />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>メニューを選択</Typography>
                <Grid container spacing={2}>
                    {menuList.map((menu) => (
                        <Grid item xs={12} sm={6} md={4} key={menu.id}>
                            <Card>
                                <CardContent>
                                    <Typography variant="h6">{menu.name}</Typography>
                                    <Typography>¥{menu.price}</Typography>
                                </CardContent>
                                <CardActions>
                                    <Button onClick={() => handleQuantityChange(menu.id, -1)}>-</Button>
                                    <Typography>{quantities[menu.id] || 0}</Typography>
                                    <Button onClick={() => handleQuantityChange(menu.id, 1)}>+</Button>
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                <Box sx={{ mt: 4 }}>
                    {/* 行 1 */}
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "1")}>1</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "2")}>2</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "3")}>3</Button>
                        </Grid>
                    </Grid>

                    {/* 行 2 */}
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "4")}>4</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "5")}>5</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "6")}>6</Button>
                        </Grid>
                    </Grid>

                    {/* 行 3 */}
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "7")}>7</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "8")}>8</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "9")}>9</Button>
                        </Grid>
                    </Grid>

                    {/* 行 4 */}
                    <Grid container spacing={1} sx={{ mt: 1 }}>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash("")}>AC</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash + "0")}>0</Button>
                        </Grid>
                        <Grid item xs={4}>
                            <Button fullWidth variant="outlined" onClick={() => setCash(cash.slice(0, -1))}>⌫</Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ width: "100%" }}>
                    <Paper variant="outlined" sx={{ p: 2, width: "100%" }}>
                        <Grid container spacing={2}>
                            {/* 合計金額 */}
                            <Grid item xs={4}>
                                <Typography variant="subtitle2" color="text.secondary" align="center">
                                    合計金額
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" align="center">
                                    ¥{calculateTotal()}
                                </Typography>
                            </Grid>

                            {/* 預かり金 */}
                            <Grid item xs={4}>
                                <Typography variant="subtitle2" color="text.secondary" align="center">
                                    預かり金
                                </Typography>
                                <Typography variant="h6" fontWeight="bold" align="center">
                                    {cash === "" ? "--" : `¥${cash}`}
                                </Typography>
                            </Grid>

                            {/* お釣り */}
                            <Grid item xs={4}>
                                <Typography variant="subtitle2" color="text.secondary" align="center">
                                    お釣り
                                </Typography>
                                <Typography
                                    variant="h6"
                                    fontWeight="bold"
                                    align="center"
                                    color={
                                        cash === "" || isNaN(parseInt(cash))
                                            ? "text.disabled"
                                            : change < 0
                                                ? "error"
                                                : "primary"
                                    }
                                >
                                    {cash === "" || isNaN(parseInt(cash))
                                        ? "--"
                                        : change < 0
                                            ? "金額が不足しています"
                                            : `¥${change}`}
                                </Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Box>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    sx={{ mt: 2 }}
                    disabled={total === 0}
                >
                    注文を送信
                </Button>
            </Container>

            {/* ✅ 共通トースト通知 */}
            <Toast
                open={toastOpen}
                message={toastMessage}
                severity={toastSeverity}
                onClose={() => setToastOpen(false)}
            />
        </>
    );
};

export default OrderForm;
