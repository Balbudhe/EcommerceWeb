import "./Footer.css";
import { Link } from "react-router-dom";
import { Camera, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="nav-brand">
            VORA
          </Link>
          <p>
            Contemporary essentials designed for daily life — thoughtful materials,
            calm silhouettes, lasting quality.
          </p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram">
              <Camera size={18} />
            </a>
            <a href="mailto:hello@vora.store" aria-label="Email">
              <Mail size={18} />
            </a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            <li><Link to="/shop">All products</Link></li>
            <li><Link to="/shop?category=apparel">Apparel</Link></li>
            <li><Link to="/shop?category=footwear">Footwear</Link></li>
            <li><Link to="/shop?category=home">Home</Link></li>
          </ul>
        </div>

        <div>
          <h4>Help</h4>
          <ul>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/account">My account</Link></li>
            <li><Link to="/cart">Cart</Link></li>
          </ul>
        </div>

        <div>
          <h4>Visit</h4>
          <ul className="footer-contact">
            <li><MapPin size={16} /> 214 Market Street, Suite 4</li>
            <li><Phone size={16} /> +1 (555) 014-2280</li>
            <li><Mail size={16} /> hello@vora.store</li>
          </ul>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} VORA. All rights reserved.</span>
        <span>Data via API → MongoDB (no localStorage)</span>
      </div>
    </footer>
  );
}
