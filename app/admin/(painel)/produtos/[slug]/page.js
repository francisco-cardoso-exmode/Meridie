import Link from "next/link";
import { notFound } from "next/navigation";
import ProdutoForm from "@/components/admin/ProdutoForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, produtoBySlug } from "@/lib/representacoes";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar produto" };

export default async function EditarProduto({ params }) {
  const { slug } = await params;
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        produtoBySlug(slug, { estrito: true }),
        allCategorias({ todos: true, estrito: true }),
        allMarcas({ todos: true, estrito: true }),
      ]),
    [null, [], []]
  );
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/produtos" className="admin-back">← Voltar</Link>
        <AvisoSemBase />
      </div>
    );
  }
  const [p, cats, marcas] = dados;
  // Produtos ainda dentro da marca (formato antigo) só se editam depois da migração.
  if (!p || p.legado) notFound();
  return (
    <div className="admin-container">
      <Link href="/admin/produtos" className="admin-back">← Voltar</Link>
      <h1>Editar — {p.nome}</h1>
      <ProdutoForm
        initial={p}
        categorias={cats.map(({ slug: s, nome, parent }) => ({ slug: s, nome, parent: parent || null }))}
        marcas={marcas.map(({ slug: s, nome }) => ({ slug: s, nome }))}
      />
    </div>
  );
}
