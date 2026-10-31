import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import {
  resolverPeriodo,
  lerFiltros,
  linhaCsv,
  percentagem,
  variacao,
  nomePais,
  rotuloLongo,
  NOME_DISPOSITIVO,
  SEM_CIDADE,
  TIPOS_EVENTO,
  DIAS_SEMANA,
  lerTipos,
  dataHoraLisboa,
  detalheEvento,
} from "@/lib/analytics";
import { obterAnalytics, obterInteracoes } from "@/lib/analyticsDados";
import { allEmpreendimentos } from "@/lib/store";

export const dynamic = "force-dynamic";

const MAX_INTERACOES = 10000;

// Separador ";" e BOM para o Excel em português abrir com os acentos certos.
function respostaCsv(linhas, nome) {
  const csv = "﻿" + linhas.map(linhaCsv).join("\r\n") + "\r\n";
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}

// ?vista=interacoes → o registo das interações filtradas (uma linha por
// evento, mais recentes primeiro, até MAX_INTERACOES), com os tipos
// escolhidos (?tipos=) e todos os filtros da página (incluindo dia/hora).
async function exportarInteracoes(periodo, filtros, tipos) {
  let r;
  let nomePorSlug = {};
  try {
    const [inter, emp] = await Promise.all([
      obterInteracoes(periodo, filtros, { tipos, limite: MAX_INTERACOES }),
      allEmpreendimentos({ todos: true }).catch(() => []),
    ]);
    r = inter;
    nomePorSlug = Object.fromEntries((emp || []).map((e) => [e.slug, e.nome]));
  } catch (e) {
    console.error("exportar interações:", e?.message || e);
    return NextResponse.json({ ok: false, erro: "Sem ligação à base de dados." }, { status: 503 });
  }
  const nomeEmp = (s) => (s === "contacto" ? "Formulário de contacto" : nomePorSlug[s] || s);
  const linhas = [
    ["data_hora_lisboa", "tipo", "tipo_codigo", "detalhe", "valor", "pagina", "cidade", "pais", "dispositivo", "origem"],
  ];
  for (const e of r.itens) {
    linhas.push([
      e.criadoEm ? dataHoraLisboa(new Date(e.criadoEm)) : "",
      TIPOS_EVENTO[e.tipo] || e.tipo,
      e.tipo,
      detalheEvento(e, { nomeEmp }),
      e.valor,
      e.caminho || "",
      e.cidade || "",
      e.pais ? `${nomePais(e.pais)} (${e.pais})` : "",
      NOME_DISPOSITIVO[e.dispositivo] || "",
      e.fonte || (e.tipo === "origem" ? e.valor : ""),
    ]);
  }
  return respostaCsv(linhas, `interacoes-${periodo.de}-a-${periodo.ate}.csv`);
}

// Resumo dos eventos filtrados (os mesmos filtros da página, pelo endereço,
// incluindo dia/hora/imóvel) em CSV: indicadores, evolução no tempo, visitas
// por dia da semana e hora, e os rankings.
export async function GET(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const periodo = resolverPeriodo(sp);
  const filtros = lerFiltros(sp);
  const tipos = lerTipos(sp);
  if (sp.vista === "interacoes") return exportarInteracoes(periodo, filtros, tipos);

  let ev;
  try {
    ev = await obterAnalytics(periodo, filtros);
  } catch (e) {
    console.error("exportar analytics:", e?.message || e);
    return NextResponse.json({ ok: false, erro: "Sem ligação à base de dados." }, { status: 503 });
  }

  const num = (v) => (typeof v === "number" ? String(Math.round(v * 10) / 10).replace(".", ",") : v);
  const linhas = [["secao", "item", "valor", "percentagem", "extra"]];
  const add = (secao, item, valor, pct = "", extra = "") => linhas.push([secao, item, num(valor), num(pct), extra]);

  // Contexto
  add("periodo", "de", periodo.de);
  add("periodo", "ate", periodo.ate);
  add("periodo", "granularidade", periodo.granularidade);
  for (const [k, v] of Object.entries(filtros))
    add("filtro", k, v, "", k === "dia" ? DIAS_SEMANA[v - 1] : k === "hora" ? `${v}h-${v + 1}h` : "");
  if (tipos.length) add("filtro", "tipos", tipos.join(","), "", "só no registo de interações");

  // Indicadores (com a variação face ao período anterior na coluna "extra")
  const t = ev.tipos;
  const ta = ev.anterior.tipos;
  const visitas = t.origem || 0;
  const vs = (a, b) => {
    const d = variacao(a, b);
    return d === null ? "novo" : `${num(d)}% vs anterior (${b})`;
  };
  add("indicador", "visitas", visitas, "", vs(visitas, ta.origem || 0));
  add("indicador", "paginas_vistas", t.pagina_vista || 0, "", vs(t.pagina_vista || 0, ta.pagina_vista || 0));
  add("indicador", "paginas_por_visita", visitas ? (t.pagina_vista || 0) / visitas : 0);
  add("indicador", "leads", t.lead_enviada || 0, "", vs(t.lead_enviada || 0, ta.lead_enviada || 0));
  add("indicador", "taxa_conversao_%", visitas ? ((t.lead_enviada || 0) / visitas) * 100 : 0);
  for (const [tipo, n] of Object.entries(t)) add("eventos_por_tipo", tipo, n, "", TIPOS_EVENTO[tipo] || "");

  // Evolução
  ev.serie.visitas.forEach((b, i) =>
    add("evolucao", rotuloLongo(b.chave, periodo.granularidade), b.n, "", `paginas_vistas=${ev.serie.paginas[i]?.n || 0}`)
  );

  // Visitas por dia da semana e por hora (com os outros filtros, sem dia/hora)
  ev.calorTodo.forEach((l, i) => add("visitas_por_dia_semana", DIAS_SEMANA[i], l.reduce((a, b) => a + b, 0)));
  for (let h = 0; h < 24; h++) add("visitas_por_hora", `${h}h`, ev.calorTodo.reduce((a, l) => a + l[h], 0));

  // Rankings
  const pv = t.pagina_vista || 0;
  for (const x of ev.paises)
    add("pais", `${nomePais(x._id)} (${x._id || "-"})`, x.visitas, percentagem(x.visitas, visitas), `paginas_vistas=${x.paginas}`);
  if (ev.semCidade) add("cidade_nao_identificada", SEM_CIDADE, ev.semCidade, percentagem(ev.semCidade, visitas));
  for (const x of ev.cidades.filter((c) => c._id.cidade))
    add(
      "cidade",
      `${x._id.cidade} (${x._id.pais || "-"})`,
      x.visitas,
      percentagem(x.visitas, visitas),
      `paginas_vistas=${x.paginas}`
    );
  for (const x of ev.paginas) add("pagina", x._id, x.n, percentagem(x.n, pv));
  for (const x of ev.fontes) add("origem", x._id, x.n, percentagem(x.n, visitas));
  for (const x of ev.dispositivos) add("dispositivo", NOME_DISPOSITIVO[x._id] || "(desconhecido)", x.n, percentagem(x.n, visitas));
  for (const x of ev.idiomas) add("idioma", x._id || "(desconhecido)", x.n, percentagem(x.n, pv));
  for (const [secao, lista] of [
    ["empreendimento_visto", ev.vistos],
    ["lead_por_empreendimento", ev.leads],
    ["interesse", ev.interesse],
    ["pesquisa", ev.pesquisas],
    ["filtro_usado", ev.filtros],
    ["comparacao", ev.comparacoes],
  ])
    for (const x of lista) add(secao, x._id, x.n);

  return respostaCsv(linhas, `analytics-${periodo.de}-a-${periodo.ate}.csv`);
}
