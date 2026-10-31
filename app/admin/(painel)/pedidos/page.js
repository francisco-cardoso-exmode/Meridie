import Link from "next/link";
import { listarPedidos } from "@/lib/pedidos";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import { ESTADOS_PEDIDO, MOTIVOS } from "@/lib/pedido";
import { formataPreco } from "@/lib/catalogo";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Pedidos" };

function dataPt(d) {
  try {
    return new Date(d).toLocaleString("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Lisbon",
    });
  } catch {
    return "";
  }
}

const AREAS = { representacoes: "Representações", tecnologia: "Tecnologia", misto: "Misto" };

const mesDe = (d) => {
  try {
    return new Date(d).toISOString().slice(0, 7);
  } catch {
    return "";
  }
};
const NOMES_MES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const rotuloMes = (m) => `${NOMES_MES[Number(m.slice(5, 7)) - 1]} ${m.slice(0, 4)}`;

export default async function AdminPedidos() {
  const { dados: pedidos, semBase } = await leAdmin(async () => {
    if (!process.env.MONGODB_URI) return [];
    return listarPedidos({ limite: 3000 });
  }, []);
  const meses = [...new Set(pedidos.map((p) => mesDe(p.criadoEm)).filter(Boolean))].sort().reverse();
  const paises = [...new Set(pedidos.map((p) => (p.cliente?.pais || "").trim()).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt")
  );

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Pedidos</h1>
          <p className="admin-sub">
            Pedidos de encomenda, informação, demonstração e proposta enviados pelo site (Representações e Tecnologia).
            Os emails vão para os destinatários de <Link href="/admin/definicoes" className="admin-link">Definições</Link>.
          </p>
        </div>
        <a href="/api/admin/pedidos/csv" className="btn btn-primary">Exportar CSV</a>
      </div>
      <AvisoSemBase mostrar={semBase} />

      {!semBase && pedidos.length === 0 && <div className="empty-state"><p>Ainda não há pedidos.</p></div>}
      <ListaFiltravel
        placeholder="Pesquisar cliente, empresa, email, referência ou produto…"
        ordemPadrao="criadoEm"
        ordens={[
          { k: "criadoEm", label: "mais recentes", desc: true },
          { k: "antigos", label: "mais antigos" },
          { k: "cliente", label: "cliente" },
          { k: "valor", label: "subtotal (maior)", desc: true },
        ]}
        facetas={[
          { k: "estado", label: "Estado", opcoes: Object.entries(ESTADOS_PEDIDO).map(([v, label]) => ({ v, label })) },
          { k: "area", label: "Tipo", opcoes: Object.entries(AREAS).map(([v, label]) => ({ v, label })) },
          { k: "motivo", label: "Motivo", opcoes: Object.entries(MOTIVOS).map(([v, label]) => ({ v, label })) },
          { k: "mes", label: "Mês", opcoes: meses.map((m) => ({ v: m, label: rotuloMes(m) })) },
          { k: "pais", label: "País", opcoes: paises.map((v) => ({ v, label: v })) },
        ]}
        itens={pedidos.map((p) => {
          const c = p.cliente || {};
          const t = new Date(p.criadoEm).getTime() || 0;
          return {
            id: String(p._id),
            busca: [p.referencia, c.nome, c.empresa, c.email, c.telefone, ...(p.itens || []).map((i) => `${i.nome} ${i.marca || ""}`)]
              .join(" ")
              .toLowerCase(),
            facetas: { estado: p.estado, area: p.area, motivo: p.motivo, mes: mesDe(p.criadoEm), pais: (c.pais || "").trim() },
            ordem: { criadoEm: t, antigos: t, cliente: c.empresa || c.nome || "", valor: p.subtotal || 0 },
            node: (
              <Link href={`/admin/pedidos/${p._id}`} className="admin-row pedido-row">
                <div className="admin-row-main">
                  <div className="admin-row-title">
                    {p.referencia} · {c.empresa || c.nome}
                    <span className={`tag-estado e-${p.estado}`}>{ESTADOS_PEDIDO[p.estado] || p.estado}</span>
                    {p.emailFalhou && <span className="tag-oculto">EMAIL FALHOU</span>}
                  </div>
                  <div className="admin-row-sub">
                    {dataPt(p.criadoEm)} · {MOTIVOS[p.motivo] || p.motivo} · {AREAS[p.area] || p.area} ·{" "}
                    {c.pais ? `${c.pais} · ` : ""}
                    {(p.itens || []).length} item(ns)
                    {p.subtotal ? ` · ${formataPreco(p.subtotal)}${p.semPreco ? " + sob consulta" : ""}` : " · sob consulta"}
                  </div>
                </div>
                <span className="admin-link">Abrir →</span>
              </Link>
            ),
          };
        })}
      />
    </div>
  );
}
