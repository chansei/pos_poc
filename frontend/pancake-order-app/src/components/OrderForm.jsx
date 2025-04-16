import React, { useEffect, useState } from "react";
import {
    Container, Typography, Box, Grid, Card, CardContent,
    CardActions, Button, Stack, TextField
} from "@mui/material";
import axios from "axios";
import NavigationBar from "../components/NavigationBar";
import Toast from "../components/Toast";

const OrderForm = () => {
    const [menuList, setMenuList] = useState([]);
    const [quantities, setQuantities] = useState({});
    const [cash, setCash] = useState("");
    const [change, setChange] = useState(null);

    // ✅ Toast 状態
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
                    <Typography variant="h6">合計金額：¥{total}</Typography>

                    <TextField
                        label="預かり金"
                        type="number"
                        value={cash}
                        onChange={(e) => {
                            const val = parseInt(e.target.value);
                            setCash(e.target.value);
                            setChange(!isNaN(val) ? val - total : null);
                        }}
                        sx={{ mt: 2 }}
                    />

                    {change !== null && (
                        <Typography sx={{ mt: 1 }} color={change < 0 ? "error" : "primary"}>
                            {change < 0 ? "金額が不足しています" : `お釣り：¥${change}`}
                        </Typography>
                    )}

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSubmit}
                        sx={{ mt: 2 }}
                        disabled={total === 0}
                    >
                        注文を送信
                    </Button>
                </Box>
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
