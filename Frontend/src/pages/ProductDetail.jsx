import "./ProductDetail.css";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Heart, Star } from "lucide-react";
import { api } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import { products as allProducts } from "../data/products";
import { formatPrice } from "../utils/formatPrice";

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    window.scrollTo(0, 0);
    api.getProduct(id).then((data) => {
      if (!alive) return;
      setProduct(data);
      if (data) {
        setSize(data.sizes[0]);
        setColor(data.colors[0]);
        setActiveImg(0);
        setQty(1);
      }
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return <div className="page container"><div className="empty-state">Loading…</div></div>;
  }

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>This item may have been removed.</p>
          <Link to="/shop" className="btn btn-primary">Back to shop</Link>
        </div>
      </div>
    );
  }

  const related = allProducts
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  const wished = isWishlisted(product.id);

  return (
    <div className="page container">
      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-main-img">
            <img src={product.images[activeImg]} alt={product.name} />
          </div>
          <div className="pd-thumbs">
            {product.images.map((src, i) => (
              <button
                key={src}
                className={i === activeImg ? "active" : ""}
                onClick={() => setActiveImg(i)}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        </div>

        <div className="pd-info">
          <span className="eyebrow">{product.category}</span>
          <h1 className="page-title">{product.name}</h1>
          <div className="pd-rating">
            <Star size={16} fill="currentColor" />
            {product.rating} · {product.reviews} reviews
          </div>
          <div className="price pd-price">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.originalPrice ? (
              <span className="price-old">{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>
          <p className="pd-desc">{product.description}</p>

          <div className="pd-option">
            <label>Color</label>
            <div className="choice-row">
              {product.colors.map((c) => (
                <button
                  key={c}
                  className={`choice-chip ${color === c ? "active" : ""}`}
                  onClick={() => setColor(c)}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-option">
            <label>Size</label>
            <div className="choice-row">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  className={`choice-chip ${size === s ? "active" : ""}`}
                  onClick={() => setSize(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="pd-option">
            <label>Quantity</label>
            <div className="qty-control">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => q + 1)}>+</button>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="btn btn-primary"
              onClick={() => addToCart(product, { quantity: qty, size, color })}
            >
              Add to cart
            </button>
            <button
              className={`btn-icon ${wished ? "active" : ""}`}
              onClick={() => toggle(product.id)}
              aria-label="Wishlist"
            >
              <Heart size={18} fill={wished ? "currentColor" : "none"} />
            </button>
          </div>

          <ul className="pd-features">
            {product.features.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
      </div>

      {related.length > 0 ? (
        <section className="section">
          <div className="section-head">
            <div>
              <span className="eyebrow">More like this</span>
              <h2>You may also like</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
