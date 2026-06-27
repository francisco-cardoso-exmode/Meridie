import Link from "next/link";
import { allEmpreendimentos } from "@/lib/store";
import { formatarPreco } from "@/lib/empreendimentos";
import DeleteButton from "@/components/admin/DeleteButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Empreendimentos" };

export default async function AdminEmpreendimentos() {
  const lista = await allEmpreendimentos({ todos: true });

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Empreendimentos</h1>
          <p className="admin-sub">{lista.length} no total. Cada card é um empreendimento.</p>
        </div>
        <Link href="/admin/empreendimentos/novo" className="btn btn-primary">
          + Novo
        </Link>
      </div>

      <div className="admin-list">
        {lista.map((e) => (
          <div className="admin-row" key={e.slug}>
            <div
              className="admin-thumb"
              style={{ backgroundImage: `url(${e.imagens?.[0] || ""})` }}
            />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {e.nome}
                {e.construtora && <span className="tag-real">REAL</span>}
                {e.destaque && <span className="tag-dest">DESTAQUE</span>}
                {e.publicado === false && <span className="tag-oculto">OCULTO</span>}
              </div>
              <div className="admin-row-sub">
                {e.cidade} · {e.zona} · {e.tipo} · {formatarPreco(e.preco, e.moeda)}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/empreendimentos/${e.slug}`} target="_blank" className="admin-link">
                Ver
              </Link>
              <Link href={`/admin/empreendimentos/${e.slug}`} className="admin-link">
                Editar
              </Link>
              <DeleteButton slug={e.slug} nome={e.nome} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
