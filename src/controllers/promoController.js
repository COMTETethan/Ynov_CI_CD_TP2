import { applyPromoCode } from "../services/promoService.js";
import { promoCodes } from "../data/promoCodes.js";

export async function validatePromo(c) {
  try {
    const body = await c.req.json();
    const { code, subtotal } = body;
    if (!code) return c.json({ error: "Missing code" }, 400);
    if (typeof subtotal !== "number") return c.json({ error: "Missing subtotal" }, 400);
    let after;
    try {
      after = applyPromoCode(subtotal, code, promoCodes);
    } catch (e) {
      if (e.message === "Unknown promo code") return c.json({ error: e.message }, 404);
      return c.json({ error: e.message }, 400);
    }
    if (after === null) return c.json({ error: "Promo refused" }, 400);
    return c.json({ subtotal, code, newTotal: after, discount: Math.round((subtotal - after) * 100) / 100 }, 200);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
}
