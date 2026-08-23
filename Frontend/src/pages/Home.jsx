import "./Home.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Leaf, RefreshCw, Truck } from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import { api } from "../services/api";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api
      .getProducts()
      .then((items) => {
        setProducts(items);
        setCategories(
          [...new Set(items.map((product) => product.category).filter(Boolean))]
            .sort()
            .map((name) => ({
              id: name.toLowerCase(),
              name,
              image: items.find((product) => product.category === name)?.image,
            })),
        );
      })
      .catch(() => {
        setProducts([]);
        setCategories([]);
      });
  }, []);

  const featured = useMemo(
    () => products.filter((product) => product.isNew || product.onSale).slice(0, 4),
    [products],
  );
  const bestsellers = useMemo(() => products.slice(0, 8), [products]);
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-media">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1800&q=80"
            alt="VORA collection lifestyle"
          />
          <div className="hero-shade" />
        </div>
        <div className="container hero-content">
          <p className="hero-brand">VORA</p>
          <h1>Essentials made for the way you move.</h1>
          <p className="hero-lead">
            Contemporary apparel, footwear, and home pieces with lasting quality.
          </p>
          <div className="hero-cta">
            <Link to="/shop" className="btn btn-primary">
              Shop collection <ArrowRight size={18} />
            </Link>
            <Link to="/about" className="btn btn-outline hero-outline">
              Our story
            </Link>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Browse</span>
            <h2>Shop by category</h2>
            <p>Find pieces that fit your routine — from city layers to calm interiors.</p>
          </div>
          <Link to="/shop" className="btn btn-ghost">
            View all <ArrowRight size={16} />
          </Link>
        </div>
        <div className="cat-grid">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              to={`/shop?category=${cat.id}`}
              className="cat-card"
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <img src={cat.image} alt={cat.name} loading="lazy" />
              <div className="cat-card-copy">
                <h3>{cat.name}</h3>
                <p>Explore our {cat.name.toLowerCase()} collection.</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Selected</span>
            <h2>New & on sale</h2>
            <p>Fresh arrivals and limited offers worth a closer look.</p>
          </div>
        </div>
        <div className="product-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="promise">
        <div className="container promise-grid">
          <div>
            <Truck size={22} />
            <h3>Free shipping</h3>
            <p>On orders over ₹999 across India.</p>
          </div>
          <div>
            <RefreshCw size={22} />
            <h3>30-day returns</h3>
            <p>Easy returns on unworn items with original tags.</p>
          </div>
          <div>
            <Leaf size={22} />
            <h3>Thoughtful materials</h3>
            <p>Organic cottons, responsible wool, and durable finishes.</p>
          </div>
        </div>
      </section>

      <section className="section container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Bestsellers</span>
            <h2>Most loved this season</h2>
            <p>Customer favorites across apparel, accessories, and home.</p>
          </div>
          <Link to="/shop" className="btn btn-outline btn-sm">
            Shop all
          </Link>
        </div>
        <div className="product-grid">
          {bestsellers.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter-inner">
          <div>
            <span className="eyebrow">Stay close</span>
            <h2>Early access to drops & restocks</h2>
            <p>Join the VORA list for seasonal edits and member-only offers.</p>
          </div>
          <form
            className="newsletter-form"
            onSubmit={(e) => {
              e.preventDefault();
              e.currentTarget.reset();
              alert("Thanks for subscribing!");
            }}
          >
            <input type="email" required placeholder="Your email address" />
            <button type="submit" className="btn btn-primary">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
