import { useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import axiosInstance from "../utils/Axios";
import Popup from "../components/ui/Popup";
import { useAuth } from "../context/AuthContext";

export default function ResetPassword() {
  const { isAuthenticated, booting } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
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

  if (isAuthenticated && !popup.open) {
    return <Navigate to="/" replace />;
  }

  const closePopup = () => {
    setPopup((prev) => {
      if (prev.type === "success" && prev.open) {
        navigate("/login", { replace: true });
      }
      return { ...prev, open: false };
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setPopup({
        open: true,
        type: "error",
        message: "Reset link is invalid or missing. Please request a new one.",
      });
      return;
    }

    if (password !== confirm) {
      setPopup({
        open: true,
        type: "error",
        message: "Passwords do not match",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await axiosInstance.post("/auth/reset-password", {
        token,
        password,
      });
      setPopup({
        open: true,
        type: "success",
        message: data.message || "Password reset successful. You can sign in now.",
      });
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1600);
    } catch (err) {
      setPopup({
        open: true,
        type: "error",
        message:
          err.response?.data?.message ||
          "Could not reset password. The link may have expired.",
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
        title={popup.type === "success" ? "Password updated" : "Reset failed"}
        message={popup.message}
        onClose={closePopup}
      />

      <div className="auth-card">
        <Link to="/login" className="auth-back">
          <ArrowLeft size={16} /> Back to sign in
        </Link>

        <span className="eyebrow">Account recovery</span>
        <h1 className="page-title">Reset password</h1>
        <p className="page-sub">
          Choose a new password for your VORA account.
        </p>

        {!token ? (
          <div className="empty-state" style={{ padding: "1.5rem 1rem" }}>
            <p>This reset link is invalid or incomplete.</p>
            <Link to="/forgot-password" className="btn btn-primary btn-sm">
              Request a new link
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <div className="field">
              <label htmlFor="confirm">Confirm new password</label>
              <input
                id="confirm"
                type="password"
                required
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
              />
            </div>
            <button className="btn btn-primary btn-block" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Remember your password? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
