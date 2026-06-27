import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

async function getLeads() {
  try {
    const db = await getDb();
    return await db
      .collection("contactos")
      .find({}, { projection: { _id: 0 } })
      .sort({ criadoEm: -1 })
      .limit(300)
      .toArray();
  } catch {
    return [];
  }
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
    });
  } catch {
    return "";
  }
}

export default async function AdminLeads() {
  const leads = await getLeads();

  return (
    <div className="admin-container">
      <h1>Leads</h1>
      <p className="admin-sub">
        {leads.length} mensagem(ns) recebida(s) pelo formulário de contacto.
      </p>

      {leads.length === 0 ? (
        <div className="empty-state">
          <p>Ainda não há mensagens. Aparecem aqui assim que alguém submeter o formulário.</p>
        </div>
      ) : (
        <div className="leads-list">
          {leads.map((l, i) => (
            <div className="lead-card" key={i}>
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
