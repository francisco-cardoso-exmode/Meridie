import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { dentroDoLimite } from "@/lib/rateLimit";

// Anti-bot sem serviços externos ("proof of work", como o ALTCHA): o servidor dá um
// desafio assinado e o browser procura um número cujo SHA-256 (sal + número) comece por
// N bits a zero. Demora < 1 s a uma pessoa; a um bot custa isso por cada mensagem.
export const DIFICULDADE = 16; // bits a zero (~65 mil tentativas em média)
const VALIDADE_MS = 15 * 60 * 1000;

// Segredo da assinatura. Sem CONTACTO_SEGREDO, deriva-se de outro segredo do servidor.
function segredo() {
  const base = process.env.CONTACTO_SEGREDO || process.env.MONGODB_URI || "meridie-dev";
  return createHash("sha256").update(`prova-trabalho:${base}`).digest();
}

function assinar(sal, expira, dificuldade) {
  return createHmac("sha256", segredo()).update(`${sal}|${expira}|${dificuldade}`).digest("hex");
}

export function novoDesafio() {
  const sal = randomBytes(16).toString("hex");
  const expira = Date.now() + VALIDADE_MS;
  return { sal, expira, dificuldade: DIFICULDADE, assinatura: assinar(sal, expira, DIFICULDADE) };
}

function zerosIniciais(buf) {
  let n = 0;
  for (const byte of buf) {
    if (byte === 0) {
      n += 8;
      continue;
    }
    return n + Math.clz32(byte) - 24;
  }
  return n;
}

// Verifica a resposta do browser. Cada desafio só serve uma vez.
export async function provaValida(p) {
  if (!p || typeof p !== "object") return false;
  const { sal, expira, dificuldade, assinatura, numero } = p;
  if (typeof sal !== "string" || !/^[0-9a-f]{32}$/.test(sal)) return false;
  if (!Number.isSafeInteger(expira) || expira < Date.now()) return false;
  if (dificuldade !== DIFICULDADE) return false;
  if (!Number.isSafeInteger(numero) || numero < 0) return false;
  if (typeof assinatura !== "string" || assinatura.length !== 64) return false;

  const certa = Buffer.from(assinar(sal, expira, dificuldade), "hex");
  const dada = Buffer.from(assinatura, "hex");
  if (dada.length !== certa.length || !timingSafeEqual(dada, certa)) return false;

  const hash = createHash("sha256").update(`${sal}${numero}`).digest();
  if (zerosIniciais(hash) < dificuldade) return false;

  // Uso único: a primeira vez passa, as seguintes não (guardado até expirar).
  return dentroDoLimite(`prova:${sal}`, 1, Math.ceil(VALIDADE_MS / 1000));
}
