import Link from "next/link";
import MarcaForm from "@/components/admin/MarcaForm";

export const metadata = { title: "Nova marca" };

export default function NovaMarca() {
  return (
    <div className="admin-container">
      <Link href="/admin/marcas" className="admin-back">← Voltar</Link>
      <h1>Nova marca</h1>
      <MarcaForm />
    </div>
  );
}
