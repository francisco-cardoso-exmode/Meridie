import "@/components/al/al.css";
import Link from "next/link";

const SUB = [
  ["/admin/alojamento", "Resumo"],
  ["/admin/alojamento/casas", "Casas"],
  ["/admin/alojamento/reservas", "Reservas"],
  ["/admin/alojamento/tarefas", "Tarefas"],
  ["/admin/alojamento/proprietarios", "Proprietários"],
  ["/admin/alojamento/equipa", "Equipa"],
  ["/admin/alojamento/definicoes", "Definições"],
];

// Secção "Alojamento" do backoffice (o painel já valida a sessão de admin).
export default function LayoutAlojamentoAdmin({ children }) {
  return (
    <>
      <nav className="al-subnav admin-container" aria-label="Alojamento">
        {SUB.map(([href, rot]) => (
          <Link key={href} href={href}>
            {rot}
          </Link>
        ))}
      </nav>
      {children}
    </>
  );
}
