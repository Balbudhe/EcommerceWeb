import { Link, Navigate } from "react-router-dom";
import { Heart, LogOut, Package, ShoppingBag, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import Popup from "../components/ui/Popup";

const CANCELLABLE = ["PLACED", "CONFIRMED", "PROCESSING"];

function formatStatus(status) {
  return String(status || "PLACED")
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());
}

export default function Account() {
  const { user, isAuthenticated, logout, updateProfile, booting } = useAuth();
  const { count } = useWishlist();
  const [section, setSection] = useState("profile");
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState("");
  const [popup, setPopup] = useState({ open: false, type: "success", message: "" });

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (window.location.hash === "#orders") setSection("orders");
  }, []);

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await api.getOrders();
      const list = Array.isArray(data) ? data : data?.orders || [];
      setOrders(
        list.filter((order) => {
          const method = order.paymentMethod;
          const payment = order.paymentStatus;
          if (method === "ONLINE") return payment === "PAID" || payment === "REFUNDED";
          return method === "COD" || payment === "PAID" || payment === "REFUNDED";
        }),
      );
    } catch {
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    loadOrders();
  }, [isAuthenticated]);

  if (booting) {
    return (
      <div className="page container">
        <div className="empty-state">Loading account…</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: "/account" }} />;
  }

  const onSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ name });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setPopup({ open: true, type: "error", message: err.message || "Could not save profile" });
    } finally {
      setSaving(false);
    }
  };

  const onCancelOrder = async (order) => {
    const id = order._id || order.id;
    const confirmed = window.confirm("Cancel this order? This cannot be undone.");
    if (!confirmed) return;
    setCancellingId(id);
    try {
      const result = await api.cancelOrder(id);
      const updated = result.order || result;
      setOrders((prev) => prev.map((item) => ((item._id || item.id) === id ? updated : item)));
      setPopup({
        open: true,
        type: "success",
        message: result.message || "Order cancelled successfully",
      });
    } catch (err) {
      setPopup({
        open: true,
        type: "error",
        message: err.message || "Could not cancel this order",
      });
    } finally {
      setCancellingId("");
    }
  };

  return (
    <div className="page container">
      <Popup
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
      />
      <h1 className="page-title">My account</h1>
      <p className="page-sub">Manage your profile and orders.</p>

      <div className="account-layout">
        <aside className="surface-panel account-side">
          <div className="account-avatar">
            <User size={28} />
          </div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <nav>
            <button
              type="button"
              className={section === "profile" ? "active" : ""}
              onClick={() => setSection("profile")}
            >
              <User size={16} /> Profile
            </button>
            <button
              type="button"
              className={section === "orders" ? "active" : ""}
              onClick={() => setSection("orders")}
            >
              <ShoppingBag size={16} /> Your orders ({orders.length})
            </button>
            <Link to="/wishlist">
              <Heart size={16} /> Wishlist ({count})
            </Link>
            <Link to="/cart">
              <Package size={16} /> Cart
            </Link>
            <button type="button" onClick={() => logout()}>
              <LogOut size={16} /> Sign out
            </button>
          </nav>
        </aside>

        {section === "profile" ? (
          <div className="surface-panel">
            <h3 className="account-heading">Profile details</h3>
            <form onSubmit={onSave}>
              <div className="field">
                <label htmlFor="name">Display name</label>
                <input id="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" value={user.email} disabled />
              </div>
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saved ? "Saved" : saving ? "Saving…" : "Save changes"}
              </button>
            </form>
          </div>
        ) : (
          <div className="surface-panel" id="orders">
            <h3 className="account-heading">Your orders</h3>
            {ordersLoading ? (
              <p style={{ color: "var(--muted)" }}>Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <p>No orders yet. Confirmed checkout orders will appear here.</p>
                <Link to="/shop" className="btn btn-outline btn-sm">
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="order-cards">
                {orders.map((order) => {
                  const id = order._id || order.id;
                  const status = order.orderStatus || order.status || "PLACED";
                  const canCancel = CANCELLABLE.includes(status);
                  return (
                    <li key={id} className="order-card">
                      <div className="order-card-head">
                        <div>
                          <strong>Order {String(id).slice(-8).toUpperCase()}</strong>
                          <p>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : ""}
                          </p>
                        </div>
                        <span className={`order-status ${status === "CANCELLED" ? "cancelled" : "live"}`}>
                          {formatStatus(status)}
                        </span>
                      </div>
                      <ul className="order-items">
                        {(order.items || []).map((item, index) => (
                          <li key={`${id}-${index}`}>
                            {item.image ? <img src={item.image} alt="" /> : null}
                            <div>
                              <span>{item.name}</span>
                              <p>
                                {item.color || "—"} · {item.size || "—"} · Qty {item.quantity}
                              </p>
                            </div>
                            <strong>{formatPrice((item.price || 0) * (item.quantity || 1))}</strong>
                          </li>
                        ))}
                      </ul>
                      <div className="order-card-foot">
                        <div>
                          <p>Payment: {formatStatus(order.paymentStatus || "PENDING")}</p>
                          <strong>{formatPrice(order.totalAmount || order.total || 0)}</strong>
                          {order.awbCode ? (
                            <p style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                              {order.courierName ? `${order.courierName} · ` : ""}
                              AWB {order.awbCode}
                              {order.trackingUrl ? (
                                <>
                                  {" · "}
                                  <a href={order.trackingUrl} target="_blank" rel="noreferrer">
                                    Track shipment
                                  </a>
                                </>
                              ) : null}
                            </p>
                          ) : order.shipmentStatus ? (
                            <p style={{ marginTop: "0.35rem", fontSize: "0.85rem", color: "var(--muted)" }}>
                              Shipping: {formatStatus(order.shipmentStatus)}
                            </p>
                          ) : null}
                        </div>
                        {canCancel ? (
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            disabled={cancellingId === id}
                            onClick={() => onCancelOrder(order)}
                          >
                            {cancellingId === id ? "Cancelling…" : "Cancel order"}
                          </button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      <style>{`
        .account-layout {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 1.25rem;
          align-items: start;
        }
        .account-side { text-align: center; }
        .account-avatar {
          width: 72px;
          height: 72px;
          margin: 0 auto 0.85rem;
          border-radius: 50%;
          background: var(--accent-soft);
          color: var(--accent);
          display: grid;
          place-items: center;
        }
        .account-side h3 { font-family: var(--font-display); }
        .account-side > p {
          color: var(--muted);
          font-size: 0.9rem;
          margin-bottom: 1.25rem;
        }
        .account-side nav {
          display: flex;
          flex-direction: column;
          gap: 0.35rem;
          text-align: left;
        }
        .account-side nav a,
        .account-side nav button {
          display: flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.7rem 0.75rem;
          border-radius: var(--radius-sm);
          font-weight: 600;
          color: var(--muted);
          width: 100%;
        }
        .account-side nav a:hover,
        .account-side nav button:hover,
        .account-side nav button.active {
          background: var(--accent-soft);
          color: var(--accent);
        }
        .account-heading {
          font-family: var(--font-display);
          margin-bottom: 1rem;
        }
        .order-cards {
          display: flex;
          flex-direction: column;
          gap: 0.9rem;
        }
        .order-card {
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 1rem;
          background: rgba(255,255,255,0.7);
        }
        .order-card-head,
        .order-card-foot {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          align-items: center;
        }
        .order-card-head p,
        .order-items p,
        .order-card-foot p {
          color: var(--muted);
          font-size: 0.82rem;
          margin: 0.15rem 0 0;
        }
        .order-status {
          border-radius: 999px;
          padding: 0.2rem 0.65rem;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .order-status.live { background: var(--accent-soft); color: var(--accent); }
        .order-status.cancelled { background: #fde8e6; color: var(--danger); }
        .order-items {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin: 0.9rem 0;
        }
        .order-items li {
          display: grid;
          grid-template-columns: 48px 1fr auto;
          gap: 0.7rem;
          align-items: center;
        }
        .order-items img {
          width: 48px;
          height: 56px;
          object-fit: cover;
          border-radius: 8px;
        }
        @media (max-width: 800px) {
          .account-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
