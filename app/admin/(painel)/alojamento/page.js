import Link from "next/link";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import { getDb } from "@/lib/mongodb";
import { hojeLisboa } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento" };

export default async function ResumoAlojamento() {
  const hoje = hojeLisboa();
  const { dados: n, semBase } = await leAdmin(async () => {
    const db = await getDb();
    const [analise, publicadas, pedidos, tarefasHoje, porAtribuir] = await Promise.all([
      db.collection("al_casas").countDocuments({ estado: "em_analise" }),
      db.collection("al_casas").countDocuments({ estado: "publicada" }),
      db.collection("al_reservas").countDocuments({ estado: "pedido" }),
      db.collection("al_tarefas").countDocuments({ data: hoje, estado: { $ne: "concluida" } }),
      db.collection("al_tarefas").countDocuments({ atribuidaA: "", estado: "pendente" }),
    ]);
    return { analise, publicadas, pedidos, tarefasHoje, porAtribuir };
  }, {});

  const cartoes = [
    ["Casas em análise", n.analise, "/admin/alojamento/casas?estado=em_analise"],
    ["Casas publicadas", n.publicadas, "/admin/alojamento/casas?estado=publicada"],
    ["Pedidos de reserva", n.pedidos, "/admin/alojamento/reservas?estado=pedido"],
    ["Tarefas de hoje", n.tarefasHoje, `/admin/alojamento/tarefas?data=${hoje}`],
    ["Tarefas por atribuir", n.porAtribuir, "/admin/alojamento/tarefas?atribuida=nao"],
  ];

  return (
    <div className="admin-container">
      <h1>Alojamento Local</h1>
      <p className="admin-sub">
        Casas dos proprietários, reservas, inspeções da equipa. Apps: <a href="/proprietario" target="_blank">/proprietario</a> ·{" "}
        <a href="/equipa" target="_blank">/equipa</a> · site: <a href="/alojamento" target="_blank">/alojamento</a>
      </p>
      <AvisoSemBase mostrar={semBase} />
      <div className="admin-stats">
        {cartoes.map(([l, v, href]) => (
          <Link key={l} href={href} className="admin-stat">
            <div className="n">{semBase ? "—" : v}</div>
            <div className="l">{l}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
