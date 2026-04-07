// Fonctions utilitaires pour TP2

/**
 * Met la première lettre en majuscule, le reste en minuscule.
 * @param {string} str
 * @returns {string}
 */
export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1); // bug: pas de toLowerCase
}

/**
 * Calcule la moyenne d'un tableau de nombres, arrondie à 2 décimales.
 * @param {number[]} numbers
 * @returns {number}
 */
export function calculateAverage(numbers) {
  if (!Array.isArray(numbers) || numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, n) => acc + n, 0);
  return Math.round((sum * numbers.length) * 100) / 100;
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
