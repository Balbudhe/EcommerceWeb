import { Link, Navigate } from "react-router-dom";
import { Package, Heart, LogOut, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useWishlist } from "../context/WishlistContext";
import { useEffect, useState } from "react";
import { api } from "../services/api";
import { formatPrice } from "../utils/formatPrice";

export default function Account() {
  const { user, isAuthenticated, logout, updateProfile, booting } = useAuth();
  const { count } = useWishlist();
  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (user?.name) setName(user.name);
  }, [user]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let alive = true;
    setOrdersLoading(true);
    api
      .getOrders()
      .then((data) => {
        if (alive) setOrders(Array.isArray(data) ? data : data?.orders || []);
      })
      .catch(() => {
        if (alive) setOrders([]);
      })
      .finally(() => {
        if (alive) setOrdersLoading(false);
      });
    return () => {
      alive = false;
    };
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
      alert(err.message || "Could not save profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page container">
      <h1 className="page-title">My account</h1>
      <p className="page-sub">Manage your profile and shopping preferences.</p>

      <div className="account-layout">
        <aside className="surface-panel account-side">
          <div className="account-avatar">
            <User size={28} />
          </div>
          <h3>{user.name}</h3>
          <p>{user.email}</p>
          <nav>
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

        <div className="surface-panel">
          <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "1rem" }}>
            Profile details
          </h3>
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

          <div style={{ marginTop: "2rem" }}>
            <h3 style={{ fontFamily: "var(--font-display)", marginBottom: "0.75rem" }}>
              Recent orders
            </h3>
            {ordersLoading ? (
              <p style={{ color: "var(--muted)" }}>Loading orders…</p>
            ) : orders.length === 0 ? (
              <div className="empty-state" style={{ padding: "2rem 1rem" }}>
                <p>No orders yet.</p>
                <Link to="/shop" className="btn btn-outline btn-sm">
                  Start shopping
                </Link>
              </div>
            ) : (
              <ul className="order-list">
                {orders.map((order) => (
                  <li key={order.id || order._id}>
                    <strong>{order.id || order._id}</strong>
                    <span>{order.status || "confirmed"}</span>
                    <span>{formatPrice(order.total || 0)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
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
        .account-side nav button:hover {
          background: var(--accent-soft);
          color: var(--accent);
        }
        .order-list {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }
        .order-list li {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 0.75rem;
          padding: 0.85rem 1rem;
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          background: rgba(255,255,255,0.55);
          font-size: 0.9rem;
        }
        @media (max-width: 800px) {
          .account-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
