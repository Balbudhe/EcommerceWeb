import "./Shop.css";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "../components/product/ProductCard";
import { api } from "../services/api";
import { COLLECTIONS } from "../data/site";

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const category = params.get("category") || "";
  const search = params.get("search") || "";
  const sort = params.get("sort") || "featured";

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    api
      .getProducts({
        category: category || undefined,
        search: search || undefined,
        sort: sort === "featured" ? undefined : sort,
      })
      .then((data) => {
        if (alive) setProducts(data);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [category, search, sort]);

  const title = useMemo(() => {
    if (search) return `Results for “${search}”`;
    if (category) {
      const fromApi = categories.find((c) => c.id === category);
      const fromSite = COLLECTIONS.find((c) => c.slug === category);
      return fromApi?.name || fromSite?.name || "Shop";
    }
    return "All products";
  }, [category, search, categories]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (!value) next.delete(key);
    else next.set(key, value);
    setParams(next);
  };

  const filters = categories.length
    ? categories
    : COLLECTIONS.map((c) => ({ id: c.slug, name: c.shortName }));

  return (
    <div className="shop-page">
      <header className="page-banner">
        <p className="eyebrow">Collection</p>
        <h1>{title}</h1>
        <p>{loading ? "Loading the collection…" : `${products.length} products available`}</p>
      </header>

      <div className="page container shop">
        <div className="shop-toolbar">
          <div className="filter-list">
            <button
              className={`filter-item ${!category ? "active" : ""}`}
              onClick={() => update("category", "")}
            >
              All
            </button>
            {filters.map((c) => (
              <button
                key={c.id}
                className={`filter-item ${category === c.id ? "active" : ""}`}
                onClick={() => update("category", c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="field shop-sort">
            <label htmlFor="sort">Sort by</label>
            <select
              id="sort"
              value={sort}
              onChange={(e) => update("sort", e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top rated</option>
            </select>
          </div>
        </div>

        {search ? (
          <button className="btn btn-outline btn-sm" onClick={() => update("search", "")}>
            Clear search
          </button>
        ) : null}

        {loading ? (
          <div className="empty-state">Loading products…</div>
        ) : products.length === 0 ? (
          <div className="empty-state">
            <h3>No products found</h3>
            <p>Add products from the backend, or try another category.</p>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
