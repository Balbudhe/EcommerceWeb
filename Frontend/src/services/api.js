/**
 * API layer for your Node.js + MongoDB backend.
 *
 * Set in Frontend/.env:
 *   VITE_API_URL=http://localhost:5000/api
 *
 * Expected routes (adjust names in this file to match your API):
 *   POST   /auth/register
 *   POST   /auth/login
 *   POST   /auth/logout
 *   GET    /auth/me
 *   PATCH  /auth/profile
 *   GET    /products
 *   GET    /products/:id
 *   GET    /categories
 *   GET    /cart
 *   POST   /cart          body: { productId, quantity, size, color }
 *   PATCH  /cart/:itemKey body: { quantity }
 *   DELETE /cart/:itemKey
 *   DELETE /cart
 *   GET    /wishlist
 *   POST   /wishlist      body: { productId }
 *   DELETE /wishlist/:productId
 *   GET    /orders
 *   POST   /orders
 *
 * Auth token is restored from a saved session on refresh.
 * Cart / wishlist / orders stay on MongoDB.
 */
import { loadAuthSession } from "../utils/authSession";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

let authToken = loadAuthSession()?.token || null;

export function setAuthToken(token) {
  authToken = token || null;
}

export function getAuthToken() {
  if (authToken) return authToken;
  return loadAuthSession()?.token || null;
}

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  if (!res.ok) {
    let message = `Request failed: ${res.status}`;
    try {
      const data = await res.json();
      message = data.message || data.error || message;
    } catch {
      try {
        message = (await res.text()) || message;
      } catch {
        /* ignore */
      }
    }
    throw new Error(message);
  }

  if (res.status === 204) return null;
  return res.json();
}

const delay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

const normalizeProduct = (product) => ({
  ...product,
  id: product.id || product._id,
  name: product.name || product.title,
  image: product.image || product.images?.[0] || "",
  images: product.images || [],
  colors: product.colors || [],
  sizes: product.sizes || [],
  features: product.features || [],
  rating: Number(product.rating || 0),
  reviews: Number(product.reviews || 0),
});

/** Session mock store (RAM only — cleared on refresh) */
const mock = {
  user: null,
  token: null,
  cart: [],
  wishlist: [],
  orders: [],
};

function mockCartItem(product, { quantity = 1, size, color } = {}) {
  const s = size || product.sizes?.[0];
  const c = color || product.colors?.[0];
  return {
    key: `${product.id}-${s}-${c}`,
    id: product.id,
    productId: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    size: s,
    color: c,
    quantity,
  };
}

export const api = {
  /* ---------- Auth ---------- */
  async register(name, email, password) {
    if (!API_BASE) {
      await delay(300);
      if (!name || !email || !password) throw new Error("All fields required");
      mock.user = { id: "u1", name, email };
      mock.token = "mock-jwt-token";
      setAuthToken(mock.token);
      return { token: mock.token, user: mock.user };
    }
    const data = await request("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  async login(email, password) {
    if (!API_BASE) {
      await delay(300);
      if (!email || !password) throw new Error("Email and password required");
      mock.user = { id: "u1", name: email.split("@")[0], email };
      mock.token = "mock-jwt-token";
      setAuthToken(mock.token);
      return { token: mock.token, user: mock.user };
    }
    const data = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data?.token) setAuthToken(data.token);
    return data;
  },

  async logout() {
    if (!API_BASE) {
      mock.user = null;
      mock.token = null;
      setAuthToken(null);
      return null;
    }
    try {
      await request("/auth/logout", { method: "POST" });
    } finally {
      setAuthToken(null);
    }
  },

  async getMe() {
    if (!API_BASE) {
      await delay();
      return mock.user;
    }
    return request("/auth/me");
  },

  async updateProfile(patch) {
    if (!API_BASE) {
      await delay();
      if (!mock.user) throw new Error("Not authenticated");
      mock.user = { ...mock.user, ...patch };
      return mock.user;
    }
    return request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
  },

  /* ---------- Catalog ---------- */
  async getProducts(params = {}) {
    const data = await request("/product/allproducts");
    let list = (data.products || data || []).map(normalizeProduct);
    if (params.category) {
      list = list.filter(
        (product) =>
          product.category?.toLowerCase() === params.category.toLowerCase(),
      );
    }
    if (params.search) {
      const query = params.search.toLowerCase();
      list = list.filter(
        (product) =>
          product.name?.toLowerCase().includes(query) ||
          product.description?.toLowerCase().includes(query),
      );
    }
    if (params.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (params.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    if (params.sort === "rating") list.sort((a, b) => b.rating - a.rating);
    return list;
  },

  async getProduct(id) {
    const products = await this.getProducts();
    return products.find((product) => String(product.id) === String(id)) || null;
  },

  async getCategories() {
    const products = await this.getProducts();
    return [...new Set(products.map((product) => product.category).filter(Boolean))]
      .sort()
      .map((name) => ({ id: name.toLowerCase(), name }));
  },

  /* ---------- Cart CRUD ---------- */
  async getCart() {
    if (!API_BASE) {
      await delay();
      return mock.cart;
    }
    return request("/cart");
  },

  async addToCart({ productId, quantity = 1, size, color, product }) {
    if (!API_BASE) {
      await delay();
      const p = product;
      if (!p) throw new Error("Product not found");
      const item = mockCartItem(p, { quantity, size, color });
      const existing = mock.cart.find((i) => i.key === item.key);
      if (existing) {
        existing.quantity += quantity;
      } else {
        mock.cart.push(item);
      }
      return [...mock.cart];
    }
    return request("/cart", {
      method: "POST",
      body: JSON.stringify({ productId, quantity, size, color }),
    });
  },

  async updateCartItem(itemKey, quantity) {
    if (!API_BASE) {
      await delay();
      if (quantity < 1) {
        mock.cart = mock.cart.filter((i) => i.key !== itemKey);
      } else {
        mock.cart = mock.cart.map((i) =>
          i.key === itemKey ? { ...i, quantity } : i
        );
      }
      return [...mock.cart];
    }
    return request(`/cart/${encodeURIComponent(itemKey)}`, {
      method: "PATCH",
      body: JSON.stringify({ quantity }),
    });
  },

  async removeCartItem(itemKey) {
    if (!API_BASE) {
      await delay();
      mock.cart = mock.cart.filter((i) => i.key !== itemKey);
      return [...mock.cart];
    }
    return request(`/cart/${encodeURIComponent(itemKey)}`, {
      method: "DELETE",
    });
  },

  async clearCart() {
    if (!API_BASE) {
      await delay();
      mock.cart = [];
      return [];
    }
    return request("/cart", { method: "DELETE" });
  },

  /* ---------- Wishlist CRUD ---------- */
  async getWishlist() {
    if (!API_BASE) {
      await delay();
      return [...mock.wishlist];
    }
    return request("/wishlist");
  },

  async addToWishlist(productId) {
    if (!API_BASE) {
      await delay();
      if (!mock.wishlist.includes(productId)) mock.wishlist.push(productId);
      return [...mock.wishlist];
    }
    return request("/wishlist", {
      method: "POST",
      body: JSON.stringify({ productId }),
    });
  },

  async removeFromWishlist(productId) {
    if (!API_BASE) {
      await delay();
      mock.wishlist = mock.wishlist.filter((id) => id !== productId);
      return [...mock.wishlist];
    }
    return request(`/wishlist/${encodeURIComponent(productId)}`, {
      method: "DELETE",
    });
  },

  /* ---------- Orders ---------- */
  async getOrders() {
    return request("/order/my-orders");
  },

  async cancelOrder(orderId) {
    return request(`/order/${orderId}/cancel`, {
      method: "PATCH",
    });
  },

  async trackOrder(orderId) {
    return request(`/order/${orderId}/track`);
  },

  async checkServiceability(pincode, { weight = 0.5, cod = 0 } = {}) {
    const params = new URLSearchParams({
      pincode: String(pincode),
      weight: String(weight),
      cod: String(cod),
    });
    return request(`/order/serviceability?${params.toString()}`);
  },

  async placeOrder(order) {
    if (!API_BASE) {
      await delay(400);
      const created = {
        id: `ORD-${Date.now().toString().slice(-8)}`,
        ...order,
        status: "confirmed",
        createdAt: new Date().toISOString(),
      };
      mock.orders.unshift(created);
      mock.cart = [];
      return created;
    }
    return request("/order", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  async initiatePayment(order) {
    return request("/order/payment/create", {
      method: "POST",
      body: JSON.stringify(order),
    });
  },

  async verifyPayment(payment) {
    return request("/order/payment/verify", {
      method: "POST",
      body: JSON.stringify(payment),
    });
  },
};
