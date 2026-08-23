import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { api, session } from "../adminApi";

export default function AdminLogin({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" }),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await api("post", "/login", form),
        next = { token: result.token, user: result.user };
      session.set(next);
      onLogin(next);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to sign in. Check that the backend server is running.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <main className="admin-login">
      <div className="login-brand">
        <span>V</span>
        <b>VORA CONTROL</b>
      </div>
      <form onSubmit={submit}>
        <small>PRIVATE WORKSPACE</small>
        <h1>Welcome back.</h1>
        <p>
          Sign in using the administrator created by Backend/createAdmin.js.
        </p>
        <label>
          Email
          <input
            required
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </label>
        <label>
          Password
          <input
            required
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </label>
        {error && <div className="login-error">{error}</div>}
        <button disabled={busy}>
          <LockKeyhole />
          {busy ? "Verifying…" : "Enter workspace"}
        </button>
      </form>
    </main>
  );
}
