/**
 * Analytics do backoffice — funções puras (sem base de dados), para poderem
 * ser testadas com o node: períodos, baldes de tempo na hora de Lisboa, picos,
 * variações, validação de caminhos e filtros.
 *
 * Datas "civis" são strings "AAAA-MM-DD" no fuso de Lisboa. As contas de dias
 * fazem-se sobre a data civil (nunca somando 24 h a um instante), para a
 * mudança de hora não estragar os baldes.
 */

export const TZ = "Europe/Lisbon";
export const DIA_MS = 864e5;

// ---------- Fuso horário ----------

const fmtPartes = new Intl.DateTimeFormat("en-CA", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hourCycle: "h23",
});

function partes(d) {
  const o = {};
  for (const p of fmtPartes.formatToParts(d)) o[p.type] = p.value;
  return o;
}

// Diferença (ms) entre a hora de Lisboa e UTC num dado instante.
export function offsetLisboa(d) {
  const p = partes(d);
  const comoUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return comoUtc - Math.floor(d.getTime() / 1000) * 1000;
}

/** Data civil de Lisboa ("AAAA-MM-DD") de um instante. */
export function dataCivil(d) {
  const p = partes(d);
  return `${p.year}-${p.month}-${p.day}`;
}

/** Hora (0–23) de Lisboa de um instante. */
export function horaLisboa(d) {
  return +partes(d).hour;
}

const ehCivil = (s) => typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s));

export function somaDias(civil, n) {
  const [y, m, d] = civil.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export function somaMeses(civil, n) {
  const [y, m] = civil.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1 + n, 1)).toISOString().slice(0, 10);
}

export function diasEntre(a, b) {
  return Math.round((Date.parse(b) - Date.parse(a)) / DIA_MS);
}

// 0 = domingo … 6 = sábado (da data civil).
export function diaSemana(civil) {
  return new Date(`${civil}T12:00:00Z`).getUTCDay();
}

/** Instante UTC em que, em Lisboa, é `civil` às `hora`:00. */
export function instanteLisboa(civil, hora = 0) {
  const [y, m, d] = civil.split("-").map(Number);
  const alvo = Date.UTC(y, m - 1, d, hora);
  let t = alvo - offsetLisboa(new Date(alvo));
  const o2 = offsetLisboa(new Date(t));
  if (alvo - o2 !== t) t = alvo - o2;
  return new Date(t);
}

// ---------- Períodos ----------

export const PERIODOS = [
  ["hoje", "Hoje"],
  ["7d", "7 dias"],
  ["30d", "30 dias"],
  ["90d", "90 dias"],
  ["12m", "12 meses"],
  ["pers", "Personalizado"],
];
const PERIODO_PADRAO = "30d";
const MAX_DIAS = 731;

/** Granularidade automática pelo número de dias do período. */
export function granularidadePara(nDias) {
  if (nDias <= 2) return "hora";
  if (nDias <= 90) return "dia";
  if (nDias <= 180) return "semana";
  return "mes";
}

/**
 * Resolve o período pedido (searchParams) em datas civis e instantes.
 * `fim` é exclusivo (meia-noite do dia a seguir a `ate`); `fimEfetivo` não
 * passa de agora. O período anterior tem o mesmo número de dias e a mesma
 * duração decorrida (ex.: "hoje até às 15h" compara com "ontem até às 15h").
 */
export function resolverPeriodo(params = {}, agora = new Date()) {
  const hoje = dataCivil(agora);
  let preset = PERIODOS.some(([k]) => k === params.periodo) ? params.periodo : PERIODO_PADRAO;
  let de;
  let ate = hoje;
  if (preset === "hoje") de = hoje;
  else if (preset === "7d") de = somaDias(hoje, -6);
  else if (preset === "30d") de = somaDias(hoje, -29);
  else if (preset === "90d") de = somaDias(hoje, -89);
  else if (preset === "12m") de = somaMeses(hoje.slice(0, 8) + "01", -11);
  else {
    de = ehCivil(params.de) ? params.de : somaDias(hoje, -29);
    ate = ehCivil(params.ate) ? params.ate : hoje;
    if (ate > hoje) ate = hoje;
    if (de > ate) [de, ate] = [ate, de];
    if (diasEntre(de, ate) + 1 > MAX_DIAS) de = somaDias(ate, -(MAX_DIAS - 1));
  }
  const nDias = diasEntre(de, ate) + 1;
  const inicio = instanteLisboa(de);
  const fim = instanteLisboa(somaDias(ate, 1));
  const fimEfetivo = new Date(Math.min(fim.getTime(), agora.getTime()));
  const deAnt = preset === "12m" ? somaMeses(de, -12) : somaDias(de, -nDias);
  const inicioAnterior = instanteLisboa(deAnt);
  const fimAnterior = new Date(
    Math.min(inicio.getTime(), inicioAnterior.getTime() + (fimEfetivo.getTime() - inicio.getTime()))
  );
  return {
    preset,
    de,
    ate,
    nDias,
    inicio,
    fim,
    fimEfetivo,
    granularidade: granularidadePara(nDias),
    anterior: { de: deAnt, inicio: inicioAnterior, fim: fimAnterior, fimSerie: inicio },
  };
}

// ---------- Baldes de tempo ----------

/** Chave do balde de um instante (igual à que o Mongo devolve — ver formatoMongo). */
export function chaveBalde(d, gran) {
  const p = partes(d);
  const civil = `${p.year}-${p.month}-${p.day}`;
  if (gran === "hora") return `${civil}T${p.hour}`;
  if (gran === "dia") return civil;
  if (gran === "semana") return somaDias(civil, -((diaSemana(civil) + 6) % 7));
  return civil.slice(0, 7);
}

/** Expressão do $group do Mongo que dá a mesma chave que chaveBalde. */
export function expressaoBaldeMongo(gran, campo = "$criadoEm") {
  if (gran === "hora") return { $dateToString: { format: "%Y-%m-%dT%H", date: campo, timezone: TZ } };
  if (gran === "dia") return { $dateToString: { format: "%Y-%m-%d", date: campo, timezone: TZ } };
  if (gran === "semana")
    return {
      $dateToString: {
        format: "%Y-%m-%d",
        timezone: TZ,
        date: { $dateTrunc: { date: campo, unit: "week", timezone: TZ, startOfWeek: "monday" } },
      },
    };
  return { $dateToString: { format: "%Y-%m", date: campo, timezone: TZ } };
}

/**
 * Lista ordenada das chaves de balde entre [inicio, fim). Por hora anda de
 * hora em hora real (o dia da mudança de hora tem 23 ou 25 h; a hora repetida
 * fica num só balde); por dia/semana/mês anda no calendário.
 */
export function sequenciaBaldes(inicio, fim, gran) {
  const out = [];
  if (gran === "hora") {
    for (let t = inicio.getTime(); t < fim.getTime(); t += 36e5) {
      const k = chaveBalde(new Date(t), "hora");
      if (out[out.length - 1] !== k) out.push(k);
    }
    return out;
  }
  const ultimo = dataCivil(new Date(fim.getTime() - 1));
  let c = dataCivil(inicio);
  if (gran === "dia") {
    for (; c <= ultimo; c = somaDias(c, 1)) out.push(c);
  } else if (gran === "semana") {
    for (c = chaveBalde(inicio, "semana"); c <= ultimo; c = somaDias(c, 7)) out.push(c);
  } else {
    for (c = c.slice(0, 7) + "-01"; c <= ultimo; c = somaMeses(c, 1)) out.push(c.slice(0, 7));
  }
  return out;
}

/** Instante de início de um balde (para saber se ainda está no futuro). */
export function inicioBalde(chave, gran) {
  if (gran === "hora") return instanteLisboa(chave.slice(0, 10), +chave.slice(11, 13));
  if (gran === "mes") return instanteLisboa(`${chave}-01`);
  return instanteLisboa(chave);
}

/** Junta as linhas do Mongo ({_id, n}) às chaves, com zeros onde não há. */
export function preencherSerie(chaves, linhas) {
  const m = new Map();
  for (const l of linhas || []) m.set(l._id ?? l.chave, (m.get(l._id ?? l.chave) || 0) + (l.n || 0));
  return chaves.map((chave) => ({ chave, n: m.get(chave) || 0 }));
}

/** Os `k` baldes com mais visitas (só > 0; empate → o mais antigo). */
export function picos(serie, k = 3) {
  return serie
    .map((b, i) => ({ ...b, i }))
    .filter((b) => b.n > 0)
    .sort((a, b) => b.n - a.n || a.i - b.i)
    .slice(0, k);
}

const DIAS_CURTOS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
export const DIAS_LONGOS = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MESES_LONGOS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

const dm = (civil) => `${civil.slice(8, 10)}/${civil.slice(5, 7)}`;
const dma = (civil) => `${dm(civil)}/${civil.slice(0, 4)}`;

/** Rótulo curto (eixo) de um balde. */
export function rotuloCurto(chave, gran) {
  if (gran === "hora") return `${+chave.slice(11, 13)}h`;
  if (gran === "dia" || gran === "semana") return dm(chave);
  return `${MESES[+chave.slice(5, 7) - 1]} ${chave.slice(2, 4)}`;
}

/** Rótulo completo (tooltip, picos) de um balde. */
export function rotuloLongo(chave, gran) {
  if (gran === "hora") {
    const c = chave.slice(0, 10);
    return `${DIAS_CURTOS[diaSemana(c)]}, ${dma(c)} às ${+chave.slice(11, 13)}h`;
  }
  if (gran === "dia") return `${DIAS_CURTOS[diaSemana(chave)]}, ${dma(chave)}`;
  if (gran === "semana") return `semana de ${dma(chave)}`;
  return `${MESES_LONGOS[+chave.slice(5, 7) - 1]} de ${chave.slice(0, 4)}`;
}

export const NOME_GRANULARIDADE = { hora: "por hora", dia: "por dia", semana: "por semana", mes: "por mês" };

// ---------- Mapa de calor (dia da semana × hora) ----------

/**
 * Converte as linhas do Mongo ({_id:{d:1..7 (1=domingo), h:0..23}, n}) numa
 * grelha 7×24 com segunda-feira primeiro.
 */
export function grelhaCalor(linhas) {
  const g = Array.from({ length: 7 }, () => Array(24).fill(0));
  for (const l of linhas || []) {
    const d = l._id?.d;
    const h = l._id?.h;
    if (!(d >= 1 && d <= 7 && h >= 0 && h <= 23)) continue;
    g[(d + 5) % 7][h] += l.n || 0; // 2 (segunda) → 0 … 1 (domingo) → 6
  }
  return g;
}
export const DIAS_GRELHA = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

/** Célula com mais visitas da grelha: { dia, hora, n } ou null. */
export function picoGrelha(g) {
  let melhor = null;
  g.forEach((linha, d) =>
    linha.forEach((n, h) => {
      if (n > 0 && (!melhor || n > melhor.n)) melhor = { dia: d, hora: h, n };
    })
  );
  return melhor;
}

// ---------- Números ----------

/** Variação % (arredondada) entre atual e anterior; null se não há base. */
export function variacao(atual, anterior) {
  if (!anterior) return atual ? null : 0;
  return Math.round(((atual - anterior) / anterior) * 1000) / 10;
}

export function percentagem(n, total) {
  if (!total) return 0;
  return Math.round((n / total) * 1000) / 10;
}

/** Topo da escala do eixo (número "redondo" ≥ max) e marcas intermédias. */
export function escalaEixo(max) {
  if (!(max > 0)) return { topo: 1, marcas: [0, 1] };
  const mag = 10 ** Math.floor(Math.log10(max));
  const passo = [1, 2, 4, 6, 8, 10].find((p) => p * mag >= max) || 10;
  const topo = Math.max(1, Math.round(passo * mag));
  const meio = topo / 2;
  return { topo, marcas: Number.isInteger(meio) && meio > 0 ? [0, meio, topo] : [0, topo] };
}

// ---------- Tracking: caminhos, dispositivos, países ----------

// 1.º segmento das rotas públicas (internas, em português) e o equivalente em
// inglês — o mesmo que lib/i18n (ROTAS_EN). Um caminho fora daqui não conta.
const ROTAS = {
  portugal: "portugal",
  brasil: "brazil",
  "como-funciona": "how-it-works",
  comparar: "compare",
  contactos: "contact",
  cookies: "cookies",
  empreendimentos: "properties",
  faq: "faq",
  marcas: "brands",
  parcerias: "partnerships",
  privacidade: "privacy",
  publicidade: "partners",
  "quem-somos": "about",
  regioes: "regions",
  tecnologia: "technology",
  termos: "terms",
};
const ROTAS_DE_EN = Object.fromEntries(Object.entries(ROTAS).map(([pt, en]) => [en, pt]));

/**
 * Valida um caminho público ("/en/brands/x", sem query) e devolve
 * { lang, caminho } com o caminho interno em português — assim "/marcas/x" e
 * "/en/brands/x" contam como a mesma página. null se não for uma rota do site.
 */
export function normalizarCaminho(publico) {
  if (typeof publico !== "string") return null;
  let p = publico.split(/[?#]/)[0].trim();
  if (!p.startsWith("/") || p.startsWith("//") || p.length > 140) return null;
  const segs = p.split("/").filter(Boolean).map((s) => s.toLowerCase());
  let lang = "pt";
  if (segs[0] === "en") {
    lang = "en";
    segs.shift();
    if (segs.length) {
      if (!ROTAS_DE_EN[segs[0]]) return null;
      segs[0] = ROTAS_DE_EN[segs[0]];
    }
  } else if (segs.length && !ROTAS[segs[0]]) {
    return null;
  }
  if (segs.length > 3) return null;
  if (!segs.every((s) => /^[a-z0-9][a-z0-9-]{0,99}$/.test(s))) return null;
  return { lang, caminho: "/" + segs.join("/") };
}

const UA_ROBO = /bot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pingdom|uptime|preview|facebookexternalhit|curl|wget|python-requests/i;

/** "mobile" | "tablet" | "desktop" pelo User-Agent (grosso); null se é um robô. */
export function classeDispositivo(ua) {
  const s = String(ua || "");
  if (!s || UA_ROBO.test(s)) return null;
  if (/iPad|Tablet|PlayBook|Silk|Android(?!.*Mobile)/i.test(s)) return "tablet";
  if (/Mobi|iPhone|iPod|Android|Windows Phone/i.test(s)) return "mobile";
  return "desktop";
}

export const NOME_DISPOSITIVO = { mobile: "Telemóvel", tablet: "Tablet", desktop: "Computador" };

let nomesRegiao = null;
/** Nome do país em português a partir do código ISO ("US" → "Estados Unidos"). */
export function nomePais(cod) {
  if (!cod) return "(sem país)";
  try {
    nomesRegiao ||= new Intl.DisplayNames(["pt-PT"], { type: "region" });
    return nomesRegiao.of(cod) || cod;
  } catch {
    return cod;
  }
}

/** Cabeçalho x-vercel-ip-city vem codificado (ex.: "S%C3%A3o%20Paulo"). */
export function descodificarCidade(v) {
  if (!v) return "";
  let s = String(v);
  try {
    s = decodeURIComponent(s.replace(/\+/g, " "));
  } catch {}
  return s.replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 80);
}

// ---------- Filtros ----------

export const SEM_CIDADE = "(sem cidade)";

/** Filtros válidos a partir dos searchParams (tudo o resto é ignorado). */
export function lerFiltros(sp = {}) {
  const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  const f = {};
  const pais = str(sp.pais, 3).toUpperCase();
  if (/^[A-Z]{2}$/.test(pais)) f.pais = pais;
  const cidade = str(sp.cidade, 80);
  if (cidade) f.cidade = cidade;
  const pagina = str(sp.pagina, 140);
  if (pagina.startsWith("/")) f.pagina = normalizarCaminho(pagina)?.caminho || pagina;
  const fonte = str(sp.fonte, 60);
  if (fonte) f.fonte = fonte;
  return f;
}

/**
 * $match do Mongo para o período e os filtros. O intervalo de datas vem
 * primeiro (usa os índices com criadoEm).
 */
export function matchEventos(inicio, fim, filtros = {}) {
  const m = { criadoEm: { $gte: inicio, $lt: fim } };
  if (filtros.pais) m.pais = filtros.pais;
  if (filtros.cidade) m.cidade = filtros.cidade === SEM_CIDADE ? { $in: [null, ""] } : filtros.cidade;
  if (filtros.pagina) m.caminho = filtros.pagina;
  if (filtros.fonte) {
    // Eventos antigos só têm a origem no próprio evento "origem".
    m.$or = [{ fonte: filtros.fonte }, { tipo: "origem", valor: filtros.fonte }];
  }
  return m;
}

/** Query string com os filtros/período atuais, alterando `mudar` (null apaga). */
export function qs(atual, mudar = {}) {
  const p = new URLSearchParams();
  const todos = { ...atual, ...mudar };
  for (const k of ["periodo", "de", "ate", "pais", "cidade", "pagina", "fonte"]) {
    const v = todos[k];
    if (v != null && v !== "") p.set(k, v);
  }
  if (todos.periodo !== "pers") {
    p.delete("de");
    p.delete("ate");
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

// ---------- CSV ----------

/** Linha CSV (separador ";" — abre bem no Excel em português). */
export function linhaCsv(valores) {
  return valores
    .map((v) => {
      let s = v == null ? "" : String(v);
      // Evita fórmulas no Excel (mas deixa os números negativos).
      if (/^[=+\-@\t\r]/.test(s) && !/^-?\d+([.,]\d+)?%?$/.test(s)) s = "'" + s;
      return /[";\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
    })
    .join(";");
}
