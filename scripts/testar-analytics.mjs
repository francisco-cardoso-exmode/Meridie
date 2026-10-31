// Testes das funções puras de lib/analytics.js (baldes, períodos, picos…),
// com eventos falsos em memória — não precisa da base de dados:
//   node scripts/testar-analytics.mjs
import assert from "node:assert/strict";
import {
  chaveBalde,
  sequenciaBaldes,
  preencherSerie,
  picos,
  resolverPeriodo,
  instanteLisboa,
  dataCivil,
  grelhaCalor,
  picoGrelha,
  variacao,
  escalaEixo,
  normalizarCaminho,
  classeDispositivo,
  descodificarCidade,
  lerFiltros,
  matchEventos,
  qs,
  linhaCsv,
  rotuloLongo,
  nomePais,
  SEM_CIDADE,
} from "../lib/analytics.js";

let ok = 0;
const t = (nome, fn) => {
  try {
    fn();
    ok++;
  } catch (e) {
    console.error(`✗ ${nome}\n  ${e.message}`);
    process.exitCode = 1;
  }
};

// Agrupa eventos em memória como o Mongo faria (mesma chave).
const agrupar = (eventos, gran) => {
  const m = {};
  for (const d of eventos) {
    const k = chaveBalde(d, gran);
    m[k] = (m[k] || 0) + 1;
  }
  return Object.entries(m).map(([_id, n]) => ({ _id, n }));
};

t("meia-noite de Lisboa (verão e inverno)", () => {
  assert.equal(instanteLisboa("2026-07-01").toISOString(), "2026-06-30T23:00:00.000Z");
  assert.equal(instanteLisboa("2026-12-01").toISOString(), "2026-12-01T00:00:00.000Z");
  // Dia da mudança (25/10/2026, 02h → 01h): a meia-noite ainda é de verão.
  assert.equal(instanteLisboa("2026-10-25").toISOString(), "2026-10-24T23:00:00.000Z");
  assert.equal(instanteLisboa("2026-03-29", 3).toISOString(), "2026-03-29T02:00:00.000Z");
});

t("baldes por hora no dia em que a hora atrasa (25 h → 24 chaves)", () => {
  const ini = instanteLisboa("2026-10-25");
  const fim = instanteLisboa("2026-10-26");
  assert.equal(fim - ini, 25 * 36e5);
  const ch = sequenciaBaldes(ini, fim, "hora");
  assert.equal(ch.length, 24);
  assert.equal(ch[0], "2026-10-25T00");
  assert.equal(ch[23], "2026-10-25T23");
  // As duas "01h" caem no mesmo balde.
  const ev = [new Date("2026-10-25T00:30:00Z"), new Date("2026-10-25T01:30:00Z")];
  const s = preencherSerie(ch, agrupar(ev, "hora"));
  assert.equal(s[1].n, 2);
});

t("baldes por hora no dia em que a hora adianta (23 h, sem 01h)", () => {
  const ch = sequenciaBaldes(instanteLisboa("2026-03-29"), instanteLisboa("2026-03-30"), "hora");
  assert.equal(ch.length, 23);
  assert.ok(!ch.includes("2026-03-29T01"));
});

t("baldes por dia atravessam a mudança de hora sem saltar nem repetir", () => {
  const ch = sequenciaBaldes(instanteLisboa("2026-10-20"), instanteLisboa("2026-10-31"), "dia");
  assert.equal(ch.length, 11);
  assert.equal(new Set(ch).size, 11);
  assert.equal(ch.at(-1), "2026-10-30");
  // 23:30 de Lisboa em horário de verão é 22:30 UTC — conta no próprio dia.
  assert.equal(chaveBalde(new Date("2026-07-10T22:30:00Z"), "dia"), "2026-07-10");
  assert.equal(chaveBalde(new Date("2026-07-10T23:30:00Z"), "dia"), "2026-07-11");
});

t("semanas começam à segunda, meses no dia 1", () => {
  assert.equal(chaveBalde(new Date("2026-10-31T12:00:00Z"), "semana"), "2026-10-26");
  assert.equal(chaveBalde(new Date("2026-10-26T00:30:00Z"), "semana"), "2026-10-26");
  const sem = sequenciaBaldes(instanteLisboa("2026-06-01"), instanteLisboa("2026-10-01"), "semana");
  assert.equal(sem[0], "2026-06-01");
  assert.ok(sem.every((c) => new Date(`${c}T12:00:00Z`).getUTCDay() === 1));
  const mes = sequenciaBaldes(instanteLisboa("2025-11-01"), instanteLisboa("2026-11-01"), "mes");
  assert.equal(mes.length, 12);
  assert.equal(mes[0], "2025-11");
  assert.equal(mes.at(-1), "2026-10");
});

t("períodos e granularidade automática", () => {
  const agora = new Date("2026-10-31T15:00:00Z");
  const hoje = resolverPeriodo({ periodo: "hoje" }, agora);
  assert.equal(hoje.granularidade, "hora");
  assert.equal(hoje.de, "2026-10-31");
  assert.equal(hoje.anterior.de, "2026-10-30");
  // "Hoje até às 15h" compara com "ontem até às 15h".
  assert.equal(hoje.anterior.fim.toISOString(), "2026-10-30T15:00:00.000Z");
  const p30 = resolverPeriodo({}, agora);
  assert.equal(p30.preset, "30d");
  assert.equal(p30.nDias, 30);
  assert.equal(p30.granularidade, "dia");
  assert.equal(p30.de, "2026-10-02");
  assert.equal(resolverPeriodo({ periodo: "12m" }, agora).granularidade, "mes");
  assert.equal(resolverPeriodo({ periodo: "12m" }, agora).de, "2025-11-01");
  const pers = resolverPeriodo({ periodo: "pers", de: "2026-09-01", ate: "2026-12-31" }, agora);
  assert.equal(pers.ate, "2026-10-31"); // não passa de hoje
  assert.equal(pers.granularidade, "dia");
  const longo = resolverPeriodo({ periodo: "pers", de: "2026-04-01", ate: "2026-06-30" }, agora);
  assert.equal(longo.granularidade, "semana");
  const trocado = resolverPeriodo({ periodo: "pers", de: "2026-10-10", ate: "2026-10-01" }, agora);
  assert.equal(trocado.de, "2026-10-01");
  assert.equal(resolverPeriodo({ periodo: "pers", de: "x", ate: "y" }, agora).nDias, 30);
});

t("picos: os maiores, sem zeros, empate → o mais antigo", () => {
  const ch = sequenciaBaldes(instanteLisboa("2026-10-01"), instanteLisboa("2026-10-11"), "dia");
  const ev = [];
  const por = { "2026-10-03": 5, "2026-10-07": 9, "2026-10-08": 5, "2026-10-09": 1 };
  for (const [d, n] of Object.entries(por))
    for (let i = 0; i < n; i++) ev.push(instanteLisboa(d, 10 + (i % 10)));
  const s = preencherSerie(ch, agrupar(ev, "dia"));
  assert.equal(s.reduce((a, b) => a + b.n, 0), 20);
  const p = picos(s, 3);
  assert.deepEqual(p.map((x) => x.chave), ["2026-10-07", "2026-10-03", "2026-10-08"]);
  assert.equal(picos(preencherSerie(ch, []), 3).length, 0);
  assert.equal(rotuloLongo("2026-10-07", "dia"), "qua, 07/10/2026");
});

t("mapa de calor: segunda primeiro, pico", () => {
  const g = grelhaCalor([
    { _id: { d: 2, h: 9 }, n: 3 }, // segunda 9h
    { _id: { d: 1, h: 21 }, n: 7 }, // domingo 21h
    { _id: { d: 9, h: 1 }, n: 99 }, // inválido
  ]);
  assert.equal(g[0][9], 3);
  assert.equal(g[6][21], 7);
  assert.deepEqual(picoGrelha(g), { dia: 6, hora: 21, n: 7 });
});

t("variação e escala do eixo", () => {
  assert.equal(variacao(150, 100), 50);
  assert.equal(variacao(50, 100), -50);
  assert.equal(variacao(5, 0), null);
  assert.equal(variacao(0, 0), 0);
  assert.deepEqual(escalaEixo(7), { topo: 8, marcas: [0, 4, 8] });
  assert.deepEqual(escalaEixo(130), { topo: 200, marcas: [0, 100, 200] });
  assert.equal(escalaEixo(0).topo, 1);
});

t("caminhos: rotas do site, PT/EN juntos, lixo recusado", () => {
  assert.deepEqual(normalizarCaminho("/"), { lang: "pt", caminho: "/" });
  assert.deepEqual(normalizarCaminho("/en"), { lang: "en", caminho: "/" });
  assert.deepEqual(normalizarCaminho("/en/brands/abc?x=1"), { lang: "en", caminho: "/marcas/abc" });
  assert.deepEqual(normalizarCaminho("/empreendimentos/casa-1"), { lang: "pt", caminho: "/empreendimentos/casa-1" });
  for (const mau of ["admin", "/admin", "/wp-login.php", "//evil.com", "/en/marcas", "/marcas/<x>", "/x".repeat(80), "/marcas/a/b/c"])
    assert.equal(normalizarCaminho(mau), null, mau);
});

t("dispositivo, cidade, país", () => {
  assert.equal(classeDispositivo("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) Mobile/15E148"), "mobile");
  assert.equal(classeDispositivo("Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36"), "mobile");
  assert.equal(classeDispositivo("Mozilla/5.0 (Linux; Android 13; SM-X200) Safari/537.36"), "tablet");
  assert.equal(classeDispositivo("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15"), "desktop");
  assert.equal(classeDispositivo("Googlebot/2.1 (+http://www.google.com/bot.html)"), null);
  assert.equal(descodificarCidade("S%C3%A3o%20Paulo"), "São Paulo");
  assert.equal(descodificarCidade("New%20York"), "New York");
  assert.equal(descodificarCidade("%E0%A4%A"), "%E0%A4%A");
  assert.equal(nomePais("US"), "Estados Unidos");
});

t("filtros → $match", () => {
  const f = lerFiltros({ pais: "us", cidade: "Miami", pagina: "/en/brands/x", fonte: "Google", lixo: "1" });
  assert.deepEqual(f, { pais: "US", cidade: "Miami", pagina: "/marcas/x", fonte: "Google" });
  const ini = new Date(0);
  const fim = new Date(1);
  const m = matchEventos(ini, fim, f);
  assert.deepEqual(Object.keys(m)[0], "criadoEm");
  assert.equal(m.caminho, "/marcas/x");
  assert.deepEqual(matchEventos(ini, fim, { cidade: SEM_CIDADE }).cidade, { $in: [null, ""] });
  assert.deepEqual(lerFiltros({ pais: "USA", pagina: "x" }), {});
  assert.equal(qs({ periodo: "7d", de: "2026-01-01", pais: "US" }, { cidade: "Miami" }), "?periodo=7d&pais=US&cidade=Miami");
  assert.equal(qs({ periodo: "pers", de: "2026-01-01", ate: "2026-01-31" }), "?periodo=pers&de=2026-01-01&ate=2026-01-31");
});

t("CSV: separador, aspas e fórmulas", () => {
  assert.equal(linhaCsv(["a;b", 'x"y', -12.5, "=SUM(A1)", null]), '"a;b";"x""y";-12.5;\'=SUM(A1);');
});

t("dados falsos: 2000 eventos aleatórios somam o mesmo nos baldes", () => {
  const p = resolverPeriodo({ periodo: "90d" }, new Date("2026-10-31T12:00:00Z"));
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const ev = Array.from({ length: 2000 }, () => new Date(p.inicio.getTime() + rnd() * (p.fimEfetivo - p.inicio)));
  for (const g of ["dia", "semana", "mes"]) {
    const ch = sequenciaBaldes(p.inicio, p.fim, g);
    const s = preencherSerie(ch, agrupar(ev, g));
    assert.equal(s.reduce((a, b) => a + b.n, 0), 2000, g);
  }
  assert.equal(dataCivil(p.inicio), p.de);
});

console.log(process.exitCode ? `\nFalharam testes (${ok} passaram).` : `✓ ${ok} grupos de testes passaram.`);
