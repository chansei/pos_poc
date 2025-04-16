import React from "react";
import {
    AppBar, Toolbar, IconButton, Typography, Drawer,
    Box, List, ListItem, ListItemText, Container
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import NavigationBar from "../components/NavigationBar";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const navigate = useNavigate();

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    return (
        <Box>
            <NavigationBar title="ホーム" />
            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    購買管理システム
                </Typography>
                <Typography variant="body1">
                    左上のメニューから操作画面へ移動できます。
                </Typography>
            </Container>
        </Box>
    );
};

export default Home;
