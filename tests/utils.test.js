describe('calculateOrderTotal', () => {
  const promoCodes = [
    { code: 'PROMO20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2026-12-31' },
    { code: 'FIXE5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2026-12-31' },
  ];
  const items = [
    { name: 'Pizza', price: 12.5, quantity: 2 },
    { name: 'Soda', price: 3, quantity: 1 }
  ];

  // Scénario complet
  it('2 pizzas à 12.50€ + 5km + mardi 15h', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 12.5, quantity: 2 }
    ], 5, 1, null, 15, 2, promoCodes);
    expect(res.subtotal).toBe(25);
    expect(res.discount).toBe(0);
    expect(res.surge).toBe(1.0);
    expect(res.deliveryFee).toBe(3);
    expect(res.total).toBe(28);
  });
  it('Même commande avec code promo 20%', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 12.5, quantity: 2 }
    ], 5, 1, 'PROMO20', 15, 2, promoCodes);
    expect(res.subtotal).toBe(25);
    expect(res.discount).toBe(5);
    expect(res.surge).toBe(1.0);
    expect(res.deliveryFee).toBe(3);
    expect(res.total).toBe(23);
  });
  it('Même commande vendredi 20h (surge 1.8)', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 12.5, quantity: 2 }
    ], 5, 1, null, 20, 5, promoCodes);
    expect(res.subtotal).toBe(25);
    expect(res.discount).toBe(0);
    expect(res.surge).toBe(1.8);
    expect(res.deliveryFee).toBe(5.4);
    expect(res.total).toBe(30.4);
  });
  it('Vérifie que le surge ne s’applique qu’à la livraison', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 3, 1, null, 20, 5, promoCodes);
    // Livraison de base = 2€, surge 1.8 => 3.6
    expect(res.deliveryFee).toBe(3.6);
    expect(res.total).toBe(13.6);
  });
  it('Vérifie que subtotal + deliveryFee = total sans promo', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 3, 1, null, 15, 2, promoCodes);
    expect(res.total).toBe(res.subtotal + res.deliveryFee);
  });
  it('Vérifie que l’objet retourné contient toutes les clés', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 3, 1, null, 15, 2, promoCodes);
    expect(res).toHaveProperty('subtotal');
    expect(res).toHaveProperty('discount');
    expect(res).toHaveProperty('deliveryFee');
    expect(res).toHaveProperty('surge');
    expect(res).toHaveProperty('total');
  });

  // Cas qui cassent
  it('Panier vide → erreur', () => {
    expect(() => calculateOrderTotal([], 5, 1, null, 15, 2, promoCodes)).toThrow();
  });
  it('Item avec quantity = 0 → ignoré', () => {
    const res = calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 0 },
      { name: 'Soda', price: 3, quantity: 1 }
    ], 3, 1, null, 15, 2, promoCodes);
    expect(res.subtotal).toBe(3);
    expect(res.total).toBe(5);
  });
  it('Item avec prix négatif → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: -10, quantity: 1 }
    ], 3, 1, null, 15, 2, promoCodes)).toThrow();
  });
  it('Commande à 23h (fermé) → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 3, 1, null, 23, 2, promoCodes)).toThrow();
  });
  it('Distance 15 km (hors zone) → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 15, 1, null, 15, 2, promoCodes)).toThrow();
  });
  it('Promo refusée (minOrder non atteint) → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 5, quantity: 1 }
    ], 3, 1, 'PROMO20', 15, 2, promoCodes)).toThrow();
  });
  it('Promo inconnue → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: 1 }
    ], 3, 1, 'INCONNU', 15, 2, promoCodes)).toThrow();
  });
  it('Quantité négative → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 10, quantity: -1 }
    ], 3, 1, null, 15, 2, promoCodes)).toThrow();
  });
  it('Item sans price ou quantity → erreur', () => {
    expect(() => calculateOrderTotal([
      { name: 'Pizza', price: 10 }
    ], 3, 1, null, 15, 2, promoCodes)).toThrow();
    expect(() => calculateOrderTotal([
      { name: 'Pizza', quantity: 1 }
    ], 3, 1, null, 15, 2, promoCodes)).toThrow();
  });
});
describe('calculateSurge', () => {
  it('Mardi 15h → 1.0 (normal)', () => {
    expect(calculateSurge(15, 2)).toBe(1.0); // mardi
  });
  it('Mercredi 12h30 → 1.3 (dejeuner)', () => {
    expect(calculateSurge(12.5, 3)).toBe(1.3); // mercredi
  });
  it('Jeudi 20h → 1.5 (diner)', () => {
    expect(calculateSurge(20, 4)).toBe(1.5); // jeudi
  });
  it('Vendredi 21h → 1.8 (weekend soir)', () => {
    expect(calculateSurge(21, 5)).toBe(1.8); // vendredi
  });
  it('Samedi 19h → 1.8 (weekend soir)', () => {
    expect(calculateSurge(19, 6)).toBe(1.8); // samedi
  });
  it('Dimanche 14h → 1.2 (dimanche)', () => {
    expect(calculateSurge(14, 0)).toBe(1.2);
  });

  it('Jeudi 11h30 pile → 1.0 (normal)', () => {
    expect(calculateSurge(11.5, 4)).toBe(1.0);
  });
  it('Lundi 12h → 1.3 (dejeuner)', () => {
    expect(calculateSurge(12, 1)).toBe(1.3);
  });
  it('Mardi 13h29 → 1.3 (dejeuner)', () => {
    expect(calculateSurge(13.49, 2)).toBe(1.3);
  });
  it('Mardi 13h30 pile → 1.0 (normal)', () => {
    expect(calculateSurge(13.5, 2)).toBe(1.0);
  });
  it('Jeudi 19h00 pile → 1.5 (diner)', () => {
    expect(calculateSurge(19, 4)).toBe(1.5);
  });
  it('Vendredi 22h00 pile → 0 (fermé)', () => {
    expect(calculateSurge(22, 5)).toBe(0);
  });
  it('Samedi 9h59 → 0 (fermé)', () => {
    expect(calculateSurge(9.99, 6)).toBe(0);
  });
  it('Samedi 10h00 → 1.0 (normal)', () => {
    expect(calculateSurge(10, 6)).toBe(1.0);
  });

  it('Heure négative → erreur', () => {
    expect(() => calculateSurge(-1, 2)).toThrow();
  });
  it('Jour hors plage → erreur', () => {
    expect(() => calculateSurge(12, 7)).toThrow();
  });
  it('Heure >= 24 → erreur', () => {
    expect(() => calculateSurge(24, 2)).toThrow();
  });
  it('Entrée non numérique → erreur', () => {
    expect(() => calculateSurge('12', 2)).toThrow();
    expect(() => calculateSurge(12, '2')).toThrow();
  });
});
describe('applyPromoCode', () => {
  const promoCodes = [
    { code: 'BIENVENUE20', type: 'percentage', value: 20, minOrder: 15.00, expiresAt: '2026-12-31' },
    { code: 'FIXE5', type: 'fixed', value: 5, minOrder: 10.00, expiresAt: '2026-12-31' },
    { code: 'BIG10', type: 'fixed', value: 10, minOrder: 0, expiresAt: '2026-12-31' },
    { code: 'FULL100', type: 'percentage', value: 100, minOrder: 0, expiresAt: '2026-12-31' },
    { code: 'TODAY', type: 'fixed', value: 5, minOrder: 0, expiresAt: '2026-04-07' },
    { code: 'EXPIRE', type: 'fixed', value: 5, minOrder: 0, expiresAt: '2026-04-06' },
  ];

  it('applique un code percentage 20% sur 50€', () => {
    expect(applyPromoCode(50, 'BIENVENUE20', promoCodes, '2026-04-07')).toBe(40);
  });
  it('applique un code fixed 5€ sur 30€', () => {
    expect(applyPromoCode(30, 'FIXE5', promoCodes, '2026-04-07')).toBe(25);
  });
  it('code valide avec minOrder respecté', () => {
    expect(applyPromoCode(20, 'FIXE5', promoCodes, '2026-04-07')).toBe(15);
  });

  it('refuse un code expiré (date passée)', () => {
    expect(applyPromoCode(30, 'EXPIRE', promoCodes, '2026-04-07')).toBeNull();
  });
  it('refuse si commande sous le minOrder', () => {
    expect(applyPromoCode(5, 'FIXE5', promoCodes, '2026-04-07')).toBeNull();
  });
  it('erreur si code inconnu', () => {
    expect(() => applyPromoCode(30, 'INCONNU', promoCodes, '2026-04-07')).toThrow();
  });

  it('total ne descend pas sous 0 avec fixed', () => {
    expect(applyPromoCode(5, 'BIG10', promoCodes, '2026-04-07')).toBe(0);
  });
  it('total ne descend pas sous 0 avec percentage 100%', () => {
    expect(applyPromoCode(50, 'FULL100', promoCodes, '2026-04-07')).toBe(0);
  });
  it('subtotal = 0, code fixed', () => {
    expect(applyPromoCode(0, 'FIXE5', promoCodes, '2026-04-07')).toBe(0);
  });
  it('subtotal = 0, code percentage', () => {
    expect(applyPromoCode(0, 'BIENVENUE20', promoCodes, '2026-04-07')).toBe(0);
  });
  it('code expire aujourd\'hui est accepté', () => {
    expect(applyPromoCode(20, 'TODAY', promoCodes, '2026-04-07')).toBe(15);
  });

  it('promoCode null → pas de réduction', () => {
    expect(applyPromoCode(50, null, promoCodes, '2026-04-07')).toBe(50);
  });
  it('promoCode vide → pas de réduction', () => {
    expect(applyPromoCode(50, '', promoCodes, '2026-04-07')).toBe(50);
  });
  it('subtotal négatif → erreur', () => {
    expect(() => applyPromoCode(-10, 'FIXE5', promoCodes, '2026-04-07')).toThrow();
  });
  it('promoCodes non array → erreur', () => {
    expect(() => applyPromoCode(50, 'FIXE5', null, '2026-04-07')).toThrow();
  });
});
describe('calculateDeliveryFee', () => {
  it('should return 2.00 for 2km, 1kg', () => {
    expect(calculateDeliveryFee(2, 1)).toBe(2.00);
  });
  it('should return 4.00 for 7km, 3kg', () => {
    // 2.00 + (7-3)*0.5 = 4.00
    expect(calculateDeliveryFee(7, 3)).toBe(4.00);
  });
  it('should return 4.50 for 5km, 8kg (lourd)', () => {
    // 2.00 + (5-3)*0.5 + 1.5 = 4.50
    expect(calculateDeliveryFee(5, 8)).toBe(4.50);
  });
  it('should return 2.00 for 1km, 1kg', () => {
    expect(calculateDeliveryFee(1, 1)).toBe(2.00);
  });
  it('should return 2.00 for 3km, 2kg', () => {
    expect(calculateDeliveryFee(3, 2)).toBe(2.00);
  });

  it('should return 2.00 for exactly 3km, 1kg', () => {
    expect(calculateDeliveryFee(3, 1)).toBe(2.00);
  });
  it('should return 5.50 for exactly 10km, 5kg', () => {
    // 2.00 + (10-3)*0.5 = 5.50
    expect(calculateDeliveryFee(10, 5)).toBe(5.50);
  });
  it('should return 3.50 for 6km, 2kg', () => {
    // 2.00 + (6-3)*0.5 = 3.50
    expect(calculateDeliveryFee(6, 2)).toBe(3.50);
  });
  it('should return 7.00 for 10km, 6kg', () => {
    // 2.00 + (10-3)*0.5 + 1.5 = 7.00
    expect(calculateDeliveryFee(10, 6)).toBe(7.00);
  });
  it('should return 3.50 for 5.0km, 5.0kg', () => {
    // 2.00 + (5-3)*0.5 = 3.00 (no supplement)
    expect(calculateDeliveryFee(5, 5)).toBe(3.00);
  });
  it('should return 4.50 for 5.0km, 5.1kg', () => {
    // 2.00 + (5-3)*0.5 + 1.5 = 4.50 (supplement)
    expect(calculateDeliveryFee(5, 5.1)).toBe(4.50);
  });
  it('should return 2.00 for distance = 0', () => {
    expect(calculateDeliveryFee(0, 1)).toBe(2.00);
  });

  it('should return null for >10km', () => {
    expect(calculateDeliveryFee(15, 2)).toBeNull();
  });
  it('should throw for negative distance', () => {
    expect(() => calculateDeliveryFee(-1, 2)).toThrow();
  });
  it('should throw for negative weight', () => {
    expect(() => calculateDeliveryFee(2, -1)).toThrow();
  });
  it('should throw for NaN distance', () => {
    expect(() => calculateDeliveryFee(NaN, 2)).toThrow();
  });
  it('should throw for NaN weight', () => {
    expect(() => calculateDeliveryFee(2, NaN)).toThrow();
  });
  it('should throw for non-number distance', () => {
    expect(() => calculateDeliveryFee("a", 2)).toThrow();
  });
  it('should throw for non-number weight', () => {
    expect(() => calculateDeliveryFee(2, "b")).toThrow();
  });

  it('should return 3.50 for 6km, 2kg (calcul précis)', () => {
    expect(calculateDeliveryFee(6, 2)).toBe(3.50);
  });
  it('should return 7.00 for 10km, 6kg (calcul précis)', () => {
    expect(calculateDeliveryFee(10, 6)).toBe(7.00);
  });
  it('should return 2.00 for 3km, 5kg', () => {
    expect(calculateDeliveryFee(3, 5)).toBe(2.00);
  });
  it('should return 3.00 for 5km, 5kg', () => {
    expect(calculateDeliveryFee(5, 5)).toBe(3.00);
  });
  it('should return 4.50 for 5km, 6kg', () => {
    expect(calculateDeliveryFee(5, 6)).toBe(4.50);
  });
  it('should return 2.00 for 0km, 0kg', () => {
    expect(calculateDeliveryFee(0, 0)).toBe(2.00);
  });
});
describe('calculateDiscount', () => {
  it('should apply percentage discount', () => {
    const rules = [{ type: 'percentage', value: 10 }];
    expect(calculateDiscount(100, rules)).toBe(90);
  });
  it('should apply fixed discount', () => {
    const rules = [{ type: 'fixed', value: 5 }];
    expect(calculateDiscount(50, rules)).toBe(45);
  });
  it('should apply multiple discounts in order', () => {
    const rules = [
      { type: 'percentage', value: 10 },
      { type: 'fixed', value: 5 },
    ];
    expect(calculateDiscount(100, rules)).toBe(85);
  });
  it('should not go below zero', () => {
    const rules = [{ type: 'fixed', value: 200 }];
    expect(calculateDiscount(100, rules)).toBe(0);
  });
  it('should handle buyXgetY', () => {
    const rules = [
      { type: 'buyXgetY', buy: 3, free: 1, itemPrice: 10 },
    ];
    expect(calculateDiscount(40, rules)).toBe(30);
  });
  it('should return error for invalid input', () => {
    expect(() => calculateDiscount(null, null)).toThrow();
    expect(() => calculateDiscount(100, [{ type: 'unknown' }])).toThrow();
  });
});
describe('groupBy', () => {
    it('should return empty object for empty array', () => {
      expect(groupBy([], 'role')).toEqual({});
    });
    it('should return empty object for null input', () => {
      expect(groupBy(null, 'role')).toEqual({});
    });
    it('should handle missing key', () => {
      const arr = [
        { name: 'Alice', role: 'dev' },
        { name: 'Bob' },
      ];
      expect(groupBy(arr, 'role')).toEqual({
        dev: [{ name: 'Alice', role: 'dev' }],
        undefined: [{ name: 'Bob' }],
      });
    });
    it('should handle one group', () => {
      const arr = [
        { name: 'Alice', role: 'dev' },
        { name: 'Charlie', role: 'dev' },
      ];
      expect(groupBy(arr, 'role')).toEqual({
        dev: [
          { name: 'Alice', role: 'dev' },
          { name: 'Charlie', role: 'dev' },
        ],
      });
    });
  it('should group objects by key', () => {
    const arr = [
      { name: 'Alice', role: 'dev' },
      { name: 'Bob', role: 'design' },
      { name: 'Charlie', role: 'dev' },
    ];
    expect(groupBy(arr, 'role')).toEqual({
      dev: [
        { name: 'Alice', role: 'dev' },
        { name: 'Charlie', role: 'dev' },
      ],
      design: [
        { name: 'Bob', role: 'design' },
      ],
    });
  });
});
describe('parsePrice', () => {
  it('should parse valid price strings', () => {
    expect(parsePrice('12.99')).toBe(12.99);
    expect(parsePrice('12,99')).toBe(12.99);
    expect(parsePrice('12.99 €')).toBe(12.99);
    expect(parsePrice('€12.99')).toBe(12.99);
    expect(parsePrice(12.99)).toBe(12.99);
  });
  it('should parse gratuit as 0', () => {
    expect(parsePrice('gratuit')).toBe(0);
  });
  it('should return null for invalid or negative', () => {
    expect(parsePrice('abc')).toBeNull();
    expect(parsePrice('-5.00')).toBeNull();
    expect(parsePrice(null)).toBeNull();
  });
});
describe('sortStudents', () => {
                it('should default to ascending order', () => {
                  const students = [
                    { name: 'Alice', grade: 15, age: 20 },
                    { name: 'Bob', grade: 12, age: 22 },
                    { name: 'Charlie', grade: 18, age: 19 },
                  ];
                  const sorted = sortStudents(students, 'grade');
                  expect(sorted).toEqual([
                    { name: 'Bob', grade: 12, age: 22 },
                    { name: 'Alice', grade: 15, age: 20 },
                    { name: 'Charlie', grade: 18, age: 19 },
                  ]);
                });
              it('should not modify the original array', () => {
                const students = [
                  { name: 'Alice', grade: 15, age: 20 },
                  { name: 'Bob', grade: 12, age: 22 },
                  { name: 'Charlie', grade: 18, age: 19 },
                ];
                const copy = [...students.map(s => ({ ...s }))];
                sortStudents(students, 'grade', 'asc');
                expect(students).toEqual(copy);
              });
            it('should return empty array for empty input', () => {
              expect(sortStudents([], 'grade', 'asc')).toEqual([]);
            });
          it('should return empty array for null input', () => {
            expect(sortStudents(null, 'grade', 'asc')).toEqual([]);
          });
        it('should sort students by age ascending', () => {
          const students = [
            { name: 'Charlie', grade: 18, age: 19 },
            { name: 'Bob', grade: 12, age: 22 },
            { name: 'Alice', grade: 15, age: 20 },
          ];
          const sorted = sortStudents(students, 'age', 'asc');
          expect(sorted).toEqual([
            { name: 'Charlie', grade: 18, age: 19 },
            { name: 'Alice', grade: 15, age: 20 },
            { name: 'Bob', grade: 12, age: 22 },
          ]);
        });
      it('should sort students by name ascending', () => {
        const students = [
          { name: 'Charlie', grade: 18, age: 19 },
          { name: 'Bob', grade: 12, age: 22 },
          { name: 'Alice', grade: 15, age: 20 },
        ];
        const sorted = sortStudents(students, 'name', 'asc');
        expect(sorted).toEqual([
          { name: 'Alice', grade: 15, age: 20 },
          { name: 'Bob', grade: 12, age: 22 },
          { name: 'Charlie', grade: 18, age: 19 },
        ]);
      });
    it('should sort students by grade descending', () => {
      const students = [
        { name: 'Alice', grade: 15, age: 20 },
        { name: 'Bob', grade: 12, age: 22 },
        { name: 'Charlie', grade: 18, age: 19 },
      ];
      const sorted = sortStudents(students, 'grade', 'desc');
      expect(sorted).toEqual([
        { name: 'Charlie', grade: 18, age: 19 },
        { name: 'Alice', grade: 15, age: 20 },
        { name: 'Bob', grade: 12, age: 22 },
      ]);
    });
  it('should sort students by grade ascending', () => {
    const students = [
      { name: 'Alice', grade: 15, age: 20 },
      { name: 'Bob', grade: 12, age: 22 },
      { name: 'Charlie', grade: 18, age: 19 },
    ];
    const sorted = sortStudents(students, 'grade', 'asc');
    expect(sorted).toEqual([
      { name: 'Bob', grade: 12, age: 22 },
      { name: 'Alice', grade: 15, age: 20 },
      { name: 'Charlie', grade: 18, age: 19 },
    ]);
  });
});

import { describe, it, expect } from 'vitest';
import { capitalize, calculateAverage, slugify, clamp, sortStudents, parsePrice, groupBy, calculateDiscount, calculateDeliveryFee, applyPromoCode, calculateSurge, calculateOrderTotal } from '../src/utils.js';

describe('capitalize', () => {
  it('should handle undefined and numbers', () => {
    expect(capitalize(undefined)).toBe('');
    expect(capitalize(123)).toBe('');
  });
  it('should capitalize first letter and lowercase the rest', () => {
    expect(capitalize('hello')).toBe('Hello');
    expect(capitalize('WORLD')).toBe('World');
  });
  it('should return empty string for empty input', () => {
    expect(capitalize('')).toBe('');
    expect(capitalize(null)).toBe('');
  });
});

describe('calculateAverage', () => {
  it('should handle array with NaN or non-numbers', () => {
    expect(calculateAverage([10, NaN, 20])).toBeCloseTo(15);
    expect(calculateAverage(["a", 5, 15])).toBeCloseTo(10);
  });
  it('should calculate average of numbers', () => {
    expect(calculateAverage([10, 12, 14])).toBe(12);
    expect(calculateAverage([15])).toBe(15);
    expect(calculateAverage([10, 11, 12])).toBe(11);
  });
  it('should return 0 for empty or null input', () => {
    expect(calculateAverage([])).toBe(0);
    expect(calculateAverage(null)).toBe(0);
  });
});

describe('slugify', () => {
    it('should handle special characters and multiple dashes', () => {
      expect(slugify('Hello---World!!!')).toBe('hello-world');
      expect(slugify('  --Hello  World--  ')).toBe('hello-world');
    });
  it('should slugify text', () => {
    expect(slugify('Hello World')).toBe('hello-world');
    expect(slugify(' Spaces Everywhere ')).toBe('spaces-everywhere');
    expect(slugify("C'est l'ete !")).toBe('cest-lete');
  });
  it('should return empty string for empty input', () => {
    expect(slugify('')).toBe('');
  });
});

describe('clamp', () => {
    it('should handle NaN and undefined', () => {
      expect(clamp(NaN, 0, 10)).toBe(0);
      expect(clamp(undefined, 0, 10)).toBe(0);
    });
    it('should handle unknown sortBy', () => {
      const students = [
        { name: 'Alice', grade: 15, age: 20 },
        { name: 'Bob', grade: 12, age: 22 },
      ];
      expect(sortStudents(students, 'unknown')).toEqual(students);
    });
    it('should handle undefined students', () => {
      expect(sortStudents(undefined, 'grade')).toEqual([]);
    });
    it('should handle undefined and empty string', () => {
      expect(parsePrice(undefined)).toBeNull();
      expect(parsePrice('')).toBeNull();
    });
    it('should handle string with spaces', () => {
      expect(parsePrice('   15,50   ')).toBe(15.5);
    });
    it('should handle undefined array', () => {
      expect(groupBy(undefined, 'role')).toEqual({});
    });
    it('should handle undefined key', () => {
      const arr = [ { name: 'Alice', role: 'dev' } ];
      expect(groupBy(arr, undefined)).toEqual({});
    });
    it('should throw for negative price', () => {
      expect(() => calculateDiscount(-10, [{ type: 'fixed', value: 5 }])).toThrow();
    });
    it('should throw for missing rule fields', () => {
      expect(() => calculateDiscount(100, [{ type: 'buyXgetY', buy: 3 }])).toThrow();
    });
    it('should handle empty rules array', () => {
      expect(calculateDiscount(100, [])).toBe(100);
    });
  it('should clamp value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(0, 0, 0)).toBe(0);
  });
});
