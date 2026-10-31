import Link from "next/link";
import RegiaoForm from "@/components/admin/RegiaoForm";
import { allRegioes } from "@/lib/store";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova região/zona" };

export default async function NovaRegiao({ searchParams }) {
  const sp = (await searchParams) || {};
  const { dados: regioes, semBase } = await leAdmin(() => allRegioes({ estrito: true }), []);
  const prefill = {
    nome: sp.nome || "",
    cidade: sp.cidade || "",
    zona: sp.zona || "",
  };
  return (
    <div className="admin-container">
      <Link href="/admin/regioes" className="admin-back">← Voltar</Link>
      <h1>Nova região / zona</h1>
      <AvisoSemBase mostrar={semBase} />
      <RegiaoForm regioesExistentes={regioes} prefill={prefill} />
    </div>
  );
}
