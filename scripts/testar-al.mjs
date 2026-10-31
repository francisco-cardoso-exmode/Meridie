// Testes das regras puras do Alojamento Local (lib/al/regras.js):
//   node --test scripts/testar-al.mjs
import test from "node:test";
import assert from "node:assert/strict";
import {
  dataValida,
  noitesEntre,
  somaDias,
  sobrepoe,
  conflitos,
  noitesOcupadas,
  erroDatas,
  percentagemComissao,
  percentagemOta,
  contasReserva,
  ganhosPorMes,
  simularCalculadora,
  moedaDe,
  formatarValor,
  percentagemTaxaServico,
  taxaServicoDe,
  totalHospede,
  podePagarOnline,
  valorParaProprietario,
} from "../lib/al/regras.js";

test("datas", () => {
  assert.equal(dataValida("2026-02-29"), false);
  assert.equal(dataValida("2028-02-29"), true);
  assert.equal(dataValida("2026-13-01"), false);
  assert.equal(dataValida("x"), false);
  assert.equal(noitesEntre("2026-03-28", "2026-04-02"), 5);
  assert.equal(noitesEntre("2026-04-02", "2026-03-28"), 0);
  assert.equal(somaDias("2026-12-31", 1), "2027-01-01");
});

test("sobreposição: o dia de saída pode ser a entrada de outra", () => {
  const a = { entrada: "2026-07-01", saida: "2026-07-05" };
  assert.equal(sobrepoe(a, { entrada: "2026-07-05", saida: "2026-07-08" }), false);
  assert.equal(sobrepoe(a, { entrada: "2026-06-28", saida: "2026-07-01" }), false);
  assert.equal(sobrepoe(a, { entrada: "2026-07-04", saida: "2026-07-06" }), true);
  assert.equal(sobrepoe(a, { entrada: "2026-06-01", saida: "2026-08-01" }), true);
  assert.equal(sobrepoe(a, { entrada: "2026-07-02", saida: "2026-07-03" }), true);
});

test("conflitos só com reservas que ocupam e ignorando a própria", () => {
  const reservas = [
    { _id: "1", estado: "confirmada", entrada: "2026-07-01", saida: "2026-07-05" },
    { _id: "2", estado: "pedido", entrada: "2026-07-01", saida: "2026-07-05" },
    { _id: "3", estado: "cancelada", entrada: "2026-07-01", saida: "2026-07-05" },
    { _id: "4", estado: "concluida", entrada: "2026-07-10", saida: "2026-07-12" },
  ];
  const nova = { entrada: "2026-07-03", saida: "2026-07-11" };
  assert.deepEqual(conflitos(reservas, nova).map((r) => r._id), ["1", "4"]);
  assert.deepEqual(conflitos(reservas, nova, "1").map((r) => r._id), ["4"]);
});

test("noites ocupadas para o calendário", () => {
  const r = [
    { estado: "confirmada", entrada: "2026-07-01", saida: "2026-07-03" },
    { estado: "pedido", entrada: "2026-07-05", saida: "2026-07-06" },
  ];
  assert.deepEqual(noitesOcupadas(r), ["2026-07-01", "2026-07-02"]);
  assert.deepEqual(noitesOcupadas(r, { desde: "2026-07-02" }), ["2026-07-02"]);
});

test("validação das datas de um pedido", () => {
  const hoje = "2026-06-01";
  assert.equal(erroDatas({ entrada: "2026-06-10", saida: "2026-06-12", hoje }), null);
  assert.match(erroDatas({ entrada: "2026-05-10", saida: "2026-05-12", hoje }), /passou/);
  assert.match(erroDatas({ entrada: "2026-06-10", saida: "2026-06-10", hoje }), /depois/);
  assert.match(erroDatas({ entrada: "2026-06-10", saida: "2026-06-11", hoje, estadiaMinima: 2 }), /mínimo/);
});

test("percentagens", () => {
  assert.equal(percentagemComissao("anuncio"), 8);
  assert.equal(percentagemComissao("gestao"), 18);
  assert.equal(percentagemComissao("gestao", { reduzida: true }), 15);
  assert.equal(percentagemComissao("gestao", {}, { planos: { gestao: 20 } }), 20);
  assert.equal(percentagemOta("direta"), 0);
  assert.equal(percentagemOta("manual"), 0);
  assert.equal(percentagemOta("airbnb"), 15);
  assert.equal(percentagemOta("booking", { comissaoOta: { booking: 17 } }), 17);
});

test("contas de uma reserva: comissão Meridie depois da OTA", () => {
  assert.deepEqual(contasReserva({ valor: 1000, origem: "airbnb" }, 18), {
    bruto: 1000,
    ota: 150,
    meridie: 153,
    proprietario: 697,
  });
  assert.deepEqual(contasReserva({ valor: 1000, origem: "direta" }, 8), {
    bruto: 1000,
    ota: 0,
    meridie: 80,
    proprietario: 920,
  });
});

test("ganhos por mês (mês da entrada), sem bloqueios nem pedidos", () => {
  const reservas = [
    { estado: "confirmada", entrada: "2026-07-01", saida: "2026-07-04", valor: 300, origem: "direta", casaSlug: "a" },
    { estado: "concluida", entrada: "2026-07-20", saida: "2026-07-22", valor: 200, origem: "booking", casaSlug: "b" },
    { estado: "confirmada", entrada: "2026-08-01", saida: "2026-08-02", valor: 100, origem: "direta", casaSlug: "a" },
    { estado: "pedido", entrada: "2026-07-10", saida: "2026-07-12", valor: 999, origem: "direta", casaSlug: "a" },
    { estado: "confirmada", entrada: "2026-07-12", saida: "2026-07-15", valor: 0, bloqueio: true, casaSlug: "a" },
  ];
  const pct = { a: 8, b: 18 };
  const g = ganhosPorMes(reservas, (r) => pct[r.casaSlug]);
  assert.deepEqual(g.map((m) => m.mes), ["2026-08", "2026-07"]);
  const jul = g[1];
  assert.equal(jul.reservas, 2);
  assert.equal(jul.noites, 5);
  assert.equal(jul.bruto, 500);
  assert.equal(jul.ota, 30); // 15% de 200
  assert.equal(jul.meridie, 24 + 30.6); // 8% de 300 + 18% de 170
  assert.equal(jul.proprietario, 276 + 139.4);
});

test("calculadora", () => {
  const r = simularCalculadora({ precoNoite: 100, ocupacao: 50, diretas: 0, taxaOta: 15, taxaCoanfitriao: 20 });
  assert.equal(r.noites, 15);
  assert.equal(r.bruto, 1500);
  assert.equal(r.sozinho, 1275);
  assert.equal(r.coanfitriao, 1020);
  assert.equal(r.anuncio, 1173); // 1275 × 0,92
  assert.equal(r.gestao, 1045.5); // 1275 × 0,82
  // Com 100% de reservas diretas não há comissão da OTA.
  const d = simularCalculadora({ precoNoite: 100, ocupacao: 50, diretas: 100, taxaOta: 15 });
  assert.equal(d.anuncio, 1380);
  // Entradas inválidas não rebentam.
  assert.equal(simularCalculadora({ precoNoite: "x", ocupacao: 500 }).bruto, 0);
});

test("multi-país: moeda da casa e ganhos separados por moeda", () => {
  assert.equal(moedaDe("PT"), "EUR");
  assert.equal(moedaDe({ pais: "BR" }), "BRL");
  assert.equal(moedaDe({}), "EUR");
  assert.match(formatarValor(1234, "BRL"), /R\$/);
  assert.match(formatarValor(1234, "EUR"), /€/);
  const g = ganhosPorMes(
    [
      { estado: "confirmada", entrada: "2026-07-01", saida: "2026-07-02", valor: 100, origem: "direta", moeda: "EUR" },
      { estado: "confirmada", entrada: "2026-07-03", saida: "2026-07-04", valor: 500, origem: "direta", moeda: "BRL" },
    ],
    () => 10
  );
  assert.deepEqual(g.map((m) => [m.mes, m.moeda, m.proprietario]), [["2026-07", "BRL", 450], ["2026-07", "EUR", 90]]);
});

test("pagamentos: taxa de serviço, total do hóspede e parte do proprietário", () => {
  assert.equal(percentagemTaxaServico("PT"), 2);
  assert.equal(percentagemTaxaServico("BR"), 2.5);
  assert.equal(percentagemTaxaServico("PT", { taxaServico: { PT: 0 } }), 0);
  assert.equal(percentagemTaxaServico("XX"), 2);
  assert.equal(taxaServicoDe(450, 50, 2), 10);
  const r = { estado: "confirmada", origem: "direta", valor: 450, limpeza: 50, taxaServico: 10, pagamento: { estado: "nao_iniciado" } };
  assert.equal(totalHospede(r), 510);
  assert.equal(podePagarOnline(r), true);
  assert.equal(podePagarOnline({ ...r, pagamento: { estado: "pendente" } }), true);
  assert.equal(podePagarOnline({ ...r, pagamento: { estado: "pago" } }), false);
  assert.equal(podePagarOnline({ ...r, estado: "pedido" }), false);
  assert.equal(podePagarOnline({ ...r, origem: "airbnb" }), false);
  assert.equal(podePagarOnline({ ...r, bloqueio: true }), false);
  // Gestão: 18% da estadia para a Meridie, limpeza fica com a Meridie.
  assert.equal(valorParaProprietario(r, 18, "gestao"), 369);
  // Anúncio: 8% da estadia; o proprietário limpa e recebe a limpeza.
  assert.equal(valorParaProprietario(r, 8, "anuncio"), 464);
});
