// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://portal-1tpo-backend.onrender.com/api",
});

export default API;