import { Link } from "react-router-dom";

export default function About() {
  return (
    <div className="page">
      <section className="about-hero">
        <img
          src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=1600&q=80"
          alt="VORA studio"
        />
        <div className="about-hero-copy container">
          <p className="hero-brand" style={{ fontSize: "clamp(2.4rem, 7vw, 4.5rem)" }}>
            VORA
          </p>
          <h1>Designed for lasting everyday use.</h1>
        </div>
      </section>

      <section className="section container about-content">
        <div>
          <span className="eyebrow">Our story</span>
          <h2>Less noise. Better materials.</h2>
          <p>
            VORA started as a small studio focused on essentials that feel considered —
            pieces you reach for often, made with durable fabrics and calm silhouettes.
          </p>
          <p>
            We partner with mills and makers who share our standards for quality and
            responsible production. Every collection is edited tightly so shopping feels
            clear, not overwhelming.
          </p>
          <Link to="/shop" className="btn btn-primary" style={{ marginTop: "1rem" }}>
            Shop the collection
          </Link>
        </div>
        <div className="about-stats">
          <div>
            <strong>2019</strong>
            <span>Founded</span>
          </div>
          <div>
            <strong>40+</strong>
            <span>Core styles</span>
          </div>
          <div>
            <strong>12</strong>
            <span>Maker partners</span>
          </div>
        </div>
      </section>

      <style>{`
        .about-hero {
          position: relative;
          min-height: 52vh;
          display: flex;
          align-items: flex-end;
          color: #f4f7f6;
          overflow: hidden;
        }
        .about-hero img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .about-hero::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(transparent, rgba(20,24,27,0.72));
        }
        .about-hero-copy {
          position: relative;
          z-index: 1;
          padding-bottom: 2.5rem;
        }
        .about-hero-copy h1 {
          font-family: var(--font-display);
          font-size: clamp(1.3rem, 3vw, 1.9rem);
          max-width: 18ch;
        }
        .about-content {
          display: grid;
          grid-template-columns: 1.3fr 0.7fr;
          gap: 2rem;
          align-items: start;
        }
        .about-content h2 {
          font-family: var(--font-display);
          font-size: clamp(1.6rem, 3vw, 2.2rem);
          letter-spacing: -0.03em;
          margin-bottom: 1rem;
        }
        .about-content p {
          color: var(--muted);
          margin-bottom: 0.85rem;
          max-width: 54ch;
        }
        .about-stats {
          display: grid;
          gap: 0.85rem;
        }
        .about-stats > div {
          padding: 1.25rem;
          border-radius: var(--radius-lg);
          background: rgba(255,255,255,0.7);
          border: 1px solid var(--border);
        }
        .about-stats strong {
          display: block;
          font-family: var(--font-display);
          font-size: 1.8rem;
          color: var(--accent);
        }
        .about-stats span {
          color: var(--muted);
          font-weight: 600;
        }
        @media (max-width: 800px) {
          .about-content { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
