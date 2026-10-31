import Link from "next/link";
import ProdutoForm from "@/components/admin/ProdutoForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { allMarcas } from "@/lib/marcas";
import { allCategorias } from "@/lib/representacoes";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo produto" };

export default async function NovoProduto({ searchParams }) {
  const { marca = "" } = await searchParams;
  const { dados, semBase } = await leAdmin(
    () => Promise.all([allCategorias({ todos: true, estrito: true }), allMarcas({ todos: true, estrito: true })]),
    [[], []]
  );
  const [cats, marcas] = dados;
  return (
    <div className="admin-container">
      <Link href="/admin/produtos" className="admin-back">← Voltar</Link>
      <h1>Novo produto</h1>
      <AvisoSemBase mostrar={semBase} />
      <ProdutoForm
        categorias={cats.map(({ slug, nome, parent }) => ({ slug, nome, parent: parent || null }))}
        marcas={marcas.map(({ slug, nome }) => ({ slug, nome }))}
        marcaInicial={marcas.some((m) => m.slug === marca) ? marca : ""}
      />
    </div>
  );
}
