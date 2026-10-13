import { listarUtilizadores } from "@/lib/utilizadores";
import { utilizadorAtual } from "@/lib/adminAuth";
import UtilizadoresAdmin from "@/components/admin/UtilizadoresAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Utilizadores" };

export default async function PaginaUtilizadores({ searchParams }) {
  const { definir } = await searchParams;
  const [lista, eu] = await Promise.all([listarUtilizadores(), utilizadorAtual()]);
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Utilizadores</h1>
          <p className="admin-sub">
            Quem pode entrar no backoffice. Cada pessoa entra com o seu email e password;
            quem se esquecer pede um link em &quot;Esqueci-me da password&quot;.
          </p>
        </div>
      </div>
      <UtilizadoresAdmin lista={lista} eu={eu} definir={definir === "1"} />
    </div>
  );
}
