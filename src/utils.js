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
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Calcule la moyenne d'un tableau de nombres, arrondie à 2 décimales.
 * @param {number[]} numbers
 * @returns {number}
 */
export function calculateAverage(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum / numbers.length) * 100) / 100;
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
  return Math.max(min, Math.min(max, value));
}
