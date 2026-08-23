import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext(null);

function normalizeIds(payload) {
  if (!payload) return [];
  if (Array.isArray(payload) && payload.every((x) => typeof x === "string")) {
    return payload;
  }
  if (Array.isArray(payload)) {
    return payload.map((item) => item.productId || item.id || item._id).filter(Boolean);
  }
  if (Array.isArray(payload.productIds)) return payload.productIds;
  if (Array.isArray(payload.items)) {
    return payload.items.map((item) => item.productId || item.id || item._id).filter(Boolean);
  }
  return [];
}

export function WishlistProvider({ children }) {
  const { isAuthenticated, booting } = useAuth();
  const [ids, setIds] = useState([]);

  const refreshWishlist = useCallback(async () => {
    try {
      const data = await api.getWishlist();
      setIds(normalizeIds(data));
    } catch {
      setIds([]);
    }
  }, []);

  useEffect(() => {
    if (booting) return;
    if (!isAuthenticated) {
      setIds([]);
      return;
    }
    refreshWishlist();
  }, [booting, isAuthenticated, refreshWishlist]);

  const toggle = async (id) => {
    if (ids.includes(id)) {
      const data = await api.removeFromWishlist(id);
      setIds(normalizeIds(data) || ids.filter((x) => x !== id));
    } else {
      const data = await api.addToWishlist(id);
      setIds(normalizeIds(data) || [...ids, id]);
    }
  };

  const isWishlisted = (id) => ids.includes(id);

  const value = useMemo(
    () => ({
      ids,
      toggle,
      isWishlisted,
      count: ids.length,
      refreshWishlist,
    }),
    [ids, refreshWishlist]
  );

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
