// components/NavigationBar.jsx
import React, { useState } from "react";
import {
    AppBar, Toolbar, Typography, IconButton, Drawer, List, ListItem,
    ListItemText, ListItemButton
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";

const NavigationBar = ({ title = "Pancake POS" }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const menuItems = [
        { label: "注文画面", path: "/order" },
        { label: "キッチン画面", path: "/kitchen" },
        { label: "呼出画面", path: "/call" },
        { label: "メニュー管理", path: "/menu" },
        { label: "設定", path: "/settings" },
    ];

    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" onClick={() => setOpen(true)} edge="start">
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6">{title}</Typography>
                </Toolbar>
            </AppBar>
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <List>
                    {menuItems.map((item) => (
                        <ListItem disablePadding key={item.path}>
                            <ListItemButton
                                onClick={() => {
                                    navigate(item.path);
                                    setOpen(false);
                                }}
                            >
                                <ListItemText primary={item.label} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </>
    );
};

export default NavigationBar;
