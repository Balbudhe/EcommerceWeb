import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { api, slugify } from "../services/api";
import { COLLECTIONS, matchesCollection } from "../data/site";
import "./Collection.css";

function productStock(product) {
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  }
  if (product.stock != null) return Number(product.stock);
  if (product.quantity != null) return Number(product.quantity);
  return 1;
}

export default function Collection() {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  const slug = paramSlug || location.pathname.replace(/^\//, "");
  const [collection, setCollection] = useState(
    () => COLLECTIONS.find((item) => item.slug === slug) || null,
  );
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availability, setAvailability] = useState("all");
  const [price, setPrice] = useState("all");
  const [sort, setSort] = useState("featured");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setAvailability("all");
    setPrice("all");
    setSort("featured");
    Promise.all([api.getProducts(), api.getCategories()])
      .then(([data, categories]) => {
        if (!alive) return;
        setProducts(data);
        const fromApi = categories.find((item) => item.id === slug);
        const fromSite = COLLECTIONS.find((item) => item.slug === slug);
        setCollection(
          fromApi
            ? {
                slug: fromApi.id,
                name: fromApi.name,
                shortName: fromApi.shortName || fromApi.name,
                title: fromApi.name,
                description: fromApi.description,
              }
            : fromSite || null,
        );
      })
      .catch(() => {
        if (!alive) return;
        setProducts([]);
        setCollection(COLLECTIONS.find((item) => item.slug === slug) || null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  const list = useMemo(() => {
    if (!collection) return [];
    let next = products.filter((product) => {
      const category = String(product.category || "").trim();
      if (!category) return matchesCollection(product, collection.slug);
      const name = category.toLowerCase();
      const catSlug = slugify(category);
      return (
        name === collection.name?.toLowerCase() ||
        catSlug === collection.slug ||
        catSlug === slugify(collection.name || "") ||
        matchesCollection(product, collection.slug)
      );
    });

    if (availability === "in") next = next.filter((product) => productStock(product) > 0);
    if (availability === "out") next = next.filter((product) => productStock(product) <= 0);

    if (price === "under-2000") next = next.filter((product) => product.price < 2000);
    if (price === "2000-5000") next = next.filter((product) => product.price >= 2000 && product.price <= 5000);
    if (price === "over-5000") next = next.filter((product) => product.price > 5000);

    if (sort === "price-asc") return [...next].sort((a, b) => a.price - b.price);
    if (sort === "price-desc") return [...next].sort((a, b) => b.price - a.price);
    return next;
  }, [products, collection, availability, price, sort]);

  if (loading && !collection) {
    return (
      <div className="page container">
        <div className="empty-state">Loading collection…</div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Collection not found</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="collection-page">
      <header className="collection-head">
        <div className="container">
          <h1>{collection.title}</h1>
          {collection.description ? <p>{collection.description}</p> : null}
        </div>
      </header>

      <div className="container collection-body">
        <div className="collection-toolbar">
          <div className="collection-filters">
            <span>Filter:</span>
            <label className="collection-select">
              <select value={availability} onChange={(e) => setAvailability(e.target.value)} aria-label="Filter by availability">
                <option value="all">Availability</option>
                <option value="in">In stock</option>
                <option value="out">Out of stock</option>
              </select>
              <ChevronDown size={14} strokeWidth={1.8} />
            </label>
            <label className="collection-select">
              <select value={price} onChange={(e) => setPrice(e.target.value)} aria-label="Filter by price">
                <option value="all">Price</option>
                <option value="under-2000">Under ₹2,000</option>
                <option value="2000-5000">₹2,000 – ₹5,000</option>
                <option value="over-5000">Over ₹5,000</option>
              </select>
              <ChevronDown size={14} strokeWidth={1.8} />
            </label>
          </div>

          <div className="collection-sort">
            <span>Sort by:</span>
            <label className="collection-select">
              <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
              <ChevronDown size={14} strokeWidth={1.8} />
            </label>
            <span className="collection-count">{loading ? "Loading…" : `${list.length} products`}</span>
          </div>
        </div>

        {loading ? (
          <div className="empty-state">Loading products…</div>
        ) : list.length === 0 ? (
          <div className="empty-state">
            <h3>Products will appear here</h3>
            <p>Add {collection.shortName.toLowerCase()} products from the backend to fill this collection.</p>
          </div>
        ) : (
          <div className="collection-grid">
            {list.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
