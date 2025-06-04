export function gerarPayloadPix(
  valor: number,
  chave: string,
  nome: string,
  cidade: string
): string {
  return `00020126360014BR.GOV.BCB.PIX0114${chave}5204000053039865405${valor
    .toFixed(2)
    .replace(".", "")}5802BR5913${nome}6009${cidade}62070503***6304`;
}

export async function gerarQrCodeBase64(payload: string): Promise<string> {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
    payload
  )}`;
  return url;
}
