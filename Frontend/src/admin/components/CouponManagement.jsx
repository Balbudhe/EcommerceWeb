import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Plus, Search, Sparkles, TicketPercent, Users, X } from "lucide-react";
import { money } from "../adminApi";
import "./CouponManagement.css";

const emptyCoupon = { code: "", discount: "", minimumOrder: "", expiryDate: "", active: true };
const couponState = (coupon) => {
  if (!coupon.active) return "disabled";
  if (coupon.expiryDate && new Date(coupon.expiryDate) < new Date()) return "expired";
  return "active";
};

export default function CouponManagement({ coupons, add, toggle }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(emptyCoupon);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeCoupons = coupons.filter((coupon) => couponState(coupon) === "active").length;
  const redemptions = coupons.reduce((total, coupon) => total + Number(coupon.usageCount || 0), 0);
  const averageDiscount = coupons.length ? Math.round(coupons.reduce((total, coupon) => total + Number(coupon.discount || 0), 0) / coupons.length) : 0;
  const visible = useMemo(() => coupons.filter((coupon) => {
    const matchesQuery = coupon.code.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (filter === "all" || couponState(coupon) === filter);
  }), [coupons, query, filter]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await add({ code: form.code.trim().toUpperCase(), discount: Number(form.discount), minimumOrder: Number(form.minimumOrder || 0), expiryDate: form.expiryDate || null, active: form.active });
      setForm(emptyCoupon);
      setModal(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create coupon");
    } finally {
      setBusy(false);
    }
  };

  return <div className="coupon-workspace">
    <header className="coupon-heading"><div><span><Sparkles /> Promotions</span><h1>Coupons</h1><p>Create strategic discounts, track redemption and control campaign availability.</p></div><button onClick={() => setModal(true)}><Plus /> Create coupon</button></header>
    <section className="coupon-stats">
      <article><i><TicketPercent /></i><span><small>Total coupons</small><b>{coupons.length}</b><p>All promotions</p></span></article>
      <article><i className="green"><CheckCircle2 /></i><span><small>Active offers</small><b>{activeCoupons}</b><p>Available to customers</p></span></article>
      <article><i className="violet"><Users /></i><span><small>Redemptions</small><b>{redemptions}</b><p>Total coupon usage</p></span></article>
      <article><i className="amber"><TicketPercent /></i><span><small>Average discount</small><b>{averageDiscount}%</b><p>Across all coupons</p></span></article>
    </section>
    <section className="coupon-panel">
      <div className="coupon-panel-head"><div><h2>Promotion library</h2><p>{visible.length} matching coupons</p></div><div className="coupon-controls"><label><Search /><input aria-label="Search coupons" placeholder="Search coupon code" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X /></button>}</label><select aria-label="Filter coupons" value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option><option value="expired">Expired</option></select></div></div>
      <div className="coupon-grid">{visible.length ? visible.map((coupon) => {
        const state = couponState(coupon);
        return <article className={`coupon-card ${state}`} key={coupon._id}>
          <div className="coupon-card-top"><span className="coupon-mark"><TicketPercent /></span><span className={`coupon-state ${state}`}><i />{state}</span></div>
          <div className="coupon-code"><small>Coupon code</small><b>{coupon.code}</b></div>
          <div className="coupon-value"><strong>{coupon.discount}%</strong><span>OFF<small>on orders from {money(coupon.minimumOrder || 0)}</small></span></div>
          <div className="coupon-meta"><span><CalendarDays /><small>Expires</small><b>{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "No expiry"}</b></span><span><Users /><small>Used</small><b>{coupon.usageCount || 0} times</b></span></div>
          <div className="coupon-card-foot"><small>Created {new Date(coupon.createdAt).toLocaleDateString("en-IN")}</small><button className={coupon.active ? "on" : ""} role="switch" aria-checked={coupon.active} aria-label={`${coupon.code} availability`} onClick={() => toggle(coupon)}><i /><b>{coupon.active ? "Enabled" : "Disabled"}</b></button></div>
        </article>;
      }) : <div className="coupon-empty"><Search /><b>No coupons found</b><p>Try changing your search or status filter.</p></div>}</div>
    </section>
    {modal && <div className="modal-bg"><form className="admin-modal coupon-modal" onSubmit={submit}>
      <button type="button" className="close" aria-label="Close coupon form" onClick={() => setModal(false)}><X /></button>
      <div className="coupon-modal-title"><span><TicketPercent /></span><div><small>New promotion</small><h2>Create coupon</h2><p>Configure a discount code for your customers.</p></div></div>
      <div className="coupon-form-grid"><label className="wide">Coupon code <em>*</em><input autoFocus required maxLength="30" placeholder="e.g. WELCOME20" value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value.toUpperCase().replace(/\s/g, "") })} /><small>Letters and numbers work best</small></label><label>Discount percentage <em>*</em><div className="coupon-input-affix"><input required type="number" min="1" max="100" placeholder="20" value={form.discount} onChange={(event) => setForm({ ...form, discount: event.target.value })} /><span>%</span></div></label><label>Minimum order<div className="coupon-input-affix"><span>₹</span><input type="number" min="0" placeholder="0" value={form.minimumOrder} onChange={(event) => setForm({ ...form, minimumOrder: event.target.value })} /></div></label><label className="wide">Expiry date<input type="date" min={new Date().toISOString().slice(0, 10)} value={form.expiryDate} onChange={(event) => setForm({ ...form, expiryDate: event.target.value })} /><small>Leave blank for no expiry</small></label></div>
      <div className="coupon-active-control"><span><b>Activate immediately</b><small>Customers can use this code as soon as it is created.</small></span><button type="button" role="switch" aria-checked={form.active} className={form.active ? "on" : ""} onClick={() => setForm({ ...form, active: !form.active })}><i /><b>{form.active ? "Active" : "Inactive"}</b></button></div>
      {error && <p className="coupon-form-error" role="alert">{error}</p>}
      <div className="coupon-modal-actions"><button type="button" onClick={() => setModal(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Creating…" : "Create coupon"}</button></div>
    </form></div>}
  </div>;
}
