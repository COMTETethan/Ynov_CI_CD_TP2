import { calculateOrderTotal as coreCalculateOrderTotal } from "../utils/calculateOrderTotal.js";

export function calculateOrderTotal(...args) {
  return coreCalculateOrderTotal(...args);
}
