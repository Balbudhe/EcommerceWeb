import { useEffect } from "react";
import { createPortal } from "react-dom";
import "./Popup.css";
import { CheckCircle2, X, XCircle } from "lucide-react";

export default function Popup({ open, type = "success", title, message, onClose }) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const isSuccess = type === "success";

  return createPortal(
    <div className="popup-overlay" onClick={onClose} role="presentation">
      <div
        className={`popup-card ${isSuccess ? "popup-success" : "popup-error"}`}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="popup-close" onClick={onClose} aria-label="Close">
          <X size={20} />
        </button>
        <div className="popup-icon">
          {isSuccess ? <CheckCircle2 size={52} /> : <XCircle size={52} />}
        </div>
        <h3 id="popup-title">{title || (isSuccess ? "Success" : "Error")}</h3>
        <p>{message}</p>
        <button type="button" className="btn btn-primary popup-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>,
    document.body
  );
}
