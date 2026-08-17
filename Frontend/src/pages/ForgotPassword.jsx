import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "../utils/Axios";
import Popup from "../components/ui/Popup";
import { useAuth } from "../context/AuthContext";

export default function ForgotPassword() {
  const { isAuthenticated, booting } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ open: false, type: "success", message: "" });

  if (booting) {
    return (
      <div className="page page-narrow">
        <div className="auth-card empty-state" style={{ padding: "2.5rem" }}>
          Loading…
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/send-verification-email", {
        email,
      });
      setPopup({
        open: true,
        type: "success",
        message: data.message || "Password reset link sent to your email.",
      });
      setEmail("");
    } catch (err) {
      setPopup({
        open: true,
        type: "error",
        message: err.response?.data?.message || "Could not send reset link. Try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page page-narrow">
      <Popup
        open={popup.open}
        type={popup.type}
        title={popup.type === "success" ? "Check your email" : "Request failed"}
        message={popup.message}
        onClose={() => setPopup((p) => ({ ...p, open: false }))}
      />

      <div className="auth-card">
        <Link to="/login" className="auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <span className="eyebrow">Account recovery</span>
        <h1 className="page-title">Forgot password?</h1>
        <p className="page-sub">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
            />
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>

        <p className="auth-switch">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
