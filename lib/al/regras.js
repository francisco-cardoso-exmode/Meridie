/**
 * Alojamento Local (AL) — regras de negócio puras (sem base de dados nem
 * dependências de servidor): datas, sobreposição de reservas, comissões,
 * ganhos por mês e a calculadora da página "Inscreve a tua casa".
 * Usado no servidor, no browser e nos testes (node --test).
 *
 * Datas: sempre texto "AAAA-MM-DD" (dia civil, sem fuso horário). A noite de
 * dia D é a que começa em D; uma reserva [entrada, saída) ocupa as noites de
 * entrada até à véspera da saída — o dia de saída pode ser a entrada de outra.
 */

// ───────── Valores fixos ─────────

// Países onde operamos. A moeda e o fornecedor de pagamentos vêm do país da casa.
export const PAISES = {
  PT: { nome: "Portugal", moeda: "EUR", pagamentos: "stripe", cidades: ["Lisboa", "Porto", "Algarve"] },
  BR: { nome: "Brasil", moeda: "BRL", pagamentos: "mercadopago", cidades: ["São Paulo", "Rio de Janeiro", "Fortaleza"] },
};
export const PAIS_PADRAO = "PT";
export const paisValido = (p) => Object.prototype.hasOwnProperty.call(PAISES, p);
/** Moeda de uma casa (ou de um país). */
export const moedaDe = (casaOuPais) =>
  PAISES[typeof casaOuPais === "string" ? casaOuPais : casaOuPais?.pais]?.moeda || PAISES[PAIS_PADRAO].moeda;

/** Valor formatado na moeda (como formatarPreco de lib/empreendimentos.js, sem arrastar o seed). */
export function formatarValor(valor, moeda = "EUR", lang = "pt", { decimais = 0 } = {}) {
  const n = Number(valor);
  if (!Number.isFinite(n)) return "—";
  const locale = lang === "en" ? "en-GB" : moeda === "BRL" ? "pt-BR" : "pt-PT";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: moeda,
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  })
    .format(n)
    .replace(/[\s\u00a0\u202f\u2009]/g, "\u00a0");
}

export const ESTADOS_CASA = ["rascunho", "em_analise", "aprovada", "publicada", "suspensa"];
export const ROTULO_ESTADO_CASA = {
  rascunho: "Rascunho",
  em_analise: "Em análise",
  aprovada: "Aprovada",
  publicada: "Publicada",
  suspensa: "Suspensa",
};

export const PLANOS = ["anuncio", "gestao"];
export const ROTULO_PLANO = { anuncio: "Anúncio", gestao: "Gestão completa" };

export const ORIGENS = ["direta", "airbnb", "booking", "manual"];
export const ROTULO_ORIGEM = { direta: "Direta (site)", airbnb: "Airbnb", booking: "Booking", manual: "Manual" };
// Origens que pagam comissão a uma plataforma (OTA).
export const ORIGENS_OTA = ["airbnb", "booking"];

export const ESTADOS_RESERVA = ["pedido", "confirmada", "cancelada", "concluida"];
export const ROTULO_ESTADO_RESERVA = {
  pedido: "Pedido",
  confirmada: "Confirmada",
  cancelada: "Cancelada",
  concluida: "Concluída",
};
// Estados que ocupam o calendário.
export const ESTADOS_OCUPAM = ["confirmada", "concluida"];

export const TIPOS_TAREFA = ["inspecao_entrada", "inspecao_saida", "limpeza"];
export const ROTULO_TIPO_TAREFA = {
  inspecao_entrada: "Inspeção de entrada",
  inspecao_saida: "Inspeção de saída",
  limpeza: "Limpeza",
};
export const ESTADOS_TAREFA = ["pendente", "em_curso", "concluida"];
export const ESTADOS_DIVISAO = ["ok", "atencao", "dano"];
export const ROTULO_ESTADO_DIVISAO = { ok: "OK", atencao: "Atenção", dano: "Dano" };

export const TIPOLOGIAS = ["T0", "T1", "T2", "T3", "T4", "T5+", "Moradia", "Quarto"];

// Comodidades (chave → rótulo PT; o EN vem do dicionário de i18n).
export const COMODIDADES = {
  wifi: "Wi-Fi",
  ac: "Ar condicionado",
  aquecimento: "Aquecimento",
  cozinha: "Cozinha equipada",
  maquina_roupa: "Máquina de lavar roupa",
  maquina_loica: "Máquina de lavar loiça",
  estacionamento: "Estacionamento",
  piscina: "Piscina",
  varanda: "Varanda / terraço",
  jardim: "Jardim",
  vista_mar: "Vista mar",
  elevador: "Elevador",
  berco: "Berço",
  animais: "Aceita animais",
  trabalho: "Espaço de trabalho",
  tv: "TV",
};

export const DIVISOES_SUGERIDAS = ["Hall de entrada", "Sala", "Cozinha", "Quarto 1", "WC 1", "Varanda"];

// Condições comerciais por defeito (editáveis no backoffice → Alojamento → Definições).
export const CONFIG_PADRAO = {
  comissaoOta: { airbnb: 15, booking: 15 }, // % que a plataforma retém (aprox.)
  planos: { anuncio: 8, gestao: 18, reduzida: 15 }, // % Meridie
};

// ───────── Datas ─────────

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/;

/** "AAAA-MM-DD" válido (existe no calendário)? */
export function dataValida(s) {
  if (typeof s !== "string" || !RE_DATA.test(s)) return false;
  const d = new Date(`${s}T00:00:00Z`);
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}

const paraUTC = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
const DIA_MS = 86400000;

/** Soma dias a uma data "AAAA-MM-DD". */
export function somaDias(s, n) {
  return new Date(paraUTC(s) + n * DIA_MS).toISOString().slice(0, 10);
}

/** Número de noites entre entrada e saída (0 se inválido ou ao contrário). */
export function noitesEntre(entrada, saida) {
  if (!dataValida(entrada) || !dataValida(saida)) return 0;
  return Math.max(0, Math.round((paraUTC(saida) - paraUTC(entrada)) / DIA_MS));
}

/** Data de hoje em Lisboa ("AAAA-MM-DD"). */
export function hojeLisboa(agora = new Date()) {
  // en-CA formata como AAAA-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Lisbon" }).format(agora);
}

// ───────── Sobreposição ─────────

/** Dois intervalos [entrada, saída) sobrepõem-se? (saída = entrada não conta). */
export function sobrepoe(a, b) {
  return a.entrada < b.saida && b.entrada < a.saida;
}

/**
 * Reservas (que ocupam o calendário) em conflito com o intervalo `nova`.
 * `ignorarId`: a própria reserva (ao confirmar um pedido já gravado).
 */
export function conflitos(reservas, nova, ignorarId = null) {
  return (reservas || []).filter(
    (r) =>
      ESTADOS_OCUPAM.includes(r.estado) &&
      (ignorarId == null || String(r._id ?? r.id) !== String(ignorarId)) &&
      sobrepoe(r, nova)
  );
}

/** Lista das noites ocupadas ("AAAA-MM-DD") — para o calendário público. */
export function noitesOcupadas(reservas, { desde, ate } = {}) {
  const out = new Set();
  for (const r of reservas || []) {
    if (!ESTADOS_OCUPAM.includes(r.estado)) continue;
    const n = noitesEntre(r.entrada, r.saida);
    for (let i = 0; i < n && i < 366; i++) {
      const d = somaDias(r.entrada, i);
      if ((desde && d < desde) || (ate && d >= ate)) continue;
      out.add(d);
    }
  }
  return [...out].sort();
}

/**
 * Valida um pedido de datas para uma casa. Devolve a mensagem de erro (PT,
 * traduzível pelo dicionário) ou null.
 */
export function erroDatas({ entrada, saida, hoje, estadiaMinima = 1, maxNoites = 90 }) {
  if (!dataValida(entrada) || !dataValida(saida)) return "Indica as datas de entrada e de saída.";
  const n = noitesEntre(entrada, saida);
  if (n <= 0) return "A data de saída tem de ser depois da entrada.";
  if (hoje && entrada < hoje) return "A data de entrada já passou.";
  if (n < (estadiaMinima || 1)) return "A estadia é mais curta do que o mínimo desta casa.";
  if (n > maxNoites) return "Estadia demasiado longa para um pedido online — fala connosco.";
  return null;
}

// ───────── Comissões e ganhos ─────────

const num = (v, def = 0) => (Number.isFinite(Number(v)) ? Number(v) : def);
const arred = (v) => Math.round(v * 100) / 100;

/** % da Meridie para uma casa: plano + comissão reduzida (2+ casas / comprou connosco). */
export function percentagemComissao(plano, { reduzida = false } = {}, config = CONFIG_PADRAO) {
  const p = { ...CONFIG_PADRAO.planos, ...(config?.planos || {}) };
  if (plano === "gestao") return num(reduzida ? p.reduzida : p.gestao);
  return num(p.anuncio);
}

/** % retida pela OTA para uma origem (0 para direta/manual). */
export function percentagemOta(origem, config = CONFIG_PADRAO) {
  if (!ORIGENS_OTA.includes(origem)) return 0;
  const c = { ...CONFIG_PADRAO.comissaoOta, ...(config?.comissaoOta || {}) };
  return num(c[origem]);
}

/**
 * Contas de uma reserva. `valor` é o valor da estadia (sem limpeza nem taxa
 * turística). A comissão Meridie é sobre o valor depois da comissão da OTA;
 * a limpeza é paga pelo hóspede ao custo e não entra nas contas.
 */
export function contasReserva(reserva, pctMeridie, config = CONFIG_PADRAO) {
  const bruto = Math.max(0, num(reserva?.valor));
  const ota = arred((bruto * percentagemOta(reserva?.origem, config)) / 100);
  const base = bruto - ota;
  const meridie = arred((base * num(pctMeridie)) / 100);
  return { bruto: arred(bruto), ota, meridie, proprietario: arred(base - meridie) };
}

/**
 * Ganhos por mês (mês da data de entrada) e por moeda de um conjunto de
 * reservas — um proprietário com casas em Portugal e no Brasil tem linhas em
 * EUR e em BRL (nunca se somam moedas diferentes).
 * `pctDe(reserva)` devolve a % Meridie da casa dessa reserva.
 * Só contam reservas confirmadas/concluídas que não sejam bloqueios.
 * Devolve [{ mes: "AAAA-MM", moeda, reservas, noites, bruto, ota, meridie, proprietario }]
 * do mais recente para o mais antigo.
 */
export function ganhosPorMes(reservas, pctDe, config = CONFIG_PADRAO) {
  const meses = new Map();
  for (const r of reservas || []) {
    if (!ESTADOS_OCUPAM.includes(r.estado) || r.bloqueio) continue;
    if (!dataValida(r.entrada)) continue;
    const mes = r.entrada.slice(0, 7);
    const moeda = r.moeda || "EUR";
    const chave = `${mes}|${moeda}`;
    const c = contasReserva(r, pctDe(r), config);
    const m = meses.get(chave) || { mes, moeda, reservas: 0, noites: 0, bruto: 0, ota: 0, meridie: 0, proprietario: 0 };
    m.reservas += 1;
    m.noites += noitesEntre(r.entrada, r.saida);
    for (const k of ["bruto", "ota", "meridie", "proprietario"]) m[k] = arred(m[k] + c[k]);
    meses.set(chave, m);
  }
  return [...meses.values()].sort((a, b) => (a.mes < b.mes ? 1 : a.mes > b.mes ? -1 : a.moeda < b.moeda ? -1 : 1));
}

// ───────── Calculadora ("Inscreve a tua casa") ─────────

/**
 * Estimativa mensal para o proprietário em cada opção. Tudo aproximado:
 * - noites = 30 × ocupação;
 * - "sozinho no Airbnb": a comissão do Airbnb sobre todas as reservas;
 * - "co-anfitrião": comissão do Airbnb + % do co-anfitrião sobre o resto;
 * - Meridie: as reservas diretas (% indicada) não pagam OTA; a comissão
 *   Meridie é sobre o valor depois da OTA.
 * Entradas: { precoNoite, ocupacao (%), diretas (%), taxaOta (%),
 *   taxaCoanfitriao (%), pctAnuncio, pctGestao }.
 */
export function simularCalculadora(e = {}) {
  const preco = Math.max(0, num(e.precoNoite));
  const ocup = Math.min(100, Math.max(0, num(e.ocupacao)));
  const diretas = Math.min(100, Math.max(0, num(e.diretas)));
  const ota = Math.min(100, Math.max(0, num(e.taxaOta, 15)));
  const coanf = Math.min(100, Math.max(0, num(e.taxaCoanfitriao, 20)));
  const noites = arred((30 * ocup) / 100);
  const bruto = arred(noites * preco);

  const sozinho = arred(bruto * (1 - ota / 100));
  const coanfitriao = arred(sozinho * (1 - coanf / 100));

  const parteOta = (bruto * (100 - diretas)) / 100;
  const depoisOta = bruto - (parteOta * ota) / 100;
  const meridie = (pct) => arred(depoisOta * (1 - num(pct) / 100));

  return {
    noites,
    bruto,
    sozinho,
    coanfitriao,
    anuncio: meridie(e.pctAnuncio ?? CONFIG_PADRAO.planos.anuncio),
    gestao: meridie(e.pctGestao ?? CONFIG_PADRAO.planos.gestao),
  };
}
