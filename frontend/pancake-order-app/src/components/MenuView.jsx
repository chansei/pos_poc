import React, { useEffect, useState } from "react";
import {
    Container, Typography, TextField, Button,
    Table, TableBody, TableCell, TableHead, TableRow, Box, IconButton, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";
import NavigationBar from "../components/NavigationBar";
import Toast from "../components/Toast";

const getBaseUrl = () => localStorage.getItem("api_base_url") || "http://localhost:8000/api";

const MenuView = () => {
    const [menuList, setMenuList] = useState([]);
    const [newName, setNewName] = useState("");
    const [newPrice, setNewPrice] = useState("");

    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editPrice, setEditPrice] = useState("");

    const [toastOpen, setToastOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastSeverity, setToastSeverity] = useState("info");

    const [deleteTargetId, setDeleteTargetId] = useState(null);
    const [deletePassword, setDeletePassword] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const fetchMenu = async () => {
        const res = await axios.get(`${getBaseUrl()}/menu`);
        setMenuList(res.data);
    };

    const handleAdd = async () => {
        if (!newName || isNaN(newPrice)) return alert("名前と価格を入力してください");
        await axios.post(`${getBaseUrl()}/menu`, {
            name: newName,
            price: parseInt(newPrice),
        });
        setNewName("");
        setNewPrice("");
        fetchMenu();
        showToast("追加しました！", "success");
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditName(item.name);
        setEditPrice(item.price);
    };

    const handleUpdate = async (id) => {
        await axios.put(`${getBaseUrl()}/menu/${id}`, {
            name: editName,
            price: parseInt(editPrice),
        });
        setEditingId(null);
        fetchMenu();
        showToast("保存しました！", "success");

    };

    const confirmDelete = (id) => {
        setDeleteTargetId(id);
        setDeletePassword("");
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        try {
            await axios.delete(`${getBaseUrl()}/menu/${deleteTargetId}`, {
                data: { password: deletePassword },
            });
            setDeleteDialogOpen(false);
            fetchMenu();
            showToast("削除しました！", "success");
        } catch (err) {
            showToast("削除に失敗しました(" + (err.response?.data?.detail || err.message) + ")", "error");
        }
    };

    useEffect(() => {
        fetchMenu();
    }, []);

    const showToast = (message, severity = "info") => {
        setToastMessage(message);
        setToastSeverity(severity);
        setToastOpen(true);
    };


    return (
        <>
            <NavigationBar title="メニュー管理" />
            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Typography variant="h5" gutterBottom>メニュー一覧</Typography>

                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>メニュー名</TableCell>
                            <TableCell>価格</TableCell>
                            <TableCell>操作</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {menuList.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    {editingId === item.id ? (
                                        <TextField
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            size="small"
                                        />
                                    ) : (
                                        item.name
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === item.id ? (
                                        <TextField
                                            type="number"
                                            value={editPrice}
                                            onChange={(e) => setEditPrice(e.target.value)}
                                            size="small"
                                        />
                                    ) : (
                                        `¥${item.price}`
                                    )}
                                </TableCell>
                                <TableCell>
                                    {editingId === item.id ? (
                                        <IconButton onClick={() => handleUpdate(item.id)} color="primary">
                                            <SaveIcon />
                                        </IconButton>
                                    ) : (
                                        <>
                                            <IconButton onClick={() => startEdit(item)} color="inherit">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton onClick={() => confirmDelete(item.id)} color="error">
                                                <DeleteIcon />
                                            </IconButton>
                                        </>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">新規メニュー追加</Typography>
                    <TextField
                        label="メニュー名"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        sx={{ mr: 2 }}
                    />
                    <TextField
                        label="価格"
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        sx={{ mr: 2 }}
                    />
                    <Button variant="contained" onClick={handleAdd}>追加</Button>
                </Box>
            </Container>

            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>削除確認</DialogTitle>
                <DialogContent>
                    <Typography sx={{ mb: 2 }}>
                        このメニューを削除するには管理用パスワードを入力してください。
                    </Typography>
                    <TextField
                        label="パスワード"
                        type="password"
                        fullWidth
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>キャンセル</Button>
                    <Button color="error" onClick={handleDelete}>削除</Button>
                </DialogActions>
            </Dialog>

            <Toast
                open={toastOpen}
                message={toastMessage}
                severity={toastSeverity}
                onClose={() => setToastOpen(false)}
            />
        </>
    );
};

export default MenuView;
