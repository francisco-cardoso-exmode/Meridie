import Link from "next/link";
import AnuncioForm from "@/components/admin/AnuncioForm";

export const metadata = { title: "Novo anúncio" };

export default function NovoAnuncio() {
  return (
    <div className="admin-container">
      <Link href="/admin/publicidade" className="admin-back">← Voltar</Link>
      <h1>Novo anúncio</h1>
      <AnuncioForm />
    </div>
  );
}
