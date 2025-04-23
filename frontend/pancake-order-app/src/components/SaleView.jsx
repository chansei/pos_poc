import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Typography,
    Paper,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Button,
    Box,
} from "@mui/material";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import NavigationBar from "../components/NavigationBar";

const getBaseUrl = () => localStorage.getItem("api_base_url") || "http://localhost:8000/api";

const SalesView = () => {
    const [sales, setSales] = useState([]);
    const [timeData, setTimeData] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchSales = async () => {
        const res1 = await axios.get(`${getBaseUrl()}/sale/today`);
        const res2 = await axios.get(`${getBaseUrl()}/sale/by-time`);

        setSales(res1.data);
        setTimeData(transformToStackedBar(res2.data));
        setLoading(false);
    };

    const resetSales = async () => {
        await axios.post(`${getBaseUrl()}/sale/reset`);
        fetchSales();
    };

    // 時系列データを stacked bar 用に変換
    const transformToStackedBar = (raw) => {
        const map = {};
        raw.forEach((entry) => {
            const { time, name, count } = entry;
            if (!map[time]) map[time] = { time };
            map[time][name] = count;
        });
        return Object.values(map);
    };

    useEffect(() => {
        fetchSales();
    }, []);

    return (
        <>
            <NavigationBar title="購買情報" />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>
                    当日の商品別販売個数
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>商品名</TableCell>
                                <TableCell align="right">個数</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sales.map((row) => (
                                <TableRow key={row.name}>
                                    <TableCell>{row.name}</TableCell>
                                    <TableCell align="right">{row.count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>

                <Typography variant="h5" gutterBottom>
                    30分ごとの売上推移（商品別）
                </Typography>

                <Paper sx={{ p: 2, mb: 3 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={timeData}>
                            <XAxis dataKey="time" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {sales.map((s) => (
                                <Bar key={s.name} dataKey={s.name} stackId="a" fill="#8884d8" />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                </Paper>

                <Box textAlign="center">
                    <Button variant="outlined" color="error" onClick={resetSales}>
                        本日の履歴をリセット
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default SalesView;
