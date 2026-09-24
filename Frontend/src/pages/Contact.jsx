import "./Contact.css";
import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";
import { SITE } from "../data/site";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <div className="contact-page">
      <header className="page-banner">
        <p className="eyebrow">Questions & inquiries</p>
        <h1>Contact</h1>
        <p>We’d love to hear from you — orders, custom pieces, or affiliate enquiries.</p>
      </header>

      <div className="page container">
        <div className="contact-layout">
          <form className="checkout-card" onSubmit={onSubmit}>
            <h2 className="page-title" style={{ fontSize: "2rem" }}>
              Contact form
            </h2>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" name="name" required />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required />
            </div>
            <div className="field">
              <label htmlFor="phone">Phone</label>
              <input id="phone" name="phone" type="tel" />
            </div>
            <div className="field">
              <label htmlFor="message">Comment</label>
              <textarea id="message" name="message" required />
            </div>
            {sent ? <p className="contact-sent">Message sent — we’ll reply shortly.</p> : null}
            <button className="btn btn-primary" type="submit">
              Send
            </button>
          </form>

          <aside className="surface-panel contact-info">
            <h3>Artiqulate Lifestyle</h3>
            <ul>
              <li>
                <MapPin size={18} /> {SITE.address}
              </li>
              <li>
                <Phone size={18} /> {SITE.phone}
              </li>
              <li>
                <Mail size={18} /> {SITE.emails.primary}
              </li>
            </ul>
            <p>Returns: {SITE.returnAddress}</p>
          </aside>
        </div>
      </div>
    </div>
  );
}
