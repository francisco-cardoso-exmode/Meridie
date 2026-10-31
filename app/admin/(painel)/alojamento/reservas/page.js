import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { BotaoAcao, ReservaManualForm } from "@/components/al/admin/AdminAl";
import { leAdmin } from "@/lib/leituraAdmin";
import { listarReservas } from "@/lib/al/reservas";
import { todasAsCasas } from "@/lib/al/casas";
import { opcoes, opcoesDeMapa } from "@/lib/al/admin";
import { ROTULO_ESTADO_RESERVA, ROTULO_ORIGEM, formatarValor, totalHospede } from "@/lib/al/regras";

const ROTULO_PAGAMENTO = {
  nao_iniciado: "Por pagar",
  pendente: "Pagamento iniciado",
  pago: "Pago",
  falhado: "Pagamento falhou",
  reembolsado: "Reembolsado",
  externo: "Pago na plataforma",
};

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Reservas" };

export default async function ReservasAdmin() {
  const { dados, semBase } = await leAdmin(async () => {
    const [reservas, casas] = await Promise.all([listarReservas({}, { limite: 2000 }), todasAsCasas()]);
    return { reservas, casas };
  }, { reservas: [], casas: [] });
  const { reservas, casas } = dados;

  const itens = reservas.map((r) => {
    const h = r.hospede || {};
    const v = (x) => formatarValor(x, r.moeda || "EUR", "pt", { decimais: 2 });
    const pago = r.pagamento?.estado === "pago";
    const pagoStripe = pago && r.pagamento?.fornecedor === "stripe" && !!r.pagamento?.paymentIntent;
    // Proprietário por pagar: reserva com valor, sem transferência, depois de paga (ou já concluída/vinda de OTA).
    const porPagarDono =
      !r.bloqueio && r.valor > 0 && !r.transferencia && (pago || r.estado === "concluida") && ["confirmada", "concluida"].includes(r.estado);
    return {
      id: r.id,
      busca: [h.nome, h.email, h.telefone, r.casaTitulo, r.casaSlug, r.id, r.nota].join(" ").toLowerCase(),
      facetas: {
        estado: r.estado,
        origem: r.bloqueio ? "bloqueio" : r.origem,
        casa: r.casaSlug,
        mes: (r.entrada || "").slice(0, 7),
        pagamento: r.pagamento?.estado || "",
        proprietario: r.bloqueio || !r.valor ? "" : r.transferencia ? "pago" : "por_pagar",
      },
      ordem: { entrada: r.entrada || "", criadoEm: new Date(r.criadoEm || 0).getTime() },
      node: (
        <div className="admin-row al-reserva-row" id={`r-${r.id}`}>
          <div className="admin-row-main">
            <div className="admin-row-title">
              {r.bloqueio ? "Bloqueio do proprietário" : h.nome} <span className={`al-badge ${r.estado}`}>{ROTULO_ESTADO_RESERVA[r.estado]}</span>{" "}
              <span className="al-badge">{r.bloqueio ? "Bloqueio" : ROTULO_ORIGEM[r.origem]}</span>
            </div>
            <div className="admin-row-sub">
              <strong>{r.casaTitulo}</strong> · {r.entrada} → {r.saida} ({r.noites} noites)
              {!r.bloqueio && (
                <>
                  {" "}
                  · {v(r.valor)}
                  {r.limpeza ? ` + limpeza ${v(r.limpeza)}` : ""} · {h.email || "sem email"} {h.telefone || ""}
                  {r.hospedes ? ` · ${r.hospedes} hóspedes` : ""}
                  {r.taxaServico ? ` + taxa de serviço ${v(r.taxaServico)}` : ""}
                </>
              )}
              {r.nota ? ` · ${r.nota}` : ""}
            </div>
            {!r.bloqueio && r.pagamento && (
              <div className="admin-row-sub">
                <span className={`al-badge ${r.pagamento.estado === "pago" ? "publicada" : ""}`}>
                  {ROTULO_PAGAMENTO[r.pagamento.estado] || r.pagamento.estado}
                </span>{" "}
                {r.origem === "direta" || r.origem === "manual" ? `Total do hóspede ${v(totalHospede(r))}` : ""}
                {r.pagamento.valorPago ? ` · recebido ${v(r.pagamento.valorPago)} (${r.pagamento.fornecedor})` : ""}
                {r.pagamento.reembolsado ? ` · reembolsado ${v(r.pagamento.reembolsado)}` : ""}
                {r.pagamento.duplicados?.length ? ` · ⚠ ${r.pagamento.duplicados.length} pagamento(s) em duplicado — reembolsar no Stripe` : ""}
                {r.transferencia
                  ? ` · proprietário pago ${v(r.transferencia.valor)} (${r.transferencia.via === "stripe" ? "Stripe" : "à mão"}, ${new Date(r.transferencia.em).toLocaleDateString("pt-PT")})`
                  : ""}
              </div>
            )}
            {r.mensagem && <div className="admin-row-sub">“{r.mensagem}”</div>}
            {r.problemas?.map((p, i) => (
              <div key={i} className="ajuda-aviso">
                ⚠ {new Date(p.criadoEm).toLocaleString("pt-PT")}: {p.texto}{" "}
                {p.fotos?.map((u, j) => (
                  <a key={u} href={u} target="_blank" rel="noopener noreferrer">
                    [foto {j + 1}]
                  </a>
                ))}
              </div>
            ))}
          </div>
          <div className="admin-row-actions">
            {r.estado === "pedido" && (
              <BotaoAcao url={`/api/admin/alojamento/reservas/${r.id}`} body={{ acao: "confirmar" }} rotulo="Confirmar" confirmar="Confirmar esta reserva? O hóspede recebe o link da estadia." />
            )}
            {["pedido", "confirmada"].includes(r.estado) && (
              <BotaoAcao
                url={`/api/admin/alojamento/reservas/${r.id}`}
                body={{ acao: "cancelar" }}
                rotulo="Cancelar"
                confirmar={
                  pago
                    ? "Esta reserva está paga. Cancelar NÃO devolve o dinheiro — usa \"Reembolsar\" antes ou depois. Cancelar mesmo assim?"
                    : "Cancelar esta reserva?"
                }
              />
            )}
            {pagoStripe && r.transferencia?.via !== "stripe" && (
              <BotaoAcao
                url={`/api/admin/alojamento/reservas/${r.id}`}
                body={{ acao: "reembolsar" }}
                rotulo="Reembolsar tudo"
                confirmar={`Devolver ${v(r.pagamento.valorPago ?? totalHospede(r))} ao hóspede pelo Stripe?`}
              />
            )}
            {porPagarDono && pagoStripe && (
              <BotaoAcao
                url={`/api/admin/alojamento/reservas/${r.id}`}
                body={{ acao: "pagar_proprietario" }}
                rotulo="Pagar ao proprietário (Stripe)"
                confirmar="Transferir agora ao proprietário a parte dele desta reserva?"
              />
            )}
            {porPagarDono && (
              <BotaoAcao
                url={`/api/admin/alojamento/reservas/${r.id}`}
                body={{ acao: "registar_pagamento" }}
                rotulo="Registar pagamento ao proprietário (à mão)"
                confirmar="Registar que o proprietário já foi pago desta reserva por transferência bancária?"
              />
            )}
            {r.estado === "confirmada" && !r.bloqueio && (
              <>
                <BotaoAcao url={`/api/admin/alojamento/reservas/${r.id}`} body={{ acao: "concluir" }} rotulo="Concluir" />
                <BotaoAcao
                  url={`/api/admin/alojamento/reservas/${r.id}`}
                  body={{ acao: "link" }}
                  rotulo="Novo link"
                  confirmar="Gerar um link novo? O anterior deixa de funcionar."
                />
              </>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="admin-container">
      <h1>Reservas</h1>
      <p className="admin-sub">
        Pedidos do site, reservas do Airbnb/Booking (criadas à mão) e bloqueios dos proprietários. Confirmar verifica sobreposições, cria as inspeções
        de entrada e saída e envia ao hóspede o link da estadia, onde paga online (quando o Stripe está ligado). Concluir uma reserva paga pelo
        Stripe transfere logo ao proprietário a parte dele, se a conta bancária dele estiver ligada.
      </p>
      <AvisoSemBase mostrar={semBase} />
      <details className="al-detalhes">
        <summary className="btn btn-primary">+ Nova reserva</summary>
        <ReservaManualForm casas={casas.map((c) => ({ slug: c.slug, titulo: c.titulo, pais: c.pais, moeda: c.moeda }))} />
      </details>
      <ListaFiltravel
        itens={itens}
        placeholder="Hóspede, email, casa, referência…"
        facetas={[
          { k: "estado", label: "Estado", opcoes: opcoesDeMapa(ROTULO_ESTADO_RESERVA) },
          { k: "origem", label: "Origem", opcoes: [...opcoesDeMapa(ROTULO_ORIGEM), { v: "bloqueio", label: "Bloqueio" }] },
          { k: "casa", label: "Casa", opcoes: opcoes(casas.map((c) => c.slug), (s) => casas.find((c) => c.slug === s)?.titulo || s) },
          { k: "mes", label: "Mês de entrada", opcoes: opcoes(reservas.map((r) => (r.entrada || "").slice(0, 7))).reverse() },
          { k: "pagamento", label: "Pagamento", opcoes: opcoesDeMapa(ROTULO_PAGAMENTO) },
          {
            k: "proprietario",
            label: "Proprietário",
            opcoes: [
              { v: "por_pagar", label: "Por pagar" },
              { v: "pago", label: "Pago" },
            ],
          },
        ]}
        ordens={[
          { k: "entrada", label: "Entrada (mais recente)", desc: true },
          { k: "criadoEm", label: "Criadas recentemente", desc: true },
        ]}
        ordemPadrao="entrada"
      />
    </div>
  );
}
