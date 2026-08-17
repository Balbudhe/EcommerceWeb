import { useState } from "react";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Contact() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    e.currentTarget.reset();
  };

  return (
    <div className="page container">
      <h1 className="page-title">Contact</h1>
      <p className="page-sub">Questions about an order or the collection? We’re here to help.</p>

      <div className="contact-layout">
        <form className="checkout-card" onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" required />
          </div>
          <div className="field">
            <label htmlFor="subject">Subject</label>
            <input id="subject" name="subject" required />
          </div>
          <div className="field">
            <label htmlFor="message">Message</label>
            <textarea id="message" name="message" required />
          </div>
          {sent ? (
            <p style={{ color: "var(--accent)", fontWeight: 600, marginBottom: "0.75rem" }}>
              Message sent — connect this form to your backend later.
            </p>
          ) : null}
          <button className="btn btn-primary" type="submit">
            Send message
          </button>
        </form>

        <aside className="surface-panel contact-info">
          <h3>Studio</h3>
          <ul>
            <li><MapPin size={18} /> 214 Market Street, Suite 4</li>
            <li><Phone size={18} /> +1 (555) 014-2280</li>
            <li><Mail size={18} /> hello@vora.store</li>
          </ul>
          <p>Support hours: Mon–Fri, 9am–6pm EST</p>
        </aside>
      </div>

      <style>{`
        .contact-layout {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 1.25rem;
          align-items: start;
        }
        .contact-info h3 {
          font-family: var(--font-display);
          margin-bottom: 1rem;
        }
        .contact-info ul {
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          margin-bottom: 1.25rem;
        }
        .contact-info li {
          display: flex;
          gap: 0.65rem;
          align-items: flex-start;
          color: var(--muted);
        }
        .contact-info p {
          color: var(--muted-soft);
          font-size: 0.9rem;
        }
        @media (max-width: 800px) {
          .contact-layout { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
