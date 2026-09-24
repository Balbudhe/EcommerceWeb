import { useEffect, useMemo, useState } from "react";
import {
  CircleDollarSign,
  PackagePlus,
  Search,
  ShoppingBag,
  Users,
  Boxes,
  BadgePercent,
  Check,
  ImagePlus,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { api, money, stock } from "../adminApi";
import { SPECIFICATION_FIELDS, blankSpecifications, normalizeSpecifications } from "../../services/api";
import ProductTable from "../components/ProductTable";
import UserManagement from "../components/UserManagement";
import CategoriesManagement from "../components/CategoriesManagement";
import CouponManagement from "../components/CouponManagement";
import { COLLECTIONS, SITE } from "../../data/site";
import "../components/ProductSelectors.css";
const PIECE_SIZES = ["Compact", "Standard", "Large", "Extra Large", "Custom"];
const WOOD_FINISHES = [
  ["Natural Teak", "#c4a574"],
  ["Honey Teak", "#d4a054"],
  ["Dark Walnut", "#4a2f1a"],
  ["Walnut", "#6b4226"],
  ["Antique Gold", "#b0894d"],
  ["Ivory", "#f3eadc"],
  ["Espresso", "#2c241b"],
  ["Black", "#1a1410"],
  ["White", "#faf6ef"],
  ["Natural", "#d6c6a5"],
];
const blank = {
  title: "",
  description: "",
  materialCare: "",
  specifications: blankSpecifications(),
  price: "",
  originalPrice: "",
  category: "",
  images: [""],
  colors: [],
  sizes: [],
  variants: [],
  features: [""],
  isNew: false,
  onSale: false,
};
const Card = ({ icon: Icon, label, value, note }) => (
  <article className="stat-card">
    <span>
      <Icon />
    </span>
    <div>
      <small>{label}</small>
      <b>{value}</b>
      <p>{note}</p>
    </div>
  </article>
);
const Panel = ({ title, subtitle, children, actions }) => (
  <section className="admin-panel">
    <header>
      <div>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      {actions}
    </header>
    {children}
  </section>
);
export default function Management({ active, setActive, user, onUser }) {
  const [data, setData] = useState({
      stats: {},
      products: [],
      orders: [],
      users: [],
      categories: [],
      coupons: [],
      sliders: [],
    }),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [modal, setModal] = useState(null),
    [form, setForm] = useState(blank),
    [saving, setSaving] = useState(false),
    [customSizeOpen, setCustomSizeOpen] = useState(false),
    [customSize, setCustomSize] = useState(""),
    [customColorOpen, setCustomColorOpen] = useState(false),
    [customColor, setCustomColor] = useState({ name: "", hex: "#c4a574" }),
    [notice, setNotice] = useState(""),
    [confirmDelete, setConfirmDelete] = useState(null);
  const flash = (message) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3200);
  };
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, coupons, sliders, users, orders] = await Promise.all([
        api("get", "/dashboard"),
        api("get", "/coupons"),
        api("get", "/sliders"),
        api("get", "/users"),
        api("get", "/orders"),
      ]);
      let cats = await api("get", "/categories");
      if (!cats.categories?.length) {
        await Promise.all(
          COLLECTIONS.map((collection) =>
            api("post", "/categories", {
              name: collection.name,
              description: collection.description,
              active: true,
            }),
          ),
        );
        cats = await api("get", "/categories");
      }
      setData({
        ...dash,
        categories: cats.categories,
        coupons: coupons.coupons,
        sliders: sliders.sliders,
        users: users.users,
        orders: orders.orders,
      });
    } catch (e) {
      setError(e.response?.data?.message || "Unable to load dashboard");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    load();
  }, []);
  const products = useMemo(
    () =>
      data.products.filter(
        (p) =>
          `${p.title} ${p.category}`
            .toLowerCase()
            .includes(query.toLowerCase()) &&
          (!filter || p.category === filter),
      ),
    [data.products, query, filter],
  );
  const payload = () => {
    const clean = (values) => [...new Set(values.map((value) => value.trim()).filter(Boolean))];
    const price = +form.price;
    const originalPrice = +form.originalPrice;
    const salePercent =
      originalPrice > price && originalPrice > 0
        ? Math.max(1, Math.min(100, Math.round(((originalPrice - price) / originalPrice) * 100)))
        : 0;
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      materialCare: form.materialCare.trim(),
      specifications: normalizeSpecifications(form.specifications),
      price,
      originalPrice,
      category: form.category,
      images: clean(form.images),
      colors: clean(form.colors),
      sizes: clean(form.sizes),
      variants: form.variants.map((variant) => ({
        color: variant.color,
        size: variant.size,
        stock: +variant.stock,
      })),
      features: clean(form.features),
      isNew: form.isNew,
      onSale: salePercent > 0,
      salePercent,
      rating: 0,
      reviews: 0,
    };
  };
  const openProduct = (type, p) => {
    setForm(
      p
        ? {
            ...p,
            images: p.images || [],
            colors: p.colors || [],
            sizes: p.sizes || [],
            variants: p.variants || [],
            features: p.features || [],
            specifications: { ...blankSpecifications(), ...normalizeSpecifications(p.specifications) },
          }
        : blank,
    );
    setModal({ type, item: p });
  };
  useEffect(() => {
    if (active === "add" && !modal) openProduct("add");
  }, [active, modal]);
  const saveProduct = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const body = payload();
      if (!body.sizes.length) body.sizes = ["Standard"];
      if (!body.colors.length) body.colors = ["Natural Teak"];
      if (!body.images.length) {
        setNotice("Add at least one product image URL.");
        return;
      }
      if (!body.features.length) body.features = ["Handmade teakwood"];
      if (!body.variants.length) {
        body.variants = [
          { color: body.colors[0], size: body.sizes[0], stock: 0 },
        ];
      }
      if (modal.type === "edit") {
        await api("patch", `/products/${modal.item._id}`, body);
      } else {
        await api("post", "/products", body);
      }
      setModal(null);
      await load();
      setActive("products");
      flash(modal.type === "edit" ? "Product updated." : "Product added to the catalog.");
    } catch (e) {
      setNotice(e.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };
  const remove = (product) => setConfirmDelete(product);
  const destroyProduct = async () => {
    if (!confirmDelete) return;
    try {
      await api("delete", `/products/${confirmDelete._id}`);
      setConfirmDelete(null);
      await load();
      flash("Product removed from the catalog.");
    } catch (e) {
      setNotice(e.response?.data?.message || "Could not delete product");
    }
  };
  const toggleOption = (field, value) => {
    setForm((current) => {
      const selected = current[field].includes(value);
      const nextValues = selected
        ? current[field].filter((item) => item !== value)
        : [...current[field], value];
      const variants = selected
        ? current.variants.filter((variant) =>
            field === "sizes" ? variant.size !== value : variant.color !== value,
          )
        : current.variants;
      return { ...current, [field]: nextValues, variants };
    });
  };
  const addCustomOption = (field, value) => {
    value = value.trim();
    if (!value) return;
    const normalized = field === "sizes" ? value.toUpperCase() : value;
    setForm((current) =>
      current[field].some(
        (item) => item.toLowerCase() === normalized.toLowerCase(),
      )
        ? current
        : { ...current, [field]: [...current[field], normalized] },
    );
    if (field === "sizes") {
      setCustomSize("");
      setCustomSizeOpen(false);
    } else {
      setCustomColor({ name: "", hex: "#64748b" });
      setCustomColorOpen(false);
    }
  };
  const generateVariants = () => {
    setForm((current) => {
      const existing = new Map(
        current.variants.map((variant) => [
          `${variant.size}\u0000${variant.color}`,
          variant,
        ]),
      );
      return {
        ...current,
        variants: current.sizes.flatMap((size) =>
          current.colors.map(
            (color) =>
              existing.get(`${size}\u0000${color}`) || {
                size,
                color,
                stock: "",
              },
          ),
        ),
      };
    });
  };
  const updateVariant = (index, field, value) => {
    setForm((current) => {
      const candidate = { ...current.variants[index], [field]: value };
      const duplicate = current.variants.some(
        (variant, variantIndex) =>
          variantIndex !== index &&
          variant.size === candidate.size &&
          variant.color === candidate.color,
      );
      if (duplicate) return current;
      return {
        ...current,
        variants: current.variants.map((variant, variantIndex) =>
          variantIndex === index ? candidate : variant,
        ),
      };
    });
  };
  if (loading)
    return <div className="admin-loading">Loading store workspace…</div>;
  if (error)
    return (
      <div className="admin-error">
        <b>Something went wrong</b>
        <p>{error}</p>
        <button onClick={load}>Try again</button>
      </div>
    );
  if (active === "dashboard")
    return (
      <>
        {notice && <div className="admin-notice">{notice}</div>}
        <div className="admin-hero">
          <div>
            <small>ARTIQULATE ATELIER</small>
            <h1>Welcome back, {user.name}.</h1>
            <p>Handmade teakwood, temples, and lighting — live from your workshop.</p>
          </div>
        </div>
        <div className="stat-grid">
          <Card
            icon={CircleDollarSign}
            label="Revenue"
            value={money(data.stats.revenue)}
            note="Non-cancelled orders"
          />
          <Card
            icon={ShoppingBag}
            label="Orders"
            value={data.stats.orders}
            note={`${data.stats.pending} awaiting action`}
          />
          <Card
            icon={Boxes}
            label="Products"
            value={data.stats.products}
            note={`${data.stats.lowStock} low stock`}
          />
          <Card
            icon={Users}
            label="Customers"
            value={data.stats.customers}
            note="Registered collectors"
          />
        </div>
        <div className="dashboard-grid">
          <Panel title="Recent orders" subtitle="Latest atelier commissions">
            <OrderRows orders={data.orders} />
          </Panel>
          <Panel
            title="Inventory watch"
            subtitle="Products requiring attention"
          >
            {[...data.products]
              .sort((a, b) => stock(a) - stock(b))
              .slice(0, 6)
              .map((p) => (
                <div className="mini-row" key={p._id}>
                  <img src={p.images?.[0]} />
                  <span>
                    <b>{p.title}</b>
                    <small>{p.category}</small>
                  </span>
                  <strong className={stock(p) < 10 ? "danger-text" : ""}>
                    {stock(p)} left
                  </strong>
                </div>
              ))}
          </Panel>
        </div>
      </>
    );
  if (active === "products" || active === "inventory")
    return (
      <Panel
        title={active === "products" ? "Product list" : "Inventory"}
        subtitle={
          active === "products"
            ? "Manage your complete product catalog"
            : "Monitor stock across every product"
        }
        actions={
          active === "products" && (
            <button className="primary" onClick={() => openProduct("add")}>
              <PackagePlus />
              Add product
            </button>
          )
        }
      >
        <div className="admin-toolbar">
          <label>
            <Search />
            <input
              placeholder="Search products"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All categories</option>
            {[...new Set(data.products.map((p) => p.category))].map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>
        {notice && <div className="admin-notice">{notice}</div>}
        <ProductTable
          products={products}
          onView={(p) => openProduct("view", p)}
          onEdit={(p) => openProduct("edit", p)}
          onDelete={remove}
        />
        {renderModal()}
        {confirmDelete && (
          <div className="modal-bg">
            <div className="admin-modal">
              <button type="button" className="close" onClick={() => setConfirmDelete(null)}>
                <X />
              </button>
              <small>Remove piece</small>
              <h2>Delete {confirmDelete.title}?</h2>
              <p>This removes the product from the catalog and storefront immediately.</p>
              <div className="modal-actions" style={{ display: "flex", gap: 8, marginTop: 18 }}>
                <button type="button" onClick={() => setConfirmDelete(null)}>
                  Keep product
                </button>
                <button type="button" className="primary" onClick={destroyProduct}>
                  Delete product
                </button>
              </div>
            </div>
          </div>
        )}
      </Panel>
    );
  if (active === "add")
    return <>{modal ? renderModal(true) : <div className="admin-loading">Preparing product form…</div>}</>;
  if (active === "orders")
    return (
      <Panel title="Orders" subtitle="Manage order fulfilment & Shiprocket shipping">
        <OrderRows
          orders={data.orders}
          update={async (id, status) => {
            const current = data.orders.find((order) => order._id === id);
            if (current?.orderStatus === "CANCELLED") return;
            await api("patch", `/orders/${id}`, { orderStatus: status });
            load();
          }}
          ship={async (id) => {
            await api("post", `/orders/${id}/ship`);
            load();
          }}
        />
      </Panel>
    );
  if (active === "users")
    return <UserManagement users={data.users} reload={load} />;
  if (active === "categories")
    return (
      <CategoriesManagement
        categories={data.categories}
        add={(v) => api("post", "/categories", v).then(load)}
        update={(x, v) => api("patch", `/categories/${x._id}`, v).then(load)}
        toggle={(x) =>
          api("patch", `/categories/${x._id}`, { active: !x.active }).then(load)
        }
        remove={(x) => api("delete", `/categories/${x._id}`).then(load)}
      />
    );
  if (active === "coupons")
    return (
      <CouponManagement
        coupons={data.coupons}
        add={(v) => api("post", "/coupons", v).then(load)}
        toggle={(x) =>
          api("patch", `/coupons/${x._id}`, { active: !x.active }).then(load)
        }
      />
    );
  if (active === "sliders")
    return (
      <Resource
        title="Storefront banners"
        items={data.sliders}
        fields={["title", "subtitle", "image", "link"]}
        add={(v) => api("post", "/sliders", v).then(load)}
        toggle={(x) =>
          api("patch", `/sliders/${x._id}`, { active: !x.active }).then(load)
        }
        render={(x) => (
          <>
            <img src={x.image} />
            <span>
              <b>{x.title}</b>
              <small>{x.subtitle}</small>
            </span>
          </>
        )}
      />
    );
  if (active === "reports")
    return (
      <>
        <div className="stat-grid">
          <Card
            icon={CircleDollarSign}
            label="Revenue"
            value={money(data.stats.revenue)}
          />
          <Card icon={ShoppingBag} label="Orders" value={data.stats.orders} />
          <Card icon={Boxes} label="Delivered" value={data.stats.delivered} />
          <Card icon={Users} label="Customers" value={data.stats.customers} />
        </div>
        <Panel
          title="Order status report"
          subtitle="Live fulfilment distribution"
        >
          <div className="report-grid">
            {["pending", "processing", "shipped", "delivered"].map((k) => (
              <div key={k}>
                <span>{k}</span>
                <b>{data.stats[k]}</b>
                <i
                  style={{
                    width: `${Math.max(5, (data.stats[k] / Math.max(1, data.stats.orders)) * 100)}%`,
                  }}
                />
              </div>
            ))}
          </div>
        </Panel>
      </>
    );
  if (active === "settings")
    return (
      <Settings
        user={user}
        save={async (name) => {
          const r = await api("patch", "/settings", { name });
          onUser(r.user);
        }}
      />
    );
  function renderModal(page = false) {
    if (!modal) return null;
    if (modal.type === "view")
      return (
        <div className="modal-bg">
          <div className="admin-modal">
            <button type="button" className="close" onClick={() => setModal(null)}>
              <X />
            </button>
            <div className="product-form-head">
              <small>Catalog piece</small>
              <h2>{form.title}</h2>
              <p>{form.category}</p>
            </div>
            <img className="detail-image" src={form.images?.[0]} alt={form.title} />
            <p>{form.description}</p>
            <h3>
              {money(form.price)} · {stock(form)} in stock
            </h3>
          </div>
        </div>
      );
    return (
      <div className={page ? "" : "modal-bg"}>
        <form
          className={`admin-modal product-form product-form-premium ${page ? "page-form" : ""}`}
          onSubmit={saveProduct}
        >
          <button
            type="button"
            className="close"
            onClick={() => {
              setModal(null);
              if (page) setActive("products");
            }}
          >
            <X />
          </button>
          <div className="product-form-head">
            <small>Catalog management</small>
            <h2>{modal.type === "edit" ? "Edit piece" : "Add a new piece"}</h2>
            <p>Title, finish, scale, and workshop stock — saved to the live catalog.</p>
          </div>
          {notice && <div className="admin-notice error">{notice}</div>}
          <div className="form-grid">
            {[
              ["title", "Product name"],
              ["price", "Price", "number"],
              ["originalPrice", "Original price", "number"],
            ].map(([k, l, t]) => (
              <label key={k}>
                {l}
                <input
                  required
                  type={t || "text"}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <label>
              Category
              <select
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Select category</option>
                {data.categories
                  .filter((item) => item.active)
                  .map((item) => (
                    <option value={item.name} key={item._id}>
                      {item.name}
                    </option>
                  ))}
              </select>
            </label>
            <ImageFields values={form.images} onChange={(images) => setForm({ ...form, images })} />
            <div className="wide option-picker product-form-section">
              <b>Scale</b>
              <div className="size-options">
                {PIECE_SIZES.map((size) => (
                  <button type="button" key={size} className={form.sizes.includes(size) ? "selected" : ""} aria-pressed={form.sizes.includes(size)} onClick={() => toggleOption("sizes", size)}>
                    {form.sizes.includes(size) && <Check />}{size}
                  </button>
                ))}
                {form.sizes.filter((size) => !PIECE_SIZES.includes(size)).map((size) => (
                  <button type="button" key={size} className="selected" aria-pressed="true" onClick={() => toggleOption("sizes", size)}><Check />{size}</button>
                ))}
                <button type="button" className="custom-option" onClick={() => setCustomSizeOpen((open) => !open)}><Plus />Custom scale</button>
              </div>
              {customSizeOpen && (
                <div className="image-row">
                  <input autoFocus placeholder="Enter custom scale" value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomOption("sizes", customSize); } }} />
                  <button type="button" className="primary" onClick={() => addCustomOption("sizes", customSize)}>Add</button>
                </div>
              )}
            </div>
            <div className="wide option-picker product-form-section">
              <b>Wood finish</b>
              <div className="color-options">
                {WOOD_FINISHES.map(([name, hex]) => (
                  <button type="button" key={name} className={form.colors.includes(name) ? "selected" : ""} aria-pressed={form.colors.includes(name)} onClick={() => toggleOption("colors", name)}>
                    <i style={{ backgroundColor: hex }}>{form.colors.includes(name) && <Check />}</i>{name}
                  </button>
                ))}
                {form.colors.filter((color) => !WOOD_FINISHES.some(([name]) => name === color)).map((color) => (
                  <button type="button" key={color} className="selected" aria-pressed="true" onClick={() => toggleOption("colors", color)}><i><Check /></i>{color}</button>
                ))}
                <button type="button" className="custom-option" onClick={() => setCustomColorOpen((open) => !open)}><Plus />Custom finish</button>
              </div>
              {customColorOpen && (
                <div className="image-row">
                  <input aria-label="Choose custom finish" type="color" value={customColor.hex} onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })} />
                  <input autoFocus placeholder="Finish name" value={customColor.name} onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomOption("colors", customColor.name); } }} />
                  <button type="button" className="primary" onClick={() => addCustomOption("colors", customColor.name)}>Add finish</button>
                </div>
              )}
            </div>
            <label className="wide">
              Description
              <textarea
                required
                placeholder="Shown in the product Description dropdown"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <label className="wide">
              Material care
              <textarea
                placeholder="Shown in the product Material Care dropdown"
                value={form.materialCare}
                onChange={(e) =>
                  setForm({ ...form, materialCare: e.target.value })
                }
              />
            </label>
            <div className="wide product-form-section spec-fields">
              <b>Specifications</b>
              <small>These rows appear in the storefront Specifications table.</small>
              <div className="spec-grid">
                {SPECIFICATION_FIELDS.map((field) => (
                  <label key={field.key}>
                    {field.label}
                    <input
                      placeholder={field.placeholder}
                      value={form.specifications?.[field.key] || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          specifications: {
                            ...blankSpecifications(),
                            ...form.specifications,
                            [field.key]: e.target.value,
                          },
                        })
                      }
                    />
                  </label>
                ))}
              </div>
            </div>
            <FeatureFields values={form.features} onChange={(features) => setForm({ ...form, features })} />
            <div className="wide variant-fields product-form-section">
              <div className="variant-heading">
                <span>
                  <b>Workshop stock</b>
                  <small>Create scale and finish combinations for inventory.</small>
                </span>
                <button type="button" disabled={!form.sizes.length || !form.colors.length} onClick={generateVariants}>
                  <Sparkles />Generate variants
                </button>
              </div>
              {form.variants.length > 0 && <div className="variant-labels"><span>Scale</span><span>Finish</span><span>Stock</span><span /></div>}
              {form.variants.map((variant, index) => (
                <div className="variant-row" key={`${variant.size}-${variant.color}-${index}`}>
                  <select required value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)}><option value="">Scale</option>{form.sizes.map((size) => <option key={size}>{size}</option>)}</select>
                  <select required value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)}><option value="">Finish</option>{form.colors.map((color) => <option key={color}>{color}</option>)}</select>
                  <input required type="number" min="0" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)}/>
                  <button type="button" aria-label={`Remove ${variant.size} ${variant.color} variant`} onClick={() => setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) })}>×</button>
                </div>
              ))}
            </div>
            <ProductStatusSection
              isNew={form.isNew}
              price={form.price}
              originalPrice={form.originalPrice}
              onChange={(field, value) => setForm({ ...form, [field]: value })}
            />
          </div>
          <button disabled={saving} className="primary save">{saving ? "Saving piece…" : modal.type === "edit" ? "Update piece" : "Save piece"}</button>
        </form>
      </div>
    );
  }
}
function ProductStatusSection({ isNew, price, originalPrice, onChange }) {
  const sell = Number(price) || 0;
  const original = Number(originalPrice) || 0;
  const salePercent =
    original > sell && original > 0
      ? Math.max(1, Math.min(100, Math.round(((original - sell) / original) * 100)))
      : 0;
  return (
    <section className="wide product-form-section">
      <b>Storefront flags</b>
      <small>Sale percent is calculated automatically when original price is higher than selling price.</small>
      <div className="status-pair">
        <div className={`status-card ${salePercent > 0 ? "on" : ""}`}>
          <i><BadgePercent /></i>
          <b>{salePercent > 0 ? `On sale · ${salePercent}% off` : "On sale"}</b>
          <span className="status-pill">{salePercent > 0 ? "Auto" : "Off"}</span>
        </div>
        <StatusToggle
          checked={isNew}
          icon={Sparkles}
          label="New arrival"
          onChange={(value) => onChange("isNew", value)}
        />
      </div>
    </section>
  );
}
function StatusToggle({ checked, icon: Icon, label, onChange }) {
  return (
    <div className={`status-card ${checked ? "on" : ""}`}>
      <i><Icon /></i>
      <b>{label}</b>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        className={`status-switch ${checked ? "is-checked" : ""}`}
        onClick={() => onChange(!checked)}
      >
        <span aria-hidden="true" />
        <b>{checked ? "ON" : "OFF"}</b>
      </button>
    </div>
  );
}
function ImageFields({ values, onChange }) {
  return (
    <section className="wide product-form-section">
      <div className="variant-heading">
        <span>
          <b>Product images</b>
          <small>The first URL becomes the catalog cover.</small>
        </span>
        <ImagePlus />
      </div>
      <div className="field-stack">
        {values.map((value, index) => (
          <div className="image-row" key={index}>
            <span className="image-index">{index + 1}</span>
            <input
              required
              type="text"
              placeholder="/banner/banner1.webp or https://…"
              value={value}
              onChange={(e) =>
                onChange(values.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))
              }
            />
            <button type="button" className="danger-btn" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
              <Trash2 />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ghost-btn" onClick={() => onChange([...values, ""])}>
        <Plus /> Add image
      </button>
      {!!values.filter(Boolean).length && (
        <div className="image-previews">
          {values.map((image, index) =>
            image ? (
              <figure key={`${image}-${index}`}>
                <img src={image} alt="" />
              </figure>
            ) : null,
          )}
        </div>
      )}
    </section>
  );
}
function FeatureFields({ values, onChange }) {
  return (
    <section className="wide product-form-section">
      <b>Craft notes</b>
      <small>Short lines customers can scan — teak grain, joinery, finish.</small>
      <div className="field-stack">
        {values.map((value, index) => (
          <div className="feature-row" key={index}>
            <input
              required
              placeholder="e.g. Aged Indian teakwood"
              value={value}
              onChange={(e) =>
                onChange(values.map((item, itemIndex) => (itemIndex === index ? e.target.value : item)))
              }
            />
            <button type="button" className="danger-btn" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}>
              <X />
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="ghost-btn" onClick={() => onChange([...values, ""])}>
        <Plus /> Add note
      </button>
    </section>
  );
}
function OrderRows({ orders, update, ship }) {
  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Items</th>
            <th>Amount</th>
            <th>Payment</th>
            <th>Status</th>
            <th>Shipping</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.length ? (
            orders.map((o) => {
              const canShip =
                o.orderStatus !== "CANCELLED" &&
                o.orderStatus !== "DELIVERED" &&
                !o.awbCode;
              return (
              <tr key={o._id}>
                <td data-label="Order">
                  <b>#{o._id.slice(-7).toUpperCase()}</b>
                </td>
                <td data-label="Customer">
                  {o.userId?.name || o.shippingAddress?.fullName || "Guest"}
                  <small>{o.userId?.email}</small>
                </td>
                <td data-label="Items">{o.items?.length || 0}</td>
                <td data-label="Amount">
                  <b>{money(o.totalAmount)}</b>
                </td>
                <td data-label="Payment">
                  <span className="tag new">{o.paymentStatus}</span>
                </td>
                <td data-label="Status">
                  {update && o.orderStatus !== "CANCELLED" ? (
                    <select
                      value={o.orderStatus}
                      onChange={(e) => update(o._id, e.target.value)}
                    >
                      {[
                        "PLACED",
                        "CONFIRMED",
                        "PROCESSING",
                        "SHIPPED",
                        "OUT_FOR_DELIVERY",
                        "DELIVERED",
                        "CANCELLED",
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    <span className={`tag ${o.orderStatus === "CANCELLED" ? "new" : "active"}`}>
                      {o.orderStatus}
                    </span>
                  )}
                </td>
                <td data-label="Shipping">
                  {o.awbCode ? (
                    <div style={{ display: "grid", gap: 4 }}>
                      <small><b>{o.courierName || "Courier"}</b></small>
                      <small>AWB: {o.awbCode}</small>
                      {o.trackingUrl ? (
                        <a href={o.trackingUrl} target="_blank" rel="noreferrer">
                          Track
                        </a>
                      ) : null}
                    </div>
                  ) : canShip && ship ? (
                    <button
                      type="button"
                      className="btn btn-sm"
                      onClick={() => ship(o._id)}
                    >
                      Ship via Shiprocket
                    </button>
                  ) : (
                    <small>{o.shipmentStatus || "Not shipped"}</small>
                  )}
                </td>
                <td data-label="Date">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            )})
          ) : (
            <tr>
              <td colSpan="8" className="admin-empty">
                No orders yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
function Resource({ title, items, fields, add, toggle, render }) {
  const [form, setForm] = useState(
      Object.fromEntries(fields.map((f) => [f, ""])),
    ),
    [busy, setBusy] = useState(false);
  return (
    <div className="resource-grid">
      <Panel
        title={`Add ${title.replace(/s$/, "")}`}
        subtitle="Create a new item"
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            await add(form);
            setForm(Object.fromEntries(fields.map((f) => [f, ""])));
            setBusy(false);
          }}
          className="resource-form"
        >
          {fields.map((f) => (
            <label key={f}>
              {f.replace(/([A-Z])/g, " $1")}
              <input
                required={[
                  "name",
                  "code",
                  "discount",
                  "title",
                  "image",
                ].includes(f)}
                type={
                  f.includes("Date")
                    ? "date"
                    : f === "discount" || f === "minimumOrder"
                      ? "number"
                      : "text"
                }
                value={form[f]}
                onChange={(e) => setForm({ ...form, [f]: e.target.value })}
              />
            </label>
          ))}
          <button className="primary">{busy ? "Saving…" : "Create"}</button>
        </form>
      </Panel>
      <Panel title={title} subtitle={`${items.length} total`}>
        {items.length ? (
          items.map((x) => (
            <div className="resource-row" key={x._id}>
              {render(x)}
              <span className={`tag ${x.active ? "active" : ""}`}>
                {x.active ? "Active" : "Disabled"}
              </span>
              <button onClick={() => toggle(x)}>
                {x.active ? "Disable" : "Enable"}
              </button>
            </div>
          ))
        ) : (
          <div className="admin-empty">No {title.toLowerCase()} yet.</div>
        )}
      </Panel>
    </div>
  );
}
function Settings({ user, save }) {
  const [name, setName] = useState(user.name),
    [message, setMessage] = useState("");
  return (
    <Panel title="Atelier settings" subtitle="Your administrator profile and house details">
      <div className="settings-store">
        <b>{SITE.name}</b>
        <span>{SITE.tagline}</span>
        <span>{SITE.address}</span>
        <span>{SITE.emails.primary}</span>
        <span>{SITE.phone}</span>
      </div>
      <form
        className="settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await save(name);
          setMessage("Profile saved");
        }}
      >
        <label>
          Display name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Email
          <input value={user.email} disabled />
        </label>
        {message && <p>{message}</p>}
        <button className="primary">Save settings</button>
      </form>
    </Panel>
  );
}
