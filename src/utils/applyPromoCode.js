export function applyPromoCode(subtotal, code, promoCodes) {
  const promo = promoCodes.find((p) => p.code === code);
  if (!promo) throw new Error("Unknown promo code");
  const now = new Date();
  if (promo.expiresAt && new Date(promo.expiresAt) < now) return null;
  if (subtotal < promo.minOrder) return null;
  if (promo.type === "percentage") {
    return Math.round((subtotal * (1 - promo.value / 100)) * 100) / 100;
  }
  if (promo.type === "fixed") {
    return Math.max(0, Math.round((subtotal - promo.value) * 100) / 100);
  }
  throw new Error("Invalid promo type");
}
