import "./MiniCart.css";
import { Link } from "react-router-dom";
import { Minus, Plus, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatPrice } from "../../utils/formatPrice";
import { useEffect } from "react";
import MediaSlot from "../ui/MediaSlot";

export default function MiniCart() {
  const {
    items,
    subtotal,
    count,
    drawerOpen,
    setDrawerOpen,
    lastAdded,
    updateQuantity,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (!drawerOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen, setDrawerOpen]);

  if (!drawerOpen) return null;

  return (
    <div className="mini-cart" role="dialog" aria-modal="true" aria-labelledby="mini-cart-title">
      <button
        type="button"
        className="mini-cart-backdrop"
        aria-label="Close cart"
        onClick={() => setDrawerOpen(false)}
      />
      <aside className="mini-cart-panel">
        <header className="mini-cart-head">
          <div>
            <p className="eyebrow">{lastAdded ? "Just added" : "Your bag"}</p>
            <h2 id="mini-cart-title">
              {lastAdded ? "Item added to your cart" : `Cart (${count})`}
            </h2>
          </div>
          <button
            type="button"
            className="btn-icon"
            aria-label="Close cart"
            onClick={() => setDrawerOpen(false)}
          >
            <X size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="mini-cart-empty">
            <p>Your cart is empty.</p>
            <Link to="/shop" className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>
              Continue shopping
            </Link>
          </div>
        ) : (
          <>
            <div className="mini-cart-list">
              {items.map((item) => (
                <article key={`${item.productId}-${item.size}-${item.color}`} className="mini-cart-item">
                  <Link
                    to={`/product/${item.productId}`}
                    className="mini-cart-thumb"
                    onClick={() => setDrawerOpen(false)}
                  >
                    <MediaSlot src={item.image} alt={item.name} label="Product" />
                  </Link>
                  <div className="mini-cart-info">
                    <Link to={`/product/${item.productId}`} onClick={() => setDrawerOpen(false)}>
                      <h3>{item.name}</h3>
                    </Link>
                    <p>
                      {item.color || "—"} · {item.size || "—"}
                    </p>
                    <strong>{formatPrice(item.price)}</strong>
                    <div className="mini-cart-row">
                      <div className="qty-control">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1, {
                              size: item.size,
                              color: item.color,
                            })
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} />
                        </button>
                        <span>{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1, {
                              size: item.size,
                              color: item.color,
                            })
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                      <button
                        type="button"
                        className="mini-cart-remove"
                        onClick={() =>
                          removeFromCart(item.productId, {
                            size: item.size,
                            color: item.color,
                          })
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <footer className="mini-cart-foot">
              <div className="mini-cart-sub">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <Link to="/cart" className="btn btn-outline btn-block" onClick={() => setDrawerOpen(false)}>
                View cart
              </Link>
              <Link to="/checkout" className="btn btn-primary btn-block" onClick={() => setDrawerOpen(false)}>
                Check out
              </Link>
              <button
                type="button"
                className="view-all mini-cart-continue"
                onClick={() => setDrawerOpen(false)}
              >
                Continue shopping
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
