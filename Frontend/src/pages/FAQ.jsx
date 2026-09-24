import "./FAQ.css";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { faqs } from "../data/faqs";

export default function FAQ() {
  const [open, setOpen] = useState(0);

  return (
    <div className="faq-page">
      <header className="page-banner">
        <p className="eyebrow">Help</p>
        <h1>FAQ</h1>
        <p>Answers about shipping, 7-day returns, teakwood, and our one-plant initiative.</p>
      </header>
      <div className="page container">
        <div className="faq-list">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={item.q} className={`faq-item ${isOpen ? "open" : ""}`}>
                <button type="button" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span>{item.q}</span>
                  <ChevronDown size={18} />
                </button>
                {isOpen ? <p>{item.a}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
