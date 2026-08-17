import "./Navbar.css";
import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useAuth } from "../../context/AuthContext";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/shop", label: "Shop" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setOpen(false);
  };

  const displayName = user?.name?.split(" ")[0] || "User";
  const userInitial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className={`nav ${scrolled ? "nav-scrolled" : ""}`}>
      <div className="container nav-inner">
        <button
          className="nav-burger btn-icon"
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        >
          <Menu size={20} />
        </button>

        <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
          VORA
        </Link>

        <nav className="nav-links" aria-label="Primary">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <form className="nav-search" onSubmit={onSearch}>
          <Search size={16} />
          <input
            type="search"
            placeholder="Search products"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search products"
          />
        </form>

        <div className="nav-actions">
          <Link to="/wishlist" className="btn-icon nav-action" aria-label="Wishlist">
            <Heart size={18} />
            {wishCount > 0 ? <span className="nav-count">{wishCount}</span> : null}
          </Link>
          {isAuthenticated ? (
            <Link
              to="/account"
              className="nav-user"
              aria-label={`Account — ${user?.name}`}
            >
              <span className="nav-user-avatar">{userInitial}</span>
              <span className="nav-user-name">{displayName}</span>
            </Link>
          ) : (
            <Link
              to="/login"
              className="btn-icon nav-action"
              aria-label="Login"
            >
              <User size={18} />
            </Link>
          )}
          <Link to="/cart" className="btn-icon nav-action" aria-label="Cart">
            <ShoppingBag size={18} />
            {count > 0 ? <span className="nav-count">{count}</span> : null}
          </Link>
        </div>
      </div>

      <div className={`nav-drawer ${open ? "open" : ""}`}>
        <div className="nav-drawer-panel">
          <div className="nav-drawer-head">
            <span className="nav-brand">VORA</span>
            <button
              className="btn-icon"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
            >
              <X size={18} />
            </button>
          </div>

          <form className="nav-search mobile" onSubmit={onSearch}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="nav-drawer-links">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </NavLink>
            ))}
            <NavLink to="/faq" onClick={() => setOpen(false)}>
              FAQ
            </NavLink>
            <NavLink
              to={isAuthenticated ? "/account" : "/login"}
              onClick={() => setOpen(false)}
            >
              {isAuthenticated ? `Hi, ${user?.name}` : "Login / Register"}
            </NavLink>
          </div>
        </div>
        <button
          className="nav-drawer-backdrop"
          aria-label="Close menu"
          onClick={() => setOpen(false)}
        />
      </div>
    </header>
  );
}
