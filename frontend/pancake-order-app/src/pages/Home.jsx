import React from "react";
import {
    AppBar, Toolbar, IconButton, Typography, Drawer,
    Box, List, ListItem, ListItemText, Container
} from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";

const Home = () => {
    const [drawerOpen, setDrawerOpen] = React.useState(false);
    const navigate = useNavigate();

    const toggleDrawer = () => setDrawerOpen(!drawerOpen);

    return (
        <Box>
            <AppBar position="static">
                <Toolbar>
                    <IconButton color="inherit" edge="start" onClick={toggleDrawer}>
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>ホーム</Typography>
                </Toolbar>
            </AppBar>

            <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer}>
                <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
                    <List>
                        <ListItem button onClick={() => navigate("/order")}> <ListItemText primary="注文" /> </ListItem>
                        <ListItem button onClick={() => navigate("/kitchen")}> <ListItemText primary="キッチン" /> </ListItem>
                        <ListItem button onClick={() => navigate("/call")}> <ListItemText primary="呼出" /> </ListItem>
                    </List>
                </Box>
            </Drawer>

            <Container maxWidth="sm" sx={{ mt: 4 }}>
                <Typography variant="h4" gutterBottom>
                    パンケーキ販売システム
                </Typography>
                <Typography variant="body1">
                    左上のメニューから操作画面へ移動できます。
                </Typography>
            </Container>
        </Box>
    );
};

export default Home;
