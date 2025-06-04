var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

function gerarPayloadPix(valor, chave, nome, cidade) {
  return `00020126360014BR.GOV.BCB.PIX0114${chave}5204000053039865405${valor
    .toFixed(2)
    .replace(".", "")}5802BR5913${nome}6009${cidade}62070503***6304`;
}

function gerarQrCodeBase64(payload) {
  return __awaiter(this, void 0, void 0, function* () {
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(
      payload
    )}`;
    return url;
  });
}

window.gerarPayloadPix = gerarPayloadPix;
window.gerarQrCodeBase64 = gerarQrCodeBase64;
