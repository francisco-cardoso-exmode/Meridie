import Link from "next/link";
import CategoriaForm from "@/components/admin/CategoriaForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { allCategorias } from "@/lib/representacoes";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova categoria" };

export default async function NovaCategoria({ searchParams }) {
  const { dentro } = await searchParams;
  const { dados: cats, semBase } = await leAdmin(() => allCategorias({ todos: true, estrito: true }), []);
  const topo = cats.filter((c) => !c.parent).map((c) => ({ slug: c.slug, nome: c.nome }));
  return (
    <div className="admin-container">
      <Link href="/admin/categorias" className="admin-back">← Voltar</Link>
      <h1>Nova categoria</h1>
      <AvisoSemBase mostrar={semBase} />
      <CategoriaForm topo={topo} parentInicial={topo.some((c) => c.slug === dentro) ? dentro : ""} />
    </div>
  );
}
