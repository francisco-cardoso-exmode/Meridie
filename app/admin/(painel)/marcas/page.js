import Link from "next/link";
import { allMarcas, garanteSeed, AREAS_MARCA } from "@/lib/marcas";
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
  const { dados: lista, semBase } = await leAdmin(async () => {
    if (process.env.MONGODB_URI) await garanteSeed(await getDb());
    return allMarcas({ todos: true, estrito: true });
  }, []);
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

      <AvisoSemBase mostrar={semBase} />
      <div className="admin-list">
        {!semBase && lista.length === 0 && (
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
              <Link href={`/admin/marcas/${encodeURIComponent(m.slug)}`} className="admin-link">Editar</Link>
              <DeleteButton slug={m.slug} nome={m.nome} endpoint="marcas" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
