import axios from "axios";
import { getAuthToken } from "../services/api.js";
import { loadAuthSession } from "./authSession.js";

const axiosInstance = axios.create({
  baseURL: " https://ecommerceweb-7p1x.onrender.com/api",
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use((config) => {
  const token = getAuthToken() || loadAuthSession()?.token;
  // Admin requests provide their own token. Do not replace it with the
  // storefront customer's token when both sessions exist in localStorage.
  if (token && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosInstance;
