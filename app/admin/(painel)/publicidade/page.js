import Link from "next/link";
import { allAnuncios } from "@/lib/anuncios";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import ListaFiltravel from "@/components/admin/ListaFiltravel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publicidade" };

export default async function AdminPublicidade() {
  const { dados: lista, semBase } = await leAdmin(
    () => allAnuncios({ todos: true, estrito: true }),
    []
  );
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Parceiros & Publicidade</h1>
          <p className="admin-sub">
            Cards de patrocínio/parceiros (hotéis, restaurantes…). Aparecem na Home
            e na página <Link href="/publicidade" target="_blank" className="admin-link">/publicidade</Link>.
          </p>
        </div>
        <Link href="/admin/publicidade/novo" className="btn btn-primary">+ Novo</Link>
      </div>

      <AvisoSemBase mostrar={semBase} />
      {!semBase && lista.length === 0 && (
        <div className="empty-state"><p>Ainda não há anúncios. Cria o primeiro.</p></div>
      )}
      <ListaFiltravel
        placeholder="Pesquisar por título, categoria, cidade…"
        facetas={[
          { k: "categoria", label: "Categoria" },
          { k: "cidade", label: "Cidade" },
          { k: "ativo", label: "Estado", opcoes: [{ v: "ativo", label: "Ativos" }, { v: "inativo", label: "Inativos" }] },
          { k: "home", label: "Página inicial", opcoes: [{ v: "sim", label: "Na página inicial" }, { v: "nao", label: "Fora da página inicial" }] },
        ]}
        ordens={[{ k: "titulo", label: "Título" }, { k: "categoria", label: "Categoria" }]}
        itens={lista.map((a) => ({
          id: a.slug,
          busca: [a.titulo, a.slug, a.categoria, a.cidade, a.url].filter(Boolean).join(" "),
          facetas: {
            categoria: a.categoria,
            cidade: a.cidade,
            ativo: a.ativo === false ? "inativo" : "ativo",
            home: a.mostrarHome ? "sim" : "nao",
          },
          ordem: { titulo: a.titulo, categoria: `${a.categoria || ""} ${a.titulo}` },
          node: (
          <div className="admin-row">
            <div className="admin-thumb" style={{ backgroundImage: `url(${thumbUrl(a.imagem) || ""})` }} />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {a.titulo}
                {a.principal && <span className="tag-dest">PRINCIPAL</span>}
                {a.mostrarHome && <span className="tag-dest">HOME</span>}
                {a.ativo === false && <span className="tag-oculto">INATIVO</span>}
              </div>
              <div className="admin-row-sub">
                {[a.categoria, a.cidade, a.url || "sem link"].filter(Boolean).join(" · ")}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/admin/publicidade/${encodeURIComponent(a.slug)}`} className="admin-link">Editar</Link>
              <DeleteButton slug={a.slug} nome={a.titulo} endpoint="anuncios" />
            </div>
          </div>
          ),
        }))}
      />
    </div>
  );
}
