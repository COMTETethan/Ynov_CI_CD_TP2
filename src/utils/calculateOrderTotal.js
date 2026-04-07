import { applyPromoCode } from "./applyPromoCode.js";
import { calculateDeliveryFee, calculateSurge } from "./delivery.js";

export function calculateOrderTotal(
  items,
  distance,
  weight,
  promoCode,
  hour,
  dayOfWeek,
  promoCodes,
) {
  if (!Array.isArray(items) || items.length === 0)
    throw new Error("Empty cart");
  let subtotal = 0;
  for (const item of items) {
    if (!item || typeof item.price !== "number" || typeof item.quantity !== "number")
      throw new Error("Invalid item");
    if (item.price < 0) throw new Error("Negative price");
    if (item.quantity < 0) throw new Error("Negative quantity");
    if (item.quantity === 0) continue;
    subtotal += item.price * item.quantity;
  }
  subtotal = Math.round(subtotal * 100) / 100;
  let discount = 0;
  let subtotalAfterDiscount = subtotal;
  if (promoCode) {
    if (!promoCodes) throw new Error("promoCodes required");
    const after = applyPromoCode(subtotal, promoCode, promoCodes);
    if (after === null) throw new Error("Promo refused");
    discount = Math.round((subtotal - after) * 100) / 100;
    subtotalAfterDiscount = after;
  }
  const deliveryFee = calculateDeliveryFee(distance, weight);
  if (deliveryFee === null) throw new Error("Delivery not available");
  const surge = calculateSurge(hour, dayOfWeek);
  if (surge === 0) throw new Error("Closed");
  const deliveryWithSurge = Math.round(deliveryFee * surge * 100) / 100;
  const total = Math.round((subtotalAfterDiscount + deliveryWithSurge) * 100) / 100;
  return {
    subtotal,
    discount,
    deliveryFee: deliveryWithSurge,
    surge,
    total,
  };
}
