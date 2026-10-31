import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { allCategorias, allProdutos, garanteSeedCategorias } from "@/lib/representacoes";
import { arvoreCategorias } from "@/lib/catalogo";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import CategoriasLista from "@/components/admin/CategoriasLista";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Categorias" };

export default async function AdminCategorias() {
  // Na primeira visita grava a árvore inicial (Bebidas, Alimentação…) na base.
  const { dados, semBase } = await leAdmin(async () => {
    if (process.env.MONGODB_URI) await garanteSeedCategorias(await getDb());
    return Promise.all([allCategorias({ todos: true, estrito: true }), allProdutos({ todos: true, estrito: true })]);
  }, [[], []]);
  const [cats, produtos] = dados;
  const conta = (slug) => produtos.filter((p) => p.categoria === slug || p.subcategoria === slug).length;
  const arvore = arvoreCategorias(cats.map((c) => ({ ...c, n: conta(c.slug) })));

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Categorias</h1>
          <p className="admin-sub">
            Árvore das Representações comerciais: <strong>Categoria</strong> (ex.: Bebidas) →{" "}
            <strong>Subcategoria</strong> (ex.: Vinho). Só há dois níveis. As categorias aparecem em{" "}
            <Link href="/representacoes" target="_blank" className="admin-link">/representacoes</Link>; as
            subcategorias são os filtros da página de cada categoria. ↑ ↓ mudam a ordem (grava logo).
          </p>
        </div>
        <Link href="/admin/categorias/novo" className="btn btn-primary">+ Nova</Link>
      </div>
      <AvisoSemBase mostrar={semBase} />
      {!semBase && arvore.length === 0 && (
        <div className="empty-state"><p>Ainda não há categorias. Cria a primeira.</p></div>
      )}
      {!semBase && <CategoriasLista arvore={arvore} />}
    </div>
  );
}
