import Link from "next/link";
import { notFound } from "next/navigation";
import AnuncioForm from "@/components/admin/AnuncioForm";
import { anuncioBySlug } from "@/lib/anuncios";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar anúncio" };

export default async function EditarAnuncio({ params }) {
  const { slug } = await params;
  const a = await anuncioBySlug(slug);
  if (!a) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/publicidade" className="admin-back">← Voltar</Link>
      <h1>Editar — {a.titulo}</h1>
      <AnuncioForm initial={a} />
    </div>
  );
}
