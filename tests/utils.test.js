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
import { capitalize, calculateAverage, slugify, clamp, sortStudents, parsePrice, groupBy, calculateDiscount } from '../src/utils.js';

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
