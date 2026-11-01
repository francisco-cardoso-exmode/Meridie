/**
 * Perguntas opcionais do formulário de contacto para qualificar a lead
 * (objetivo, orçamento, prazo). Regras puras (browser e servidor): guardam-se
 * só as chaves; os textos (PT, traduzidos no site com t()) vêm daqui.
 * O orçamento tem escalões por moeda — 150 mil em reais não é 150 mil em euros.
 */
export const OBJETIVOS = {
  habitacao: "Habitação própria",
  arrendar: "Investimento para arrendar",
  revenda: "Investimento para revenda",
  decidir: "Ainda a decidir",
};

export const ORCAMENTOS = {
  EUR: {
    o1: "Até 150 mil €",
    o2: "150 – 300 mil €",
    o3: "300 – 600 mil €",
    o4: "Mais de 600 mil €",
  },
  BRL: {
    o1: "Até R$ 500 mil",
    o2: "R$ 500 mil – 1 milhão",
    o3: "R$ 1 – 2 milhões",
    o4: "Mais de R$ 2 milhões",
  },
};

export const PRAZOS = {
  ja: "Nos próximos 3 meses",
  meses: "Dentro de 3 a 12 meses",
  sem_pressa: "Sem pressa",
};

const moedaValida = (m) => (m === "BRL" ? "BRL" : "EUR");

/** Só as chaves conhecidas; devolve null se nenhuma pergunta foi respondida. */
export function limpaQualificacao(d) {
  if (!d || typeof d !== "object") return null;
  const moeda = moedaValida(d.moeda);
  const q = {
    objetivo: Object.hasOwn(OBJETIVOS, d.objetivo) ? d.objetivo : "",
    orcamento: Object.hasOwn(ORCAMENTOS[moeda], d.orcamento) ? d.orcamento : "",
    prazo: Object.hasOwn(PRAZOS, d.prazo) ? d.prazo : "",
  };
  if (!q.objetivo && !q.orcamento && !q.prazo) return null;
  return { ...q, moeda };
}

/** Linhas legíveis (PT) para o email da equipa e o backoffice. */
export function linhasQualificacao(q) {
  if (!q) return [];
  return [
    q.objetivo && ["Objetivo", OBJETIVOS[q.objetivo]],
    q.orcamento && ["Orçamento", ORCAMENTOS[moedaValida(q.moeda)][q.orcamento]],
    q.prazo && ["Prazo", PRAZOS[q.prazo]],
  ].filter(Boolean);
}
