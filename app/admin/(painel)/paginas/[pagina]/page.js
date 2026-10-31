import Link from "next/link";
import { notFound } from "next/navigation";
import ConteudoForm from "@/components/admin/ConteudoForm";
import { PAGINAS, getConteudo } from "@/lib/conteudo";
import { getDb } from "@/lib/mongodb";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editar página" };

export default async function EditarPagina({ params }) {
  const { pagina } = await params;
  const reg = PAGINAS.find((p) => p.key === pagina);
  if (!reg) notFound();
  // getConteudo cai nos textos por defeito se a base falhar — aqui confirma-se
  // primeiro a ligação, para não gravar os textos por defeito por cima dos reais.
  const { semBase } = await leAdmin(async () => {
    if (!process.env.MONGODB_URI) return;
    const db = await getDb();
    await db.collection("paginas").findOne({ _id: pagina }, { projection: { _id: 1 } });
  });
  if (semBase) {
    return (
      <div className="admin-container">
        <Link href="/admin/paginas" className="admin-back">← Voltar</Link>
        <h1>Editar — {reg.nome}</h1>
        <AvisoSemBase />
      </div>
    );
  }
  const [valores, enMostrado] = await Promise.all([
    getConteudo(pagina),
    getConteudo(pagina, "en"),
  ]);

  return (
    <div className="admin-container">
      <Link href="/admin/paginas" className="admin-back">← Voltar</Link>
      <div className="admin-head">
        <h1>Editar — {reg.nome}</h1>
        <Link href={reg.rota} target="_blank" className="btn-ver-site" style={{ display: "inline-block", marginTop: 0 }}>
          Ver no site ↗
        </Link>
      </div>
      <ConteudoForm
        pagina={pagina}
        campos={reg.campos}
        valores={valores}
        enMostrado={enMostrado}
      />
    </div>
  );
}
