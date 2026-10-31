import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { formatarPreco, PAIS_LABEL } from "@/lib/empreendimentos";
import { leAdmin } from "@/lib/leituraAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import {
  resolverPeriodo,
  lerFiltros,
  picos as calcPicos,
  picoGrelha,
  variacao,
  percentagem,
  qs,
  nomePais,
  rotuloLongo,
  NOME_GRANULARIDADE,
  NOME_DISPOSITIVO,
  DIAS_LONGOS,
  SEM_CIDADE,
} from "@/lib/analytics";
import { obterAnalytics, contagensConteudo } from "@/lib/analyticsDados";
import Filtros from "@/components/admin/analytics/Filtros";
import { Evolucao, TabelaSerie, MapaCalor } from "@/components/admin/analytics/Graficos";
import { Kpis, Ranking } from "@/components/admin/analytics/Quadros";

export const dynamic = "force-dynamic";
export const metadata = { title: "Analytics" };

const BASE = "/admin/analytics";

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

// Quadro simples do conteúdo (empreendimentos por país, estado…).
function Breakdown({ titulo, dados, total }) {
  return (
    <Ranking
      titulo={titulo}
      total={total}
      vazio="Sem dados."
      linhas={dados.map(([k, n]) => ({ k, rotulo: k, n }))}
    />
  );
}

// Nome legível de uma página do site (caminho interno em português).
function fazRotuloPagina(nomePorSlug) {
  const SECOES = {
    portugal: "Portugal",
    brasil: "Brasil",
    "como-funciona": "Como funciona",
    comparar: "Comparar",
    contactos: "Contactos",
    cookies: "Cookies",
    empreendimentos: "Empreendimentos",
    faq: "FAQ",
    marcas: "Marcas",
    parcerias: "Parcerias",
    privacidade: "Privacidade",
    publicidade: "Publicidade",
    "quem-somos": "Quem somos",
    regioes: "Regiões",
    tecnologia: "Tecnologia",
    termos: "Termos",
  };
  return (caminho) => {
    if (!caminho) return "—";
    if (caminho === "/") return "Início";
    const [sec, slug] = caminho.split("/").filter(Boolean);
    const nomeSec = SECOES[sec] || sec;
    if (!slug) return nomeSec;
    if (sec === "empreendimentos" && nomePorSlug[slug]) return `${nomePorSlug[slug]}`;
    return `${nomeSec} › ${slug}`;
  };
}

export default async function AdminAnalytics({ searchParams }) {
  const sp = (await searchParams) || {};
  const periodo = resolverPeriodo(sp);
  const filtros = lerFiltros(sp);
  // Estado atual dos filtros (para os links manterem o resto).
  const atual = {
    periodo: periodo.preset,
    de: periodo.preset === "pers" ? periodo.de : "",
    ate: periodo.preset === "pers" ? periodo.ate : "",
    ...filtros,
  };

  // Se a base falhar, mostra o aviso em vez de zeros/dados de exemplo.
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        allEmpreendimentos({ todos: true, estrito: true }),
        allRegioes({ estrito: true }),
        contagensConteudo(),
        obterAnalytics(periodo, filtros),
      ]),
    null
  );
  if (semBase) {
    return (
      <div className="admin-container">
        <h1>Analytics</h1>
        <AvisoSemBase />
      </div>
    );
  }
  const [emp, reg, db, ev] = dados;
  const agora = new Date();

  const nomePorSlug = Object.fromEntries(emp.map((e) => [e.slug, e.nome]));
  const rotuloPagina = fazRotuloPagina(nomePorSlug);
  const nomeEmp = (s) => (s === "contacto" ? "Formulário de contacto" : nomePorSlug[s] || s);

  // ---- Indicadores do período ----
  const t = ev.tipos;
  const ta = ev.anterior.tipos;
  const visitas = t.origem || 0;
  const paginasV = t.pagina_vista || 0;
  const leads = t.lead_enviada || 0;
  const pv = (tt) => (tt.origem ? (tt.pagina_vista || 0) / tt.origem : 0);
  const conv = (tt) => (tt.origem ? ((tt.lead_enviada || 0) / tt.origem) * 100 : 0);
  const totalEventos = Object.values(t).reduce((a, b) => a + b, 0);
  const kpis = [
    { l: "Visitas", v: visitas, delta: variacao(visitas, ta.origem || 0) },
    { l: "Páginas vistas", v: paginasV, delta: variacao(paginasV, ta.pagina_vista || 0) },
    {
      l: "Páginas por visita",
      v: pv(t),
      casas: 1,
      delta: ta.origem && ta.pagina_vista ? variacao(Math.round(pv(t) * 10), Math.round(pv(ta) * 10)) : null,
    },
    { l: "Leads", v: leads, delta: variacao(leads, ta.lead_enviada || 0) },
    {
      l: "Taxa de conversão",
      v: conv(t),
      casas: 1,
      sufixo: "%",
      pp: true,
      delta: ta.origem ? Math.round((conv(t) - conv(ta)) * 10) / 10 : null,
      nota: "leads ÷ visitas",
    },
  ];

  // ---- Evolução e picos ----
  const gran = periodo.granularidade;
  const picosV = calcPicos(ev.serie.visitas, 3);
  const picosP = calcPicos(ev.serie.paginas, 3);
  const picoHora = picoGrelha(ev.calor);

  // ---- Rankings ----
  const linhasPaises = ev.paises.map((x) => ({
    k: x._id || "-",
    rotulo: nomePais(x._id),
    n: x.visitas,
    extra: `· ${x.paginas.toLocaleString("pt-PT")} pág.`,
    href: x._id ? BASE + qs(atual, { pais: x._id, cidade: null }) : undefined,
    ativo: filtros.pais && filtros.pais === x._id,
  }));
  const linhasCidades = ev.cidades.map((x) => {
    const cidade = x._id.cidade || SEM_CIDADE;
    return {
      k: `${x._id.pais}|${cidade}`,
      rotulo: filtros.pais ? cidade : `${cidade} · ${x._id.pais ? nomePais(x._id.pais) : "?"}`,
      n: x.visitas,
      extra: `· ${x.paginas.toLocaleString("pt-PT")} pág.`,
      href: BASE + qs(atual, { pais: x._id.pais || null, cidade }),
      ativo: filtros.cidade === cidade,
    };
  });
  const linhasPaginas = ev.paginas.map((x) => ({
    k: x._id,
    rotulo: rotuloPagina(x._id),
    n: x.n,
    extra: x._id,
    href: BASE + qs(atual, { pagina: x._id }),
    ativo: filtros.pagina === x._id,
  }));
  const linhasFontes = ev.fontes.map((x) => ({
    k: x._id,
    rotulo: x._id,
    n: x.n,
    href: BASE + qs(atual, { fonte: x._id }),
    ativo: filtros.fonte === x._id,
  }));
  const linhasDisp = ev.dispositivos.map((x) => ({
    k: x._id || "-",
    rotulo: NOME_DISPOSITIVO[x._id] || "(desconhecido)",
    n: x.n,
  }));
  const linhasIdiomas = ev.idiomas.map((x) => ({
    k: x._id || "-",
    rotulo: x._id === "en" ? "Inglês (/en)" : x._id === "pt" ? "Português" : "(desconhecido)",
    n: x.n,
  }));
  const vistosPor = Object.fromEntries(ev.vistos.map((x) => [x._id, x.n]));
  const linhasVistos = ev.vistos.map((x) => ({ k: x._id, rotulo: nomeEmp(x._id), n: x.n }));
  const linhasLeads = ev.leads.map((x) => ({
    k: x._id,
    rotulo: nomeEmp(x._id),
    n: x.n,
    extra: vistosPor[x._id] ? `· ${percentagem(x.n, vistosPor[x._id]).toLocaleString("pt-PT")}% de ${vistosPor[x._id]} vistas` : "",
  }));
  const simples = (lista, nome = (v) => v) => lista.map((x) => ({ k: String(x._id), rotulo: nome(x._id), n: x.n }));
  const linhasComparacoes = simples(ev.comparacoes, (v) => {
    const [s1, s2] = String(v).split("|");
    return `${nomeEmp(s1)} vs ${nomeEmp(s2)}`;
  });

  const opcoes = {
    paises: ev.opcoesPais,
    cidades: [...new Set(ev.cidades.map((x) => x._id.cidade || SEM_CIDADE))],
    paginas: ev.paginas.map((x) => x._id),
    fontes: ev.fontes.map((x) => x._id),
  };

  // ---- Conteúdo (como antes) ----
  const publicados = emp.filter((e) => e.publicado !== false);
  const ocultos = emp.length - publicados.length;
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
    { n: destaque, l: "Em destaque" },
    { n: reg.length, l: "Regiões / zonas" },
    { n: db.leads, l: "Leads (total)" },
    { n: db.leads30, l: "Leads (30 dias)" },
    { n: db.leads7, l: "Leads (7 dias)" },
    { n: db.comparacoes, l: "Comparações IA" },
    { n: db.anuncios, l: "Anúncios" },
    { n: db.paginas, l: "Páginas editadas" },
  ];

  const fmtData = (c) => `${c.slice(8, 10)}/${c.slice(5, 7)}/${c.slice(0, 4)}`;
  const descPeriodo =
    periodo.de === periodo.ate ? fmtData(periodo.de) : `${fmtData(periodo.de)} a ${fmtData(periodo.ate)}`;
  const descAnterior = `desde ${fmtData(periodo.anterior.de)}, com a mesma duração`;

  return (
    <div className="admin-container an-pagina">
      <h1>Analytics</h1>
      <p className="admin-sub">
        Visitas e atividade no site, anónimas (sem cookies nem IP guardado). Hora de Lisboa.
      </p>

      <Filtros atual={atual} periodo={periodo} opcoes={opcoes} rotuloPagina={rotuloPagina} />

      <p className="an-resumo">
        <strong>{descPeriodo}</strong> · {periodo.nDias} dia{periodo.nDias === 1 ? "" : "s"},{" "}
        {NOME_GRANULARIDADE[gran]} · comparado com o período anterior ({descAnterior})
        {filtros.pagina && (
          <>
            <br />
            Com uma página escolhida, &laquo;visitas&raquo; são as visitas que <em>entraram</em> no
            site por essa página.
          </>
        )}
      </p>

      <Kpis itens={kpis} />

      {totalEventos === 0 && (
        <div className="an-bloco an-vazio">
          <p className="muted">
            Sem atividade registada neste período{Object.keys(filtros).length ? " com estes filtros" : ""}.
            Experimenta um período maior{Object.keys(filtros).length ? " ou tira filtros" : ""}. Os
            dados vão aparecendo à medida que as pessoas visitam o site.
          </p>
        </div>
      )}

      <section className="an-secao">
        <h2>Evolução</h2>
        <div className="an-picos">
          {picosV.length ? (
            <p>
              <span className="an-key an-key-pico" aria-hidden="true" /> <strong>Pico:</strong>{" "}
              {rotuloLongo(picosV[0].chave, gran)} com <strong>{picosV[0].n.toLocaleString("pt-PT")}</strong>{" "}
              visita{picosV[0].n === 1 ? "" : "s"}
              {picosV.length > 1 && (
                <span className="muted">
                  {" "}· a seguir: {picosV.slice(1).map((p) => `${rotuloLongo(p.chave, gran)} (${p.n})`).join(", ")}
                </span>
              )}
            </p>
          ) : (
            <p className="muted">Sem visitas neste período — ainda não há picos.</p>
          )}
          {picoHora && (
            <p>
              <strong>Hora mais movimentada:</strong> {DIAS_LONGOS[(picoHora.dia + 1) % 7]} das{" "}
              {picoHora.hora}h às {picoHora.hora + 1}h ({picoHora.n} visita{picoHora.n === 1 ? "" : "s"} no total)
            </p>
          )}
        </div>
        <div className="an-evo-par">
          <Evolucao
            titulo={`Visitas ${NOME_GRANULARIDADE[gran]}`}
            unidade="visitas"
            serie={ev.serie.visitas}
            anterior={ev.anterior.serie.visitas}
            gran={gran}
            picos={picosV}
            agora={agora}
          />
          <Evolucao
            titulo={`Páginas vistas ${NOME_GRANULARIDADE[gran]}`}
            unidade="páginas vistas"
            serie={ev.serie.paginas}
            anterior={ev.anterior.serie.paginas}
            gran={gran}
            picos={picosP}
            agora={agora}
          />
        </div>
        <TabelaSerie
          visitas={ev.serie.visitas}
          paginas={ev.serie.paginas}
          anteriorV={ev.anterior.serie.visitas}
          gran={gran}
        />
      </section>

      <section className="an-secao">
        <h2>Quando visitam</h2>
        <p className="admin-sub an-sub">Visitas por dia da semana e hora (Lisboa), no período escolhido.</p>
        <div className="an-bloco">
          <MapaCalor grelha={ev.calor} />
        </div>
      </section>

      <section className="an-secao">
        <h2>De onde vêm</h2>
        <p className="admin-sub an-sub">
          Clica num país para ver as cidades desse país; clica numa cidade, página ou origem para
          filtrar a página toda. Localização aproximada (dada pela Vercel); eventos antigos não têm
          cidade.
        </p>
        <div className="an-grid">
          <Ranking
            titulo="Países"
            nota="visitas · % das visitas · páginas vistas"
            linhas={linhasPaises}
            total={visitas || undefined}
          />
          <Ranking
            titulo={filtros.pais ? `Cidades — ${nomePais(filtros.pais)}` : "Cidades (todas)"}
            nota="visitas · % · páginas vistas"
            linhas={linhasCidades}
            total={visitas || undefined}
          />
          <Ranking titulo="Origem (de onde chegam)" linhas={linhasFontes} total={visitas || undefined} />
          <Ranking titulo="Dispositivos" linhas={linhasDisp} />
        </div>
      </section>

      <section className="an-secao">
        <h2>O que vêem</h2>
        <div className="an-grid">
          <Ranking titulo="Páginas mais vistas" linhas={linhasPaginas} total={paginasV || undefined} />
          <Ranking titulo="Empreendimentos mais vistos" linhas={linhasVistos} />
          <Ranking
            titulo="Leads por empreendimento"
            nota="leads · % das leads · conversão sobre as vistas"
            linhas={linhasLeads}
            total={leads || undefined}
          />
          <Ranking titulo="Idioma das páginas vistas" linhas={linhasIdiomas} />
          <Ranking titulo="Interesse por empreendimento" linhas={simples(ev.interesse, nomeEmp)} />
          <Ranking titulo="Pesquisas mais feitas" linhas={simples(ev.pesquisas)} />
          <Ranking titulo="Filtros mais usados" linhas={simples(ev.filtros)} />
          <Ranking titulo="Comparações mais feitas" linhas={linhasComparacoes} />
        </div>
      </section>

      <details className="an-conteudo">
        <summary>
          <h2>Conteúdo do site</h2>
          <span className="muted">empreendimentos, regiões, leads e preços (não depende dos filtros)</span>
        </summary>
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
      </details>

      <p className="email-note" style={{ marginTop: 24 }}>
        Uma <strong>visita</strong> é a primeira página de cada sessão (um separador aberto no
        site); as <strong>páginas vistas</strong> contam cada página aberta, incluindo a navegação
        dentro do site. Robôs conhecidos não contam. Para mais detalhe (tempo na página, tempo
        real), liga o Google Analytics com o teu ID <code>G-…</code> na Vercel.
      </p>
    </div>
  );
}
