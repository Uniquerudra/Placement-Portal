// src/api.js
import axios from "axios";

let baseURL = (process.env.REACT_APP_API_URL || "https://portal-1tpo-backend.onrender.com/api").trim();
if (baseURL && !baseURL.startsWith("http")) {
  baseURL = `https://${baseURL}`;
}

const API = axios.create({
  baseURL: baseURL,
});

export default API;