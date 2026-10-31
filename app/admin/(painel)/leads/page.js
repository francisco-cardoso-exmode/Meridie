import { getDb } from "@/lib/mongodb";
import { leAdmin } from "@/lib/leituraAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

async function getLeads() {
  if (!process.env.MONGODB_URI) return [];
  const db = await getDb();
  return await db
    .collection("contactos")
    .find({})
    .sort({ criadoEm: -1 })
    .limit(300)
    .toArray();
}

function dataPt(d) {
  if (!d) return "";
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

export default async function AdminLeads() {
  const { dados: leads, semBase } = await leAdmin(getLeads, []);

  return (
    <div className="admin-container">
      <h1>Leads</h1>
      <AvisoSemBase mostrar={semBase} />
      <p className="admin-sub">
        {semBase ? "Não foi possível ler as mensagens." : `${leads.length} mensagem(ns) recebida(s) pelo formulário de contacto.`}
      </p>

      {semBase ? null : leads.length === 0 ? (
        <div className="empty-state">
          <p>Ainda não há mensagens. Aparecem aqui assim que alguém submeter o formulário.</p>
        </div>
      ) : (
        <div className="leads-list">
          {leads.map((l) => (
            <div className="lead-card" key={String(l._id)}>
              <div className="lead-top">
                <div>
                  <strong>{l.nome || "—"}</strong>{" "}
                  <a href={`mailto:${l.email}`} className="admin-link">{l.email}</a>
                </div>
                <span className="lead-date">{dataPt(l.criadoEm)}</span>
              </div>
              {l.assunto && <div className="lead-assunto">{l.assunto}</div>}
              <p className="lead-msg">{l.mensagem}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
