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
import { capitalize, calculateAverage, slugify, clamp, sortStudents } from '../src/utils.js';

describe('capitalize', () => {
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
  it('should clamp value between min and max', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(0, 0, 0)).toBe(0);
  });
});
