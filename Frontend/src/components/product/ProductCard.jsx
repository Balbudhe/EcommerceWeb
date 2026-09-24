import "./ProductCard.css";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { formatPrice, salePercent } from "../../utils/formatPrice";
import MediaSlot from "../ui/MediaSlot";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { toggle, isWishlisted } = useWishlist();
  const wished = isWishlisted(product.id);
  const off = salePercent(product);
  const hoverImg = product.images?.[1];

  return (
    <article className="product-card">
      <div className="product-card-media">
        <Link to={`/product/${product.id}`}>
          <MediaSlot src={product.image} alt={product.name} label="Product image" />
          {hoverImg ? (
            <img src={hoverImg} alt="" className="product-card-hover" loading="lazy" />
          ) : null}
        </Link>
        <div className="product-card-badges">
          {product.isNew ? (
            <span className="badge badge-new">New Launch</span>
          ) : product.onSale ? (
            <span className="badge badge-best">Best-Seller</span>
          ) : null}
          {product.onSale && off > 0 ? <span className="badge badge-sale">{off}% OFF</span> : null}
        </div>
        <button
          className={`btn-icon product-wish ${wished ? "active" : ""}`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggle(product.id)}
        >
          <Heart size={16} fill={wished ? "currentColor" : "none"} />
        </button>
        <button type="button" className="product-atc" onClick={() => addToCart(product)}>
          Add to cart
        </button>
      </div>

      <div className="product-card-body">
        <Link to={`/product/${product.id}`}>
          <h3>{product.name}</h3>
        </Link>
        <div className="price">
          <span className="price-current">{formatPrice(product.price)}</span>
          {product.originalPrice ? (
            <span className="price-old">{formatPrice(product.originalPrice)}</span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
