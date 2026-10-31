import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import CategoriaForm from "@/components/admin/CategoriaForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { allCategorias, garanteSeedCategorias } from "@/lib/representacoes";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar categoria" };

export default async function EditarCategoria({ params }) {
  const { slug } = await params;
  const { dados: cats, semBase } = await leAdmin(async () => {
    if (process.env.MONGODB_URI) await garanteSeedCategorias(await getDb());
    return allCategorias({ todos: true, estrito: true });
  }, []);
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/categorias" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  const c = cats.find((x) => x.slug === slug);
  if (!c) notFound();
  const topo = cats.filter((x) => !x.parent).map((x) => ({ slug: x.slug, nome: x.nome }));
  return (
    <div className="admin-container">
      <Link href="/admin/categorias" className="admin-back">← Voltar</Link>
      <h1>Editar — {c.nome}</h1>
      <CategoriaForm initial={c} topo={topo} temFilhas={cats.some((x) => x.parent === c.slug)} />
    </div>
  );
}
