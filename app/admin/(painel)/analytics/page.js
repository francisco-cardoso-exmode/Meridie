import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { getDb } from "@/lib/mongodb";
import { formatarPreco, PAIS_LABEL } from "@/lib/empreendimentos";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

async function contagensDb() {
  const vazio = { leads: 0, leads7: 0, leads30: 0, comparacoes: 0, anuncios: 0, paginas: 0 };
  try {
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
  } catch {
    return vazio;
  }
}

async function eventosAgg() {
  const vazio = {
    vistos: [],
    pesquisas: [],
    filtros: [],
    comparacoes: [],
    leads: [],
    interesse: [],
    paises: [],
    total: 0,
  };
  try {
    const db = await getDb();
    const col = db.collection("eventos");
    const top = (tipo, limit = 8) =>
      col
        .aggregate([
          { $match: { tipo } },
          { $group: { _id: "$valor", n: { $sum: 1 } } },
          { $sort: { n: -1 } },
          { $limit: limit },
        ])
        .toArray();
    const [vistos, pesquisas, filtros, comparacoes, leads, interesse, paises, total] =
      await Promise.all([
      top("empreendimento_visto"),
      top("pesquisa"),
      top("filtro"),
      top("comparacao"),
      top("lead_enviada"),
      top("interesse"),
      col
        .aggregate([
          { $match: { pais: { $nin: [null, ""] } } },
          { $group: { _id: "$pais", n: { $sum: 1 } } },
          { $sort: { n: -1 } },
          { $limit: 12 },
        ])
        .toArray(),
      col.countDocuments(),
    ]);
    return { vistos, pesquisas, filtros, comparacoes, leads, interesse, paises, total };
  } catch {
    return vazio;
  }
}

const PAIS_COD = {
  PT: "Portugal",
  BR: "Brasil",
  ES: "Espanha",
  FR: "França",
  GB: "Reino Unido",
  US: "EUA",
  DE: "Alemanha",
  CH: "Suíça",
  AO: "Angola",
};

function agrupar(lista, chave) {
  const m = {};
  for (const e of lista) {
    const k = (typeof chave === "function" ? chave(e) : e[chave]) || "—";
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m).sort((a, b) => b[1] - a[1]);
}

function precoMedio(lista, moeda) {
  const vals = lista
    .filter((e) => e.moeda === moeda && e.preco > 0 && e.precoTipo !== "consulta")
    .map((e) => e.preco);
  if (!vals.length) return null;
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function Breakdown({ titulo, dados, total }) {
  const max = Math.max(1, ...dados.map((d) => d[1]));
  return (
    <div className="an-bloco">
      <h3>{titulo}</h3>
      {dados.length === 0 ? (
        <p className="muted">Sem dados.</p>
      ) : (
        <ul className="an-bars">
          {dados.map(([k, v]) => (
            <li key={k}>
              <span className="an-bar-label">{k}</span>
              <span className="an-bar-track">
                <span className="an-bar-fill" style={{ width: `${(v / max) * 100}%` }} />
              </span>
              <span className="an-bar-val">
                {v}
                {total ? <small> · {Math.round((v / total) * 100)}%</small> : null}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default async function AdminAnalytics() {
  const [emp, reg, db, ev] = await Promise.all([
    allEmpreendimentos({ todos: true }),
    allRegioes(),
    contagensDb(),
    eventosAgg(),
  ]);

  const nomePorSlug = Object.fromEntries(emp.map((e) => [e.slug, e.nome]));
  const vistosD = ev.vistos.map((x) => [nomePorSlug[x._id] || x._id, x.n]);
  const pesquisasD = ev.pesquisas.map((x) => [x._id, x.n]);
  const filtrosD = ev.filtros.map((x) => [x._id, x.n]);
  const comparacoesD = ev.comparacoes.map((x) => {
    const [s1, s2] = String(x._id).split("|");
    return [`${nomePorSlug[s1] || s1} vs ${nomePorSlug[s2] || s2}`, x.n];
  });
  const paisesD = ev.paises.map((x) => [PAIS_COD[x._id] || x._id, x.n]);
  const leadsD = ev.leads.map((x) => [nomePorSlug[x._id] || x._id, x.n]);
  const interesseD = ev.interesse.map((x) => [nomePorSlug[x._id] || x._id, x.n]);

  const publicados = emp.filter((e) => e.publicado !== false);
  const ocultos = emp.length - publicados.length;
  const reais = emp.filter((e) => e.construtora).length;
  const destaque = emp.filter((e) => e.destaque).length;

  const porPais = agrupar(emp, (e) => PAIS_LABEL[e.pais] || e.pais);
  const porEstado = agrupar(emp, "estado");
  const porFinalidade = agrupar(emp, "finalidade");
  const porTipo = agrupar(emp, "tipo");
  const porCidade = agrupar(emp, "cidade").slice(0, 8);

  const medioPT = precoMedio(emp, "EUR");
  const medioBR = precoMedio(emp, "BRL");

  const regTopo = reg.filter((r) => !r.parent).length;
  const regZonas = reg.length - regTopo;

  const stats = [
    { n: emp.length, l: "Empreendimentos" },
    { n: publicados.length, l: "Publicados" },
    { n: ocultos, l: "Ocultos" },
    { n: reais, l: "Reais (com construtora)" },
    { n: destaque, l: "Em destaque" },
    { n: reg.length, l: "Regiões / zonas" },
    { n: db.leads, l: "Leads (total)" },
    { n: db.leads30, l: "Leads (30 dias)" },
    { n: db.leads7, l: "Leads (7 dias)" },
    { n: db.comparacoes, l: "Comparações IA" },
    { n: db.anuncios, l: "Anúncios" },
    { n: db.paginas, l: "Páginas editadas" },
  ];

  return (
    <div className="admin-container">
      <h1>Analytics</h1>
      <p className="admin-sub">Visão geral do conteúdo e da atividade do site.</p>

      <div className="admin-stats an-stats">
        {stats.map((s) => (
          <div className="admin-stat" key={s.l}>
            <div className="n">{s.n}</div>
            <div className="l">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="an-grid">
        <Breakdown titulo="Por país" dados={porPais} total={emp.length} />
        <Breakdown titulo="Por estado do imóvel" dados={porEstado} total={emp.length} />
        <Breakdown titulo="Por finalidade" dados={porFinalidade} total={emp.length} />
        <Breakdown titulo="Por tipologia" dados={porTipo} total={emp.length} />
        <Breakdown titulo="Top cidades" dados={porCidade} total={emp.length} />
        <div className="an-bloco">
          <h3>Preço médio</h3>
          <ul className="an-precos">
            <li>
              <span>Portugal (€)</span>
              <strong>{medioPT ? formatarPreco(medioPT, "EUR") : "—"}</strong>
            </li>
            <li>
              <span>Brasil (R$)</span>
              <strong>{medioBR ? formatarPreco(medioBR, "BRL") : "—"}</strong>
            </li>
            <li>
              <span>Regiões de topo</span>
              <strong>{regTopo}</strong>
            </li>
            <li>
              <span>Zonas</span>
              <strong>{regZonas}</strong>
            </li>
          </ul>
        </div>
      </div>

      <h2 style={{ marginTop: 36, fontSize: "1.3rem" }}>Atividade dos visitantes</h2>
      <p className="admin-sub">
        O que as pessoas mais vêem, pesquisam e filtram no site. Cresce à medida que recebes
        visitas online{ev.total ? ` (${ev.total} ações registadas)` : ""}.
      </p>
      {ev.total === 0 ? (
        <div className="an-bloco" style={{ marginTop: 8 }}>
          <p className="muted">
            Ainda sem dados de visitantes. Assim que o site estiver online e as pessoas
            navegarem, aparecem aqui os empreendimentos mais vistos, as pesquisas e os filtros
            mais usados, e de que países vêm.
          </p>
        </div>
      ) : (
        <div className="an-grid">
          <Breakdown titulo="Empreendimentos mais vistos" dados={vistosD} />
          <Breakdown titulo="Pesquisas mais feitas" dados={pesquisasD} />
          <Breakdown titulo="Filtros mais usados" dados={filtrosD} />
          <Breakdown titulo="Comparações mais feitas" dados={comparacoesD} />
          <Breakdown titulo="Interesse por empreendimento" dados={interesseD} />
          <Breakdown titulo="Leads por empreendimento" dados={leadsD} />
          <Breakdown titulo="Visitantes por país" dados={paisesD} />
        </div>
      )}

      <p className="email-note" style={{ marginTop: 24 }}>
        Nota: estes números são do teu conteúdo, das leads, e da atividade no site (vistos,
        pesquisas, filtros, comparações). Para dados de tráfego mais detalhados (sessões,
        origem, cidade exata, tempo real), liga o Google Analytics com o teu ID
        <code> G-…</code> na Vercel.
      </p>
    </div>
  );
}
