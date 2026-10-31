import Link from "next/link";
import { notFound } from "next/navigation";
import TarefaFluxo from "@/components/al/TarefaFluxo";
import { exigirEquipa, dataCurta } from "@/lib/al/paginas";
import { tarefaDaEquipa } from "@/lib/al/tarefas";
import { casaPorSlug } from "@/lib/al/casas";
import { reservaPorId } from "@/lib/al/reservas";
import { ROTULO_TIPO_TAREFA } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tarefa" };

export default async function TarefaEquipa({ params }) {
  const { id } = await params;
  const m = await exigirEquipa();
  const tarefa = await tarefaDaEquipa(id, m.email);
  if (!tarefa) notFound();
  const [casa, reserva] = await Promise.all([casaPorSlug(tarefa.casaSlug), tarefa.reservaId ? reservaPorId(tarefa.reservaId) : null]);

  return (
    <div>
      <Link href="/equipa" className="al-voltar">
        ← Hoje
      </Link>
      <h1>{ROTULO_TIPO_TAREFA[tarefa.tipo]}</h1>
      <div className="al-cartao">
        <strong>{casa?.titulo || tarefa.casaSlug}</strong>
        {casa?.morada && (
          <p>
            <a href={`https://maps.google.com/?q=${encodeURIComponent(casa.morada)}`} target="_blank" rel="noopener noreferrer">
              📍 {casa.morada}
            </a>
          </p>
        )}
        <p className="al-nota">
          {dataCurta(tarefa.data)}
          {reserva && !reserva.bloqueio && ` · Hóspede: ${String(reserva.hospede?.nome || "").split(" ")[0]} · ${reserva.entrada} → ${reserva.saida}`}
        </p>
        {casa?.checkinInfo && (
          <details>
            <summary>Instruções de acesso</summary>
            <p className="al-descricao">{casa.checkinInfo}</p>
          </details>
        )}
      </div>
      <TarefaFluxo tarefa={tarefa} divisoes={casa?.divisoes || []} />
    </div>
  );
}
