import "./Footer.css";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { SITE } from "../../data/site";

const WHATSAPP_HREF = `https://wa.me/${SITE.phone.replace(/\D/g, "")}`;

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.18 8.44 9.94v-7.03H7.9v-2.91h2.54V9.41c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.48h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.45 2.91h-2.33v7.03C18.34 21.24 22 17.08 22 12.06Z"
      />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        fillRule="evenodd"
        d="M8.2 3.5h7.6A4.7 4.7 0 0 1 20.5 8.2v7.6a4.7 4.7 0 0 1-4.7 4.7H8.2a4.7 4.7 0 0 1-4.7-4.7V8.2A4.7 4.7 0 0 1 8.2 3.5Zm0 1.7a3 3 0 0 0-3 3v7.6a3 3 0 0 0 3 3h7.6a3 3 0 0 0 3-3V8.2a3 3 0 0 0-3-3H8.2ZM12 8.15A3.85 3.85 0 1 1 8.15 12 3.85 3.85 0 0 1 12 8.15Zm0 1.7A2.15 2.15 0 1 0 14.15 12 2.15 2.15 0 0 0 12 9.85Zm4.92-2.7a1.05 1.05 0 1 1-1.05 1.05 1.05 1.05 0 0 1 1.05-1.05Z"
      />
    </svg>
  );
}

function PinterestIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12c0 4.24 2.64 7.85 6.32 9.29-.08-.79-.16-2 .04-2.87.18-.78 1.17-4.97 1.17-4.97s-.3-.6-.3-1.49c0-1.4.81-2.45 1.82-2.45.86 0 1.27.64 1.27 1.41 0 .86-.55 2.15-.83 3.35-.24 1 .5 1.81 1.49 1.81 1.79 0 3.16-1.89 3.16-4.61 0-2.41-1.73-4.1-4.2-4.1-2.87 0-4.55 2.15-4.55 4.37 0 .87.33 1.8.75 2.3a.3.3 0 0 1 .07.29c-.08.31-.24 1-.28 1.14-.04.19-.14.23-.33.14-1.26-.58-2.05-2.42-2.05-3.9 0-3.18 2.31-6.1 6.66-6.1 3.5 0 6.22 2.5 6.22 5.83 0 3.48-2.2 6.28-5.25 6.28-1.02 0-1.98-.53-2.31-1.16l-.63 2.39c-.22.88-.84 1.98-1.25 2.65A10.02 10.02 0 0 0 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2Z"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M12.04 2a9.9 9.9 0 0 0-8.5 14.9L2 22l5.3-1.4A9.9 9.9 0 1 0 12.04 2Zm5.8 14.2c-.24.68-1.4 1.26-1.94 1.34-.5.07-1.13.1-1.83-.12-.42-.13-.97-.32-1.67-.62-2.94-1.27-4.85-4.23-5-4.42-.14-.2-1.18-1.57-1.18-3s.75-2.13 1.02-2.42c.24-.27.64-.4 1.02-.4h.74c.24 0 .56-.1.87.67.32.8.86 2.1.94 2.25.08.16.13.34.03.55-.1.2-.15.33-.3.5-.14.16-.3.37-.43.5-.14.14-.29.3-.12.58.16.27.73 1.2 1.57 1.95 1.08.96 1.97 1.26 2.26 1.4.3.14.47.12.64-.07.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.27.1 1.72.81 2.01.96.3.14.5.22.57.34.08.13.08.74-.16 1.42Z"
      />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-quick">
          <h2>Quick links</h2>
          <nav>
            <Link to="/shop">Search</Link>
            <Link to="/refund-policy">Refund Policy</Link>
            <Link to="/affiliates">Affiliates</Link>
          </nav>
        </div>

        <div className="footer-mid">
          <div className="footer-subscribe">
            <h2>Subscribe to our emails</h2>
            <form
              className="footer-form"
              onSubmit={(e) => {
                e.preventDefault();
                e.currentTarget.reset();
              }}
            >
              <input type="email" required placeholder="Email" aria-label="Email" />
              <button type="submit" aria-label="Subscribe">
                <ArrowRight size={16} strokeWidth={1.7} />
              </button>
            </form>
          </div>

          <div className="footer-social">
            <a href={SITE.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook">
              <FacebookIcon />
            </a>
            <a href={SITE.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <a href={SITE.social.pinterest} target="_blank" rel="noreferrer" aria-label="Pinterest">
              <PinterestIcon />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-rule" />

      <div className="container footer-bottom">
        <p>
          © {new Date().getFullYear()}, {SITE.name} Powered by Shopify
        </p>
        <nav className="footer-policies">
          <Link to="/refund-policy">Refund policy</Link>
          <Link to="/privacy-policy">Privacy policy</Link>
          <Link to="/terms-of-service">Terms of service</Link>
          <Link to="/contact">Contact information</Link>
        </nav>
      </div>

      <a
        className="footer-whatsapp"
        href={WHATSAPP_HREF}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat on WhatsApp"
      >
        <WhatsAppIcon />
      </a>
    </footer>
  );
}
