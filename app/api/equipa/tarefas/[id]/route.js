import { NextResponse } from "next/server";
import { getEquipa } from "@/lib/al/auth";
import { tarefaDaEquipa, iniciarTarefa, guardarDivisao, concluirTarefa } from "@/lib/al/tarefas";
import { reservaPorId } from "@/lib/al/reservas";
import { casaPorSlug } from "@/lib/al/casas";
import { proprietarioPorId } from "@/lib/al/contas";
import { limparDivisaoRelatorio, texto } from "@/lib/al/validacao";
import { avisarEquipa, avisarProprietario } from "@/lib/al/emails";
import { ROTULO_TIPO_TAREFA } from "@/lib/al/regras";
import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * App da equipa — uma tarefa:
 * - { acao: "iniciar" } → fica atribuída a quem começou, estado em_curso;
 * - { acao: "divisao", divisao: { divisao, fotos, estado, notas, checklist } };
 * - { acao: "concluir", observacoes } → fecha. Danos avisam a equipa por
 *   email; uma inspeção de entrada concluída fica visível ao hóspede e ao
 *   proprietário (que recebe um aviso).
 */
export async function POST(request, { params }) {
  const m = await getEquipa();
  if (!m) return erro("A tua sessão expirou. Entra de novo.", 401);
  const { id } = await params;
  const t = await tarefaDaEquipa(id, m.email);
  if (!t) return erro("Tarefa não encontrada ou atribuída a outra pessoa.", 404);
  const b = (await request.json().catch(() => null)) || {};

  if (b.acao === "iniciar") {
    if (!(await iniciarTarefa(id, m.email))) return erro("Não foi possível começar esta tarefa.");
    return NextResponse.json({ ok: true });
  }

  if (b.acao === "divisao") {
    const d = limparDivisaoRelatorio(b.divisao);
    if (!d) return erro("Divisão inválida.");
    if (!(await guardarDivisao(id, m.email, d))) return erro("Começa a tarefa antes de gravar.");
    return NextResponse.json({ ok: true });
  }

  if (b.acao === "concluir") {
    const feita = await concluirTarefa(id, m.email, texto(b.observacoes, 3000));
    if (!feita) return erro("Esta tarefa não está em curso.");
    const divs = feita.relatorio?.porDivisao || [];
    const danos = divs.filter((d) => d.estado === "dano");
    const atencao = divs.filter((d) => d.estado === "atencao");
    const linkAdmin = `${SITE_URL}/admin/alojamento/tarefas/${id}`;
    if (danos.length) {
      await avisarEquipa({
        assunto: `DANO — ${feita.casaTitulo || feita.casaSlug} (${ROTULO_TIPO_TAREFA[feita.tipo]})`,
        titulo: "Dano registado numa inspeção",
        campos: [
          ["Casa", feita.casaTitulo || feita.casaSlug],
          ["Tarefa", `${ROTULO_TIPO_TAREFA[feita.tipo]} — ${feita.data}`],
          ["Feita por", `${m.nome} <${m.email}>`],
          ...danos.map((d) => [`Dano — ${d.divisao}`, d.notas || "(sem notas)"]),
          ...atencao.map((d) => [`Atenção — ${d.divisao}`, d.notas || "(sem notas)"]),
          ["Observações", feita.relatorio?.observacoes],
        ],
        link: linkAdmin,
      }).catch((e) => console.error("aviso dano:", e?.message || e));
    }
    // Inspeção de entrada: avisa o proprietário de que o relatório está disponível.
    if (feita.tipo === "inspecao_entrada") {
      try {
        const casa = await casaPorSlug(feita.casaSlug);
        const dono = casa && (await proprietarioPorId(casa.proprietarioId));
        const reserva = feita.reservaId && (await reservaPorId(feita.reservaId));
        if (dono?.email) {
          await avisarProprietario({
            para: dono.email,
            assunto: `Inspeção de entrada concluída — ${casa.titulo}`,
            titulo: "Inspeção de entrada concluída",
            paragrafos: [
              `A casa "${casa.titulo}" foi inspecionada antes da entrada dos hóspedes${reserva ? ` (${reserva.entrada} → ${reserva.saida})` : ""}.`,
              danos.length ? `Foram registados ${danos.length} dano(s) — a nossa equipa vai tratar do assunto.` : "Sem danos registados.",
              "As fotografias de cada divisão estão na tua área de proprietário.",
            ],
            link: `${SITE_URL}${caminho("pt", `/proprietario/casas/${casa.slug}`)}`,
            rotulo: "Ver relatório",
          });
        }
      } catch (e) {
        console.error("aviso proprietário inspeção:", e?.message || e);
      }
    }
    return NextResponse.json({ ok: true });
  }

  return erro("Pedido inválido.");
}
