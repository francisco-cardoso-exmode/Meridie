// Tipologias de um empreendimento: nome, área, preço (valor ou sob consulta)
// e disponibilidade. Sem dependências de servidor (usado também no backoffice).

export const DISPONIBILIDADE = [
  { v: "disponivel", label: "Disponível" },
  { v: "reservado", label: "Reservado" },
  { v: "vendido", label: "Vendido" },
  { v: "esgotado", label: "Esgotado" },
];
const VALIDAS = new Set(DISPONIBILIDADE.map((d) => d.v));

// Etiqueta mostrada no site no lugar (ou ao lado) do preço; null = disponível.
export const ETIQUETA = { reservado: "Reservado", vendido: "Vendido", esgotado: "Esgotado" };

export const indisponivel = (t) => t?.disponibilidade === "vendido" || t?.disponibilidade === "esgotado";

/**
 * Normaliza uma tipologia vinda da base ou do formulário. Aceita o formato
 * antigo (texto "T2", ou { nome, area, preco } sem tipo) e devolve sempre
 * { nome, area?, precoTipo, preco?, disponibilidade }.
 */
export function normalizaTipologia(t) {
  if (typeof t === "string") t = { nome: t };
  if (!t || typeof t !== "object") return null;
  const nome = String(t.nome ?? "").trim().slice(0, 120);
  if (!nome) return null;
  const area = String(t.area ?? "").trim().slice(0, 120);
  const preco = t.preco === "" || t.preco == null ? NaN : Number(t.preco);
  const temPreco = Number.isFinite(preco) && preco > 0;
  const precoTipo = t.precoTipo === "consulta" || !temPreco ? "consulta" : "valor";
  const disponibilidade = VALIDAS.has(t.disponibilidade) ? t.disponibilidade : "disponivel";
  const o = { nome, precoTipo, disponibilidade };
  if (area) o.area = area;
  if (precoTipo === "valor") o.preco = preco;
  return o;
}

export const normalizaTipologias = (lista) =>
  Array.isArray(lista) ? lista.map(normalizaTipologia).filter(Boolean).slice(0, 60) : [];

/**
 * Preço "desde" coerente com a tabela: com o preço em "Desde", passa a ser o
 * mais baixo das tipologias com valor e ainda à venda (se houver alguma).
 */
export function comPrecoDesde(e) {
  if (!e || e.precoTipo !== "desde") return e;
  const precos = normalizaTipologias(e.tipologias)
    .filter((t) => t.precoTipo === "valor" && !indisponivel(t))
    .map((t) => t.preco);
  return precos.length ? { ...e, preco: Math.min(...precos) } : e;
}
