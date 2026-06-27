import Link from "next/link";
import { PAGINAS } from "@/lib/conteudo";

export const metadata = { title: "Páginas" };

export default function AdminPaginas() {
  return (
    <div className="admin-container">
      <h1>Páginas</h1>
      <p className="admin-sub">Edita os textos das páginas do site.</p>
      <div className="admin-list">
        {PAGINAS.map((p) => (
          <div className="admin-row" key={p.key}>
            <div className="admin-row-main">
              <div className="admin-row-title">{p.nome}</div>
              <div className="admin-row-sub">{p.rota} · {p.campos.length} campos</div>
            </div>
            <div className="admin-row-actions">
              <Link href={p.rota} target="_blank" className="admin-link">Ver</Link>
              <Link href={`/admin/paginas/${p.key}`} className="admin-link">Editar</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
