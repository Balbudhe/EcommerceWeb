import { Link } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { useWishlist } from "../context/WishlistContext";
import { products } from "../data/products";

export default function Wishlist() {
  const { ids } = useWishlist();
  const list = products.filter((p) => ids.includes(p.id));

  return (
    <div className="page container">
      <h1 className="page-title">Wishlist</h1>
      <p className="page-sub">Saved pieces you can revisit anytime.</p>

      {list.length === 0 ? (
        <div className="empty-state">
          <h3>No saved items yet</h3>
          <p>Tap the heart on a product to add it here.</p>
          <Link to="/shop" className="btn btn-primary">Explore shop</Link>
        </div>
      ) : (
        <div className="product-grid">
          {list.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
