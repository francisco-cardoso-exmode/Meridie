import { getDb } from "@/lib/mongodb";
import { leAdmin } from "@/lib/leituraAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import { allEmpreendimentos } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

async function getLeads() {
  if (!process.env.MONGODB_URI) return [];
  const db = await getDb();
  return await db
    .collection("contactos")
    .find({})
    .sort({ criadoEm: -1 })
    .limit(2000)
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
  // Nome do imóvel de onde veio cada lead (o formulário guarda o slug em `ref`).
  const { dados: emps } = await leAdmin(() => allEmpreendimentos({ todos: true }), []);
  const nomeImovel = Object.fromEntries(emps.map((e) => [e.slug, e.nome]));
  const origemDe = (l) => (!l.ref || l.ref === "contacto" ? "Página de contactos" : nomeImovel[l.ref] || l.ref);

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
        <ListaFiltravel
          className="leads-list"
          placeholder="Pesquisar por nome, email, assunto, mensagem…"
          periodo="data"
          facetas={[
            { k: "origem", label: "Origem" },
            { k: "lang", label: "Idioma", opcoes: [{ v: "pt", label: "Português" }, { v: "en", label: "Inglês" }] },
            { k: "email", label: "Email", opcoes: [{ v: "falhou", label: "Envio falhou" }, { v: "ok", label: "Enviado" }] },
          ]}
          ordens={[
            { k: "data", label: "Mais recentes", desc: true },
            { k: "dataAsc", label: "Mais antigas" },
            { k: "nome", label: "Nome" },
          ]}
          itens={leads.map((l) => ({
            id: String(l._id),
            busca: [l.nome, l.email, l.assunto, l.mensagem, origemDe(l)].filter(Boolean).join(" "),
            facetas: { origem: origemDe(l), lang: l.lang || "pt", email: l.emailFalhou ? "falhou" : "ok" },
            ordem: {
              data: l.criadoEm ? new Date(l.criadoEm).getTime() : 0,
              dataAsc: l.criadoEm ? new Date(l.criadoEm).getTime() : 0,
              nome: l.nome,
            },
            node: (
            <div className="lead-card">
              <div className="lead-top">
                <div>
                  <strong>{l.nome || "—"}</strong>{" "}
                  <a href={`mailto:${l.email}`} className="admin-link">{l.email}</a>
                </div>
                <span className="lead-date">{dataPt(l.criadoEm)}</span>
              </div>
              {l.assunto && <div className="lead-assunto">{l.assunto}</div>}
              <p className="lead-msg">{l.mensagem}</p>
              <div className="lead-meta">
                Origem: {origemDe(l)}
                {l.lang === "en" && " · EN"}
                {l.emailFalhou && <span className="tag-oculto">EMAIL FALHOU</span>}
              </div>
            </div>
            ),
          }))}
        />
      )}
    </div>
  );
}
