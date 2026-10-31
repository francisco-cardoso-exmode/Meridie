import ConfigForm from "@/components/admin/ConfigForm";
import RedesForm from "@/components/admin/RedesForm";
import EmpresaForm from "@/components/admin/EmpresaForm";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import {
  getDestinatariosGuardados,
  destinatariosPorDefeito,
  getRedes,
  getEmpresa,
} from "@/lib/config";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Definições" };

export default async function AdminDefinicoes() {
  // Se a leitura falhar, os formulários ficam bloqueados: gravar valores vazios
  // por cima dos reais apagava a configuração.
  const { dados, semBase } = await leAdmin(
    () =>
      Promise.all([
        getDestinatariosGuardados({ estrito: true }),
        getRedes({ estrito: true }),
        getEmpresa({ estrito: true }),
      ]),
    [[], null, null]
  );
  const [destinatarios, redes, empresa] = dados;
  const porDefeito = destinatariosPorDefeito();
  return (
    <div className="admin-container">
      <h1>Definições</h1>
      <p className="admin-sub">Configurações gerais do site.</p>
      <AvisoSemBase mostrar={semBase} />

      <h2 style={{ fontSize: "1.2rem", marginBottom: 6 }}>Emails do formulário</h2>
      <p className="admin-sub">
        Para onde vão as mensagens recebidas no site (ex.: Helder e Paulo).
      </p>
      <ConfigForm inicial={destinatarios} porDefeito={porDefeito} bloqueado={semBase} />

      <h2 style={{ fontSize: "1.2rem", margin: "40px 0 6px" }}>Dados da empresa</h2>
      <p className="admin-sub">
        Usados nas páginas legais (Privacidade, Cookies, Termos) e no rodapé do site.
      </p>
      <EmpresaForm inicial={empresa} bloqueado={semBase} />

      <h2 style={{ fontSize: "1.2rem", margin: "40px 0 6px" }}>Redes sociais (footer)</h2>
      <p className="admin-sub">Aparecem no rodapé de todas as páginas.</p>
      <RedesForm inicial={redes} bloqueado={semBase} />
    </div>
  );
}
