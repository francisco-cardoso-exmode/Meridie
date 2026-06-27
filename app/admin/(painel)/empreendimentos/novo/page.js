import Link from "next/link";
import EmpreendimentoForm from "@/components/admin/EmpreendimentoForm";

export const metadata = { title: "Novo empreendimento" };

export default function NovoEmpreendimento() {
  return (
    <div className="admin-container">
      <Link href="/admin/empreendimentos" className="admin-back">
        ← Voltar
      </Link>
      <h1>Novo empreendimento</h1>
      <EmpreendimentoForm />
    </div>
  );
}
