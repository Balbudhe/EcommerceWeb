import { Link, useLocation } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="page container">
      <div className="empty-state" style={{ maxWidth: 520, margin: "0 auto" }}>
        <CheckCircle2 size={48} color="var(--accent)" />
        <h3>Order confirmed</h3>
        <p>
          {order
            ? `Thank you! Your order ${order.id} is confirmed.`
            : "Thank you for your purchase."}
        </p>
        {order ? (
          <p style={{ marginTop: "-0.75rem" }}>
            Total paid: <strong>{formatPrice(order.total)}</strong>
          </p>
        ) : null}
        <div style={{ display: "flex", gap: "0.65rem", justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
          <Link to="/account" className="btn btn-outline">View account</Link>
        </div>
      </div>
    </div>
  );
}
