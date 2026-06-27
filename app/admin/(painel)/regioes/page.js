import Link from "next/link";
import { allRegioes } from "@/lib/store";
import { PAIS_LABEL } from "@/lib/empreendimentos";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regiões & Zonas" };

export default async function AdminRegioes() {
  const lista = await allRegioes();
  const mapaNome = Object.fromEntries(lista.map((r) => [r.slug, r.nome]));

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Regiões & Zonas</h1>
          <p className="admin-sub">
            As regiões de topo aparecem como banners. As zonas pertencem a uma
            região (campo &quot;pertence a&quot;).
          </p>
        </div>
        <Link href="/admin/regioes/novo" className="btn btn-primary">+ Nova</Link>
      </div>

      <div className="admin-list">
        {lista.map((r) => (
          <div className="admin-row" key={r.slug}>
            <div className="admin-thumb" style={{ backgroundImage: `url(${r.imagem || ""})` }} />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {r.nome}
                {r.parent ? (
                  <span className="tag-dest">ZONA · {mapaNome[r.parent] || r.parent}</span>
                ) : (
                  <span className="tag-real">REGIÃO</span>
                )}
              </div>
              <div className="admin-row-sub">
                {PAIS_LABEL[r.pais]} · liga a: {[...(r.cidades || []), ...(r.zonas || [])].join(", ") || "—"}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/regioes/${r.slug}`} target="_blank" className="admin-link">Ver</Link>
              <Link href={`/admin/regioes/${r.slug}`} className="admin-link">Editar</Link>
              <DeleteButton slug={r.slug} nome={r.nome} endpoint="regioes" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
