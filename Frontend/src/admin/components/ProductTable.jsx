import { Edit3, Eye, Trash2 } from "lucide-react";
import { money, stock } from "../adminApi";
export default function ProductTable({ products, onView, onEdit, onDelete }) {
  if (!products.length)
    return <div className="admin-empty">No products found.</div>;
  return (
    <div className="admin-table-wrap">
      <table className="product-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Product info</th>
            <th>Pricing</th>
            <th>Inventory</th>
            <th>Variations</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const qty = stock(p),
              off =
                p.originalPrice > p.price
                  ? Math.round((1 - p.price / p.originalPrice) * 100)
                  : 0;
            return (
              <tr key={p._id}>
              <td data-label="Product">
                  <img src={p.images?.[0]} alt={p.title} />
                </td>
              <td data-label="Product info">
                  <b>{p.title}</b>
                  <small>SKU: {p.sku || "Not set"}</small>
                  <small>Category: {p.category}</small>
                </td>
              <td data-label="Pricing">
                  <strong>{money(p.price)}</strong>
                  <del>{money(p.originalPrice)}</del>
                  {off > 0 && <span className="tag sale">{off}% OFF</span>}
                </td>
              <td data-label="Inventory">
                  <strong className={qty < 10 ? "danger-text" : "success-text"}>
                    {qty} in stock
                  </strong>
                  <small>
                    {qty === 0
                      ? "Out of stock"
                      : qty < 10
                        ? "Low stock alert"
                        : "Stock managed"}
                  </small>
                </td>
              <td data-label="Variations">
                  <small>{p.colors?.join(", ") || "No colors"}</small>
                  <small>{p.sizes?.join(", ") || "No sizes"}</small>
                  <span className="tag">
                    {p.variants?.length || 0} variants
                  </span>
                </td>
              <td data-label="Status">
                  <span className="tag active">Active</span>
                  {p.isNew && <span className="tag new">New</span>}
                  <small>
                    Updated: {new Date(p.updatedAt).toLocaleDateString()}
                  </small>
                </td>
              <td data-label="Actions">
                  <button className="action view" onClick={() => onView(p)}>
                    <Eye />
                    View
                  </button>
                  <button className="action edit" onClick={() => onEdit(p)}>
                    <Edit3 />
                    Edit
                  </button>
                  <button className="action delete" onClick={() => onDelete(p)}>
                    <Trash2 />
                    Delete
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
