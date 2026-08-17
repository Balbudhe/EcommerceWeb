import "./ProductCard.css";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Star } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice } from "../../utils/formatPrice";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.id);

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={`/product/${product.id}`}>
          <img src={product.image} alt={product.name} loading="lazy" />
        </Link>
        <div className="product-card-badges">
          {product.onSale ? <span className="badge badge-sale">Sale</span> : null}
          {product.isNew ? <span className="badge badge-new">New</span> : null}
        </div>
        <button
          className={`btn-icon product-wish ${wished ? "active" : ""}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggle(product.id)}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="product-card-body">
        <p className="product-card-cat">{product.category}</p>
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="product-card-meta">
          <div className="price">
            <span className="price-current">{formatPrice(product.price)}</span>
            {product.originalPrice ? (
              <span className="price-old">{formatPrice(product.originalPrice)}</span>
            ) : null}
          </div>
          <span className="product-rating">
            <Star size={14} fill="currentColor" />
            {product.rating}
          </span>
        </div>
        <button
          className="btn btn-outline btn-sm btn-block"
          onClick={() => addToCart(product)}
        >
          <ShoppingBag size={16} />
          Add to cart
        </button>
      </div>
    </article>
  );
}
