import Link from "next/link";
import RegiaoForm from "@/components/admin/RegiaoForm";
import { allRegioes } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova região/zona" };

export default async function NovaRegiao() {
  const regioes = await allRegioes();
  return (
    <div className="admin-container">
      <Link href="/admin/regioes" className="admin-back">← Voltar</Link>
      <h1>Nova região / zona</h1>
      <RegiaoForm regioesExistentes={regioes} />
    </div>
  );
}
