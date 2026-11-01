import Link from "next/link";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";
import { allRegioes, empreendimentoBySlug } from "@/lib/store";
import { copiaDe } from "@/lib/slug";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo empreendimento" };

// `?de=<slug>`: "Duplicar" — o formulário vem preenchido com uma cópia (oculta).
export default async function NovoEmpreendimento({ searchParams }) {
  const { de } = await searchParams;
  const { dados, semBase } = await leAdmin(
    () => Promise.all([allRegioes({ estrito: true }), de ? empreendimentoBySlug(de, { estrito: true }) : null]),
    [[], null]
  );
  const [regioes, original] = dados;
  return (
    <div className="admin-container">
      <Link href="/admin/empreendimentos" className="admin-back">← Voltar</Link>
      <h1>{original ? `Duplicar «${original.nome}»` : "Novo empreendimento"}</h1>
      {original && <p className="admin-sub">Cópia oculta: muda o nome e o que for diferente, e publica quando estiver pronta.</p>}
      <AvisoSemBase mostrar={semBase} />
      <EmpreendimentoForm key={de || "novo"} copia={copiaDe(original, "publicado")} regioesExistentes={regioes} />
    </div>
  );
}
