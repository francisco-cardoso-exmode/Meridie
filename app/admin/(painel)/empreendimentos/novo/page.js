import Link from "next/link";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";
import { allRegioes } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo empreendimento" };

export default async function NovoEmpreendimento() {
  const regioes = await allRegioes();
  return (
    <div className="admin-container">
      <Link href="/admin/empreendimentos" className="admin-back">← Voltar</Link>
      <h1>Novo empreendimento</h1>
      <EmpreendimentoForm regioesExistentes={regioes} />
    </div>
  );
}
