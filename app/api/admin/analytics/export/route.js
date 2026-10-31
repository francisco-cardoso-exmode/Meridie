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
} from "@/lib/analytics";
import { obterAnalytics } from "@/lib/analyticsDados";

export const dynamic = "force-dynamic";

// Resumo dos eventos filtrados (os mesmos filtros da página, pelo endereço)
// em CSV: indicadores, evolução no tempo e os rankings. Separador ";" e BOM
// para o Excel em português abrir com os acentos certos.
export async function GET(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });

  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const periodo = resolverPeriodo(sp);
  const filtros = lerFiltros(sp);
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
  for (const [k, v] of Object.entries(filtros)) add("filtro", k, v);

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
  for (const [tipo, n] of Object.entries(t)) add("eventos_por_tipo", tipo, n);

  // Evolução
  ev.serie.visitas.forEach((b, i) =>
    add("evolucao", rotuloLongo(b.chave, periodo.granularidade), b.n, "", `paginas_vistas=${ev.serie.paginas[i]?.n || 0}`)
  );

  // Rankings
  const pv = t.pagina_vista || 0;
  for (const x of ev.paises)
    add("pais", `${nomePais(x._id)} (${x._id || "-"})`, x.visitas, percentagem(x.visitas, visitas), `paginas_vistas=${x.paginas}`);
  for (const x of ev.cidades)
    add(
      "cidade",
      `${x._id.cidade || SEM_CIDADE} (${x._id.pais || "-"})`,
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

  const csv = "﻿" + linhas.map(linhaCsv).join("\r\n") + "\r\n";
  const nome = `analytics-${periodo.de}-a-${periodo.ate}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${nome}"`,
      "Cache-Control": "no-store",
    },
  });
}
