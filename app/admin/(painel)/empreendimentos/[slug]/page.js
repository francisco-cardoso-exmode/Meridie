import Link from "next/link";
import { notFound } from "next/navigation";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";
import { empreendimentoBySlug, allRegioes } from "@/lib/store";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar empreendimento" };

export default async function EditarEmpreendimento({ params }) {
  const { slug } = await params;
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        empreendimentoBySlug(slug, { estrito: true }),
        allRegioes({ estrito: true }),
      ]),
    [null, []]
  );
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/empreendimentos" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  const [e, regioes] = dados;
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
