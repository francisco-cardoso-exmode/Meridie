import Link from "next/link";
import SolucaoForm from "@/components/admin/SolucaoForm";

export const metadata = { title: "Nova solução" };

export default function NovaSolucao() {
  return (
    <div className="admin-container">
      <Link href="/admin/solucoes" className="admin-back">← Voltar</Link>
      <h1>Nova solução</h1>
      <SolucaoForm />
    </div>
  );
}
