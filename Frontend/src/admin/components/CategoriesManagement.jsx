import { useMemo, useState } from "react";
import { Boxes, CheckCircle2, FolderTree, ImagePlus, Pencil, Plus, Search, Trash2, Upload, X } from "lucide-react";
import "./CategoriesManagement.css";

const emptyForm = { name: "", description: "", image: "", active: true, subcategories: [{ name: "", image: "", active: true }] };
const toForm = (category) => ({
  name: category.name || "",
  description: category.description || "",
  image: category.image || "",
  active: category.active !== false,
  subcategories: category.subcategories?.length
    ? category.subcategories.map((item) => ({
        name: item.name || "",
        image: item.image || "",
        active: item.active !== false,
      }))
    : [{ name: "", image: "", active: true }],
});

export default function CategoriesManagement({ categories, add, update, toggle, remove }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [pendingDelete, setPendingDelete] = useState(null);
  const activeCount = categories.filter((category) => category.active).length;
  const productCount = categories.reduce((total, category) => total + Number(category.count || 0), 0);
  const visible = useMemo(() => categories.filter((category) => {
    const matchesText = `${category.name} ${category.description}`.toLowerCase().includes(query.toLowerCase());
    const matchesStatus = status === "all" || (status === "active" ? category.active : !category.active);
    return matchesText && matchesStatus;
  }), [categories, query, status]);

  const payload = () => ({
    name: form.name.trim(),
    description: form.description.trim(),
    image: form.image,
    active: form.active,
    subcategories: form.subcategories
      .map((item) => ({ ...item, name: item.name.trim() }))
      .filter((item) => item.name),
  });
  const closeForm = () => {
    setModal(false);
    setEditing(null);
    setForm(emptyForm);
    setError("");
  };
  const openCreate = () => {
    setError("");
    setEditing(null);
    setForm(emptyForm);
    setModal(true);
  };
  const openEdit = (category) => {
    setError("");
    setPendingDelete(null);
    setEditing(category);
    setForm(toForm(category));
    setModal(true);
  };
  const submit = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (editing) await update(editing, payload());
      else await add(payload());
      closeForm();
    } catch (requestError) {
      setError(requestError.response?.data?.message || (editing ? "Could not update category" : "Could not create category"));
    } finally {
      setBusy(false);
    }
  };
  const deleteCategory = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    setError("");
    try {
      await remove(pendingDelete);
      setPendingDelete(null);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not delete category");
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
      <button className="category-add" onClick={openCreate}><Plus /> Add category</button>
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
          <thead><tr><th>Category</th><th>Description</th><th>Products</th><th>Status</th><th>Visibility</th><th>Actions</th></tr></thead>
          <tbody>{visible.length ? visible.map((category) => <tr key={category._id}>
            <td data-label="Category">{category.image ? <img className="category-avatar category-image" src={category.image} alt="" /> : <span className="category-avatar">{category.name.slice(0, 2).toUpperCase()}</span>}<span><b>{category.name}</b><small>{category.subcategories?.length || 0} subcategories</small></span></td>
            <td data-label="Description"><p>{category.description || "No description added"}</p></td>
            <td data-label="Products"><strong>{category.count || 0}</strong><small>products</small></td>
            <td data-label="Status"><span className={`category-status ${category.active ? "active" : "disabled"}`}><i />{category.active ? "Active" : "Disabled"}</span></td>
            <td data-label="Visibility"><button className={`category-toggle ${category.active ? "on" : ""}`} role="switch" aria-checked={category.active} aria-label={`${category.name} visibility`} onClick={() => toggle(category)}><span /><b>{category.active ? "Visible" : "Hidden"}</b></button></td>
            <td data-label="Actions"><div className="category-actions"><button type="button" className="category-edit" aria-label={`Edit ${category.name}`} onClick={() => openEdit(category)}><Pencil /> Edit</button><button type="button" className="category-delete" aria-label={`Delete ${category.name}`} onClick={() => { setError(""); setPendingDelete(category); }}><Trash2 /> Delete</button></div></td>
          </tr>) : <tr><td className="category-empty-cell" colSpan="6"><div className="category-empty"><Search /><b>No categories found</b><p>Try changing the search or status filter.</p></div></td></tr>}</tbody>
        </table>
      </div>
    </section>

    {modal && <div className="modal-bg"><form className="admin-modal category-modal" onSubmit={submit}>
      <button type="button" className="close" aria-label="Close category form" onClick={closeForm}><X /></button>
      <div className="category-modal-heading"><span className="category-modal-icon"><FolderTree /></span><span><small>Catalog structure</small><h2>{editing ? "Edit category" : "Add category"}</h2><p>{editing ? "Update this collection and its subcategories." : "Create a parent category and its optional subcategories."}</p></span></div>
      <section className="category-main-fields">
        <label>Main category name <em>*</em><input autoFocus required maxLength="80" placeholder="e.g. Furniture, Temples" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>
        <label>Description<textarea maxLength="240" placeholder="Briefly describe this collection" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label>
        <ImagePicker label="Category image" value={form.image} onPick={(file) => selectImage(file, (image) => setForm({ ...form, image }))} onRemove={() => setForm({ ...form, image: "" })} />
        <ToggleField label="Active category" note="Visible in product category selections" checked={form.active} onChange={(active) => setForm({ ...form, active })} />
      </section>
      <section className="subcategory-section">
        <div className="subcategory-heading"><span><h3>Subcategories</h3><p>Add more specific collections under this category.</p></span><button type="button" onClick={() => setForm({ ...form, subcategories: [...form.subcategories, { name: "", image: "", active: true }] })}><Plus /> Add subcategory</button></div>
        <div className="subcategory-list">{form.subcategories.map((subcategory, index) => <article key={index}>
          <span className="subcategory-number">{String(index + 1).padStart(2, "0")}</span>
          <label>Name<input maxLength="80" placeholder="e.g. Side tables" value={subcategory.name} onChange={(event) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) })} /></label>
          <ImagePicker compact label="Image" value={subcategory.image} onPick={(file) => selectImage(file, (image) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, image } : item) }))} onRemove={() => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, image: "" } : item) })} />
          <ToggleField compact label="Active" checked={subcategory.active} onChange={(active) => setForm({ ...form, subcategories: form.subcategories.map((item, itemIndex) => itemIndex === index ? { ...item, active } : item) })} />
          <button type="button" className="subcategory-remove" aria-label={`Remove subcategory ${index + 1}`} onClick={() => setForm({ ...form, subcategories: form.subcategories.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 /></button>
        </article>)}</div>
      </section>
      {error && <p className="category-form-error" role="alert">{error}</p>}
      <div className="category-modal-actions"><button type="button" onClick={closeForm}>Cancel</button><button className="primary" disabled={busy}>{busy ? (editing ? "Saving…" : "Creating…") : editing ? "Save changes" : "Create category"}</button></div>
    </form></div>}
    {pendingDelete && <div className="modal-bg"><div className="admin-modal category-delete-modal">
      <button type="button" className="close" aria-label="Close delete confirmation" onClick={() => setPendingDelete(null)}><X /></button>
      <span className="category-modal-icon"><Trash2 /></span>
      <h2>Delete {pendingDelete.name}?</h2>
      <p>This removes the category from the catalog. Products already assigned to it stay in the store.</p>
      {error && <p className="category-form-error" role="alert">{error}</p>}
      <div className="category-modal-actions">
        <button type="button" onClick={() => setPendingDelete(null)}>Keep category</button>
        <button type="button" className="primary category-delete-confirm" disabled={busy} onClick={deleteCategory}>{busy ? "Deleting…" : "Delete category"}</button>
      </div>
    </div></div>}
  </div>;
}

function ImagePicker({ label, value, onPick, onRemove, compact = false }) {
  return <div className={`category-image-picker ${compact ? "compact" : ""}`}><b>{label}</b><div>{value ? <img src={value} alt={`${label} preview`} /> : <span><ImagePlus /></span>}<label><Upload />{value ? "Replace" : "Choose image"}<input type="file" accept="image/*" onChange={(event) => onPick(event.target.files?.[0])} /></label>{value && <button type="button" onClick={onRemove}><X /> Remove</button>}</div></div>;
}

function ToggleField({ label, note, checked, onChange, compact = false }) {
  return <div className={`category-active-field ${compact ? "compact" : ""}`}><span><b>{label}</b>{note && <small>{note}</small>}</span><button type="button" role="switch" aria-checked={checked} className={checked ? "on" : ""} onClick={() => onChange(!checked)}><i /><strong>{checked ? "Active" : "Inactive"}</strong></button></div>;
}
