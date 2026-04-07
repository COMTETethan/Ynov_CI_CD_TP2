export function calculateDeliveryFee(distance, weight) {
  if (typeof distance !== "number" || typeof weight !== "number") return null;
  if (distance > 10) return null;
  let fee = 2 + distance * 0.2 + weight * 0.5;
  return Math.round(fee * 100) / 100;
}

export function calculateSurge(hour, dayOfWeek) {
  if (typeof hour !== "number" || typeof dayOfWeek !== "number") return 1.0;
  // Vendredi soir 20h-22h : surge 1.8
  if (dayOfWeek === 5 && hour >= 20 && hour <= 22) return 1.8;
  // Samedi soir 19h-22h : surge 1.5
  if (dayOfWeek === 6 && hour >= 19 && hour <= 22) return 1.5;
  // Fermé la nuit
  if (hour < 11 || hour > 22) return 0;
  return 1.0;
}
