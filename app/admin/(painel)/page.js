import Link from "next/link";
import { allEmpreendimentos, allRegioes } from "@/lib/store";
import { getDb } from "@/lib/mongodb";
import { leAdmin } from "@/lib/leituraAdmin";
import { contarPendentes } from "@/lib/pendentesAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hoje" };

async function contarLeads() {
  if (!process.env.MONGODB_URI) return 0;
  const db = await getDb();
  return await db.collection("contactos").countDocuments();
}

const plural = (n, um, varios) => `${n} ${n === 1 ? um : varios}`;

export default async function AdminDashboard() {
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        allEmpreendimentos({ todos: true, estrito: true }),
        allRegioes({ estrito: true }),
        contarLeads(),
        contarPendentes(),
      ]),
    [[], [], 0, null]
  );
  const [emp, reg, leads, p] = dados;
  const n = (v) => (semBase ? "—" : v);

  // [quantos, texto, link, urgente?] — só aparece o que tem alguma coisa.
  const tarefas = p
    ? [
        [p.reservasPedido, plural(p.reservasPedido, "pedido de reserva por responder", "pedidos de reserva por responder"), "/admin/alojamento/reservas?estado=pedido", true],
        [p.pedidosNovos, plural(p.pedidosNovos, "pedido novo (encomenda, proposta ou demonstração)", "pedidos novos (encomendas, propostas ou demonstrações)"), "/admin/pedidos?estado=novo", true],
        [p.emailsFalhados, plural(p.emailsFalhados, "mensagem cujo email de aviso falhou — responde a partir daqui", "mensagens cujo email de aviso falhou — responde a partir daqui"), "/admin/leads?email=falhou&dias=7", true],
        [p.casasAnalise, plural(p.casasAnalise, "casa à espera de aprovação", "casas à espera de aprovação"), "/admin/alojamento/casas?estado=em_analise", true],
        [p.tarefasPorAtribuir, plural(p.tarefasPorAtribuir, "tarefa da equipa sem ninguém atribuído", "tarefas da equipa sem ninguém atribuído"), "/admin/alojamento/tarefas?atribuida=nao", true],
        [p.tarefasHoje, plural(p.tarefasHoje, "tarefa marcada para hoje por concluir", "tarefas marcadas para hoje por concluir"), `/admin/alojamento/tarefas?data=${p.hoje}`, false],
        [p.leadsSemana, plural(p.leadsSemana, "mensagem recebida nos últimos 7 dias", "mensagens recebidas nos últimos 7 dias"), "/admin/leads?dias=7", false],
      ].filter(([q]) => q > 0)
    : [];

  return (
    <div className="admin-container">
      <h1>Para tratar hoje</h1>
      <p className="admin-sub">O que está à espera de alguém. Os números no menu contam o mesmo.</p>
      <AvisoSemBase mostrar={semBase} />

      {!semBase && p && (
        <div className="admin-hoje">
          {tarefas.length === 0 ? (
            <p className="admin-hoje-vazio">Nada pendente. Tudo em dia.</p>
          ) : (
            tarefas.map(([q, texto, href, urgente]) => (
              <Link key={href} href={href} className={`admin-hoje-item${urgente ? " urgente" : ""}`}>
                <span>{texto}</span>
                <span className="admin-link">Abrir →</span>
              </Link>
            ))
          )}
        </div>
      )}

      <h2 className="admin-h2">Conteúdo do site</h2>
      <div className="admin-stats">
        <Link href="/admin/empreendimentos" className="admin-stat">
          <div className="n">{n(emp.length)}</div>
          <div className="l">Empreendimentos</div>
        </Link>
        <Link href="/admin/regioes" className="admin-stat">
          <div className="n">{n(reg.length)}</div>
          <div className="l">Regiões / zonas</div>
        </Link>
        <Link href="/admin/leads" className="admin-stat">
          <div className="n">{n(leads)}</div>
          <div className="l">Leads recebidas (total)</div>
        </Link>
      </div>

      <div className="admin-cards">
        <Link href="/admin/paginas" className="admin-card">
          <h3>Páginas →</h3>
          <p>Textos da Home, Sobre, FAQ e restantes páginas.</p>
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
