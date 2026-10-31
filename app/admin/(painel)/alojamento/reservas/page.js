import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { BotaoAcao, ReservaManualForm } from "@/components/al/admin/AdminAl";
import { leAdmin } from "@/lib/leituraAdmin";
import { listarReservas } from "@/lib/al/reservas";
import { todasAsCasas } from "@/lib/al/casas";
import { opcoes, opcoesDeMapa } from "@/lib/al/admin";
import { ROTULO_ESTADO_RESERVA, ROTULO_ORIGEM, formatarValor } from "@/lib/al/regras";

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
    return {
      id: r.id,
      busca: [h.nome, h.email, h.telefone, r.casaTitulo, r.casaSlug, r.id, r.nota].join(" ").toLowerCase(),
      facetas: { estado: r.estado, origem: r.bloqueio ? "bloqueio" : r.origem, casa: r.casaSlug, mes: (r.entrada || "").slice(0, 7) },
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
                  {r.pagamento ? ` · pagamento: ${r.pagamento.fornecedor}/${r.pagamento.estado}` : ""}
                </>
              )}
              {r.nota ? ` · ${r.nota}` : ""}
            </div>
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
              <BotaoAcao url={`/api/admin/alojamento/reservas/${r.id}`} body={{ acao: "cancelar" }} rotulo="Cancelar" confirmar="Cancelar esta reserva?" />
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
        de entrada e saída e envia ao hóspede o link da estadia.
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
