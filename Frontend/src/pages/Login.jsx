import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Popup from "../components/ui/Popup";

export default function Login() {
  const { login, loading, isAuthenticated, booting } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  if (isAuthenticated && !popup.open) {
    return <Navigate to="/" replace />;
  }

  const closePopup = () => {
    setPopup((prev) => {
      if (prev.type === "success" && prev.open) {
        navigate("/", { replace: true });
      }
      return { ...prev, open: false };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await login(email, password);
      setPopup({
        open: true,
        type: "success",
        message: data.message || "Login successful",
      });
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 1600);
    } catch (err) {
      setPopup({
        open: true,
        type: "error",
        message: err.message || "Login failed",
      });
    }
  };

  return (
    <div className="page page-narrow">
      <Popup
        open={popup.open}
        type={popup.type}
        title={popup.type === "success" ? "Welcome back!" : "Login failed"}
        message={popup.message}
        onClose={closePopup}
      />

      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1 className="page-title">Sign in</h1>
        <p className="page-sub">Access your orders, wishlist, and saved details.</p>

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
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
            <Link to="/forgot-password" className="forgot-link">
              Forgot password?
            </Link>
          </div>
          <button className="btn btn-primary btn-block" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="auth-switch">
          New to VORA? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
