import Link from "next/link";
import { notFound } from "next/navigation";
import { pedidoPorId } from "@/lib/pedidos";
import { ESTADOS_PEDIDO, MOTIVOS } from "@/lib/pedido";
import { formataPreco } from "@/lib/catalogo";
import PedidoAcoes from "@/components/admin/PedidoAcoes";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedido" };

function dataPt(d) {
  try {
    return new Date(d).toLocaleString("pt-PT", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Lisbon" });
  } catch {
    return "";
  }
}

export default async function PedidoDetalhe({ params }) {
  const { id } = await params;
  const { dados: p, semBase } = await leAdmin(() => pedidoPorId(id), null);
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/pedidos" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  if (!p) notFound();
  const c = p.cliente || {};
  const campo = (rotulo, v, href) =>
    v ? (
      <p>
        <strong>{rotulo}:</strong> {href ? <a href={href} className="admin-link">{v}</a> : v}
      </p>
    ) : null;

  return (
    <div className="admin-container">
      <Link href="/admin/pedidos" className="admin-back">← Voltar</Link>
      <h1>
        {p.referencia} <span className={`tag-estado e-${p.estado}`}>{ESTADOS_PEDIDO[p.estado] || p.estado}</span>
      </h1>
      <p className="admin-sub">
        {MOTIVOS[p.motivo] || p.motivo} · {dataPt(p.criadoEm)} · site em {p.idioma === "en" ? "inglês" : "português"}
        {p.emailFalhou ? " · o email para a equipa falhou (o pedido ficou guardado)" : ""}
      </p>

      <div className="pedido-detalhe">
        <div>
          <div className="lead-card">
            <h3>Cliente</h3>
            {campo("Nome", c.nome)}
            {campo("Empresa", c.empresa)}
            {campo("NIF", c.nif)}
            {campo("Email", c.email, `mailto:${c.email}`)}
            {campo("Telefone", c.telefone, `tel:${String(c.telefone || "").replace(/[^\d+]/g, "")}`)}
            {campo("País", c.pais)}
            {campo("Morada de entrega", c.morada)}
            {c.notas && <p className="lead-msg">{c.notas}</p>}
          </div>

          <div className="lead-card">
            <h3>Itens (preços no momento do pedido)</h3>
            <table className="ficha-tabela pedido-tabela">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qtd.</th>
                  <th>Unitário</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {(p.itens || []).map((i, k) => (
                  <tr key={k}>
                    <td>
                      {i.href ? <a href={i.href} target="_blank" className="admin-link">{i.nome}</a> : i.nome}
                      {i.marca && <small> · {i.marca}</small>}
                      {i.unidade && <small> · {i.unidade}</small>}
                    </td>
                    <td>{i.quantidade}</td>
                    <td>{i.preco != null ? formataPreco(i.preco) : "sob consulta"}</td>
                    <td>{i.total != null ? formataPreco(i.total) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p>
              <strong>Subtotal indicativo:</strong> {formataPreco(p.subtotal || 0)}
              {p.semPreco ? ` (+ ${p.semPreco} item(ns) sob consulta)` : ""}
            </p>
          </div>
        </div>

        <div>
          <PedidoAcoes id={String(p._id)} estado={p.estado} />
          {(p.notas || []).length > 0 && (
            <div className="lead-card">
              <h3>Notas</h3>
              {[...p.notas].reverse().map((n, k) => (
                <div key={k} className="pedido-nota-item">
                  <span className="lead-date">{dataPt(n.em)} · {n.por}</span>
                  <p className="lead-msg">{n.texto}</p>
                </div>
              ))}
            </div>
          )}
          <div className="lead-card">
            <h3>Histórico</h3>
            {[...(p.historico || [])].reverse().map((h, k) => (
              <p key={k} className="lead-date">
                {dataPt(h.em)} · {ESTADOS_PEDIDO[h.estado] || h.estado} · {h.por}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
