import { getDb } from "@/lib/mongodb";
import {
  matchEventos,
  expressaoBaldeMongo,
  sequenciaBaldes,
  preencherSerie,
  grelhaCalor,
  semFiltros,
  paginacao,
  POR_PAGINA,
  TZ,
} from "@/lib/analytics";

/**
 * Leituras de analytics para o backoffice (página e exportação CSV). Cada
 * período é UMA agregação: $match no intervalo de datas (+ filtros) primeiro,
 * para usar os índices, e depois um $facet com todos os quadros.
 */

const TOP = 15;

const topPor = (campo, tipo, limite = TOP) => [
  { $match: { tipo } },
  { $group: { _id: campo, n: { $sum: 1 } } },
  { $sort: { n: -1, _id: 1 } },
  { $limit: limite },
];

// Visitas (eventos "origem") e páginas vistas na mesma linha.
const visitasEPaginas = (chave, limite) => [
  { $match: { tipo: { $in: ["origem", "pagina_vista"] } } },
  {
    $group: {
      _id: chave,
      visitas: { $sum: { $cond: [{ $eq: ["$tipo", "origem"] }, 1, 0] } },
      paginas: { $sum: { $cond: [{ $eq: ["$tipo", "pagina_vista"] }, 1, 0] } },
    },
  },
  { $sort: { visitas: -1, paginas: -1 } },
  { $limit: limite },
];

const VAZIO = {
  tipos: {},
  serie: { visitas: [], paginas: [] },
  calor: grelhaCalor([]),
  calorTodo: grelhaCalor([]),
  semCidade: 0,
  paises: [],
  cidades: [],
  paginas: [],
  idiomas: [],
  fontes: [],
  dispositivos: [],
  vistos: [],
  leads: [],
  interesse: [],
  pesquisas: [],
  filtros: [],
  comparacoes: [],
  opcoesPais: [],
};

const contarTipos = (linhas) => Object.fromEntries((linhas || []).map((l) => [l._id, l.n]));

function serieDe(linhas, chaves) {
  const v = [];
  const p = [];
  for (const l of linhas || []) (l._id.t === "origem" ? v : p).push({ _id: l._id.b, n: l.n });
  return { visitas: preencherSerie(chaves, v), paginas: preencherSerie(chaves, p) };
}

/**
 * Tudo o que a página de analytics mostra, para um período (lib/analytics →
 * resolverPeriodo) e filtros (lerFiltros). Sem MONGODB_URI devolve vazio; um
 * erro da base é lançado (a página mostra o aviso).
 */
export async function obterAnalytics(periodo, filtros = {}) {
  const gran = periodo.granularidade;
  const chaves = sequenciaBaldes(periodo.inicio, periodo.fim, gran);
  const chavesAnt = sequenciaBaldes(periodo.anterior.inicio, periodo.anterior.fimSerie, gran);
  const vazio = {
    ...VAZIO,
    chaves,
    serie: serieDe([], chaves),
    anterior: { tipos: {}, serie: serieDe([], chavesAnt) },
  };
  if (!process.env.MONGODB_URI) return vazio;

  const db = await getDb();
  const col = db.collection("eventos");
  const balde = expressaoBaldeMongo(gran);
  const serieFacet = [
    { $match: { tipo: { $in: ["origem", "pagina_vista"] } } },
    { $group: { _id: { b: balde, t: "$tipo" }, n: { $sum: 1 } } },
  ];
  // Cidades: com um país escolhido, as cidades desse país; senão as de todos.
  const chaveCidade = { pais: "$pais", cidade: { $ifNull: ["$cidade", ""] } };
  const semLocal = semFiltros(filtros, "pais", "cidade");
  // O mapa de calor e os gráficos por dia/hora mostram sempre a grelha toda
  // (com os outros filtros), para o horário escolhido ter contexto.
  const comHorario = filtros.dia != null || filtros.hora != null;
  const calorFacet = [
    { $match: { tipo: "origem" } },
    {
      $group: {
        _id: {
          d: { $dayOfWeek: { date: "$criadoEm", timezone: TZ } },
          h: { $hour: { date: "$criadoEm", timezone: TZ } },
        },
        n: { $sum: 1 },
      },
    },
  ];

  const [atual, anterior, opcoesPais, calorTodo] = await Promise.all([
    col
      .aggregate([
        { $match: matchEventos(periodo.inicio, periodo.fim, filtros) },
        {
          $facet: {
            tipos: [{ $group: { _id: "$tipo", n: { $sum: 1 } } }],
            serie: serieFacet,
            calor: calorFacet,
            semCidade: [{ $match: { tipo: "origem", cidade: { $in: [null, ""] } } }, { $count: "n" }],
            paises: visitasEPaginas("$pais", 40),
            cidades: visitasEPaginas(chaveCidade, 40),
            paginas: topPor("$valor", "pagina_vista", 25),
            idiomas: topPor("$lang", "pagina_vista", 5),
            fontes: topPor("$valor", "origem", 20),
            dispositivos: topPor("$dispositivo", "origem", 5),
            vistos: topPor("$valor", "empreendimento_visto"),
            leads: topPor("$valor", "lead_enviada"),
            interesse: topPor("$valor", "interesse", 10),
            pesquisas: topPor("$valor", "pesquisa", 10),
            filtros: topPor("$valor", "filtro", 10),
            comparacoes: topPor("$valor", "comparacao", 10),
          },
        },
      ])
      .next(),
    col
      .aggregate([
        {
          $match: matchEventos(periodo.anterior.inicio, periodo.anterior.fimSerie, filtros),
        },
        {
          $facet: {
            // Totais só até ao mesmo ponto do período (comparação justa).
            tipos: [
              { $match: { criadoEm: { $lt: periodo.anterior.fim } } },
              { $group: { _id: "$tipo", n: { $sum: 1 } } },
            ],
            serie: serieFacet,
          },
        },
      ])
      .next(),
    // Países com atividade no período (para o seletor do filtro).
    col
      .aggregate([
        { $match: { ...matchEventos(periodo.inicio, periodo.fim, semLocal), tipo: { $in: ["origem", "pagina_vista"] } } },
        { $group: { _id: "$pais", n: { $sum: 1 } } },
        { $match: { _id: { $nin: [null, ""] } } },
        { $sort: { n: -1 } },
        { $limit: 80 },
      ])
      .toArray(),
    comHorario
      ? col
          .aggregate([
            { $match: matchEventos(periodo.inicio, periodo.fim, semFiltros(filtros, "dia", "hora")) },
            ...calorFacet,
          ])
          .toArray()
      : null,
  ]);

  const a = atual || {};
  const calor = grelhaCalor(a.calor);
  return {
    ...vazio,
    ...a,
    tipos: contarTipos(a.tipos),
    serie: serieDe(a.serie, chaves),
    calor,
    // Grelha sem os filtros dia/hora (igual à de cima quando não há horário).
    calorTodo: calorTodo ? grelhaCalor(calorTodo) : calor,
    semCidade: a.semCidade?.[0]?.n || 0,
    anterior: {
      tipos: contarTipos(anterior?.tipos),
      serie: serieDe(anterior?.serie, chavesAnt),
    },
    opcoesPais: opcoesPais.map((p) => p._id),
  };
}

/**
 * Registo das interações (eventos) filtradas, mais recentes primeiro, uma
 * página de cada vez. `tipos` (lista) restringe os tipos; vazio = todos.
 * Com `limite` (exportação) devolve até esse número de eventos, sem páginas.
 */
export async function obterInteracoes(periodo, filtros = {}, { tipos = [], pagina = 1, limite } = {}) {
  const vazio = { itens: [], total: 0, ...paginacao(0, 1) };
  if (!process.env.MONGODB_URI) return vazio;
  const db = await getDb();
  const match = matchEventos(periodo.inicio, periodo.fim, filtros);
  if (tipos.length) match.tipo = { $in: tipos };
  const campos = {
    _id: 0,
    tipo: 1,
    valor: 1,
    caminho: 1,
    cidade: 1,
    pais: 1,
    dispositivo: 1,
    fonte: 1,
    criadoEm: 1,
  };
  const col = db.collection("eventos");
  if (limite) {
    const itens = await col.find(match, { projection: campos }).sort({ criadoEm: -1 }).limit(limite).toArray();
    return { ...vazio, itens, total: itens.length };
  }
  const total = await col.countDocuments(match);
  const pg = paginacao(total, pagina, POR_PAGINA);
  const itens = total
    ? await col.find(match, { projection: campos }).sort({ criadoEm: -1 }).skip(pg.skip).limit(POR_PAGINA).toArray()
    : [];
  return { itens, total, ...pg };
}

/** Contagens do conteúdo (independentes dos filtros). */
export async function contagensConteudo() {
  const vazio = { leads: 0, leads7: 0, leads30: 0, comparacoes: 0, anuncios: 0, paginas: 0 };
  if (!process.env.MONGODB_URI) return vazio;
  const db = await getDb();
  const agora = Date.now();
  const d7 = new Date(agora - 7 * 864e5);
  const d30 = new Date(agora - 30 * 864e5);
  const [leads, leads7, leads30, comparacoes, anuncios, paginas] = await Promise.all([
    db.collection("contactos").countDocuments(),
    db.collection("contactos").countDocuments({ criadoEm: { $gte: d7 } }),
    db.collection("contactos").countDocuments({ criadoEm: { $gte: d30 } }),
    db.collection("comparacoes_cache").countDocuments(),
    db.collection("anuncios").countDocuments(),
    db.collection("paginas").countDocuments(),
  ]);
  return { leads, leads7, leads30, comparacoes, anuncios, paginas };
}
