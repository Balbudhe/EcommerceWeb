import axios from "../utils/Axios";
const KEY = "vora_admin_session";
export const session = {
  get() {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "null");
    } catch {
      return null;
    }
  },
  set(value) {
    localStorage.setItem(KEY, JSON.stringify(value));
  },
  clear() {
    localStorage.removeItem(KEY);
  },
};
const request = (prefix, method, url, data) => {
  const token = session.get()?.token;
  return axios({
    method,
    url: `/${prefix}${url}`,
    data,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  }).then((response) => response.data);
};
export const api = (method, url, data) => request("admin", method, url, data);
export const productApi = (method, url, data) =>
  request("product", method, url, data);
export const money = (value = 0) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
export const stock = (product) =>
  product.variants?.reduce(
    (total, variant) => total + Number(variant.stock || 0),
    0,
  ) || 0;
