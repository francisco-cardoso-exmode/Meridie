// Lado do browser da prova de trabalho (ver lib/provaTrabalho.js): procura o número
// cujo SHA-256 de (sal + número) começa por `dificuldade` bits a zero.
function zerosIniciais(bytes) {
  let n = 0;
  for (const byte of bytes) {
    if (byte === 0) {
      n += 8;
      continue;
    }
    return n + Math.clz32(byte) - 24;
  }
  return n;
}

export async function resolverDesafio() {
  const res = await fetch("/api/contacto/desafio", { cache: "no-store" });
  const d = await res.json();
  const enc = new TextEncoder();
  for (let numero = 0; numero < 1e8; numero++) {
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(`${d.sal}${numero}`)));
    if (zerosIniciais(hash) >= d.dificuldade) return { ...d, numero };
  }
  throw new Error("desafio sem solução");
}
