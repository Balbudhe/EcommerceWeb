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
import { api, productApi, money, stock } from "../adminApi";
import ProductTable from "../components/ProductTable";
import UserManagement from "../components/UserManagement";
import CategoriesManagement from "../components/CategoriesManagement";
import CouponManagement from "../components/CouponManagement";
import "../components/ClothingSelectors.css";
const CLOTHING_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL"];
const CLOTHING_COLORS = [
  ["Black", "#111827"], ["White", "#ffffff"], ["Red", "#dc2626"],
  ["Blue", "#2563eb"], ["Green", "#16a34a"], ["Yellow", "#facc15"],
  ["Pink", "#ec4899"], ["Purple", "#9333ea"], ["Orange", "#f97316"],
  ["Brown", "#92400e"], ["Grey", "#6b7280"], ["Navy", "#172554"],
  ["Maroon", "#7f1d1d"], ["Beige", "#d6c6a5"],
];
const blank = {
  title: "",
  description: "",
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
    [customColor, setCustomColor] = useState({ name: "", hex: "#64748b" });
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [dash, cats, coupons, sliders, users, orders] = await Promise.all([
        api("get", "/dashboard"),
        api("get", "/categories"),
        api("get", "/coupons"),
        api("get", "/sliders"),
        api("get", "/users"),
        api("get", "/orders"),
      ]);
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
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      price: +form.price,
      originalPrice: +form.originalPrice,
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
      onSale: form.onSale,
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
      if (modal.type === "edit") {
        await productApi(
          "put",
          `/updateproduct/${modal.item._id}`,
          payload(),
        );
      } else {
        await productApi("post", "/createproduct", payload());
      }
      setModal(null);
      await load();
      setActive("products");
    } catch (e) {
      alert(e.response?.data?.message || "Could not save product");
    } finally {
      setSaving(false);
    }
  };
  const remove = () => alert("Product delete is reserved for your manual implementation.");
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
        <div className="admin-hero">
          <div>
            <small>STORE PULSE</small>
            <h1>Welcome back, {user.name}.</h1>
            <p>Here is what is happening across your store today.</p>
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
            note="Registered shoppers"
          />
        </div>
        <div className="dashboard-grid">
          <Panel title="Recent orders" subtitle="Latest customer purchases">
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
        <ProductTable
          products={products}
          onView={(p) => openProduct("view", p)}
          onEdit={(p) => openProduct("edit", p)}
          onDelete={remove}
        />
        {renderModal()}
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
        toggle={(x) =>
          api("patch", `/categories/${x._id}`, { active: !x.active }).then(load)
        }
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
        title="Slider / Banners"
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
            <button className="close" onClick={() => setModal(null)}>
              <X />
            </button>
            <h2>{form.title}</h2>
            <img className="detail-image" src={form.images?.[0]} />
            <p>{form.description}</p>
            <h3>
              {money(form.price)} · {form.stock} in stock
            </h3>
          </div>
        </div>
      );
    return (
      <div className={page ? "" : "modal-bg"}>
        <form
          className={`admin-modal product-form product-form-premium tw:!rounded-3xl tw:!border tw:!border-slate-200 tw:!bg-white tw:!p-5 sm:tw:!p-7 tw:shadow-2xl tw:shadow-slate-900/10 ${page ? "page-form" : ""}`}
          onSubmit={saveProduct}
        >
          <button
            type="button"
            className="close tw:flex tw:size-9 tw:items-center tw:justify-center tw:rounded-full tw:bg-slate-100 tw:text-slate-500 tw:transition tw:hover:bg-slate-200 tw:hover:text-slate-900"
            onClick={() => {
              setModal(null);
              if (page) setActive("products");
            }}
          >
            <X />
          </button>
          <div className="tw:border-b tw:border-slate-100 tw:pb-5">
            <span className="tw:text-[10px] tw:font-extrabold tw:uppercase tw:tracking-[.18em] tw:text-emerald-700">Catalog management</span>
            <h2 className="tw:mt-1 tw:text-2xl tw:font-extrabold tw:tracking-tight tw:text-slate-900">{modal.type === "edit" ? "Edit product" : "Add new product"}</h2>
            <p className="tw:mt-1 tw:text-xs tw:text-slate-500">Add product information, selling options and inventory variants.</p>
          </div>
          <div className="form-grid tw:!gap-4">
            {[
              ["title", "Product name"],
              ["price", "Price", "number"],
              ["originalPrice", "Original price", "number"],
            ].map(([k, l, t]) => (
              <label className="tw:text-slate-700" key={k}>
                {l}
                <input
                  className="tw:transition tw:focus:!border-emerald-600 tw:focus:!ring-3 tw:focus:!ring-emerald-600/10"
                  required
                  type={t || "text"}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </label>
            ))}
            <label className="tw:text-slate-700">Category<select className="tw:!border-slate-200 tw:!p-2.5 tw:transition tw:focus:!border-emerald-600 tw:focus:!ring-3 tw:focus:!ring-emerald-600/10" required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}><option value="">Select category</option>{data.categories.filter((item) => item.active).map((item) => <option value={item.name} key={item._id}>{item.name}</option>)}</select></label>
            <ImageFields values={form.images} onChange={(images) => setForm({ ...form, images })} />
            <div className="wide option-picker product-form-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-slate-50/70">
              <b>Sizes</b>
              <div className="size-options">
                {CLOTHING_SIZES.map((size) => (
                  <button type="button" key={size} className={form.sizes.includes(size) ? "selected" : ""} aria-pressed={form.sizes.includes(size)} onClick={() => toggleOption("sizes", size)}>
                    {form.sizes.includes(size) && <Check />}{size}
                  </button>
                ))}
                {form.sizes.filter((size) => !CLOTHING_SIZES.includes(size)).map((size) => (
                  <button type="button" key={size} className="selected" aria-pressed="true" onClick={() => toggleOption("sizes", size)}><Check />{size}</button>
                ))}
                <button type="button" className="custom-option" onClick={() => setCustomSizeOpen((open) => !open)}><Plus />Custom Size</button>
              </div>
              {customSizeOpen && <div className="tw:flex tw:gap-2"><input autoFocus className="tw:min-w-0 tw:flex-1 tw:uppercase" placeholder="Enter custom size" value={customSize} onChange={(e) => setCustomSize(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomOption("sizes", customSize); } }}/><button type="button" className="tw:rounded-lg tw:bg-emerald-700 tw:px-4 tw:text-xs tw:font-bold tw:text-white" onClick={() => addCustomOption("sizes", customSize)}>Add</button></div>}
            </div>
            <div className="wide option-picker product-form-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-slate-50/70">
              <b>Colors</b>
              <div className="color-options">
                {CLOTHING_COLORS.map(([name, hex]) => (
                  <button type="button" key={name} className={form.colors.includes(name) ? "selected" : ""} aria-pressed={form.colors.includes(name)} onClick={() => toggleOption("colors", name)}>
                    <i style={{ backgroundColor: hex }}>{form.colors.includes(name) && <Check />}</i>{name}
                  </button>
                ))}
                {form.colors.filter((color) => !CLOTHING_COLORS.some(([name]) => name === color)).map((color) => (
                  <button type="button" key={color} className="selected" aria-pressed="true" onClick={() => toggleOption("colors", color)}><i><Check /></i>{color}</button>
                ))}
                <button type="button" className="custom-option" onClick={() => setCustomColorOpen((open) => !open)}><Plus />Custom Color</button>
              </div>
              {customColorOpen && <div className="tw:flex tw:flex-wrap tw:items-center tw:gap-2"><input aria-label="Choose custom color" className="tw:!size-10 tw:!p-1" type="color" value={customColor.hex} onChange={(e) => setCustomColor({ ...customColor, hex: e.target.value })}/><input autoFocus className="tw:min-w-40 tw:flex-1" placeholder="Color name" value={customColor.name} onChange={(e) => setCustomColor({ ...customColor, name: e.target.value })} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomOption("colors", customColor.name); } }}/><button type="button" className="tw:rounded-lg tw:bg-emerald-700 tw:px-4 tw:py-2.5 tw:text-xs tw:font-bold tw:text-white" onClick={() => addCustomOption("colors", customColor.name)}>Add color</button></div>}
            </div>
            <label className="wide tw:text-slate-700">
              Description
              <textarea className="tw:transition tw:focus:!border-emerald-600 tw:focus:!ring-3 tw:focus:!ring-emerald-600/10"
                required
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </label>
            <FeatureFields values={form.features} onChange={(features) => setForm({ ...form, features })} />
            <div className="wide variant-fields product-form-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-white tw:shadow-sm">
              <div className="variant-heading"><span><b>Variants</b><small className="tw:mt-0.5 tw:block tw:text-[10px] tw:font-normal tw:text-slate-500">Create size and color inventory combinations.</small></span><button type="button" disabled={!form.sizes.length || !form.colors.length} onClick={generateVariants}><Sparkles />Generate Variants</button></div>
              {form.variants.length > 0 && <div className="variant-labels"><span>Size</span><span>Color</span><span>Stock</span><span /></div>}
              {form.variants.map((variant, index) => (
                <div className="variant-row" key={`${variant.size}-${variant.color}`}>
                  <select required value={variant.size} onChange={(e) => updateVariant(index, "size", e.target.value)}><option value="">Size</option>{form.sizes.map((size) => <option key={size}>{size}</option>)}</select>
                  <select required value={variant.color} onChange={(e) => updateVariant(index, "color", e.target.value)}><option value="">Color</option>{form.colors.map((color) => <option key={color}>{color}</option>)}</select>
                  <input required type="number" min="0" placeholder="Stock" value={variant.stock} onChange={(e) => updateVariant(index, "stock", e.target.value)}/>
                  <button type="button" aria-label={`Remove ${variant.size} ${variant.color} variant`} onClick={() => setForm({ ...form, variants: form.variants.filter((_, i) => i !== index) })}>×</button>
                </div>
              ))}
            </div>
            <ProductStatusSection
              isNew={form.isNew}
              onSale={form.onSale}
              discount={form.originalPrice > form.price && form.originalPrice > 0 ? Math.round((1 - form.price / form.originalPrice) * 100) : 0}
              onChange={(field, value) => setForm({ ...form, [field]: value })}
            />
          </div>
          <button disabled={saving} className="primary save tw:!rounded-xl tw:!bg-slate-900 tw:!py-3.5 tw:!text-white tw:shadow-lg tw:shadow-slate-900/15 tw:transition tw:hover:!-translate-y-0.5 tw:hover:!bg-emerald-800 tw:active:!translate-y-0 tw:disabled:!cursor-not-allowed tw:disabled:!opacity-60">{saving ? "Saving product…" : modal.type === "edit" ? "Update product" : "Save product"}</button>
        </form>
      </div>
    );
  }
}
function ProductStatusSection({ isNew, onSale, discount, onChange }) {
  return (
    <section className="wide product-status-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-slate-50/70">
      <div className="tw:mb-3">
        <b className="tw:block tw:text-xs tw:text-slate-800">Product status</b>
        <small className="tw:text-[10px] tw:text-slate-500">Control how this product is highlighted across your storefront.</small>
      </div>
      <div className="tw:flex tw:w-full tw:items-stretch tw:gap-3">
        <StatusToggle
          checked={onSale}
          icon={BadgePercent}
          label="On sale"
          description="Display promotional pricing"
          accent="amber"
          badge={discount > 0 ? `${discount}% OFF` : null}
          onChange={(value) => onChange("onSale", value)}
        />
        <StatusToggle
          checked={isNew}
          icon={Sparkles}
          label="New product"
          description="Highlight as a new arrival"
          accent="emerald"
          badge={isNew ? "NEW" : null}
          onChange={(value) => onChange("isNew", value)}
        />
      </div>
    </section>
  );
}
function StatusToggle({ checked, icon: Icon, label, accent, onChange }) {
  const activeCard = accent === "amber"
    ? "tw:border-amber-300 tw:bg-amber-50/70 tw:shadow-amber-900/5"
    : "tw:border-emerald-300 tw:bg-emerald-50/70 tw:shadow-emerald-900/5";
  const iconStyle = accent === "amber"
    ? "tw:bg-amber-100 tw:text-amber-700"
    : "tw:bg-emerald-100 tw:text-emerald-700";
  return (
    <div className={`status-card-control tw:group tw:flex tw:min-w-0 tw:flex-1 tw:items-center tw:gap-3 tw:rounded-xl tw:border tw:p-3.5 tw:shadow-sm tw:transition-all tw:duration-200 tw:hover:-translate-y-0.5 tw:hover:shadow-md ${checked ? activeCard : "tw:border-slate-200 tw:bg-white"}`}>
      <span className={`tw:flex tw:size-10 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-xl tw:transition ${checked ? iconStyle : "tw:bg-slate-100 tw:text-slate-500"}`}><Icon className="tw:size-5" /></span>
      <span className="tw:min-w-0 tw:flex-1"><span className="tw:flex tw:items-center tw:gap-2"><b className="tw:text-xs tw:text-slate-800">{label}</b></span></span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={`${label}: ${checked ? "enabled" : "disabled"}`}
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
    <section className="wide product-form-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-slate-50/70">
      <div className="tw:mb-3 tw:flex tw:items-center tw:justify-between tw:gap-3"><span><b className="tw:block tw:text-xs tw:text-slate-700">Product images</b><small className="tw:text-[10px] tw:text-slate-500">Add clear image URLs. The first image is used as the cover.</small></span><ImagePlus className="tw:size-5 tw:text-emerald-700" /></div>
      <div className="tw:grid tw:gap-2">
        {values.map((value, index) => <div className="tw:flex tw:items-center tw:gap-2" key={index}><span className="tw:flex tw:size-9 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-lg tw:bg-white tw:text-[10px] tw:font-extrabold tw:text-slate-400 tw:ring-1 tw:ring-slate-200">{index + 1}</span><input aria-label={`Product image URL ${index + 1}`} className="tw:min-w-0 tw:flex-1 tw:!bg-white tw:transition tw:focus:!border-emerald-600 tw:focus:!ring-3 tw:focus:!ring-emerald-600/10" required type="url" placeholder="https://example.com/product-image.jpg" value={value} onChange={(e) => onChange(values.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}/><button aria-label={`Remove image ${index + 1}`} className="tw:flex tw:size-9 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-lg tw:border tw:border-red-200 tw:bg-red-50 tw:text-red-600 tw:transition tw:hover:bg-red-100" type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><Trash2 className="tw:size-4" /></button></div>)}
      </div>
      <button className="tw:mt-3 tw:inline-flex tw:items-center tw:gap-1.5 tw:rounded-lg tw:border tw:border-dashed tw:border-emerald-600/40 tw:bg-white tw:px-3 tw:py-2 tw:text-[11px] tw:font-bold tw:text-emerald-700 tw:transition tw:hover:bg-emerald-50" type="button" onClick={() => onChange([...values, ""])}><Plus className="tw:size-3.5" />Add Product Image</button>
      {!!values.filter(Boolean).length && <div className="tw:mt-4 tw:flex tw:flex-wrap tw:gap-3">{values.map((image, index) => image && <div className="tw:group tw:relative tw:size-20 tw:overflow-hidden tw:rounded-xl tw:border tw:border-slate-200 tw:bg-white" key={`${image}-${index}`}><img className="tw:size-full tw:object-cover" src={image} alt={`Product preview ${index + 1}`}/><button aria-label={`Remove preview ${index + 1}`} className="tw:absolute tw:right-1 tw:top-1 tw:flex tw:size-6 tw:items-center tw:justify-center tw:rounded-full tw:bg-slate-950/75 tw:text-white tw:opacity-0 tw:transition tw:group-hover:opacity-100 tw:focus:opacity-100" type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><X className="tw:size-3" /></button></div>)}</div>}
    </section>
  );
}
function FeatureFields({ values, onChange }) {
  return (
    <section className="wide product-form-section tw:rounded-2xl tw:border tw:border-slate-200 tw:bg-slate-50/70">
      <div className="tw:mb-3"><b className="tw:block tw:text-xs tw:text-slate-700">Features</b><small className="tw:text-[10px] tw:text-slate-500">Add short selling points customers can scan quickly.</small></div>
      <div className="tw:grid tw:gap-2">{values.map((value, index) => <div className="tw:flex tw:items-center tw:gap-2" key={index}><input aria-label={`Product feature ${index + 1}`} className="tw:min-w-0 tw:flex-1 tw:!bg-white tw:transition tw:focus:!border-emerald-600 tw:focus:!ring-3 tw:focus:!ring-emerald-600/10" required placeholder="e.g. Premium breathable cotton" value={value} onChange={(e) => onChange(values.map((item, itemIndex) => itemIndex === index ? e.target.value : item))}/><button aria-label={`Remove feature ${index + 1}`} className="tw:flex tw:size-9 tw:shrink-0 tw:items-center tw:justify-center tw:rounded-lg tw:border tw:border-red-200 tw:bg-red-50 tw:text-red-600 tw:transition tw:hover:bg-red-100" type="button" onClick={() => onChange(values.filter((_, itemIndex) => itemIndex !== index))}><X className="tw:size-4" /></button></div>)}</div>
      <button className="tw:mt-3 tw:inline-flex tw:items-center tw:gap-1.5 tw:rounded-lg tw:border tw:border-dashed tw:border-emerald-600/40 tw:bg-white tw:px-3 tw:py-2 tw:text-[11px] tw:font-bold tw:text-emerald-700 tw:transition tw:hover:bg-emerald-50" type="button" onClick={() => onChange([...values, ""])}><Plus className="tw:size-3.5" />Add Feature</button>
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
    <Panel title="Settings" subtitle="Manage your admin profile">
      <form
        className="settings-form"
        onSubmit={async (e) => {
          e.preventDefault();
          await save(name);
          setMessage("Profile saved");
        }}
      >
        <label>
          Name
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
