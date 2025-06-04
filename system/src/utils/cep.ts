import { isValidCep } from "./validators";

export async function getCepInfo(zip: string): Promise<any> {
  const cleanZip = zip.replace(/\D/g, "");
  if (!isValidCep(cleanZip)) {
    console.error("Invalid ZIP code:", zip);
    throw new Error("Invalid ZIP code");
  }
  const res = await fetch(`https://viacep.com.br/ws/${cleanZip}/json/`);
  if (!res.ok) {
    console.error("Error fetching ZIP code:", zip);
    throw new Error("Error fetching ZIP code");
  }
  const data = await res.json();
  if (data.erro) {
    console.error("ZIP code not found:", zip);
    throw new Error("ZIP code not found");
  }
  return data;
}

export function validateZIP(zip: string): boolean {
  return /^\d{5}-?\d{3}$/.test(zip);
}
