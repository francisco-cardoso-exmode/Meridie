/**
 * Quartos e casas de banho de um empreendimento: um número ("2") ou um
 * intervalo ("1-3" — um empreendimento com T1 a T3).
 *
 * Na base fica texto canónico "N" ou "N-M" (N ≤ M, 0..99) ou "" (sem valor).
 * Os documentos antigos têm números — todas as leituras aceitam
 * número | texto | vazio.
 */

export const MAX_INTERVALO = 99;

// "2", "1-3", "1 a 3", "T1–T3", "t1 até t3", "1 / 3" → [1, 3]; "" → [];
// null quando o texto não é um número nem um intervalo.
function numeros(v) {
  if (v == null) return [];
  if (typeof v === "number") return Number.isFinite(v) ? [v] : null;
  if (typeof v !== "string") return null;
  const s = v.trim().toLowerCase();
  if (!s) return [];
  const m = s.match(/^t?\s*(\d{1,3})\s*(?:(?:-|–|—|a|até|ate|to|\/)\s*t?\s*(\d{1,3}))?$/);
  if (!m) return null;
  return m[2] === undefined ? [Number(m[1])] : [Number(m[1]), Number(m[2])];
}

/**
 * Normaliza o que o backoffice envia. Devolve { valor } com o texto canónico
 * ("" quando vazio) ou { erro } quando não é um número nem um intervalo válido.
 */
export function normalizaIntervalo(v) {
  const n = numeros(v);
  if (!n) return { erro: "use um número ou um intervalo (ex.: 2 ou 1-3)" };
  if (!n.length) return { valor: "" };
  if (n.some((x) => !Number.isInteger(x) || x < 0 || x > MAX_INTERVALO))
    return { erro: `use números inteiros de 0 a ${MAX_INTERVALO}` };
  const min = Math.min(...n);
  const max = Math.max(...n);
  return { valor: min === max ? String(min) : `${min}-${max}` };
}

/** { min, max } para filtrar/ordenar/JSON-LD — null quando vazio ou inválido. */
export function intervalo(v) {
  // Número antigo da base (mesmo fora do formato novo) — mostra-se tal como está.
  if (typeof v === "number") return Number.isFinite(v) && v >= 0 ? { min: v, max: v } : null;
  const r = normalizaIntervalo(v);
  if (!r.valor) return null;
  const [min, max = min] = r.valor.split("-").map(Number);
  return { min, max };
}

/** Texto para mostrar: "2", "1–3" (meia-risca) ou "" quando vazio/zero. */
export function formataIntervalo(v) {
  const i = intervalo(v);
  if (!i || i.max <= 0) return "";
  return i.min === i.max ? String(i.min) : `${i.min}–${i.max}`;
}

/** Quartos: 0 é um T0 (estúdio) e mostra-se como "T0"; vazio não se mostra. */
export function formataQuartos(v) {
  const i = intervalo(v);
  if (!i) return "";
  if (i.max === 0) return "T0";
  return formataIntervalo(v);
}
export const eT0 = (v) => formataQuartos(v) === "T0";

/** Singular só quando é exatamente 1 ("1 quarto"; "1–2 quartos"). */
export const eUm = (v) => {
  const i = intervalo(v);
  return !!i && i.min === 1 && i.max === 1;
};

const CAMPOS_INTERVALO = { quartos: "Quartos", casasBanho: "Casas de banho" };

/**
 * Normaliza no próprio doc os campos de intervalo de um empreendimento
 * (só os que vieram no pedido). Devolve a mensagem de erro, se houver.
 */
export function validarIntervalos(doc) {
  for (const [campo, rotulo] of Object.entries(CAMPOS_INTERVALO)) {
    if (!(campo in doc)) continue;
    const r = normalizaIntervalo(doc[campo]);
    if (r.erro) return `${rotulo}: ${r.erro}.`;
    doc[campo] = r.valor;
  }
  return null;
}
