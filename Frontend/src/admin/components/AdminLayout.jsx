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
import BrandMark from "../../components/ui/BrandMark";

const groups = [
  ["ATELIER", [["Dashboard", "dashboard", LayoutDashboard]]],
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
    "GALLERY",
    [
      ["Banners", "sliders", Image],
      ["Coupons", "coupons", TicketPercent],
    ],
  ],
  [
    "HOUSE",
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
  const page = groups.flatMap((group) => group[1]).find((item) => item[1] === active);
  return (
    <div className="admin-shell">
      <div
        className={`admin-overlay ${open ? "show" : ""}`}
        onClick={() => setOpen(false)}
      />
      <aside className={open ? "open" : ""}>
        <header>
          <BrandMark className="admin-logo" wordmark="" />
          <div className="admin-brand-copy">
            <b>Artiqulate</b>
            <small>Atelier</small>
          </div>
          <button type="button" onClick={() => setOpen(false)}>
            <X />
          </button>
        </header>
        <nav>
          {groups.map(([label, items]) => (
            <section key={label}>
              <small>{label}</small>
              {items.map(([name, id, Icon]) => (
                <button
                  type="button"
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
        <button type="button" className="admin-logout" onClick={logout}>
          <LogOut />
          Sign out
        </button>
      </aside>
      <main>
        <div className="admin-topbar">
          <button type="button" className="admin-menu" onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <div>
            <b>{page?.[0]}</b>
            <small>Artiqulate Lifestyle · workshop control</small>
          </div>
          <a href="/" target="_blank" rel="noreferrer">
            View storefront
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
