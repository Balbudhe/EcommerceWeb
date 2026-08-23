import { useMemo, useState } from "react";
import { Boxes, CheckCircle2, FolderTree, ImagePlus, Plus, Search, Trash2, Upload, X } from "lucide-react";
import "./CategoriesManagement.css";

export default function CategoriesManagement({ categories, add, toggle }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(false);
  const emptyForm = { name: "", description: "", image: "", active: true, subcategories: [{ name: "", image: "", active: true }] };
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const activeCount = categories.filter((category) => category.active).length;
  const productCount = categories.reduce((total, category) => total + Number(category.count || 0), 0);
  const visible = useMemo(() => categories.filter((category) => {
    const matchesText = `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || (status === "active" ? category.active : !category.active);
    return matchesText && matchesStatus;
  }), [categories, query, status]);

  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      await add({ ...form, name: form.name.trim(), description: form.description.trim(), subcategories: form.subcategories.map((item) => ({ ...item, name: item.name.trim() })).filter((item) => item.name) });
      setForm(emptyForm);
      setModal(false);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not create category");
    } finally {
      setBusy(false);
    }
  };
  const selectImage = (file, callback) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return setError("Please choose a valid image file");
    if (file.size > 750 * 1024) return setError("Image must be smaller than 750 KB");
    const reader = new FileReader();
    reader.onload = () => callback(reader.result);
    reader.readAsDataURL(file);
  };

  return <div className="category-workspace">
    <header className="category-heading">
      <div><span><FolderTree /> Catalog structure</span><h1>Categories</h1><p>Organize products into clear collections and control their storefront visibility.</p></div>
      <button className="category-add" onClick={() => setModal(true)}><Plus /> Add category</button>
    </header>

    <section className="category-stats">
      <article><span className="category-stat-icon"><FolderTree /></span><div><small>Total categories</small><b>{categories.length}</b></div></article>
      <article><span className="category-stat-icon active"><CheckCircle2 /></span><div><small>Active categories</small><b>{activeCount}</b></div></article>
      <article><span className="category-stat-icon products"><Boxes /></span><div><small>Assigned products</small><b>{productCount}</b></div></article>
    </section>

    <section className="category-panel">
      <div className="category-panel-head">
        <div><h2>Category directory</h2><p>{visible.length} of {categories.length} categories</p></div>
        <div className="category-controls">
          <label><Search /><input aria-label="Search categories" placeholder="Search categories" value={query} onChange={(event) => setQuery(event.target.value)} />{query && <button aria-label="Clear search" onClick={() => setQuery("")}><X /></button>}</label>
          <select aria-label="Filter category status" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">All statuses</option><option value="active">Active</option><option value="disabled">Disabled</option></select>
        </div>
      </div>
      <div className="category-table-wrap">
        <table className="category-table">
          <thead><tr><th>Category</th><th>Description</th><th>Products</th><th>Status</th><th>Visibility</th></tr></thead>
          <tbody>{visible.length ? visible.map((category) => <tr key={category._id}>
            <td data-label="Category">{category.image ? <img className="category-avatar category-image" src={category.image} alt="" /> : <span className="category-avatar">{category.name.slice(0, 2).toUpperCase()}</span>}<span><b>{category.name}</b><small>{category.subcategories?.length || 0} subcategories</small></span></td>
            <td data-label="Description"><p>{category.description || "No description added"}</p></td>
            <td data-label="Products"><strong>{category.count || 0}</strong><small>products</small></td>
            <td data-label="Status"><span className={`category-status ${category.active ? "active" : "disabled"}`}><i />{category.active ? "Active" : "Disabled"}</span></td>
            <td data-label="Visibility"><button className={`category-toggle ${category.active ? "on" : ""}`} role="switch" aria-checked={category.active} aria-label={`${category.name} visibility`} onClick={() => toggle(category)}><span /><b>{category.active ? "Visible" : "Hidden"}</b></button></td>
          </tr>) : <tr><td className="category-empty-cell" colSpan="5"><div className="category-empty"><Search /><b>No categories found</b><p>Try changing the search or status filter.</p></div></td></tr>}</tbody>
        </table>
      </div>
    </section>

    {modal && <div className="modal-bg"><form className="admin-modal category-modal" onSubmit={submit}>
      <button type="button" className="close" aria-label="Close category form" onClick={() => setModal(false)}><X /></button>
      <div className="category-modal-heading"><span className="category-modal-icon"><FolderTree /></span><span><small>Catalog structure</small><h2>Add category</h2><p>Create a parent category and its optional subcategories.</p></span></div>
      <section className="category-main-fields">
        <label>Main category name <em>*</em><input autoFocus required maxLength="80" placeholder="e.g. Dresses, Footwear" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Description<textarea maxLength="240" placeholder="Briefly describe this collection" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <ImagePicker label="Category image" value={form.image} onPick={(file) => selectImage(file, (image) => setForm({ ...form, image }))} onRemove={() => setForm({ ...form, image: "" })} />
        <ToggleField label="Active category" note="Visible in product category selections" checked={form.active} onChange={(active) => setForm({ ...form, active })} />
      </section>
      <section className="subcategory-section">
        <div className="subcategory-heading"><span><h3>Subcategories</h3><p>Add more specific collections under this category.</p></span><button type="button" onClick={() => setForm({ ...form, subcategories: [...form.subcategories, { name: "", image: "", active: true }] })}><Plus /> Add subcategory</button></div>
        <div className="subcategory-list">{form.subcategories.map((subcategory, index) => <article key={index}>
          <span className="subcategory-number">{String(index + 1).padStart(2, "0")}</span>
          <label>Name <em>*</em><input required maxLength="80" placeholder="e.g. Maxi Dresses" value={subcategory.name} onChange={(event) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} /></label>
          <ImagePicker compact label="Image" value={subcategory.image} onPick={(file) => selectImage(file, (image) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, image } : item) }))} onRemove={() => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, image: "" } : item) })} />
          <ToggleField compact label="Active" checked={subcategory.active} onChange={(active) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, active } : item) })} />
          <button type="button" className="subcategory-remove" aria-label={`Remove subcategory ${index + 1}`} onClick={() => setForm({ ...form, subcategories: form.subcategories.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button>
        </article>)}</div>
      </section>
      {error && <p className="category-form-error" role="alert">{error}</p>}
      <div className="category-modal-actions"><button type="button" onClick={() => setModal(false)}>Cancel</button><button className="primary" disabled={busy}>{busy ? "Creating…" : "Create category"}</button></div>
    </form></div>}
  </div>;
}

function ImagePicker({ label, value, onPick, onRemove, compact = false }) {
  return <div className={`category-image-picker ${compact ? "compact" : ""}`}><b>{label}</b><div>{value ? <img src={value} alt={`${label} preview`} /> : <span><ImagePlus /></span>}<label><Upload />{value ? "Replace" : "Choose image"}<input type="file" accept="image/*" onChange={(event) => onPick(event.target.files?.[0])} /></label>{value && <button type="button" onClick={onRemove}><X /> Remove</button>}</div></div>;
}

function ToggleField({ label, note, checked, onChange, compact = false }) {
  return <div className={`category-active-field ${compact ? "compact" : ""}`}><span><b>{label}</b>{note && <small>{note}</small>}</span><button type="button" role="switch" aria-checked={checked} className={checked ? "on" : ""} onClick={() => onChange(!checked)}><i /><strong>{checked ? "Active" : "Inactive"}</strong></button></div>;
}
