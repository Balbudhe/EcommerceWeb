import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import axiosInstance from "../utils/Axios";

const CartContext = createContext(null);

function normalizeCart(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload?.items && Array.isArray(payload.items)) return payload.items;
  if (payload?.cart?.items && Array.isArray(payload.cart.items)) return payload.cart.items;
  if (payload?.data?.items && Array.isArray(payload.data.items)) return payload.data.items;
  return [];
}

export function CartProvider({ children }) {
  const { isAuthenticated, booting, user } = useAuth();
  const [items, setItems] = useState([]);
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = user?.id || user?._id;

  const refreshCart = useCallback(async () => {
    if (!userId) {
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/cart/get/${userId}`);
      setItems(normalizeCart(data));
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (booting) return;
    if (!isAuthenticated || !userId) {
      setItems([]);
      return;
    }
    refreshCart();
  }, [booting, isAuthenticated, userId, refreshCart]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  const addToCart = async (product, options = {}) => {
try{
    if(!isAuthenticated || !userId){
      setToast("Please sign in to add items to cart");
      return;
    }
    setLoading(true);
    const payload={
      userId,
      productId:product.id || product._id,
      name:product.name,
      price:product.price,
      image:product.image ||  product.images?.[0] ||
      "",
      size:options.size || "",
      color:options.color || "",
      quantity:options.quantity || 1,
    }

    const {data}=await axiosInstance.post("/cart/add",payload);
    setItems(normalizeCart(data));
    setToast(data.message || "Item added to cart successfully");
  }catch(e){
    console.error("Add to cart error:", error);

    setToast(
      error.response?.data?.message ||
      "Failed to add product"
    );
  }finally{
    setLoading(false);
  }
  };

 const updateQuantity=async(productId,quantity,options={})=>{

  if(!userId || quantity<1){
    setToast("Please sign in to update quantity");
    return;
  }

  try{
    const {data}=await axiosInstance.put(`/cart/update-quantity/${userId}/${productId}`,{quantity,size:options.size || "",color:options.color || ""});
    setItems(normalizeCart(data));
    setToast(data.message || "Quantity updated successfully");
  }catch(e){
    console.error("Update quantity error:", e);
    setToast(
      error.response?.data?.message ||
      "Failed to update quantity"
    );
  }
 };

 const removeFromCart=async(productId,options={})=>{
  if(!userId){
    setToast("Please sign in to remove items from cart");
    return;
  }

  try{
    setLoading(true);
    const {data}=await axiosInstance.delete(`/cart/remove-item/${userId}/${productId}`,{data:{size:options.size || "",color:options.color || ""}});
    setItems(normalizeCart(data));
    setToast(data.message || "Item removed from cart successfully");

  }catch(e){
    console.error("Remove item error:", error);
    setToast(
      error.response?.data?.message ||
      "Failed to remove item"
    );
  }
 };
  const clearCart = async () => {
    if(!userId){
      setToast("Please sign in to clear cart");
      return;
    }
    try{
      const {data}=await axiosInstance.delete(`/cart/clear/${userId}`);
      setItems(normalizeCart(data));
      setToast(data.message || "Cart cleared successfully");
    }catch(e){
      console.error("Clear cart error:", e);
      setToast(
        error.response?.data?.message ||
        "Failed to clear cart"
      );
    }
  };

  const value = useMemo(() => {
    const count = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
    return {
      items,
      count,
      subtotal,
      loading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
      toast,
      setToast,
    };
  }, [items, loading, toast, refreshCart]);

  return (
    <CartContext.Provider value={value}>
      {children}
      {toast ? <div className="toast">{toast}</div> : null}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
