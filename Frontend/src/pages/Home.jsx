import "./Home.css";
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Droplets,
  Hammer,
  Leaf,
  Play,
  Shield,
  Star,
} from "lucide-react";
import ProductCard from "../components/product/ProductCard";
import MediaSlot from "../components/ui/MediaSlot";
import Reveal from "../components/ui/Reveal";
import { api } from "../services/api";
import { formatPrice } from "../utils/formatPrice";
import { useCart } from "../context/CartContext";
import {
  FEATURES,
  HERO_SLIDES,
  MARQUEE,
  REVIEWS,
  TRUST_ITEMS,
} from "../data/site";

const FEATURE_ICONS = [Droplets, Shield, Hammer, Leaf];

function HandmadeIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M30.5 26.5V16.8a5.2 5.2 0 0 1 10.4 0V28" />
      <path d="M40.9 18.8a4.4 4.4 0 0 1 8.8 0V31" />
      <path d="M49.7 21.2a4 4 0 0 1 8 0V36c0 10.4-8.2 18.5-19.2 18.5h-7.4" />
      <path d="M16.2 31.2V22a4.8 4.8 0 0 1 9.6 0v12.4" />
      <path d="M12.8 33.4V25a4.4 4.4 0 0 1 8.8 0v12c0 8.8 6.8 16.8 16.6 16.8" />
    </svg>
  );
}

function WoodIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <ellipse cx="32" cy="44.2" rx="17.5" ry="6.6" />
      <path d="M14.5 44.2v-5.6c0-3.6 7.8-6.6 17.5-6.6s17.5 3 17.5 6.6v5.6" />
      <ellipse cx="32" cy="38.6" rx="17.5" ry="6.6" />
      <path d="M14.5 38.6v-5.6c0-3.6 7.8-6.6 17.5-6.6s17.5 3 17.5 6.6v5.6" />
      <ellipse cx="32" cy="33" rx="17.5" ry="6.6" />
      <circle cx="22.5" cy="33" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="22.5" cy="38.6" r="1.35" fill="currentColor" stroke="none" />
      <circle cx="22.5" cy="44.2" r="1.35" fill="currentColor" stroke="none" />
    </svg>
  );
}

function PlantIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <path d="M11 47.2c7.8-.8 14.2-4.6 17.2-12.4" />
      <path d="M8 41.4c6.4.2 11.8 2.6 16.2 8.4" />
      <path d="M8.4 48.4c6.6.2 12.2-.4 18.2-3.4 3.6-1.8 6.6-1.2 9.2 1.2" />
      <path fill="currentColor" stroke="none" d="M32 33.2c.6-8.8 5.2-14.8 14.6-17.8-1.6 9.2-6.4 14.8-14.6 17.8Z" />
      <path fill="currentColor" stroke="none" d="M32 33.2c-1.4-7.6-6.6-12.6-15.4-14.8 2.8 8 7.6 12.6 15.4 14.8Z" />
      <path d="M32 19.6v25.2" />
    </svg>
  );
}

function StudentIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true">
      <circle cx="32" cy="16.2" r="7.4" fill="currentColor" stroke="none" />
      <path fill="currentColor" stroke="none" d="M17.2 34.8c2-8 7.8-12.2 14.8-12.2s12.8 4.2 14.8 12.2H17.2Z" />
      <rect x="16.5" y="36.8" width="31" height="18.2" rx="1.6" />
      <path d="M21 36.8V33.2c0-1.5 1.4-2.7 3.1-2.7h15.8c1.7 0 3.1 1.2 3.1 2.7v3.6" />
      <circle cx="32" cy="46.2" r="1.25" fill="currentColor" stroke="none" />
    </svg>
  );
}

const TRUST_ICONS = [HandmadeIcon, WoodIcon, PlantIcon, StudentIcon];

function HeroSlider() {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const slides = HERO_SLIDES;

  useEffect(() => {
    if (hover || slides.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, 5000);
    return () => clearInterval(id);
  }, [hover, slides.length]);

  const go = (dir) => {
    setIndex((i) => (i + dir + slides.length) % slides.length);
  };

  return (
    <section
      className="hero"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="hero-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((item, i) => (
          <div key={item.id} className="hero-slide">
            <img src={item.image} alt={item.label} className="hero-image" loading={i === 0 ? "eager" : "lazy"} />
          </div>
        ))}
      </div>

      {slides.length > 1 ? (
        <>
          <button type="button" className="hero-arrow prev" onClick={() => go(-1)} aria-label="Previous">
            <ChevronLeft size={28} strokeWidth={2} />
          </button>
          <button type="button" className="hero-arrow next" onClick={() => go(1)} aria-label="Next">
            <ChevronRight size={28} strokeWidth={2} />
          </button>
        </>
      ) : null}
    </section>
  );
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();
  const watchRef = useRef(null);
  const essentialsRef = useRef(null);
  const reviewsRef = useRef(null);

  useEffect(() => {
    api.getProducts().then(setProducts).catch(() => setProducts([]));
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const bestsellers = useMemo(() => products.slice(0, 8), [products]);
  const essentials = useMemo(() => products.slice(0, 10), [products]);
  const watchItems = useMemo(() => products.slice(0, 8), [products]);

  const collectionTiles = useMemo(
    () =>
      categories.map((category) => {
        const match = products.find(
          (product) =>
            String(product.category || "").toLowerCase() === category.name.toLowerCase() ||
            String(product.category || "").toLowerCase() === category.id,
        );
        return {
          ...category,
          shortName: category.shortName || category.name,
          image: category.image || match?.image || "",
        };
      }),
    [categories, products],
  );

  const scrollWatch = (dir) => {
    const track = watchRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.86), behavior: "smooth" });
  };

  const scrollEssentials = (dir) => {
    const track = essentialsRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.78), behavior: "smooth" });
  };

  const scrollReviews = (dir) => {
    const track = reviewsRef.current;
    if (!track) return;
    track.scrollBy({ left: dir * Math.round(track.clientWidth * 0.9), behavior: "smooth" });
  };

  const promoImages = products.slice(0, 3);

  return (
    <div className="home">
      <HeroSlider />

      <section className="trust">
        <div className="container">
          <Reveal>
            <h2>Why customers trust us</h2>
          </Reveal>
          <div className="trust-grid">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = TRUST_ICONS[i];
              return (
                <Reveal className="trust-item" delay={i * 80} key={item.title}>
                  <div className="trust-icon">
                    <Icon />
                  </div>
                  <h3>{item.title}</h3>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {collectionTiles.length > 0 ? (
      <section className="section collection-tiles">
        <div className="collection-grid">
          {collectionTiles.map((cat, i) => (
            <Reveal
              as={Link}
              key={cat.id}
              to={cat.path}
              className="collection-card"
              delay={i * 110}
            >
              <MediaSlot src={cat.image} alt={cat.name} label="" />
              <div className="collection-card-copy">
                <h3>{cat.name}</h3>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
      ) : null}

      <section className="section container">
        <Reveal className="section-head">
          <h2>Shop Best-Sellers</h2>
          <Link to="/shop" className="view-all">
            View all
          </Link>
        </Reveal>
        {bestsellers.length > 0 ? (
          <div className="product-grid">
            {bestsellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>Products will appear here</h3>
            <p>Add products from the backend to fill this section.</p>
          </div>
        )}
      </section>

      <section className="promo-banner">
        <div className="container promo-banner-inner">
          <div className="promo-banner-copy">
            <h2>One Purchase = One Plant</h2>
            <p>Our Initiative For Greener Happier Planet</p>
            <Link to="/shop" className="btn promo-shop">
              Shop Now
            </Link>
          </div>
          <div className="promo-banner-media">
            <video
              src={encodeURI("/Home Video.mp4")}
              autoPlay
              muted
              loop
              playsInline
              aria-label="One purchase equals one plant"
            />
          </div>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={`${item}-${i}`}>
              {item} <em>•</em>
            </span>
          ))}
        </div>
      </div>

      {collectionTiles.length > 0 ? (
      <section className="section">
        <div className="container lookbook-grid">
          {collectionTiles.map((cat, i) => (
            <Reveal
              as={Link}
              key={`look-${cat.id}`}
              to={cat.path}
              className="lookbook-card"
              delay={i * 80}
            >
              <MediaSlot src={cat.image} alt={cat.shortName} label={cat.shortName} />
              <span>{cat.shortName}</span>
            </Reveal>
          ))}
        </div>
      </section>
      ) : null}

      <section className="section essentials">
        <div className="container">
          <Reveal className="essentials-head">
            <h2>Daily Essentials</h2>
          </Reveal>

          <div className="essentials-layout">
            <article className="essentials-promo">
              <div className="essentials-promo-stack">
                {[0, 1, 2].map((i) => (
                  <MediaSlot
                    key={`promo-${i}`}
                    src={promoImages[i]?.image}
                    alt=""
                    label=""
                  />
                ))}
              </div>
              <div className="essentials-promo-overlay">
                <p className="essentials-promo-brand">Artiqulate</p>
                <h3>Artistry meets utility</h3>
                <Link to="/shop" className="essentials-explore">
                  Explore
                </Link>
              </div>
            </article>

            <div className="essentials-track" ref={essentialsRef}>
              {essentials.map((product) => (
                <article key={product.id} className="essentials-card">
                  <div className="essentials-media">
                    <Link to={`/product/${product.id}`}>
                      <MediaSlot src={product.image} alt={product.name} label="Product" />
                    </Link>
                    <button type="button" className="essentials-atc" onClick={() => addToCart(product)}>
                      Add to bag
                    </button>
                  </div>
                  <div className="essentials-copy">
                    <Link to={`/product/${product.id}`}>
                      <h3>{product.name}</h3>
                    </Link>
                    <p>
                      {product.description
                        ? `${product.description.slice(0, 78)}${product.description.length > 78 ? "..." : ""}`
                        : "A handmade teakwood essential for everyday living."}
                    </p>
                    <div className="price">
                      <span className="price-current">{formatPrice(product.price)}</span>
                      {product.originalPrice ? (
                        <span className="price-old">{formatPrice(product.originalPrice)}</span>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="essentials-nav">
            <button type="button" className="essentials-arrow" onClick={() => scrollEssentials(-1)} aria-label="Previous">
              <ChevronLeft size={18} />
            </button>
            <button type="button" className="essentials-arrow" onClick={() => scrollEssentials(1)} aria-label="Next">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>

      <section className="feature-row">
        <div className="container feature-grid">
          {FEATURES.map((item, i) => {
            const Icon = FEATURE_ICONS[i];
            return (
              <div key={item.title}>
                <Icon size={22} />
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section watch-section">
        <h2 className="watch-title">Watch & Buy</h2>
        <div className="watch-wrap">
          <button type="button" className="watch-side prev" onClick={() => scrollWatch(-1)} aria-label="Previous">
            <ChevronLeft size={16} />
          </button>
          <div className="watch-track" ref={watchRef}>
            {(watchItems.length ? watchItems : Array.from({ length: 5 }, (_, i) => ({ id: `placeholder-${i}` }))).map((product) => (
              <article key={product.id} className="watch-card">
                {product.video || product.videos?.[0] ? (
                  <video src={product.video || product.videos[0]} muted loop playsInline preload="metadata" />
                ) : (
                  <MediaSlot src={product.image} alt={product.name || ""} label="" />
                )}
                <span className="watch-play" aria-hidden="true">
                  <Play size={16} fill="currentColor" />
                </span>
                <Link to={product.id && !String(product.id).startsWith("placeholder") ? `/product/${product.id}` : "/shop"} className="watch-shop">
                  Shop now
                </Link>
              </article>
            ))}
          </div>
          <button type="button" className="watch-side next" onClick={() => scrollWatch(1)} aria-label="Next">
            <ChevronRight size={16} />
          </button>
        </div>
      </section>

      <section className="reviews">
        <div className="container reviews-inner">
          <aside className="reviews-summary">
            <p>{REVIEWS.label}</p>
            <div className="reviews-stars reviews-stars-light" aria-label={`${REVIEWS.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <span>{REVIEWS.rating} average</span>
            <span>{REVIEWS.count} reviews</span>
          </aside>

          <div className="reviews-carousel">
            <button type="button" className="reviews-arrow" onClick={() => scrollReviews(-1)} aria-label="Previous reviews">
              <ChevronLeft size={18} />
            </button>
            <div className="reviews-track" ref={reviewsRef}>
              {REVIEWS.items.map((review) => (
                <article key={review.name} className="reviews-card">
                  <header>
                    <strong>{review.name}</strong>
                    <span className="reviews-stars" aria-label={`${review.stars} stars`}>
                      {Array.from({ length: review.stars }).map((_, i) => (
                        <Star key={i} size={13} fill="currentColor" strokeWidth={0} />
                      ))}
                    </span>
                  </header>
                  <p>{review.text}</p>
                  <span className="reviews-country">{review.country}</span>
                </article>
              ))}
            </div>
            <button type="button" className="reviews-arrow" onClick={() => scrollReviews(1)} aria-label="Next reviews">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
