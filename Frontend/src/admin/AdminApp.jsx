import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { api, session } from "./adminApi";
import AdminLogin from "./pages/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import Management from "./pages/Management";
import "./admin.css";
import "./AdminTables.css";
import "./SidebarScrollbar.css";
export default function AdminApp() {
  const [auth, setAuth] = useState(session.get),
    [checking, setChecking] = useState(Boolean(session.get())),
    [active, setActive] = useState("dashboard");
  const nav = useNavigate(),
    token = auth?.token;
  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    api("get", "/me")
      .then((r) => {
        if (r.user.role !== "admin") throw Error();
        setAuth((x) => ({ ...x, user: r.user }));
      })
      .catch(() => {
        session.clear();
        setAuth(null);
      })
      .finally(() => setChecking(false));
  }, [token]);
  if (checking)
    return <div className="admin-loading full">Checking secure session…</div>;
  if (!auth)
    return (
      <Routes>
        <Route path="login" element={<AdminLogin onLogin={setAuth} />} />
        <Route path="*" element={<Navigate to="login" replace />} />
      </Routes>
    );
  const logout = () => {
    session.clear();
    setAuth(null);
    nav("/admin/login", { replace: true });
  };
  const onUser = (user) => {
    const next = { ...auth, user };
    session.set(next);
    setAuth(next);
  };
  return (
    <AdminLayout
      active={active}
      setActive={setActive}
      user={auth.user}
      logout={logout}
    >
      <Management
        active={active}
        setActive={setActive}
        user={auth.user}
        onUser={onUser}
      />
    </AdminLayout>
  );
}
