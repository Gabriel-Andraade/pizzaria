export function isValidCep(cep: string): boolean {
  const cleanCep = cep.replace(/\D/g, "");
  return /^\d{8}$/.test(cleanCep);
}

export function isEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
