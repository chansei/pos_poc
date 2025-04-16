import axios from "axios";

const getBaseUrl = () => {
    return localStorage.getItem("api_base_url") || "http://localhost:8000/api";
};

export const fetchMenu = async () => {
    const res = await axios.get(`${getBaseUrl()}/menu`);
    return res.data;
};

export const submitOrder = async (items) => {
    const res = await axios.post(`${getBaseUrl()}/order`, { items });
    return res.data;
};

export const updateUnitStatus = async (unitId, status) => {
    await axios.post(`${getBaseUrl()}/order_item_unit/${unitId}/status`, {
        status,
    });
};
