import Link from "next/link";
import { allMarcas, AREAS_MARCA } from "@/lib/marcas";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Marcas" };

export default async function AdminMarcas() {
  const lista = await allMarcas({ todos: true });
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Marcas</h1>
          <p className="admin-sub">
            Marcas representadas (vinhos, bebidas, alimentação…). Aparecem na página{" "}
            <Link href="/marcas" target="_blank" className="admin-link">/marcas</Link> e, se
            marcadas, na faixa da Home.
          </p>
        </div>
        <Link href="/admin/marcas/novo" className="btn btn-primary">+ Nova</Link>
      </div>

      <div className="admin-list">
        {lista.length === 0 && (
          <div className="empty-state"><p>Ainda não há marcas. Cria a primeira.</p></div>
        )}
        {lista.map((m) => (
          <div className="admin-row" key={m.slug}>
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
                {AREAS_MARCA[m.area] || m.area}
                {m.origem ? ` · ${m.origem}` : ""}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/admin/marcas/${m.slug}`} className="admin-link">Editar</Link>
              <DeleteButton slug={m.slug} nome={m.nome} endpoint="marcas" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
