import axios from "axios";

export const fetchMenu = async () => {
    const res = await axios.get("http://localhost:8000/api/menu");
    return res.data;
};

export const submitOrder = async (items) => {
    const res = await axios.post("http://localhost:8000/api/order", { items });
    return res.data;
};

export const updateUnitStatus = async (unitId, status) => {
    await axios.post(`http://localhost:8000/api/order_item_unit/${unitId}/status`, {
        status,
    });
};
