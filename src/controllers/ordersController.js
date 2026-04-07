import { calculateOrderTotal } from "../services/orderService.js";
import { promoCodes } from "../data/promoCodes.js";
import { orders, nextId } from "../data/orders.js";

export async function simulateOrder(c) {
  try {
    const body = await c.req.json();
    const { items, distance, weight, promoCode, hour, dayOfWeek } = body;
    const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, promoCodes);
    return c.json(result, 200);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
}

export async function createOrder(c) {
  try {
    const body = await c.req.json();
    const { items, distance, weight, promoCode, hour, dayOfWeek } = body;
    const result = calculateOrderTotal(items, distance, weight, promoCode, hour, dayOfWeek, promoCodes);
    if (!items || !Array.isArray(items) || items.length === 0 || result.total <= 0) {
      return c.json({ error: "Commande invalide" }, 400);
    }
    let id = nextId.value;
    while (orders.some(o => o.id === id)) {
      id++;
    }
    const order = { id, ...body, ...result };
    orders.push(order);
    nextId.value = id + 1;
    return c.json(order, 201);
  } catch (e) {
    return c.json({ error: e.message }, 400);
  }
}

export function getOrderById(c) {
  const id = Number(c.req.param("id"));
  const order = orders.find(o => o.id === id);
  if (!order) return c.json({ error: "Order not found" }, 404);
  return c.json(order, 200);
}
