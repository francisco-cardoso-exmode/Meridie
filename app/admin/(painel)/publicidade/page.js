import Link from "next/link";
import { allAnuncios } from "@/lib/anuncios";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Publicidade" };

export default async function AdminPublicidade() {
  const lista = await allAnuncios({ todos: true });
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Publicidade</h1>
          <p className="admin-sub">
            Cards de patrocínio/parceiros (hotéis, restaurantes…). Aparecem na Home
            e na página <Link href="/publicidade" target="_blank" className="admin-link">/publicidade</Link>.
          </p>
        </div>
        <Link href="/admin/publicidade/novo" className="btn btn-primary">+ Novo</Link>
      </div>

      <div className="admin-list">
        {lista.length === 0 && (
          <div className="empty-state"><p>Ainda não há anúncios. Cria o primeiro.</p></div>
        )}
        {lista.map((a) => (
          <div className="admin-row" key={a.slug}>
            <div className="admin-thumb" style={{ backgroundImage: `url(${thumbUrl(a.imagem) || ""})` }} />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {a.titulo}
                {a.mostrarHome && <span className="tag-dest">HOME</span>}
                {a.ativo === false && <span className="tag-oculto">INATIVO</span>}
              </div>
              <div className="admin-row-sub">{a.url || "sem link"}</div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/admin/publicidade/${a.slug}`} className="admin-link">Editar</Link>
              <DeleteButton slug={a.slug} nome={a.titulo} endpoint="anuncios" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
