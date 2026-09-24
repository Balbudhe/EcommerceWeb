/** Format amount as Indian Rupees (₹1,999) */
export function formatPrice(amount) {
  const value = Number(amount) || 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function salePercent(product) {
  const price = Number(product?.price) || 0;
  const original = Number(product?.originalPrice) || 0;
  if (original > price && price >= 0) {
    return Math.max(1, Math.round(((original - price) / original) * 100));
  }
  return 0;
}
