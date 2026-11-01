import Link from "next/link";
import { urlPrevisualizar } from "@/lib/previsualizacao";
import { notFound } from "next/navigation";
import CasaForm from "@/components/al/CasaForm";
import Relatorio from "@/components/al/Relatorio";
import { BotaoAcao } from "@/components/al/admin/AdminAl";
import { casaPorSlug, nCasasAtivas } from "@/lib/al/casas";
import { proprietarioPorId } from "@/lib/al/contas";
import { relatoriosDasCasas } from "@/lib/al/tarefas";
import { getConfigAl } from "@/lib/al/config";
import { faltaParaPublicar } from "@/lib/al/validacao";
import { ROTULO_ESTADO_CASA, PAISES, percentagemComissao } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Casa" };

// Transições oferecidas em cada estado (as mesmas que lib/al/casas.js aceita).
const ACOES = {
  rascunho: [["em_analise", "Pôr em análise"], ["aprovada", "Aprovar"]],
  em_analise: [["aprovada", "Aprovar"], ["rascunho", "Devolver a rascunho"]],
  aprovada: [["publicada", "Publicar"], ["suspensa", "Suspender"], ["rascunho", "Devolver a rascunho"]],
  publicada: [["suspensa", "Suspender"], ["aprovada", "Despublicar"]],
  suspensa: [["publicada", "Republicar"], ["aprovada", "Aprovada (sem publicar)"], ["rascunho", "Devolver a rascunho"]],
};

export default async function CasaAdmin({ params }) {
  const { slug } = await params;
  const casa = await casaPorSlug(slug);
  if (!casa) notFound();
  const [dono, relatorios, config, ativas] = await Promise.all([
    proprietarioPorId(casa.proprietarioId),
    relatoriosDasCasas([slug]),
    getConfigAl(),
    nCasasAtivas(casa.proprietarioId),
  ]);
  const falta = faltaParaPublicar(casa);
  const pct = percentagemComissao(casa.plano, { reduzida: casa.comissaoReduzida || ativas >= 2 }, config);
  const { en, enFonte, ...semEn } = casa;

  return (
    <div className="admin-container">
      <Link href="/admin/alojamento/casas" className="admin-back">
        ← Casas
      </Link>
      <h1>
        {casa.titulo} <span className={`al-badge ${casa.estado}`}>{ROTULO_ESTADO_CASA[casa.estado]}</span>
      </h1>
      <p className="admin-sub">
        {PAISES[casa.pais || "PT"].nome} · Proprietário: {dono ? `${dono.nome} <${dono.email}> ${dono.telefone || ""}` : "—"} · Comissão
        efetiva: {pct}%{ativas >= 2 ? " (2+ casas ativas)" : ""}
      </p>
      {falta.length > 0 && <div className="ajuda-aviso">Para publicar falta: {falta.join(", ")}.</div>}
      <div className="al-acoes-admin">
        <a href={urlPrevisualizar(`/alojamento/${slug}`)} target="_blank" className="btn btn-outline">
          {casa.estado === "publicada" ? "Ver no site ↗" : "Pré-visualizar ↗"}
        </a>
        {(ACOES[casa.estado] || []).map(([estado, rot]) => (
          <BotaoAcao
            key={estado}
            url={`/api/admin/alojamento/casas/${slug}`}
            body={{ acao: "estado", estado }}
            rotulo={rot}
            classe="btn btn-outline"
            confirmar={estado === "suspensa" ? "Suspender esta casa? Deixa de aparecer no site." : undefined}
          />
        ))}
      </div>
      <CasaForm casa={semEn} modo="admin" />
      <h2>Inspeções</h2>
      {relatorios.length === 0 ? <p className="admin-sub">Sem relatórios.</p> : relatorios.map((r) => <Relatorio key={r.id} tarefa={r} />)}
    </div>
  );
}
