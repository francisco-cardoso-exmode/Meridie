import Link from "next/link";
import { notFound } from "next/navigation";
import MarcaForm from "@/components/admin/MarcaForm";
import { marcaBySlug } from "@/lib/marcas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar marca" };

export default async function EditarMarca({ params }) {
  const { slug } = await params;
  const m = await marcaBySlug(slug);
  if (!m) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/marcas" className="admin-back">← Voltar</Link>
      <h1>Editar — {m.nome}</h1>
      <MarcaForm initial={m} />
    </div>
  );
}
