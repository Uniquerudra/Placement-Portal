// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "https://portal-1tpo-backend.onrender.com/api",
});

export default API;