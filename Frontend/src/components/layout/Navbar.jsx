import "./Navbar.css";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { ANNOUNCEMENTS, NAV_LINKS } from "../../data/site";
import BrandMark from "../ui/BrandMark";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [query, setQuery] = useState("");
  const [announceIndex, setAnnounceIndex] = useState(0);
  const { count, setDrawerOpen } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setAnnounceIndex((i) => (i + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  const onSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    setQuery("");
    setSearchOpen(false);
    setOpen(false);
  };

  const cycleAnnounce = (dir) => {
    setAnnounceIndex((i) => (i + dir + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const displayName = user?.name?.split(" ")[0] || "Account";
  const announcement = ANNOUNCEMENTS[announceIndex];

  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <div className="announce">
        <button type="button" className="announce-arrow" onClick={() => cycleAnnounce(-1)} aria-label="Previous announcement">
          <ChevronLeft size={16} />
        </button>
        <Link to={announcement.to} key={announceIndex}>
          {announcement.text} →
        </Link>
        <button type="button" className="announce-arrow" onClick={() => cycleAnnounce(1)} aria-label="Next announcement">
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="nav">
        <div className="container nav-inner">
          <button
            className="nav-burger btn-icon"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="nav-brand">
            <BrandMark />
          </Link>

          <nav className="nav-links" aria-label="Primary">
            {NAV_LINKS.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
              >
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="nav-actions">
            <button
              className={`btn-icon nav-action ${searchOpen ? "active" : ""}`}
              aria-label="Search"
              onClick={() => setSearchOpen((v) => !v)}
            >
              {searchOpen ? <X size={20} strokeWidth={1.6} /> : <Search size={20} strokeWidth={1.6} />}
            </button>
            <Link
              to={isAuthenticated ? "/account" : "/login"}
              className="btn-icon nav-action"
              aria-label={isAuthenticated ? `Account — ${displayName}` : "Log in"}
            >
              <User size={20} strokeWidth={1.6} />
            </Link>
            <button
              type="button"
              className="btn-icon nav-action"
              aria-label="Cart"
              onClick={() => setDrawerOpen(true)}
            >
              <ShoppingBag size={20} strokeWidth={1.6} />
              {count > 0 ? <span className="nav-count">{count}</span> : null}
            </button>
          </div>
        </div>

        <div className={`nav-search-panel ${searchOpen ? "open" : ""}`}>
          <form className="container nav-search" onSubmit={onSearch}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button type="submit" className="view-all">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className={`nav-drawer ${open ? "open" : ""}`}>
        <div className="nav-drawer-panel">
          <div className="nav-drawer-head">
            <Link to="/" className="nav-brand" onClick={() => setOpen(false)}>
              <BrandMark />
            </Link>
            <button className="btn-icon" aria-label="Close menu" onClick={() => setOpen(false)}>
              <X size={18} />
            </button>
          </div>

          <form className="nav-search mobile" onSubmit={onSearch}>
            <Search size={16} />
            <input
              type="search"
              placeholder="Search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </form>

          <div className="nav-drawer-links">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
            <NavLink to={isAuthenticated ? "/account" : "/login"} onClick={() => setOpen(false)}>
              {isAuthenticated ? `Hi, ${displayName}` : "Log in"}
            </NavLink>
          </div>
        </div>
        <button className="nav-drawer-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />
      </div>
    </header>
  );
}
