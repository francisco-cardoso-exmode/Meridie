import Link from "next/link";
import SolucaoForm from "@/components/admin/SolucaoForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { solucaoBySlug } from "@/lib/solucoes";
import { leAdmin } from "@/lib/leituraAdmin";
import { copiaDe } from "@/lib/slug";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova solução" };

// `?de=<slug>`: "Duplicar" — o formulário vem preenchido com uma cópia (inativa).
export default async function NovaSolucao({ searchParams }) {
  const { de } = await searchParams;
  const { dados: original, semBase } = await leAdmin(() => (de ? solucaoBySlug(de, { estrito: true }) : null), null);
  return (
    <div className="admin-container">
      <Link href="/admin/solucoes" className="admin-back">← Voltar</Link>
      <h1>{original ? `Duplicar «${original.nome}»` : "Nova solução"}</h1>
      {original && <p className="admin-sub">Cópia inativa: muda o nome e o que for diferente, e ativa quando estiver pronta.</p>}
      <AvisoSemBase mostrar={semBase} />
      <SolucaoForm key={de || "nova"} copia={copiaDe(original, "ativo")} />
    </div>
  );
}
