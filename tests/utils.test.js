
import { describe, it, expect } from 'vitest';
import { capitalize, calculateAverage, slugify, clamp } from '../src/utils.js';

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
