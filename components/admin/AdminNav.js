"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/empreendimentos", label: "Empreendimentos" },
  { href: "/admin/regioes", label: "Regiões & Zonas" },
  { href: "/admin/paginas", label: "Páginas" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/emails", label: "Emails" },
  { href: "/admin/definicoes", label: "Definições" },
  { href: "/admin/ajuda", label: "Ajuda" },
];

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <header className="admin-nav">
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-brand">
          MERIDIE <span>ADMIN</span>
        </Link>
        <nav>
          {LINKS.map((l) => {
            const active =
              l.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? "active" : undefined}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/" target="_blank">
            Ver site ↗
          </Link>
          <button type="button" onClick={logout} className="admin-logout">
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}
