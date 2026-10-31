import Link from "next/link";
import { notFound } from "next/navigation";
import MarcaForm from "@/components/admin/MarcaForm";
import { marcaBySlug } from "@/lib/marcas";
import { allProdutos } from "@/lib/representacoes";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar marca" };

export default async function EditarMarca({ params }) {
  const { slug } = await params;
  const { dados, semBase } = await leAdmin(
    () => Promise.all([marcaBySlug(slug, { estrito: true }), allProdutos({ todos: true, estrito: true, marca: slug })]),
    [null, []]
  );
  const [m, produtos] = dados;
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/marcas" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  if (!m) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/marcas" className="admin-back">← Voltar</Link>
      <h1>Editar — {m.nome}</h1>
      <MarcaForm initial={m} nProdutos={produtos.length} />
    </div>
  );
}
