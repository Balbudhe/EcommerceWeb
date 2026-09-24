export const blogs = [
  {
    slug: "create-a-sacred-corner-why-our-teakwood-mandir",
    title: "Create a Sacred Corner: Why Our Teakwood Mandir Belongs in Your Home",
    date: "June 2, 2025",
    excerpt:
      "In a world that moves fast and feels cluttered, finding a peaceful moment — or a peaceful corner — can be rare. That’s exactly why we created our Teakwood Mandir.",
    content: [
      "In a world that moves fast and feels cluttered, finding a peaceful moment — or a peaceful corner — can be rare. That’s exactly why we created our Teakwood Mandir: to give your home a still point. A place that is yours, even on the busiest days.",
      "A home mandir is more than furniture. It is a daily invitation to pause. Light a diya, sit for a few minutes, and let the grain of aged teak and the pattern of jali work hold the room in quiet. Each Artiqulate mandir is handmade from ethically sourced Indian teakwood by artisans who understand both craft and devotion.",
      "Whether you choose hanging bells, a designer shutter, or an open jali facade, the piece is designed for modern living: compact enough for apartments, substantial enough to feel sacred. Place it where morning light falls, keep it simple, and let the wood do the rest.",
      "One purchase also plants one tree. So the corner you create at home reaches a little further — toward a greener, happier planet.",
    ],
  },
  {
    slug: "organizing-made-beautiful-how-our-wooden-racks",
    title: "Organizing Made Beautiful: How Our Wooden Racks Change Everyday Spaces",
    date: "June 2, 2025",
    excerpt:
      "Let’s be honest — most of us want to be “organized people.” You know, the ones whose kitchens look like Pinterest boards, bathrooms feel like mini spas, and desks are always clutter-free.",
    content: [
      "Let’s be honest — most of us want to be “organized people.” You know, the ones whose kitchens look like Pinterest boards, bathrooms feel like mini spas, and desks are always clutter-free. The gap is rarely willpower. It is having pieces that make order feel natural.",
      "Our teak wood multi-purpose racks are built for that gap. Two shelves or more, warm grain, and a footprint that works in a kitchen, pooja room, balcony, or study. Because they are handmade from premium teak, they don’t look like storage — they look like furniture you meant to live with.",
      "Start with one rack where clutter gathers most. Give every object a home. The rest of the room often follows. That is organizing made beautiful: not more boxes, but better wood, better proportions, and a daily habit that finally sticks.",
    ],
  },
  {
    slug: "smart-living-stylish-space-saving-furniture",
    title: "Smart Living: Stylish Space-Saving Furniture for Modern Homes",
    date: "June 2, 2025",
    excerpt:
      "Do you recognize the gorgeous interiors on Pinterest? The ones with crisp lines, warm wood tones, and everything fitting together like magic? It turns out that you can have that.",
    content: [
      "Do you recognize the gorgeous interiors on Pinterest? The ones with crisp lines, warm wood tones, and everything fitting together like magic? It turns out that you can have that — even in a compact Indian apartment — if the furniture is designed to fold, stack, and serve more than one role.",
      "Artiqulate folding tables, bed tables, stools, and chairs are made from solid teak so they stay handsome when open and disappear when you need the floor. Space-saving should never mean flimsy. Our pieces are built for guests, work-from-home days, and evening tea on the balcony.",
      "Smart living is not buying less life. It is choosing furniture that adapts as your day changes — inspired by tradition, made with love, and designed for easy functionality.",
    ],
  },
  {
    slug: "why-teakwood-tables-are-the-heart-of-every-home",
    title: "Why Teakwood Tables are the Heart of every Considered Home",
    date: "June 2, 2025",
    excerpt:
      "Let’s be real — when it comes to furniture, most of us are looking for more than just aesthetics. We want pieces that feel like us — practical, intentional, low-maintenance.",
    content: [
      "Let’s be real — when it comes to furniture, most of us are looking for more than just aesthetics. We want pieces that feel like us — practical, intentional, low-maintenance (because who has time for fussy finishes?), and warm enough to gather around.",
      "A teakwood table earns that place. Side table, folding dining top, antique low table, or large outdoor fold — teak is moisture resistant, pest and rot resistant, and grows more character with years of use. That is why tables sit at the heart of a considered home: they hold meals, lamps, books, and conversation.",
      "Every Artiqulate table is 100% handmade from ethically sourced original teakwood. Crafted with care and precision, it is furniture you will still want in ten years — not a trend you replace next season.",
    ],
  },
];

export function getBlog(slug) {
  return blogs.find((post) => post.slug === slug) || null;
}
