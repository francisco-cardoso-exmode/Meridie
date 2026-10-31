import Link from "next/link";
import { allMarcas } from "@/lib/marcas";
import { allCategorias, allProdutos } from "@/lib/representacoes";
import { formataPreco, hrefProduto, temPreco } from "@/lib/catalogo";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Produtos" };

export default async function AdminProdutos() {
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        allProdutos({ todos: true, estrito: true }),
        allCategorias({ todos: true, estrito: true }),
        allMarcas({ todos: true, estrito: true }),
      ]),
    [[], [], []]
  );
  const [todos, cats, marcas] = dados;
  const nomeCat = new Map(cats.map((c) => [c.slug, c.nome]));
  const nomeMarca = new Map(marcas.map((m) => [m.slug, m.nome]));
  const legado = todos.filter((p) => p.legado).length;

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Produtos</h1>
          <p className="admin-sub">
            Produtos das Representações comerciais — cada um com marca, categoria, fotos, ficha técnica e preço
            (ou «sob consulta»). Aparecem em{" "}
            <Link href="/representacoes" target="_blank" className="admin-link">/representacoes</Link> e na página da marca.
          </p>
        </div>
        <Link href="/admin/produtos/novo" className="btn btn-primary">+ Novo</Link>
      </div>
      <AvisoSemBase mostrar={semBase} />
      {legado > 0 && (
        <div className="aviso-sem-base" role="status">
          <strong>{legado} produto(s) ainda no formato antigo</strong> (dentro das marcas, marcados «POR MIGRAR»).
          Aparecem no site, mas só se editam depois da migração: <code>node scripts/migrar-representacoes.mjs --aplicar</code>{" "}
          (ver Ajuda, ponto 7).
        </div>
      )}

      {!semBase && todos.length === 0 && (
        <div className="empty-state"><p>Ainda não há produtos. Cria o primeiro.</p></div>
      )}
      <ListaFiltravel
        placeholder="Pesquisar por nome, referência ou marca…"
        ordemPadrao="nome"
        ordens={[
          { k: "nome", label: "nome" },
          { k: "categoria", label: "categoria" },
          { k: "preco", label: "preço (mais barato)" },
          { k: "precoDesc", label: "preço (mais caro)", desc: true },
          { k: "atualizadoEm", label: "alterados recentemente", desc: true },
        ]}
        facetas={[
          { k: "categoria", label: "Categoria", opcoes: cats.filter((c) => !c.parent).map((c) => ({ v: c.slug, label: c.nome })) },
          { k: "subcategoria", label: "Subcategoria", opcoes: cats.filter((c) => c.parent).map((c) => ({ v: c.slug, label: `${nomeCat.get(c.parent) || c.parent} › ${c.nome}` })) },
          { k: "marca", label: "Marca", opcoes: marcas.map((m) => ({ v: m.slug, label: m.nome })) },
          { k: "disponivel", label: "Disponível", opcoes: [{ v: "sim", label: "Disponível" }, { v: "nao", label: "Indisponível" }] },
          { k: "preco", label: "Preço", opcoes: [{ v: "valor", label: "Com preço" }, { v: "consulta", label: "Sob consulta" }] },
          { k: "destaque", label: "Destaque", opcoes: [{ v: "sim", label: "Em destaque" }, { v: "nao", label: "Sem destaque" }] },
        ]}
        itens={todos.map((p) => ({
          id: p.slug,
          busca: `${p.nome} ${p.slug} ${nomeMarca.get(p.marca) || ""}`.toLowerCase(),
          facetas: {
            categoria: p.categoria,
            subcategoria: p.subcategoria || "",
            marca: p.marca || "",
            disponivel: p.disponivel === false ? "nao" : "sim",
            preco: temPreco(p) ? "valor" : "consulta",
            destaque: p.destaque ? "sim" : "nao",
          },
          ordem: {
            nome: p.nome,
            categoria: `${nomeCat.get(p.categoria) || ""} ${nomeCat.get(p.subcategoria) || ""} ${p.nome}`,
            preco: temPreco(p) ? Number(p.preco) : null,
            precoDesc: temPreco(p) ? Number(p.preco) : -1,
            atualizadoEm: p.atualizadoEm ? new Date(p.atualizadoEm).getTime() : 0,
          },
          node: (
            <div className="admin-row">
              <div className="admin-thumb" style={{ backgroundImage: `url(${thumbUrl(p.imagens?.[0]) || ""})` }} />
              <div className="admin-row-main">
                <div className="admin-row-title">
                  {p.nome}
                  {p.destaque && <span className="tag-dest">DESTAQUE</span>}
                  {p.disponivel === false && <span className="tag-oculto">INDISPONÍVEL</span>}
                  {p.ativo === false && <span className="tag-oculto">INATIVO</span>}
                  {p.legado && <span className="tag-oculto">POR MIGRAR</span>}
                </div>
                <div className="admin-row-sub">
                  {nomeMarca.get(p.marca) || "sem marca"} · {nomeCat.get(p.categoria) || p.categoria}
                  {p.subcategoria ? ` › ${nomeCat.get(p.subcategoria) || p.subcategoria}` : ""} ·{" "}
                  {temPreco(p) ? `${formataPreco(p.preco)}${p.unidade ? ` / ${p.unidade}` : ""}` : "sob consulta"}
                </div>
              </div>
              <div className="admin-row-actions">
                <Link href={hrefProduto(p)} target="_blank" className="admin-link">Ver</Link>
                {!p.legado && (
                  <>
                    <Link href={`/admin/produtos/${encodeURIComponent(p.slug)}`} className="admin-link">Editar</Link>
                    <DeleteButton slug={p.slug} nome={p.nome} endpoint="produtos" />
                  </>
                )}
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
