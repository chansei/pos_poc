import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Order from "./pages/Order";
import Kitchen from "./pages/Kitchen";
import CallScreen from "./pages/CallScreen";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/order" element={<Order />} />
        <Route path="/kitchen" element={<Kitchen />} />
        <Route path="/call" element={<CallScreen />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;