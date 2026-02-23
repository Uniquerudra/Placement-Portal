// src/api.js
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "https://tpo-a6bf.onrender.com/api",
});

export default API;