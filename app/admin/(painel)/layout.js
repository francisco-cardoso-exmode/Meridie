import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getSessao } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

// Valida a sessão na base antes de mostrar o painel (o middleware também
// valida; isto cobre qualquer caminho que lhe escape).
export default async function PainelLayout({ children }) {
  if (!(await getSessao())) redirect("/admin/login");
  return (
    <>
      <AdminNav />
      <main className="admin-main">{children}</main>
    </>
  );
}
