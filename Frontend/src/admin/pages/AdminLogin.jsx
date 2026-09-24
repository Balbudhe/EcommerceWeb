import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { KeyRound, LockKeyhole, UserPlus } from "lucide-react";
import BrandMark from "../../components/ui/BrandMark";
import { api, session } from "../adminApi";

const COPY = {
  login: {
    eyebrow: "ARTIQULATE ATELIER",
    title: "Welcome back.",
    text: "Sign in to manage teakwood furniture, temples, lighting, and orders.",
    action: "Enter atelier",
    busy: "Verifying…",
  },
  signup: {
    eyebrow: "CREATE ACCESS",
    title: "Join the atelier.",
    text: "Create an administrator account and open the workshop immediately.",
    action: "Create administrator",
    busy: "Creating…",
  },
  forgot: {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Forgot password?",
    text: "Enter your admin email and we will send a reset link that expires in 10 minutes.",
    action: "Send reset link",
    busy: "Sending…",
  },
  reset: {
    eyebrow: "ACCOUNT RECOVERY",
    title: "Set a new password.",
    text: "Choose a new password for this administrator account.",
    action: "Update password",
    busy: "Updating…",
  },
};

const emptyForm = {
  name: "",
  email: "",
  password: "",
  confirm: "",
};

export default function AdminLogin({ onLogin }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("token") || "";
  const requested = searchParams.get("view");
  const view = location.pathname.includes("reset-password")
    ? "reset"
    : requested === "signup" || requested === "forgot"
      ? requested
      : "login";
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(location.state?.notice || "");
  const [busy, setBusy] = useState(false);
  const copy = COPY[view];
  const change = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));
  const show = (next, message = "") => {
    setError("");
    setNotice(message);
    setBusy(false);
    const path =
      next === "login" ? "/admin/login" : `/admin/login?view=${next}`;
    navigate(path, {
      replace: true,
      state: message ? { notice: message } : {},
    });
  };
  const enterWorkspace = (result) => {
    const next = { token: result.token, user: result.user };
    session.set(next);
    onLogin(next);
  };
  const fail = (requestError, fallback) => {
    setError(requestError.response?.data?.message || fallback);
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (view === "login") {
        enterWorkspace(
          await api("post", "/login", {
            email: form.email,
            password: form.password,
          }),
        );
        return;
      }
      if (view === "signup") {
        if (form.password !== form.confirm) {
          setError("Passwords do not match");
          return;
        }
        enterWorkspace(
          await api("post", "/register", {
            name: form.name,
            email: form.email,
            password: form.password,
          }),
        );
        return;
      }
      if (view === "forgot") {
        const result = await api("post", "/forgot-password", {
          email: form.email,
        });
        setNotice(result.message || "Reset link sent. Check your email.");
        return;
      }
      if (!resetToken) {
        setError("Reset link is invalid or missing. Request a new one.");
        return;
      }
      if (form.password !== form.confirm) {
        setError("Passwords do not match");
        return;
      }
      const result = await api("post", "/reset-password", {
        token: resetToken,
        password: form.password,
      });
      setForm(emptyForm);
      show(
        "login",
        result.message || "Password reset successfully. You can sign in now.",
      );
    } catch (requestError) {
      fail(
        requestError,
        view === "login"
          ? "Unable to sign in. Check that the backend server is running."
          : view === "signup"
            ? "Unable to create administrator."
            : view === "forgot"
              ? "Unable to send reset email."
              : "Unable to reset password. The link may have expired.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="admin-login">
      <div className="login-brand">
        <BrandMark className="admin-logo" wordmark="" />
        <div>
          <b>Artiqulate</b>
          <small>Atelier</small>
        </div>
      </div>
      <form onSubmit={submit}>
        <small>{copy.eyebrow}</small>
        <h1>{copy.title}</h1>
        <p>{copy.text}</p>
        {view === "signup" && (
          <label>
            Full name
            <input
              required
              autoComplete="name"
              value={form.name}
              onChange={change("name")}
            />
          </label>
        )}
        {view !== "reset" && (
          <label>
            Email
            <input
              required
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={change("email")}
            />
          </label>
        )}
        {view !== "forgot" && (
          <label>
            {view === "reset" ? "New password" : "Password"}
            <input
              required
              type="password"
              minLength={6}
              autoComplete={
                view === "signup" ? "new-password" : "current-password"
              }
              value={form.password}
              onChange={change("password")}
            />
          </label>
        )}
        {(view === "signup" || view === "reset") && (
          <label>
            Confirm password
            <input
              required
              type="password"
              minLength={6}
              autoComplete="new-password"
              value={form.confirm}
              onChange={change("confirm")}
            />
          </label>
        )}
        {view === "reset" && !resetToken && (
          <div className="login-error">
            This reset link is invalid or incomplete.
          </div>
        )}
        {error && <div className="login-error">{error}</div>}
        {notice && <div className="login-success">{notice}</div>}
        <button type="submit" disabled={busy || (view === "reset" && !resetToken)}>
          {view === "signup" ? (
            <UserPlus />
          ) : view === "forgot" || view === "reset" ? (
            <KeyRound />
          ) : (
            <LockKeyhole />
          )}
          {busy ? copy.busy : copy.action}
        </button>
        <div className="login-links">
          {view === "login" && (
            <>
              <button type="button" onClick={() => show("forgot")}>
                Forgot password?
              </button>
              <span>
                New administrator?{" "}
                <button type="button" onClick={() => show("signup")}>
                  Sign up
                </button>
              </span>
            </>
          )}
          {view === "signup" && (
            <span>
              Already have access?{" "}
              <button type="button" onClick={() => show("login")}>
                Sign in
              </button>
            </span>
          )}
          {(view === "forgot" || view === "reset") && (
            <span>
              Remember your password?{" "}
              <button type="button" onClick={() => show("login")}>
                Sign in
              </button>
            </span>
          )}
        </div>
        {view === "reset" && !resetToken && (
          <p className="login-links">
            <button type="button" onClick={() => show("forgot")}>
              Request a new link
            </button>
          </p>
        )}
      </form>
    </main>
  );
}
