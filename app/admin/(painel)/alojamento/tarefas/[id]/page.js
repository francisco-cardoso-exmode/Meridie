import Link from "next/link";
import { notFound } from "next/navigation";
import Relatorio from "@/components/al/Relatorio";
import { tarefaPorId } from "@/lib/al/tarefas";
import { ROTULO_TIPO_TAREFA } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Relatório" };

export default async function TarefaAdmin({ params }) {
  const { id } = await params;
  const t = await tarefaPorId(id);
  if (!t) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/alojamento/tarefas" className="admin-back">
        ← Tarefas
      </Link>
      <h1>
        {ROTULO_TIPO_TAREFA[t.tipo]} — {t.casaTitulo || t.casaSlug}
      </h1>
      <p className="admin-sub">
        {t.data} · {t.estado} · {t.atribuidaA || "por atribuir"}
      </p>
      {t.relatorio ? <Relatorio tarefa={t} /> : <p>Sem relatório ainda.</p>}
    </div>
  );
}
