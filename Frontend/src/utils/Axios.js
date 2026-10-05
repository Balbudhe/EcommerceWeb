import axios from "axios";
import { getAuthToken } from "../services/api.js";
import { loadAuthSession } from "./authSession.js";

function resolveApiBase() {
  const fallback = import.meta.env.PROD
    ? "https://ecommerce-web-sigma-six.vercel.app/api"
    : "http://localhost:5000/api";
  const raw = String(import.meta.env.VITE_API_URL || fallback).trim();
  const cleaned = raw.replace(/\/+$/, "");
  return cleaned.endsWith("/api") ? cleaned : `${cleaned}/api`;
}

const axiosInstance = axios.create({
  baseURL: resolveApiBase(),
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
