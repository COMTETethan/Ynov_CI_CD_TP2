
import { describe, it, expect } from 'vitest';
import { isValidEmail, isValidPassword, isValidAge } from '../src/validators.js';

describe('isValidEmail', () => {
  it('should validate correct emails', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('user.name+tag@domain.co')).toBe(true);
  });
  it('should invalidate incorrect emails', () => {
    expect(isValidEmail('invalid')).toBe(false);
    expect(isValidEmail('@domain.com')).toBe(false);
    expect(isValidEmail('user@')).toBe(false);
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
  });
});

describe('isValidPassword', () => {
  it('should validate a strong password', () => {
    expect(isValidPassword('Passw0rd!')).toEqual({ valid: true, errors: [] });
  });
  it('should catch all errors for a weak password', () => {
    const result = isValidPassword('short');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
  });
  it('should catch missing uppercase', () => {
    const result = isValidPassword('alllowercase1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
  });
  it('should catch missing lowercase', () => {
    const result = isValidPassword('ALLUPPERCASE1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
  });
  it('should catch missing digit', () => {
    const result = isValidPassword('NoDigits!here');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
  });
  it('should catch missing special character', () => {
    const result = isValidPassword('NoSpecial1here');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)');
  });
  it('should handle empty and null', () => {
    expect(isValidPassword('')).toMatchObject({ valid: false });
    expect(isValidPassword(null)).toMatchObject({ valid: false });
  });
});

describe('isValidAge', () => {
  it('should validate correct ages', () => {
    expect(isValidAge(25)).toBe(true);
    expect(isValidAge(0)).toBe(true);
    expect(isValidAge(150)).toBe(true);
  });
  it('should invalidate incorrect ages', () => {
    expect(isValidAge(-1)).toBe(false);
    expect(isValidAge(151)).toBe(false);
    expect(isValidAge(25.5)).toBe(false);
    expect(isValidAge("25")).toBe(false);
    expect(isValidAge(null)).toBe(false);
  });
});
