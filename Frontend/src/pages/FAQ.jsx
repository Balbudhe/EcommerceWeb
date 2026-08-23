import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "../data/faqs";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="page container" style={{ maxWidth: 760 }}>
      <h1 className="page-title">FAQ</h1>
      <p className="page-sub">Answers to common questions about shipping, returns, and orders.</p>

      <div className="faq-list">
        {faqs.map((item, i) => {
          const isOpen = open === i;
          return (
            <div key={item.q} className={`faq-item ${isOpen ? "open" : ""}`}>
              <button onClick={() => setOpen(isOpen ? -1 : i)}>
                <span>{item.q}</span>
                <ChevronDown size={18} />
              </button>
              {isOpen ? <p>{item.a}</p> : null}
            </div>
          );
        })}
      </div>

      <style>{`
        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .faq-item {
          background: rgba(255,255,255,0.75);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .faq-item button {
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.15rem;
          font-weight: 700;
          text-align: left;
        }
        .faq-item button svg {
          transition: transform var(--transition);
          flex-shrink: 0;
        }
        .faq-item.open button svg {
          transform: rotate(180deg);
        }
        .faq-item p {
          padding: 0 1.15rem 1.15rem;
          color: var(--muted);
        }
      `}</style>
    </div>
  );
}
