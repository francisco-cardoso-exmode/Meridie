import Link from "next/link";
import { notFound } from "next/navigation";
import ConteudoForm from "@/components/admin/ConteudoForm";
import { PAGINAS, getConteudo } from "@/lib/conteudo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar página" };

export default async function EditarPagina({ params }) {
  const { pagina } = await params;
  const reg = PAGINAS.find((p) => p.key === pagina);
  if (!reg) notFound();
  const valores = await getConteudo(pagina);

  return (
    <div className="admin-container">
      <Link href="/admin/paginas" className="admin-back">← Voltar</Link>
      <div className="admin-head">
        <h1>Editar — {reg.nome}</h1>
        <Link href={reg.rota} target="_blank" className="btn-ver-site" style={{ display: "inline-block", marginTop: 0 }}>
          Ver no site ↗
        </Link>
      </div>
      <ConteudoForm pagina={pagina} campos={reg.campos} valores={valores} />
    </div>
  );
}
