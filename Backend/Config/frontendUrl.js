const PRODUCTION_FRONTEND = "https://ecommerce-web-g35m.vercel.app";

export function resolveFrontendOrigin() {
  const configured = String(process.env.FRONTEND_URL || "")
    .trim()
    .replace(/\/+$/, "");
  const isLocal = !configured || /localhost|127\.0\.0\.1/i.test(configured);
  if (process.env.VERCEL && isLocal) return PRODUCTION_FRONTEND;
  return configured || "http://localhost:5173";
}

export const productionFrontendOrigin = PRODUCTION_FRONTEND;
