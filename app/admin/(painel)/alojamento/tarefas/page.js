import Link from "next/link";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { AtribuirTarefa, NovaTarefaForm } from "@/components/al/admin/AdminAl";
import { leAdmin } from "@/lib/leituraAdmin";
import { listarTarefas } from "@/lib/al/tarefas";
import { todasAsCasas } from "@/lib/al/casas";
import { listarEquipa } from "@/lib/al/contas";
import { opcoes, opcoesDeMapa } from "@/lib/al/admin";
import { ROTULO_TIPO_TAREFA } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Tarefas" };

const ESTADO = { pendente: "Pendente", em_curso: "Em curso", concluida: "Concluída" };

export default async function TarefasAdmin() {
  const { dados, semBase } = await leAdmin(async () => {
    const [tarefas, casas, equipa] = await Promise.all([listarTarefas(), todasAsCasas(), listarEquipa()]);
    return { tarefas, casas, equipa };
  }, { tarefas: [], casas: [], equipa: [] });
  const { tarefas, casas, equipa } = dados;
  const nomes = Object.fromEntries(equipa.map((m) => [m.email, m.nome]));
  const eq = equipa.map((m) => ({ email: m.email, nome: m.nome, ativo: m.ativo }));

  const itens = tarefas.map((t) => {
    const danos = (t.relatorio?.porDivisao || []).filter((d) => d.estado === "dano").length;
    return {
      id: t.id,
      busca: [t.casaTitulo, t.casaSlug, t.atribuidaA, nomes[t.atribuidaA]].join(" ").toLowerCase(),
      facetas: { tipo: t.tipo, estado: t.estado, data: t.data, atribuida: t.atribuidaA ? "sim" : "nao", pessoa: t.atribuidaA || "" },
      ordem: { data: t.data || "", data_asc: t.data || "" },
      node: (
        <div className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-title">
              {ROTULO_TIPO_TAREFA[t.tipo]} — {t.casaTitulo || t.casaSlug} <span className={`al-badge ${t.estado}`}>{ESTADO[t.estado]}</span>
              {danos > 0 && <span className="al-badge dano">{danos} dano(s)</span>}
            </div>
            <div className="admin-row-sub">
              {t.data}
              {t.relatorio?.feitoPor ? ` · feita por ${nomes[t.relatorio.feitoPor] || t.relatorio.feitoPor}` : ""}
            </div>
          </div>
          <div className="admin-row-actions">
            {t.estado !== "concluida" && <AtribuirTarefa id={t.id} atual={t.atribuidaA} equipa={eq} />}
            {t.relatorio && (
              <Link href={`/admin/alojamento/tarefas/${t.id}`} className="admin-link">
                Relatório
              </Link>
            )}
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="admin-container">
      <h1>Tarefas</h1>
      <p className="admin-sub">
        As inspeções de entrada e de saída são criadas sozinhas quando se confirma uma reserva. A equipa vê as suas e as por atribuir em{" "}
        <a href="/equipa" target="_blank">
          /equipa
        </a>
        .
      </p>
      <AvisoSemBase mostrar={semBase} />
      <details className="al-detalhes">
        <summary className="btn btn-primary">+ Nova tarefa</summary>
        <NovaTarefaForm casas={casas.map((c) => ({ slug: c.slug, titulo: c.titulo }))} equipa={eq.filter((m) => m.ativo !== false)} />
      </details>
      <ListaFiltravel
        itens={itens}
        placeholder="Casa, pessoa da equipa…"
        facetas={[
          { k: "tipo", label: "Tipo", opcoes: opcoesDeMapa(ROTULO_TIPO_TAREFA) },
          { k: "estado", label: "Estado", opcoes: opcoesDeMapa(ESTADO) },
          { k: "atribuida", label: "Atribuída", opcoes: [{ v: "sim", label: "Sim" }, { v: "nao", label: "Não" }] },
          { k: "pessoa", label: "Pessoa", opcoes: opcoes(tarefas.map((t) => t.atribuidaA), (e) => nomes[e] || e) },
          { k: "data", label: "Data", opcoes: opcoes(tarefas.map((t) => t.data)).reverse() },
        ]}
        ordens={[
          { k: "data", label: "Data (mais recente)", desc: true },
          { k: "data_asc", label: "Data (mais antiga)" },
        ]}
        ordemPadrao="data"
      />
    </div>
  );
}
