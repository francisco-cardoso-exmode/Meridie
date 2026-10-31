import Link from "next/link";
import { notFound } from "next/navigation";
import SolucaoForm from "@/components/admin/SolucaoForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { solucaoBySlug } from "@/lib/solucoes";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar solução" };

export default async function EditarSolucao({ params }) {
  const { slug } = await params;
  const { dados: s, semBase } = await leAdmin(() => solucaoBySlug(slug, { estrito: true }), null);
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/solucoes" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  if (!s) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/solucoes" className="admin-back">← Voltar</Link>
      <h1>Editar — {s.nome}</h1>
      <SolucaoForm initial={s} />
    </div>
  );
}
