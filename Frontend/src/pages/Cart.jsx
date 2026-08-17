import "./Cart.css";
import { Link } from "react-router-dom";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../context/CartContext";
import { formatPrice } from "../utils/formatPrice";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();
  const shipping = subtotal >= 999 || subtotal === 0 ? 0 : 79;
  const total = subtotal + shipping;

  const onClearCart = async () => {
    const confirmed = window.confirm("Remove all items from your cart?");
    if (!confirmed) return;
    await clearCart();
  };

  if (items.length === 0) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Browse the collection and add something you love.</p>
          <Link to="/shop" className="btn btn-primary">Continue shopping</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page container">
      <header className="cart-head">
        <div>
          <h1 className="page-title">Your cart</h1>
          <p className="page-sub">{items.length} item{items.length > 1 ? "s" : ""} in bag</p>
        </div>
        <button type="button" className="btn btn-outline btn-sm" onClick={onClearCart}>
          Clear cart
        </button>
      </header>

      <div className="cart-layout">
        <div className="cart-list">
          {items.map((item) => (
            <article key={`${item.productId}-${item.size}-${item.color}`} className="cart-item surface-panel">
              <Link to={`/product/${item.productId}`} className="cart-thumb">
                <img src={item.image} alt={item.name} />
              </Link>
              <div className="cart-info">
                <Link to={`/product/${item.productId}`}>
                  <h3>{item.name}</h3>
                </Link>
                <p>
                  {item.color || "N/A"} · Size {item.size || "N/A"}
                </p>
                <strong>{formatPrice(item.price)}</strong>
              </div>
              <div className="cart-controls">
                <div className="qty-control">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1, {
                        size: item.size,
                        color: item.color,
                      })
                    }
                  >
                    <Minus size={14} />
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1, {
                        size: item.size,
                        color: item.color,
                      })
                    }
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  className="cart-remove"
                  onClick={() =>
                    removeFromCart(item.productId, {
                      size: item.size,
                      color: item.color,
                    })
                  }
                  aria-label="Remove item"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>

        <aside className="cart-summary surface-panel">
          <h3>Order summary</h3>
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
          <Link to="/checkout" className="btn btn-primary btn-block">
            Proceed to checkout
          </Link>
          <Link to="/shop" className="btn btn-ghost btn-block">
            Continue shopping
          </Link>
        </aside>
      </div>
    </div>
  );
}
