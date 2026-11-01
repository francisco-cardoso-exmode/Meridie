import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getSessao } from "@/lib/adminAuth";
import { leAdmin } from "@/lib/leituraAdmin";
import { contarPendentes, contadoresMenu } from "@/lib/pendentesAdmin";

export const dynamic = "force-dynamic";

// Valida a sessão na base antes de mostrar o painel (o middleware também
// valida; isto cobre qualquer caminho que lhe escape).
export default async function PainelLayout({ children }) {
  if (!(await getSessao())) redirect("/admin/login");
  // Os números do menu nunca impedem o painel de abrir.
  const { dados: pendentes } = await leAdmin(contarPendentes, null);
  return (
    <>
      <AdminNav contadores={contadoresMenu(pendentes)} />
      <main className="admin-main">{children}</main>
    </>
  );
}
