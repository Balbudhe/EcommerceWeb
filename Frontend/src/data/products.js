export const categories = [
  {
    id: "apparel",
    name: "Apparel",
    description: "Layered essentials for every season",
    image:
      "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "footwear",
    name: "Footwear",
    description: "Comfort built for city movement",
    image:
      "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "accessories",
    name: "Accessories",
    description: "Finishing details that elevate",
    image:
      "https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "home",
    name: "Home",
    description: "Calm objects for modern spaces",
    image:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
  },
];

export const products = [
  {
    id: 1,
    name: "Merino Oversized Coat",
    category: "apparel",
    price: 15687,
    originalPrice: 19920,
    rating: 4.8,
    reviews: 126,
    isNew: false,
    onSale: true,
    colors: ["Charcoal", "Sand", "Olive"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 18,
    image:
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "A structured oversized coat in Italian merino wool. Soft hand-feel with a clean silhouette that works over knits or shirts.",
    features: ["100% merino wool", "Relaxed fit", "Horn buttons", "Dry clean"],
  },
  {
    id: 2,
    name: "Everyday Cotton Tee",
    category: "apparel",
    price: 3154,
    originalPrice: null,
    rating: 4.6,
    reviews: 312,
    isNew: true,
    onSale: false,
    colors: ["White", "Ink", "Sage"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 64,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Mid-weight cotton jersey with a subtle drape. Designed for daily rotation without losing shape.",
    features: ["Organic cotton", "Pre-shrunk", "Crew neck", "Machine wash"],
  },
  {
    id: 3,
    name: "City Runner Sneaker",
    category: "footwear",
    price: 10624,
    originalPrice: 12284,
    rating: 4.7,
    reviews: 208,
    isNew: false,
    onSale: true,
    colors: ["Bone", "Black", "Forest"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    stock: 27,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Lightweight runners with cushioned foam midsoles and breathable mesh uppers for all-day wear.",
    features: ["Breathable mesh", "Cushion midsole", "Rubber outsole", "Removable insole"],
  },
  {
    id: 4,
    name: "Leather Strap Watch",
    category: "accessories",
    price: 17430,
    originalPrice: null,
    rating: 4.9,
    reviews: 89,
    isNew: true,
    onSale: false,
    colors: ["Tan", "Black"],
    sizes: ["One Size"],
    stock: 14,
    image:
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Minimal case with sapphire crystal and vegetable-tanned leather strap. Quiet luxury on the wrist.",
    features: ["Sapphire crystal", "40mm case", "Water resistant 5ATM", "Japanese quartz"],
  },
  {
    id: 5,
    name: "Linen Lounge Trousers",
    category: "apparel",
    price: 7138,
    originalPrice: null,
    rating: 4.5,
    reviews: 154,
    isNew: false,
    onSale: false,
    colors: ["Natural", "Slate", "Clay"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 41,
    image:
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Airy linen trousers with a soft drawcord waist. Ideal for warm days and easy evenings.",
    features: ["European linen", "Drawcord waist", "Side pockets", "Relaxed taper"],
  },
  {
    id: 6,
    name: "Ceramic Pour-Over Set",
    category: "home",
    price: 5312,
    originalPrice: 6474,
    rating: 4.8,
    reviews: 97,
    isNew: false,
    onSale: true,
    colors: ["Ivory", "Stone"],
    sizes: ["One Size"],
    stock: 33,
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Hand-glazed ceramic dripper and mug set for a calmer morning ritual.",
    features: ["Stoneware ceramic", "Dishwasher safe", "Includes dripper & mug", "Matte glaze"],
  },
  {
    id: 7,
    name: "Structured Crossbody Bag",
    category: "accessories",
    price: 11786,
    originalPrice: null,
    rating: 4.6,
    reviews: 71,
    isNew: true,
    onSale: false,
    colors: ["Espresso", "Cream", "Forest"],
    sizes: ["One Size"],
    stock: 22,
    image:
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1590874103328-eac38a67437e?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Compact crossbody with organized compartments and adjustable strap for commuting or travel.",
    features: ["Vegan leather", "Magnetic flap", "Interior pocket", "Adjustable strap"],
  },
  {
    id: 8,
    name: "Trail Hiking Boot",
    category: "footwear",
    price: 13944,
    originalPrice: null,
    rating: 4.7,
    reviews: 118,
    isNew: false,
    onSale: false,
    colors: ["Walnut", "Black"],
    sizes: ["7", "8", "9", "10", "11", "12"],
    stock: 19,
    image:
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Rugged yet refined boots with grippy soles and waterproof membrane for weekend escapes.",
    features: ["Waterproof membrane", "Vibram-style sole", "Ankle support", "Quick-lace"],
  },
  {
    id: 9,
    name: "Wool Throw Blanket",
    category: "home",
    price: 8134,
    originalPrice: 9960,
    rating: 4.9,
    reviews: 143,
    isNew: false,
    onSale: true,
    colors: ["Oat", "Graphite", "Moss"],
    sizes: ["One Size"],
    stock: 26,
    image:
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Heavyweight wool throw with a soft brushed finish. Anchors sofas and reading nooks.",
    features: ["80% wool / 20% cotton", "Fringed edges", "130 Ã— 180 cm", "Dry clean"],
  },
  {
    id: 10,
    name: "Ribbed Knit Beanie",
    category: "accessories",
    price: 2656,
    originalPrice: null,
    rating: 4.4,
    reviews: 201,
    isNew: false,
    onSale: false,
    colors: ["Ink", "Camel", "Forest"],
    sizes: ["One Size"],
    stock: 80,
    image:
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Fine-gauge ribbed beanie that sits neatly without bulk. A cold-weather staple.",
    features: ["Merino blend", "Double layer cuff", "Unisex fit", "Hand wash"],
  },
  {
    id: 11,
    name: "Relaxed Denim Jacket",
    category: "apparel",
    price: 9794,
    originalPrice: null,
    rating: 4.6,
    reviews: 167,
    isNew: true,
    onSale: false,
    colors: ["Indigo", "Washed Black"],
    sizes: ["XS", "S", "M", "L", "XL"],
    stock: 35,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Broken-in denim jacket with a soft wash and roomy shoulders for layering.",
    features: ["Organic denim", "Metal hardware", "Chest pockets", "Relaxed fit"],
  },
  {
    id: 12,
    name: "Sculptural Table Lamp",
    category: "home",
    price: 12948,
    originalPrice: null,
    rating: 4.8,
    reviews: 54,
    isNew: true,
    onSale: false,
    colors: ["Cream", "Terracotta"],
    sizes: ["One Size"],
    stock: 12,
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
    images: [
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80",
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80",
    ],
    description:
      "Soft ceramic base with linen shade. Diffused light for desks and nightstands.",
    features: ["Ceramic base", "Linen shade", "E27 bulb compatible", "Inline switch"],
  },
];

export const faqs = [
  {
    q: "How long does shipping take?",
    a: "Standard orders ship within 1â€“2 business days and typically arrive in 3â€“7 days depending on your location.",
  },
  {
    q: "What is your return policy?",
    a: "Unworn items can be returned within 30 days of delivery. Start a return from your account orders page.",
  },
  {
    q: "Do you ship internationally?",
    a: "Yes. International shipping is available to most countries. Duties and taxes may apply at delivery.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, youâ€™ll receive an email with a tracking link. You can also view status in Account â†’ Orders.",
  },
];
