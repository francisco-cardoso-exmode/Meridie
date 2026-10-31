import Link from "next/link";
import { notFound } from "next/navigation";
import RegiaoForm from "@/components/admin/RegiaoForm";
import { regiaoBySlug, allRegioes } from "@/lib/store";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar região/zona" };

export default async function EditarRegiao({ params }) {
  const { slug } = await params;
  const { dados, semBase } = await leAdmin(
    () => Promise.all([regiaoBySlug(slug, { estrito: true }), allRegioes({ estrito: true })]),
    [null, []]
  );
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/regioes" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  const [r, regioes] = dados;
  if (!r) notFound();

  return (
    <div className="admin-container">
      <Link href="/admin/regioes" className="admin-back">← Voltar</Link>
      <h1>Editar — {r.nome}</h1>
      <RegiaoForm initial={r} regioesExistentes={regioes} />
    </div>
  );
}
