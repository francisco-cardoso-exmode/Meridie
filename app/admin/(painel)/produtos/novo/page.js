import Link from "next/link";
import ProdutoForm from "@/components/admin/ProdutoForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, produtoBySlug } from "@/lib/representacoes";
import { copiaDe } from "@/lib/slug";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo produto" };

export default async function NovoProduto({ searchParams }) {
  const { marca = "", de } = await searchParams;
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        allCategorias({ todos: true, estrito: true }),
        allMarcas({ todos: true, estrito: true }),
        de ? produtoBySlug(de, { estrito: true }) : null,
      ]),
    [[], [], null]
  );
  const [cats, marcas, original] = dados;
  return (
    <div className="admin-container">
      <Link href="/admin/produtos" className="admin-back">← Voltar</Link>
      <h1>{original ? `Duplicar «${original.nome}»` : "Novo produto"}</h1>
      {original && <p className="admin-sub">Cópia inativa: muda o nome e o que for diferente, e ativa quando estiver pronta.</p>}
      <AvisoSemBase mostrar={semBase} />
      <ProdutoForm
        key={de || "novo"}
        copia={copiaDe(original, "ativo")}
        categorias={cats.map(({ slug, nome, parent }) => ({ slug, nome, parent: parent || null }))}
        marcas={marcas.map(({ slug, nome }) => ({ slug, nome }))}
        marcaInicial={marcas.some((m) => m.slug === marca) ? marca : ""}
      />
    </div>
  );
}
