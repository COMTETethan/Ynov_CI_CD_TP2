// B1 : calculateSurge
/**
 * Calcule le multiplicateur de prix selon l'heure et le jour.
 * @param {number} hour - Heure décimale (ex: 14.5 pour 14h30)
 * @param {number} dayOfWeek - 0=dimanche, 1=lundi, ..., 6=samedi
 * @returns {number} Le multiplicateur (0 si fermé)
 */
export function calculateSurge(hour, dayOfWeek) {
  if (typeof hour !== 'number' || typeof dayOfWeek !== 'number' || isNaN(hour) || isNaN(dayOfWeek)) throw new Error('Invalid input');
  if (hour < 0 || hour >= 24 || dayOfWeek < 0 || dayOfWeek > 6) throw new Error('Invalid hour or day');
  // Fermé avant 10h ou après 22h
  if (hour < 10 || hour >= 22) return 0;
  // Dimanche
  if (dayOfWeek === 0) return 1.2;
  // Vendredi (5) ou samedi (6) soir 19h-22h
  if ((dayOfWeek === 5 || dayOfWeek === 6) && hour >= 19 && hour < 22) return 1.8;
  // Lundi-jeudi (1-4)
  if (dayOfWeek >= 1 && dayOfWeek <= 4) {
    // Déjeuner 12h-13h30
    if (hour >= 12 && hour < 13.5) return 1.3;
    // Diner 19h-21h
    if (hour >= 19 && hour < 21) return 1.5;
    // Normal 10h-11h30 ou 14h-18h
    if ((hour >= 10 && hour < 11.5) || (hour >= 14 && hour < 18)) return 1.0;
    // Sinon, normal (autres créneaux ouverts)
    return 1.0;
  }
  // Sinon, normal
  return 1.0;
}
// B1 : applyPromoCode
/**
 * Applique un code promo au sous-total.
 * @param {number} subtotal
 * @param {string|null} promoCode
 * @param {Array} promoCodes
 * @param {string} [today] - Optionnel, pour tests (YYYY-MM-DD)
 * @returns {number} Le total après réduction, ou subtotal si pas de code, ou null si refusé
 */
export function applyPromoCode(subtotal, promoCode, promoCodes, today) {
  if (typeof subtotal !== 'number' || isNaN(subtotal)) throw new Error('Invalid subtotal');
  if (subtotal < 0) throw new Error('Subtotal cannot be negative');
  if (!promoCode || typeof promoCode !== 'string' || promoCode.trim() === '') return subtotal;
  if (!Array.isArray(promoCodes)) throw new Error('promoCodes must be an array');
  const codeObj = promoCodes.find(c => c.code === promoCode);
  if (!codeObj) throw new Error('Unknown promo code');
  // Cas particulier : si subtotal = 0, minOrder = 0, la promo s'applique
  if (subtotal === 0) {
    // Si le sous-total est 0, la réduction s'applique toujours (résultat 0)
  } else if (typeof codeObj.minOrder === 'number' && subtotal < codeObj.minOrder) {
    return null;
  }
  // Date d'expiration
  const now = today || new Date().toISOString().slice(0, 10);
  if (codeObj.expiresAt && now > codeObj.expiresAt) return null;
  let total = subtotal;
  if (codeObj.type === 'percentage') {
    total -= subtotal * (codeObj.value / 100);
  } else if (codeObj.type === 'fixed') {
    total -= codeObj.value;
  } else {
    throw new Error('Unknown promo type');
  }
  if (total < 0) total = 0;
  return Math.round(total * 100) / 100;
}
// B1 : calculateDeliveryFee
export function calculateDeliveryFee(distance, weight) {
  if (typeof distance !== 'number' || typeof weight !== 'number' || isNaN(distance) || isNaN(weight)) throw new Error('Invalid input');
  if (distance < 0 || weight < 0) throw new Error('Negative values not allowed');
  if (distance > 10) return null;
  let fee = 2.00;
  if (distance > 3) fee += (distance - 3) * 0.5;
  if (weight > 5) fee += 1.5;
  return Math.round(fee * 100) / 100;
}
// A7 : calculateDiscount
export function calculateDiscount(price, discountRules) {
  if (typeof price !== 'number' || price < 0 || !Array.isArray(discountRules)) throw new Error('Invalid input');
  let result = price;
  for (const rule of discountRules) {
    if (rule.type === 'percentage') {
      result -= (result * (rule.value / 100));
    } else if (rule.type === 'fixed') {
      result -= rule.value;
    } else if (rule.type === 'buyXgetY') {
      if (typeof rule.buy !== 'number' || typeof rule.free !== 'number' || typeof rule.itemPrice !== 'number') throw new Error('Invalid buyXgetY');
      // Suppose le prix = quantité * itemPrice
      const qty = Math.floor(result / rule.itemPrice);
      const freeItems = Math.floor(qty / (rule.buy + rule.free)) * rule.free;
      result -= freeItems * rule.itemPrice;
    } else {
      throw new Error('Unknown rule');
    }
    if (result < 0) result = 0;
  }
  return Math.max(0, Math.round(result * 100) / 100);
}
// A6 : groupBy
export function groupBy(array, key) {
  if (!Array.isArray(array) || !key) return {};
  return array.reduce((acc, obj) => {
    const val = obj[key];
    if (!acc[val]) acc[val] = [];
    acc[val].push(obj);
    return acc;
  }, {});
}
// A5 : parsePrice
export function parsePrice(input) {
  if (input === null || input === undefined) return null;
  if (typeof input === 'number') return input >= 0 ? input : null;
  if (typeof input === 'string') {
    const str = input.trim().toLowerCase();
    if (str === 'gratuit') return 0;
    let cleaned = str.replace(/€/g, '').replace(/ /g, '').replace(',', '.');
    if (/^-?\d+(\.\d+)?$/.test(cleaned)) {
      const num = parseFloat(cleaned);
      return num >= 0 ? num : null;
    }
    return null;
  }
  return null;
}
// TDD: Fonction de tri des étudiants
export function sortStudents(students, sortBy, order = 'asc') {
  if (!Array.isArray(students) || students.length === 0) return [];
  let sorted;
  if (sortBy === 'grade') {
    sorted = students.slice().sort((a, b) => a.grade - b.grade);
  } else if (sortBy === 'name') {
    sorted = students.slice().sort((a, b) => a.name.localeCompare(b.name));
  } else if (sortBy === 'age') {
    sorted = students.slice().sort((a, b) => a.age - b.age);
  } else {
    sorted = students.slice();
  }
  return order === 'desc' ? sorted.reverse() : sorted;
}
// Fonctions utilitaires pour TP2

/**
 * Met la première lettre en majuscule, le reste en minuscule.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (typeof str !== 'string' || !str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Calcule la moyenne d'un tableau de nombres, arrondie à 2 décimales.
 * @param {number[]} numbers
 * @returns {number}
 */
export function calculateAverage(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const valid = numbers.filter(n => typeof n === 'number' && !isNaN(n));
  if (valid.length === 0) return 0;
  const sum = valid.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / valid.length) * 100) / 100;
}

/**
 * Transforme un texte en slug URL.
 * @param {string} text
 * @returns {string}
 */
export function slugify(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Limite une valeur entre un minimum et un maximum.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
export function clamp(value, min, max) {
  if (typeof value !== 'number' || isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}
