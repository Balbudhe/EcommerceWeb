import "./Product.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Heart,
  Link2,
  RefreshCcw,
  Shield,
  Sprout,
  Truck,
  X,
} from "lucide-react";
import { api, slugify, SPECIFICATION_FIELDS } from "../services/api";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import ProductCard from "../components/product/ProductCard";
import MediaSlot from "../components/ui/MediaSlot";
import { formatPrice, salePercent } from "../utils/formatPrice";

const PRODUCT_FAQS = [
  {
    q: "Is this table safe to leave outdoors permanently?",
    a: "Teak is naturally resistant to moisture and outdoor conditions. For the longest life, keep it covered during extreme weather and prolonged rain.",
  },
  {
    q: "How much weight can the table hold?",
    a: "The table comfortably holds everyday use loads — laptops, dinnerware, plants and décor. Avoid standing or placing extremely heavy items on the folded edges.",
  },
  {
    q: "Does it require any assembly?",
    a: "No assembly needed. It arrives fully built — simply unfold the legs and it's ready to use.",
  },
  {
    q: "What is your return policy?",
    a: "We offer 7-day easy returns on unused products in original packaging. Reach out to our support team to initiate a return or replacement.",
  },
  {
    q: "How long does delivery take?",
    a: "Orders are dispatched within 2–3 business days and typically arrive within 5–8 business days, depending on your location.",
  },
];

function productStock(product) {
  if (Array.isArray(product.variants) && product.variants.length) {
    return product.variants.reduce((total, variant) => total + Number(variant.stock || 0), 0);
  }
  return Number(product.stock || product.quantity || 0);
}

function firstSentence(text = "") {
  const clean = String(text).trim();
  if (!clean) return "Space-saving design for balconies, living rooms & everyday corners";
  const match = clean.match(/[^.!?]+[.!?]?/);
  return match ? match[0].trim() : clean;
}

export default function Product() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [openFaqs, setOpenFaqs] = useState([]);
  const [openPanel, setOpenPanel] = useState("");
  const [copied, setCopied] = useState(false);
  const { addToCart, items, loading: cartBusy } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    window.scrollTo(0, 0);
    Promise.all([api.getProduct(id), api.getProducts()])
      .then(([data, products]) => {
        if (!alive) return;
        setProduct(data);
        if (data) {
          setRelated(
            products
              .filter((item) => item.category === data.category && item.id !== data.id)
              .slice(0, 4),
          );
          setSize(data.sizes?.[0] || "");
          setColor(data.colors?.[0] || "");
          setActiveImg(0);
          setQty(1);
          setLightbox(false);
        }
      })
      .catch(() => {
        if (alive) setProduct(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (event) => {
      if (event.key === "Escape") setLightbox(false);
      if (event.key === "ArrowRight") setActiveImg((i) => i + 1);
      if (event.key === "ArrowLeft") setActiveImg((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  const inCart = useMemo(
    () =>
      items
        .filter((item) => String(item.productId || item.id) === String(id))
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [items, id],
  );

  if (loading) {
    return (
      <div className="page container">
        <div className="empty-state">Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page container">
        <div className="empty-state">
          <h3>Product not found</h3>
          <p>This item may have been removed.</p>
          <Link to="/shop" className="btn btn-primary">
            Back to shop
          </Link>
        </div>
      </div>
    );
  }

  const wished = isWishlisted(product.id);
  const gallery = product.images?.length ? product.images : product.image ? [product.image] : [];
  const safeIndex = gallery.length ? ((activeImg % gallery.length) + gallery.length) % gallery.length : 0;
  const off = salePercent(product);
  const saved =
    product.originalPrice && product.originalPrice > product.price
      ? product.originalPrice - product.price
      : 0;
  const stock = productStock(product);
  const viewers = 18 + (String(product.id).split("").reduce((n, ch) => n + ch.charCodeAt(0), 0) % 19);
  const collectionPath = product.category ? `/collection/${slugify(product.category)}` : "/shop";
  const features = product.features?.length
    ? product.features
    : [
        "The natural beauty of teak wood adds a touch of elegance to your space.",
        "Ample storage to keep belongings organised.",
        "A multi-purpose design for living room, bedroom, study, or kitchen.",
        "Compact enough for small spaces, without looking bulky.",
        "Minimalist finish that complements any interior.",
      ];
  const detailSpecs = SPECIFICATION_FIELDS.map((field) => [
    field.label,
    product.specifications?.[field.key] || "N/A",
  ]);

  const stepImage = (dir) => {
    if (!gallery.length) return;
    setActiveImg((i) => (i + dir + gallery.length) % gallery.length);
  };

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product.name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="pd-page">
      <div className="container">
        <nav className="pd-crumb">
          <Link to="/">Home</Link>
          <span>/</span>
          {product.category ? (
            <>
              <Link to={collectionPath}>{product.category}</Link>
              <span>/</span>
            </>
          ) : null}
          <b>{product.name}</b>
        </nav>

        <div className="pd-layout">
          <div className="pd-gallery">
            <button type="button" className="pd-main-img" onClick={() => gallery.length && setLightbox(true)}>
              {off > 0 ? <span className="pd-sale-badge">{off}% OFF</span> : null}
              <MediaSlot
                src={gallery[safeIndex] || product.image}
                alt={product.name}
                label="Product image"
              />
              {gallery.length > 1 ? (
                <span className="pd-counter">
                  {safeIndex + 1} / of {gallery.length}
                </span>
              ) : null}
            </button>
            {gallery.length > 1 ? (
              <>
                <button type="button" className="pd-nav prev" onClick={() => stepImage(-1)} aria-label="Previous image">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className="pd-nav next" onClick={() => stepImage(1)} aria-label="Next image">
                  <ChevronRight size={22} />
                </button>
                <div className="pd-thumbs">
                  {gallery.map((src, i) => (
                    <button
                      key={`${src}-${i}`}
                      type="button"
                      className={i === safeIndex ? "active" : ""}
                      onClick={() => setActiveImg(i)}
                    >
                      <MediaSlot src={src} alt="" label={`${i + 1}`} />
                    </button>
                  ))}
                </div>
              </>
            ) : null}
          </div>

          <div className="pd-info">
            <div className="pd-pills">
              <span>Sustainably sourced</span>
              <span>Handcrafted in India</span>
            </div>
            <h1>{product.name}</h1>
            <p className="pd-lead">{firstSentence(product.description)}</p>

            <div className="pd-price-block">
              <div className="pd-price-row">
                <span className="pd-sale-label">{saved > 0 ? "Sale price" : "Price"}</span>
                <strong>{formatPrice(product.price)}</strong>
                {saved > 0 ? (
                  <>
                    <span className="pd-sale-label">Regular price</span>
                    <s>{formatPrice(product.originalPrice)}</s>
                  </>
                ) : null}
              </div>
              {saved > 0 ? <p className="pd-save">You save {formatPrice(saved)}</p> : null}
              <p className="pd-tax">Inclusive of all taxes · 3 interest-free EMI options available at checkout</p>
            </div>

            {product.colors?.length ? (
              <div className="pd-option">
                <label>Colour</label>
                <div className="choice-row">
                  {product.colors.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`choice-chip ${color === value ? "active" : ""}`}
                      onClick={() => setColor(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes?.length ? (
              <div className="pd-option">
                <label>Size</label>
                <div className="choice-row">
                  {product.sizes.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={`choice-chip ${size === value ? "active" : ""}`}
                      onClick={() => setSize(value)}
                    >
                      {value}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div className="pd-option">
              <label>Quantity</label>
              <div className="qty-control">
                <button
                  type="button"
                  aria-label={`Decrease quantity for ${product.name}`}
                  onClick={() => setQty((value) => Math.max(1, value - 1))}
                >
                  −
                </button>
                <span>{qty}</span>
                <button
                  type="button"
                  aria-label={`Increase quantity for ${product.name}`}
                  onClick={() => setQty((value) => value + 1)}
                >
                  +
                </button>
              </div>
              <small>({inCart} in cart)</small>
            </div>

            <div className="pd-actions">
              <button
                type="button"
                className="btn btn-primary"
                disabled={cartBusy}
                onClick={() => addToCart(product, { quantity: qty, size, color })}
              >
                Add to cart
              </button>
              <button
                type="button"
                className={`btn-icon ${wished ? "active" : ""}`}
                onClick={() => toggle(product.id)}
                aria-label="Wishlist"
              >
                <Heart size={18} fill={wished ? "currentColor" : "none"} />
              </button>
            </div>

            {stock > 0 && stock < 12 ? (
              <p className="pd-urgency">
                Only {stock} left at this price — {viewers} people viewing this today
              </p>
            ) : (
              <p className="pd-urgency">{viewers} people viewing this today</p>
            )}

            <ul className="pd-trust">
              <li>
                <Truck size={18} />
                Free shipping, pan-India
              </li>
              <li>
                <RefreshCcw size={18} />
                7-day hassle-free returns
              </li>
              <li>
                <Shield size={18} />
                1-year craftsmanship warranty
              </li>
            </ul>

            <div className="pd-accordions">
              <article className={openPanel === "description" ? "open" : ""}>
                <button type="button" onClick={() => setOpenPanel(openPanel === "description" ? "" : "description")}>
                  Description
                  <ChevronDown size={18} />
                </button>
                {openPanel === "description" ? (
                  <div className="pd-accordion-body">
                    <p>
                      {product.description ||
                        `Introducing the ${product.name} — a durable, elegant teakwood piece for organising books, décor, or everyday essentials.`}
                    </p>
                    {features.length ? (
                      <ul className="pd-leaves">
                        {features.map((feature) => (
                          <li key={feature}>
                            <span>🌿</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </article>
              <article className={openPanel === "care" ? "open" : ""}>
                <button type="button" onClick={() => setOpenPanel(openPanel === "care" ? "" : "care")}>
                  Material Care
                  <ChevronDown size={18} />
                </button>
                {openPanel === "care" ? (
                  <div className="pd-accordion-body">
                    <p>
                      {product.materialCare ||
                        "Wipe with a damp cloth or wet wipes to clean."}
                    </p>
                  </div>
                ) : null}
              </article>
              <button type="button" className="pd-share" onClick={share}>
                <Link2 size={16} />
                {copied ? "Link copied" : "Share"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {gallery.length > 1 ? (
        <section className="pd-band">
          <div className="container">
            <span className="eyebrow">A closer look</span>
            <h2>See it from every angle</h2>
            <p>Handcrafted teak, made to hold its own indoors or out.</p>
            <div className="pd-angle-grid">
              {gallery.slice(0, 6).map((src, i) => (
                <button key={`${src}-${i}`} type="button" onClick={() => { setActiveImg(i); setLightbox(true); }}>
                  <MediaSlot src={src} alt={`${product.name} ${i + 1}`} label="" />
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="pd-specs">
        <div className="container">
          <span className="eyebrow">Specifications</span>
          <h2>Every detail, listed plainly</h2>
          <dl>
            {detailSpecs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="pd-promise">
        <div className="container pd-promise-grid">
          <div className="pd-promise-visual" aria-hidden="true">
            <Sprout size={72} strokeWidth={1.4} />
          </div>
          <div className="pd-promise-copy">
            <span className="eyebrow">Our promise</span>
            <h2>One purchase, one tree planted</h2>
            <p>
              Every Artiqulate order funds a new tree planted through our reforestation partners. Furniture that comes from nature should give back to it.
            </p>
            <p>
              Our teak is sourced from responsibly managed, sustainably replanted plantations — never old-growth forest.
            </p>
            <ul>
              <li>
                <b>12,400+</b>
                <span>Trees planted to date</span>
              </li>
              <li>
                <b>100%</b>
                <span>Sustainably sourced teak</span>
              </li>
              <li>
                <b>60+</b>
                <span>Artisan families supported</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="pd-faq">
        <div className="container">
          <span className="eyebrow">FAQs</span>
          <h2>Still have questions?</h2>
          <div className="pd-faq-list">
            {PRODUCT_FAQS.map((item, i) => {
              const open = openFaqs.includes(i);
              return (
                <article key={item.q} className={open ? "open" : ""}>
                  <button
                    type="button"
                    aria-expanded={open}
                    onClick={() =>
                      setOpenFaqs((current) =>
                        current.includes(i) ? current.filter((n) => n !== i) : [...current, i],
                      )
                    }
                  >
                    {item.q}
                    <span aria-hidden="true">{open ? "−" : "+"}</span>
                  </button>
                  {open ? <p>{item.a}</p> : null}
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section pd-related">
          <div className="container">
            <div className="section-head">
              <div>
                <span className="eyebrow">More like this</span>
                <h2>You may also like</h2>
              </div>
            </div>
            <div className="product-grid">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {lightbox && gallery.length ? (
        <div className="pd-lightbox" role="dialog" aria-modal="true" aria-label="Product images">
          <button type="button" className="pd-lightbox-close" onClick={() => setLightbox(false)} aria-label="Close">
            <X size={22} />
          </button>
          {gallery.length > 1 ? (
            <button type="button" className="pd-nav prev" onClick={() => stepImage(-1)} aria-label="Previous image">
              <ChevronLeft size={28} />
            </button>
          ) : null}
          <img src={gallery[safeIndex]} alt={product.name} />
          {gallery.length > 1 ? (
            <button type="button" className="pd-nav next" onClick={() => stepImage(1)} aria-label="Next image">
              <ChevronRight size={28} />
            </button>
          ) : null}
          <span className="pd-counter">
            {safeIndex + 1} / of {gallery.length}
          </span>
        </div>
      ) : null}
    </div>
  );
}
