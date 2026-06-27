import ConfigForm from "@/components/admin/ConfigForm";
import { getDestinatarios } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Definições" };

export default async function AdminDefinicoes() {
  const destinatarios = await getDestinatarios();
  return (
    <div className="admin-container">
      <h1>Definições</h1>
      <p className="admin-sub">Configurações gerais do site.</p>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>Emails do formulário</h2>
      <p className="admin-sub">
        Para onde vão as mensagens recebidas no site (ex.: Helder e Paulo).
      </p>
      <ConfigForm inicial={destinatarios} />
    </div>
  );
}
