import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import { formatPrice } from "../utils/formatPrice";

const initial = {
  email: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  country: "India",
  payment: "online",
};

const loadRazorpay = () =>
  new Promise((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = resolve;
    script.onerror = () => reject(new Error("Unable to load Razorpay Checkout"));
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    ...initial,
    email: user?.email || "",
    fullName: user?.name || "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shippingNote, setShippingNote] = useState("");

  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Nothing to checkout</h3>
          <p>Add products to your cart first.</p>
          <Link to="/shop" className="btn btn-primary">Go to shop</Link>
        </div>
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "zip") setShippingNote("");
  };

  const checkPincode = async () => {
    const pincode = String(form.zip || "").trim();
    if (!/^\d{6}$/.test(pincode)) return;
    try {
      const result = await api.checkServiceability(pincode, {
        weight: Math.max(0.5, items.reduce((n, i) => n + i.quantity * 0.4, 0)),
        cod: form.payment === "cod" ? total : 0,
      });
      if (result.serviceable) {
        const days = result.estimatedDays ? ` · ETA ${result.estimatedDays}` : "";
        setShippingNote(`Deliverable to ${pincode}${days}`);
      } else {
        setShippingNote(result.message || "This pincode may not be serviceable yet.");
      }
    } catch {
      setShippingNote("");
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (!isAuthenticated) {
        navigate("/login", { state: { from: "/checkout" } });
        return;
      }
      const orderPayload = {
        shippingAddress: {
          fullName: form.fullName,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.zip,
        },
        items: items.map(({ productId, quantity, size, color }) => ({
          productId,
          quantity,
          size,
          color,
        })),
      };

      if (form.payment === "cod") {
        const result = await api.placeOrder(orderPayload);
        const order = result.order || result;
        await clearCart();
        navigate("/order-success", { state: { order } });
        return;
      }

      await loadRazorpay();
      const paymentOrder = await api.initiatePayment(orderPayload);
      const paymentResponse = await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: paymentOrder.keyId,
          amount: paymentOrder.gatewayOrder.amount,
          currency: paymentOrder.gatewayOrder.currency,
          name: "VORA",
          description: "Store purchase",
          order_id: paymentOrder.gatewayOrder.id,
          prefill: {
            name: form.fullName,
            email: form.email,
            contact: form.phone,
          },
          theme: { color: "#0f6b5c" },
          handler: resolve,
          modal: {
            ondismiss: () => reject(new Error("Payment was cancelled")),
          },
        });
        checkout.on("payment.failed", (response) =>
          reject(new Error(response.error?.description || "Payment failed")),
        );
        checkout.open();
      });
      const verification = await api.verifyPayment(paymentResponse);
      const order = verification.order;
      await clearCart();
      navigate("/order-success", { state: { order } });
    } catch (err) {
      setError(err.message || "Checkout failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page container">
      <h1 className="page-title">Checkout</h1>
      <p className="page-sub">
        {isAuthenticated
          ? `Signed in as ${user.email}`
          : "Guest checkout — or "}
        {!isAuthenticated ? <Link to="/login">sign in</Link> : null}
      </p>

      <form className="checkout-layout" onSubmit={onSubmit}>
        <div className="checkout-card">
          <h3>Contact</h3>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required value={form.email} onChange={onChange} />
          </div>
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" required value={form.fullName} onChange={onChange} />
          </div>
          <div className="field">
            <label htmlFor="phone">Phone</label>
            <input id="phone" name="phone" required value={form.phone} onChange={onChange} />
          </div>

          <h3 style={{ marginTop: "1.25rem" }}>Shipping address</h3>
          <div className="field">
            <label htmlFor="address">Street address</label>
            <input id="address" name="address" required value={form.address} onChange={onChange} />
          </div>
          <div className="checkout-row">
            <div className="field">
              <label htmlFor="city">City</label>
              <input id="city" name="city" required value={form.city} onChange={onChange} />
            </div>
            <div className="field">
              <label htmlFor="state">State</label>
              <input id="state" name="state" required value={form.state} onChange={onChange} />
            </div>
          </div>
          <div className="checkout-row">
            <div className="field">
              <label htmlFor="zip">PIN code</label>
              <input
                id="zip"
                name="zip"
                required
                inputMode="numeric"
                pattern="\d{6}"
                value={form.zip}
                onChange={onChange}
                onBlur={checkPincode}
              />
              {shippingNote ? (
                <small style={{ color: "var(--muted)" }}>{shippingNote}</small>
              ) : null}
            </div>
            <div className="field">
              <label htmlFor="country">Country</label>
              <input id="country" name="country" required value={form.country} onChange={onChange} />
            </div>
          </div>

          <h3 style={{ marginTop: "1.25rem" }}>Payment</h3>
          <div className="choice-row" style={{ marginBottom: "1rem" }}>
            {["online", "cod"].map((method) => (
              <button
                key={method}
                type="button"
                className={`choice-chip ${form.payment === method ? "active" : ""}`}
                onClick={() => setForm((p) => ({ ...p, payment: method }))}
              >
                {method === "online" ? "Pay online" : "Cash on delivery"}
              </button>
            ))}
          </div>

          {form.payment === "online" ? (
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
              Razorpay securely handles cards, UPI, netbanking, and wallets.
            </p>
          ) : (
            <p style={{ color: "var(--muted)", marginBottom: "1rem" }}>
              Pay with cash when your order arrives.
            </p>
          )}

          {error ? <p className="field-error">{error}</p> : null}
          <button className="btn btn-primary btn-block" disabled={submitting}>
            {submitting
              ? "Processing…"
              : form.payment === "cod"
                ? `Place order · ${formatPrice(total)}`
                : `Pay ${formatPrice(total)}`}
          </button>
        </div>

        <aside className="surface-panel checkout-summary">
          <h3>Order</h3>
          <ul>
            {items.map((item) => (
              <li key={item.key}>
                <span>
                  {item.name} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? "Free" : formatPrice(shipping)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>
        </aside>
      </form>

      <style>{`
        .checkout-layout {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 1.5rem;
          align-items: start;
        }
        .checkout-card h3,
        .checkout-summary h3 {
          font-family: var(--font-display);
          margin-bottom: 1rem;
        }
        .checkout-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        .checkout-summary ul {
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border);
        }
        .checkout-summary li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          font-size: 0.9rem;
          color: var(--muted);
        }
        @media (max-width: 860px) {
          .checkout-layout { grid-template-columns: 1fr; }
        }
        @media (max-width: 560px) {
          .checkout-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
