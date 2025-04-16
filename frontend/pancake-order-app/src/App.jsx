import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Kitchen from "./pages/Kitchen";
import CallScreen from "./pages/CallScreen";
import Settings from "./pages/Settings";
import Menu from "./pages/Menu";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<Order />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/call" element={<CallScreen />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;