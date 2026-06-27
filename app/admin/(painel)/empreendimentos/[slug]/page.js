import Link from "next/link";
import { notFound } from "next/navigation";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";
import { empreendimentoBySlug, allRegioes } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar empreendimento" };

export default async function EditarEmpreendimento({ params }) {
  const { slug } = await params;
  const [e, regioes] = await Promise.all([empreendimentoBySlug(slug), allRegioes()]);
  if (!e) notFound();

  return (
    <div className="admin-container">
      <Link href="/admin/empreendimentos" className="admin-back">
        ← Voltar
      </Link>
      <h1>Editar — {e.nome}</h1>
      <EmpreendimentoForm initial={e} regioesExistentes={regioes} />
    </div>
  );
}
