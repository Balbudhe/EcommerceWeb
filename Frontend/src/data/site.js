export const SITE = {
  name: "Artiqulate Lifestyle",
  tagline: "Wooden Storage, Organizers & Essentials",
  phone: "+91-9529622631",
  emails: {
    primary: "gayatri.artiqulate@gmail.com",
    returns: "varun.artiqulate@gmail.com",
  },
  address: "R-3, Jyoti apartments Laxminagar, 601, Jain Mandir Road, 440022 Nagpur MH, India",
  returnAddress: "U-108, Amar Nagar, MIDC Hingna, Nagpur - 441110",
  social: {
    facebook: "https://www.facebook.com/artiqulatenagpur",
    instagram: "https://www.instagram.com/artiqulate.lifestyle",
    pinterest: "https://www.pinterest.com/",
  },
};

/** Site-wide typeface — used by CSS variables --font-display / --font-body */
export const FONT = {
  stack: "sans-serif",
};

export const ANNOUNCEMENTS = [
  { text: "Click here to see our exquisite product line today!", to: "/shop" },
  { text: "Special Sale on Furniture Collection!", to: "/furniture" },
];

export const HERO_SLIDES = [
  {
    id: "tradition-meets",
    image: "/banner/banner1.webp",
    label: "Tradition meets modern living",
    to: "/furniture",
  },
  {
    id: "teak-it-easy",
    image: "/banner/banner2.webp",
    label: "Teak it easy folding teakwood bed table",
    to: "/furniture",
  },
];

export const NAV_LINKS = [
  { to: "/", label: "Home", end: true },
  { to: "/about", label: "About Us" },
  { to: "/furniture", label: "Furniture" },
  { to: "/temples", label: "Temples" },
  { to: "/lighting", label: "Designer Lighting" },
  { to: "/blogs", label: "Blogs" },
  { to: "/contact", label: "Contact" },
];

export const MARQUEE = [
  "100% Ethically Sourced Original Teakwood",
  "Crafted with Care & Precision",
  "Inspired by Tradition & Made With Love",
  "Designed for Modern Living & Easy Functionality",
];

export const TRUST_ITEMS = [
  {
    title: "100% Handmade",
    body: "Every piece is handcrafted by skilled artisans — never mass produced.",
  },
  {
    title: "Premium Quality Wood",
    body: "Aged Indian teakwood chosen for grain, strength, and lasting beauty.",
  },
  {
    title: "One Purchase = One Plant",
    body: "Each order supports our initiative for a greener, happier planet.",
  },
  {
    title: "Student Commission",
    body: "A share of every sale supports students and the next generation of makers.",
  },
];

export const REVIEWS = {
  rating: 4.8,
  count: 127,
  label: "Excellent",
  items: [
    {
      name: "Rahul A.",
      stars: 5,
      country: "IN",
      text: "Bought it as a plant stand and it looks stunning. Strong enough to hold heavy pots.",
    },
    {
      name: "Pooja M.",
      stars: 5,
      country: "IN",
      text: "Excellent quality side table. The handcrafted details make it stand out.",
    },
    {
      name: "Karan B.",
      stars: 5,
      country: "IN",
      text: "Compact yet functional. Fits perfectly in small spaces without looking bulky.",
    },
    {
      name: "Meera S.",
      stars: 5,
      country: "IN",
      text: "The teak grain is beautiful. Feels solid and well finished — worth every rupee.",
    },
    {
      name: "Arjun K.",
      stars: 5,
      country: "IN",
      text: "Folding table is a space-saver. Easy to open, sturdy, and looks premium.",
    },
    {
      name: "Nisha T.",
      stars: 4,
      country: "IN",
      text: "Loved the mandir. Compact, elegant, and the jali work is done with care.",
    },
  ],
};

export const FEATURES = [
  { title: "Moisture resistant", body: "Built for Indian homes, balconies, and daily use." },
  { title: "Pest & rot resistant", body: "Naturally durable teak that stands the test of time." },
  { title: "Crafted By Experts", body: "Precision joinery from artisans who know the wood." },
  { title: "Made In India", body: "Designed, made, and finished in India with care." },
];

export const COLLECTIONS = [
  {
    slug: "lighting",
    name: "Designer Lighting Solutions",
    shortName: "Lighting",
    path: "/lighting",
    eyebrow: "Collection",
    title: "Designer Lighting Solutions",
    description:
      "Wooden table lamps with jaali, floral, and geometric designs — handmade teak lighting that warms every corner of the home.",
  },
  {
    slug: "temples",
    name: "Temples",
    shortName: "Mandir",
    path: "/temples",
    eyebrow: "Collection",
    title: "Temples",
    description:
      "Designer teak wood mandirs for home and peace — handcrafted shrines with jali work, shutters, and hanging bells.",
  },
  {
    slug: "furniture",
    name: "Furniture",
    shortName: "Furniture",
    path: "/furniture",
    eyebrow: "Collection",
    title: "Furniture",
    description:
      "Welcome to our Furniture Collection, where craftsmanship meets elegance. Our selection features handmade, wooden pieces that bring warmth and character to any space. Each item is meticulously crafted, ensuring that every rack, table, chair, bench, and small furniture piece is not only functional but also a work of art.",
  },
];

function toSlug(value = "") {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function matchesCollection(product, slug) {
  const category = String(product.category || "").trim().toLowerCase();
  const catSlug = toSlug(product.category || "");
  const aliases = {
    lighting: ["lighting", "designer-lighting", "designer-lighting-solutions", "designer lighting", "designer lighting solutions"],
    temples: ["temples", "temple", "mandir", "mandirs"],
    furniture: ["furniture"],
  };
  const allowed = aliases[slug] || [slug];
  if (category) {
    return allowed.includes(category) || allowed.includes(catSlug);
  }
  const hay = `${product.name || ""} ${product.description || ""}`.toLowerCase();
  if (slug === "lighting") return /\b(light|lights|lamp|lamps|lighting)\b/.test(hay);
  if (slug === "temples") return /\b(temple|temples|mandir|mandirs|shrine)\b/.test(hay);
  if (slug === "furniture") {
    return /\b(furniture|table|rack|chair|bench|stool|bed)\b/.test(hay) &&
      !/\b(light|lamp|lighting|mandir|temple)\b/.test(hay);
  }
  return false;
}
