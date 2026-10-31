import Link from "next/link";
import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { getDb } from "@/lib/mongodb";
import { leAdmin } from "@/lib/leituraAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";

export const dynamic = "force-dynamic";

async function contarLeads() {
  if (!process.env.MONGODB_URI) return 0;
  const db = await getDb();
  return await db.collection("contactos").countDocuments();
}

export default async function AdminDashboard() {
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        allEmpreendimentos({ todos: true, estrito: true }),
        allRegioes({ estrito: true }),
        contarLeads(),
      ]),
    [[], [], 0]
  );
  const [emp, reg, leads] = dados;
  const n = (v) => (semBase ? "—" : v);

  return (
    <div className="admin-container">
      <h1>Dashboard</h1>
      <p className="admin-sub">Visão geral do conteúdo do site.</p>
      <AvisoSemBase mostrar={semBase} />

      <div className="admin-stats">
        <div className="admin-stat">
          <div className="n">{n(emp.length)}</div>
          <div className="l">Empreendimentos</div>
        </div>
        <div className="admin-stat">
          <div className="n">{n(reg.length)}</div>
          <div className="l">Regiões / zonas</div>
        </div>
        <div className="admin-stat">
          <div className="n">{n(leads)}</div>
          <div className="l">Leads recebidas</div>
        </div>
      </div>

      <div className="admin-cards">
        <Link href="/admin/empreendimentos" className="admin-card">
          <h3>Empreendimentos →</h3>
          <p>Criar, editar e remover imóveis. Cada card é um empreendimento.</p>
        </Link>
        <Link href="/admin/regioes" className="admin-card">
          <h3>Regiões &amp; Zonas →</h3>
          <p>Gerir regiões e zonas, mapas e o que liga aos imóveis.</p>
        </Link>
        <Link href="/admin/emails" className="admin-card">
          <h3>Emails →</h3>
          <p>Pré-visualizar os templates e ver como/quando são enviados.</p>
        </Link>
        <Link href="/admin/ajuda" className="admin-card">
          <h3>Ajuda →</h3>
          <p>Como pôr o conteúdo de tudo, passo a passo.</p>
        </Link>
      </div>
    </div>
  );
}
