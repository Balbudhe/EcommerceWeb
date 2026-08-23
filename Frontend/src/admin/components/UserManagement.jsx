import { useMemo, useState } from "react";
import {
  ArrowUpDown,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { api, money, session } from "../adminApi";
import "./UserManagement.css";
import "./UserToolbar.css";

export default function UserManagement({ users, reload }) {
  const [tab, setTab] = useState("all"),
    [query, setQuery] = useState(""),
    [sort, setSort] = useState("newest"),
    [editing, setEditing] = useState(null),
    [form, setForm] = useState({ name: "", role: "user" }),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [success, setSuccess] = useState("");
  const currentId = session.get()?.user?.id;
  const admins = users.filter((user) => user.role === "admin").length,
    customers = users.length - admins,
    customerRevenue = users
      .filter((u) => u.role === "user")
      .reduce((sum, u) => sum + Number(u.totalSpent || 0), 0);
  const visible = useMemo(
    () =>
      users
        .filter(
          (user) =>
            (tab === "all" || user.role === tab) &&
            `${user.name} ${user.email} ${user._id}`
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "oldest"
            ? new Date(a.createdAt) - new Date(b.createdAt)
            : sort === "name"
              ? a.name.localeCompare(b.name)
              : sort === "spend"
                ? Number(b.totalSpent) - Number(a.totalSpent)
                : new Date(b.createdAt) - new Date(a.createdAt),
        ),
    [users, tab, query, sort],
  );
  const open = (user) => {
    setEditing(user);
    setForm({ name: user.name, role: user.role });
    setError("");
  };
  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("patch", `/users/${editing._id}`, form);
      setEditing(null);
      setSuccess(`${form.name} was updated successfully.`);
      await reload();
      setTimeout(() => setSuccess(""), 3500);
    } catch (requestError) {
      setError(
        requestError.response?.data?.message || "User could not be updated.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <header className="user-heading">
        <div>
          <span className="user-eyebrow">
            <Sparkles />
            Access & accounts
          </span>
          <h1>User management</h1>
          <p>
            Understand your customers and control administrator access from one
            secure workspace.
          </p>
        </div>
        <label className="user-search">
          <Search />
          <input
            aria-label="Search users"
            placeholder="Search name, email, or ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘K</kbd>
        </label>
      </header>
      {success && (
        <div className="user-success" role="status">
          {success}
        </div>
      )}
      <div className="user-stats">
        <article>
          <span className="stat-icon blue">
            <Users />
          </span>
          <div>
            <small>Total accounts</small>
            <b>{users.length}</b>
            <p>Across every role</p>
          </div>
        </article>
        <article>
          <span className="stat-icon violet">
            <ShieldCheck />
          </span>
          <div>
            <small>Administrators</small>
            <b>{admins}</b>
            <p>Privileged accounts</p>
          </div>
        </article>
        <article>
          <span className="stat-icon green">
            <UserRound />
          </span>
          <div>
            <small>Customers</small>
            <b>{customers}</b>
            <p>{money(customerRevenue)} lifetime value</p>
          </div>
        </article>
      </div>
      <section className="user-panel">
        <div className="user-panel-top">
          <div className="account-filter">
          <div className="filter-title"><SlidersHorizontal/><span>Account type</span></div>
          <nav aria-label="Filter accounts by role">
            {[
              ["all", "All accounts", users.length, Users],
              ["admin", "Admins", admins, ShieldCheck],
              ["user", "Customers", customers, UserRound],
            ].map(([id, label, count, Icon]) => (
              <button
                type="button"
                className={tab === id ? "active" : ""}
                onClick={() => setTab(id)}
                aria-pressed={tab === id}
                key={id}
              >
                <Icon />
                <span className="filter-label">{label}</span>
                <span className="filter-count">{count}</span>
              </button>
            ))}
          </nav>
          </div>
          <div className="table-controls">
          <span className="results-summary"><b>{visible.length}</b> {visible.length === 1 ? "account" : "accounts"}</span>
          <label className="sort-control">
            <span className="sort-icon"><ArrowUpDown /></span>
            <span className="sort-copy"><small>Sort by</small><b>{sort === "newest" ? "Newest first" : sort === "oldest" ? "Oldest first" : sort === "name" ? "Name A–Z" : "Highest spend"}</b></span>
            <select aria-label="Sort accounts" value={sort} onChange={(e) => setSort(e.target.value)}>
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Name A–Z</option>
              <option value="spend">Highest spend</option>
            </select>
          </label>
          </div>
        </div>
        <div className="admin-table-wrap">
          <table className="user-table">
            <thead>
              <tr>
                <th>Identity</th>
                <th>Contact</th>
                <th>Activity</th>
                <th>Status</th>
                <th>Access</th>
                <th>Joined</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.length ? (
                visible.map((user) => (
                  <tr key={user._id}>
                    <td data-label="User">
                      <div className={`user-avatar ${user.role}`}>
                        {initials(user.name)}
                      </div>
                      <span>
                        <b>
                          {user.name}
                          {user._id === currentId && <em>You</em>}
                        </b>
                        <small>#{user._id.slice(-8).toUpperCase()}</small>
                      </span>
                    </td>
                    <td data-label="Contact">
                      <b>{user.email}</b>
                      <small>Email account</small>
                    </td>
                    <td data-label="Activity">
                      <b>{user.orderCount || 0} orders</b>
                      <small>{money(user.totalSpent || 0)} spent</small>
                    </td>
                    <td data-label="Status">
                      <span className="user-badge status">
                        <i />
                        Active
                      </span>
                    </td>
                    <td data-label="Access">
                      <span className={`user-badge ${user.role}`}>
                        {user.role === "admin" ? (
                          <ShieldCheck />
                        ) : (
                          <UserRound />
                        )}
                        {user.role === "admin" ? "Admin" : "Customer"}
                      </span>
                    </td>
                    <td data-label="Joined">
                      <b>
                        {new Date(user.createdAt).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </b>
                      <small>{relativeDate(user.createdAt)}</small>
                    </td>
                    <td data-label="Actions">
                      <button className="user-edit" onClick={() => open(user)}>
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className="user-empty">
                      <Search />
                      <b>No matching accounts</b>
                      <p>Try another search term or role filter.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="user-footer">
          Showing <b>{visible.length}</b> of <b>{users.length}</b> accounts
        </footer>
      </section>
      {editing && (
        <div className="modal-bg">
          <form className="admin-modal user-modal" onSubmit={save}>
            <button
              type="button"
              className="close"
              onClick={() => setEditing(null)}
            >
              <X />
            </button>
            <div className={`user-avatar large ${editing.role}`}>
              {initials(editing.name)}
            </div>
            <span className="user-eyebrow">Account editor</span>
            <h2>Manage user</h2>
            <p>{editing.email}</p>
            <label>
              Display name
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </label>
            <label>
              Access role
              <select
                value={form.role}
                disabled={editing._id === currentId}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="user">Customer</option>
                <option value="admin">Administrator</option>
              </select>
              {editing._id === currentId && (
                <small>Your own administrator role cannot be changed.</small>
              )}
            </label>
            <div className="role-note">
              <ShieldCheck />
              <p>
                <b>Role changes take effect immediately.</b>
                <br />
                Administrators can access every management function.
              </p>
            </div>
            {error && <div className="login-error">{error}</div>}
            <div className="modal-actions">
              <button type="button" onClick={() => setEditing(null)}>
                Cancel
              </button>
              <button className="primary" disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
const initials = (name) =>
  (name || "User")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
function relativeDate(value) {
  const days = Math.floor((Date.now() - new Date(value)) / 86400000);
  if (days === 0) return "Joined today";
  if (days < 30) return `${days} days ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}
