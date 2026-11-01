"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUB = [
  ["/admin/alojamento", "Resumo"],
  ["/admin/alojamento/casas", "Casas"],
  ["/admin/alojamento/reservas", "Reservas"],
  ["/admin/alojamento/tarefas", "Tarefas"],
  ["/admin/alojamento/proprietarios", "Proprietários"],
  ["/admin/alojamento/equipa", "Equipa"],
  ["/admin/alojamento/definicoes", "Definições"],
];

// Submenu da secção Alojamento, com a página atual destacada.
export default function SubnavAl() {
  const pathname = usePathname();
  return (
    <nav className="al-subnav admin-container" aria-label="Alojamento">
      {SUB.map(([href, rot]) => {
        const ativo = href === "/admin/alojamento" ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href} className={ativo ? "ativo" : undefined} aria-current={ativo ? "page" : undefined}>
            {rot}
          </Link>
        );
      })}
    </nav>
  );
}
