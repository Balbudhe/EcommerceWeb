import {
  BarChart3,
  Boxes,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  ShoppingBag,
  Tags,
  TicketPercent,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
const groups = [
  ["MAIN", [["Dashboard", "dashboard", LayoutDashboard]]],
  [
    "CATALOG",
    [
      ["Products", "products", Boxes],
      ["Categories", "categories", Tags],
      ["Inventory", "inventory", Boxes],
    ],
  ],
  ["ORDERS", [["Orders", "orders", ShoppingBag]]],
  [
    "MARKETING",
    [
      ["Slider / Banners", "sliders", Image],
      ["Coupons", "coupons", TicketPercent],
    ],
  ],
  [
    "USERS & REPORTS",
    [
      ["Customers", "users", Users],
      ["Reports", "reports", BarChart3],
      ["Settings", "settings", Settings],
    ],
  ],
];
export default function AdminLayout({
  active,
  setActive,
  user,
  logout,
  children,
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={open ? "open" : ""}>
        <header>
          <span>V</span>
          <b>
            VORA <em>Control</em>
          </b>
          <button onClick={() => setOpen(false)}>
            <X />
          </button>
        </header>
        <nav>
          {groups.map(([label, items]) => (
            <section key={label}>
              <small>{label}</small>
              {items.map(([name, id, Icon]) => (
                <button
                  className={active === id ? "active" : ""}
                  onClick={() => {
                    setActive(id);
                    setOpen(false);
                  }}
                  key={id}
                >
                  <Icon />
                  {name}
                </button>
              ))}
            </section>
          ))}
        </nav>
        <button className="admin-logout" onClick={logout}>
          <LogOut />
          Logout
        </button>
      </aside>
      <main>
        <div className="admin-topbar">
          <button className="admin-menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <b>
              {groups.flatMap((g) => g[1]).find((x) => x[1] === active)?.[0]}
            </b>
            <small>Store administration</small>
          </div>
          <a href="/" target="_blank">
            View storefront ↗
          </a>
          <div className="admin-profile">
            <span>{user.name?.[0]}</span>
            <div>
              <b>{user.name}</b>
              <small>{user.email}</small>
            </div>
          </div>
        </div>
        <div className="admin-workspace">{children}</div>
      </main>
    </div>
  );
}
