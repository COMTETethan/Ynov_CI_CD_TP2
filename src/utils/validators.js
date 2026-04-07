export function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const parts = email.split("@");
  if (parts.length !== 2) return false;
  const domain = parts[1];
  return domain.includes(".") && parts[0].length > 0 && domain.split(".").every(Boolean);
}

export function isValidPassword(password) {
  const errors = [];
  if (typeof password !== "string" || password.length < 8)
    errors.push("Le mot de passe doit contenir au moins 8 caractères");
  if (!/[A-Z]/.test(password))
    errors.push("Le mot de passe doit contenir au moins une majuscule");
  if (!/[a-z]/.test(password))
    errors.push("Le mot de passe doit contenir au moins une minuscule");
  if (!/[0-9]/.test(password))
    errors.push("Le mot de passe doit contenir au moins un chiffre");
  if (!/[!@#$%^&*]/.test(password))
    errors.push("Le mot de passe doit contenir au moins un caractère spécial (!@#$%^&*)");
  return { valid: errors.length === 0, errors };
}

export function isValidAge(age) {
  return Number.isInteger(age) && age >= 0 && age <= 150;
}
