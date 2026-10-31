import Link from "next/link";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";
import { allRegioes } from "@/lib/store";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Novo empreendimento" };

export default async function NovoEmpreendimento() {
  const { dados: regioes, semBase } = await leAdmin(() => allRegioes({ estrito: true }), []);
  return (
    <div className="admin-container">
      <Link href="/admin/empreendimentos" className="admin-back">← Voltar</Link>
      <h1>Novo empreendimento</h1>
      <AvisoSemBase mostrar={semBase} />
      <EmpreendimentoForm regioesExistentes={regioes} />
    </div>
  );
}
