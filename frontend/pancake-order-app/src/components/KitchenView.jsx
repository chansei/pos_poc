import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container, Typography, Box, Card, CardContent,
    Button, Checkbox, FormControlLabel, Stack, Divider
} from "@mui/material";
import NavigationBar from "../components/NavigationBar";



const KitchenView = () => {
    const [orders, setOrders] = useState([]);
    const [hideReceived, setHideReceived] = useState(true);

    // JST変換関数
    const convertToJST = (utcDateString) => {
        const utcDate = new Date(utcDateString);
        return new Date(utcDate.getTime() + 9 * 60 * 60 * 1000);
    };

    // 経過時間を計算
    const elapsedTime = (createdAt) => {
        const now = new Date();
        const diffMs = now - createdAt;
        const minutes = Math.floor(diffMs / 60000);
        const seconds = Math.floor((diffMs % 60000) / 1000);
        return `${minutes}分${seconds}秒`;
    };

    const fetchOrders = async () => {
        const res = await axios.get("http://localhost:8000/api/orders");
        setOrders(res.data);
    };

    const updateOrderStatus = async (orderId, status) => {
        await axios.post(`http://localhost:8000/api/orders/${orderId}/status`, { status });
        fetchOrders();
    };

    const updateUnitStatus = async (unitId, status) => {
        await axios.post(`http://localhost:8000/api/order_item_unit/${unitId}/status`, { status });
        fetchOrders();
    };

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const filteredOrders = hideReceived
        ? orders.filter((order) => order.status !== "received")
        : orders;

    return (
        <>
            <NavigationBar title="キッチン画面" />

            <Container
                maxWidth="md"
                sx={{
                    mt: 2,
                    maxHeight: "calc(100vh - 100px)",
                    overflowY: "auto",
                    pr: 1
                }}
            >
                <Typography variant="h4" gutterBottom>
                    キッチン注文一覧
                </Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={hideReceived}
                            onChange={(e) => setHideReceived(e.target.checked)}
                        />
                    }
                    label="受取完了は非表示"
                />

                {filteredOrders.length === 0 ? (
                    <Typography>表示可能な注文がありません</Typography>
                ) : (
                    filteredOrders.map((order) => {
                        const orderTime = convertToJST(order.created_at);

                        return (
                            <Card key={order.id} sx={{ mb: 2 }}>
                                <CardContent>
                                    <Typography variant="h6">
                                        注文 #{order.id} - <em>{order.status}</em>
                                    </Typography>

                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
                                        注文時間: {orderTime.toLocaleTimeString("ja-JP", { hour12: false })}（{elapsedTime(orderTime)} 経過）
                                    </Typography>

                                    <Divider sx={{ my: 1 }} />

                                    {order.items.map((item) => (
                                        <Box key={item.id} sx={{ mb: 2 }}>
                                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                                {item.name} × {item.quantity}
                                            </Typography>

                                            <Stack direction="row" spacing={1} flexWrap="wrap">
                                                {item.units.map((unit) => (
                                                    <Box
                                                        key={unit.id}
                                                        sx={{
                                                            border: "1px solid #ccc",
                                                            borderRadius: 1,
                                                            padding: 1,
                                                            minWidth: 120,
                                                            textAlign: "center",
                                                            backgroundColor: unit.status === "done" ? "#f0f0f0" : "white",
                                                            opacity: unit.status === "done" ? 0.5 : 1,
                                                        }}
                                                    >
                                                        <Typography variant="body2" sx={{ mb: 1 }}>
                                                            状態: {unit.status}
                                                        </Typography>
                                                        <Stack spacing={1}>
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                onClick={() => updateUnitStatus(unit.id, "cooking")}
                                                            >
                                                                調理中
                                                            </Button>
                                                            <Button
                                                                size="small"
                                                                variant="contained"
                                                                onClick={() => updateUnitStatus(unit.id, "done")}
                                                            >
                                                                調理完了
                                                            </Button>
                                                        </Stack>
                                                    </Box>
                                                ))}
                                            </Stack>
                                        </Box>
                                    ))}

                                    <Divider sx={{ my: 2 }} />
                                    <Stack direction="row" spacing={2}>
                                        <Button
                                            variant="outlined"
                                            onClick={() => updateOrderStatus(order.id, "cooking")}
                                        >
                                            調理中
                                        </Button>
                                        <Button
                                            variant="contained"
                                            onClick={() => updateOrderStatus(order.id, "done")}
                                        >
                                            全体調理完了
                                        </Button>
                                        {order.status === "done" && (
                                            <Button
                                                variant="contained"
                                                color="success"
                                                onClick={() => updateOrderStatus(order.id, "received")}
                                            >
                                                受取完了
                                            </Button>
                                        )}
                                    </Stack>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </Container>
        </>
    );
};

export default KitchenView;