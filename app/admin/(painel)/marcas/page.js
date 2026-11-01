import Link from "next/link";
import { urlPrevisualizar } from "@/lib/previsualizacao";
import { hrefMarca } from "@/lib/catalogo";
import { allMarcas, garanteSeed } from "@/lib/marcas";
import { allCategorias, allProdutos } from "@/lib/representacoes";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import { getDb } from "@/lib/mongodb";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marcas" };

export default async function AdminMarcas() {
  // Na primeira visita de sempre, grava as marcas de exemplo na base de dados
  // (só uma vez — se forem apagadas, não voltam).
  const { dados, semBase } = await leAdmin(async () => {
    if (process.env.MONGODB_URI) await garanteSeed(await getDb());
    return Promise.all([
      allMarcas({ todos: true, estrito: true }),
      allProdutos({ todos: true, estrito: true }),
      allCategorias({ todos: true, estrito: true }),
    ]);
  }, [[], [], []]);
  const [lista, produtos, cats] = dados;
  const nProdutos = (slug) => produtos.filter((p) => p.marca === slug).length;
  // Categoria principal da marca (a dos seus produtos, a mais frequente) — para o filtro.
  const catPrincipal = (slug) => {
    const n = new Map();
    for (const p of produtos) if (p.marca === slug) n.set(p.categoria, (n.get(p.categoria) || 0) + 1);
    return [...n.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  };
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Marcas</h1>
          <p className="admin-sub">
            Marcas representadas — a história, o logótipo e a galeria de cada uma. Os produtos
            geram-se em <Link href="/admin/produtos" className="admin-link">Produtos</Link>. Aparecem na página{" "}
            <Link href="/representacoes/marcas" target="_blank" className="admin-link">/representacoes/marcas</Link> e, se
            marcadas, na faixa da Home.
          </p>
        </div>
        <Link href="/admin/marcas/novo" className="btn btn-primary">+ Nova</Link>
      </div>

      <AvisoSemBase mostrar={semBase} />
      {!semBase && lista.length === 0 && (
        <div className="empty-state"><p>Ainda não há marcas. Cria a primeira.</p></div>
      )}
      <ListaFiltravel
        placeholder="Pesquisar marca…"
        ordemPadrao="ordem"
        ordens={[
          { k: "ordem", label: "ordem no site" },
          { k: "nome", label: "nome" },
        ]}
        facetas={[
          { k: "ativa", label: "Estado", opcoes: [{ v: "sim", label: "Ativa" }, { v: "nao", label: "Inativa" }] },
          { k: "categoria", label: "Categoria", opcoes: cats.filter((c) => !c.parent).map((c) => ({ v: c.slug, label: c.nome })) },
        ]}
        itens={lista.map((m) => ({
          id: m.slug,
          busca: `${m.nome} ${m.slug} ${m.origem || ""}`.toLowerCase(),
          facetas: { ativa: m.ativo === false ? "nao" : "sim", categoria: catPrincipal(m.slug) },
          ordem: { nome: m.nome, ordem: Number.isFinite(Number(m.ordem)) ? Number(m.ordem) : 99 },
          node: (
            <div className="admin-row">
              <div
                className="admin-thumb"
                style={{ backgroundImage: `url(${thumbUrl(m.imagens?.[0] || m.logo) || ""})` }}
              />
              <div className="admin-row-main">
                <div className="admin-row-title">
                  {m.nome}
                  {m.mostrarHome && <span className="tag-dest">HOME</span>}
                  {m.ativo === false && <span className="tag-oculto">INATIVA</span>}
                </div>
                <div className="admin-row-sub">
                  {nProdutos(m.slug)} produto(s)
                  {m.origem ? ` · ${m.origem}` : ""}
                  {m.produtos?.length ? " · por migrar" : ""}
                </div>
              </div>
              <div className="admin-row-actions">
                <a href={urlPrevisualizar(hrefMarca(m.slug))} target="_blank" className="admin-link">
                  {m.ativo === false ? "Pré-visualizar" : "Ver"}
                </a>
                <Link href={`/admin/marcas/${encodeURIComponent(m.slug)}`} className="admin-link">Editar</Link>
                <DeleteButton slug={m.slug} nome={m.nome} endpoint="marcas" />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
