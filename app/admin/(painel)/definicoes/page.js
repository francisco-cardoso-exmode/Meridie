import ConfigForm from "@/components/admin/ConfigForm";
import RedesForm from "@/components/admin/RedesForm";
import { getDestinatarios, getRedes } from "@/lib/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Definições" };

export default async function AdminDefinicoes() {
  const [destinatarios, redes] = await Promise.all([getDestinatarios(), getRedes()]);
  return (
    <div className="admin-container">
      <h1>Definições</h1>
      <p className="admin-sub">Configurações gerais do site.</p>

      <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>Emails do formulário</h2>
      <p className="admin-sub">
        Para onde vão as mensagens recebidas no site (ex.: Helder e Paulo).
      </p>
      <ConfigForm inicial={destinatarios} />

      <h2 style={{ fontSize: "1.2rem", margin: "40px 0 6px" }}>Redes sociais (footer)</h2>
      <p className="admin-sub">Aparecem no rodapé de todas as páginas.</p>
      <RedesForm inicial={redes} />
    </div>
  );
}
