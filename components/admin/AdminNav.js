"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu agrupado por assunto. `conta`: chave em `contadores` (número a amarelo
// com o que está à espera de ação — ver lib/pendentesAdmin.js).
const MENU = [
  { href: "/admin", label: "Hoje" },
  {
    label: "Imobiliário",
    sub: [
      { href: "/admin/empreendimentos", label: "Empreendimentos" },
      { href: "/admin/regioes", label: "Regiões & Zonas" },
    ],
  },
  { href: "/admin/alojamento", label: "Alojamento", conta: "alojamento" },
  {
    label: "Catálogo",
    sub: [
      { href: "/admin/marcas", label: "Marcas" },
      { href: "/admin/produtos", label: "Produtos" },
      { href: "/admin/categorias", label: "Categorias" },
      { href: "/admin/solucoes", label: "Soluções" },
      { href: "/admin/publicidade", label: "Parceiros" },
    ],
  },
  {
    label: "Contactos",
    conta: "contactos",
    sub: [
      { href: "/admin/pedidos", label: "Pedidos" },
      { href: "/admin/leads", label: "Leads" },
    ],
  },
  {
    label: "Site",
    sub: [
      { href: "/admin/paginas", label: "Páginas" },
      { href: "/admin/traducoes", label: "Traduções" },
      { href: "/admin/emails", label: "Emails" },
      { href: "/admin/assinatura", label: "Assinatura" },
      { href: "/admin/analytics", label: "Analytics" },
    ],
  },
  {
    label: "Conta",
    sub: [
      { href: "/admin/definicoes", label: "Definições" },
      { href: "/admin/utilizadores", label: "Utilizadores" },
      { href: "/admin/ajuda", label: "Ajuda" },
    ],
  },
];

const ativo = (pathname, href) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

function Conta({ n }) {
  return n > 0 ? <span className="admin-conta">{n > 99 ? "99+" : n}</span> : null;
}

export default function AdminNav({ contadores = {} }) {
  const pathname = usePathname();
  const [aberto, setAberto] = useState(null); // grupo aberto (computador)
  const [menu, setMenu] = useState(false); // painel do telemóvel
  const ref = useRef(null);

  // Fecha tudo ao mudar de página, ao clicar fora e com Esc.
  useEffect(() => {
    setAberto(null);
    setMenu(false);
  }, [pathname]);
  useEffect(() => {
    const fora = (e) => ref.current && !ref.current.contains(e.target) && setAberto(null);
    const esc = (e) => e.key === "Escape" && (setAberto(null), setMenu(false));
    document.addEventListener("click", fora);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("click", fora);
      document.removeEventListener("keydown", esc);
    };
  }, []);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const total = Object.values(contadores).reduce((a, b) => a + (b || 0), 0);

  return (
    <header className="admin-nav" ref={ref}>
      <div className="admin-nav-inner">
        <Link href="/admin" className="admin-brand">
          MERIDIE <span>ADMIN</span>
        </Link>
        <button
          type="button"
          className="admin-burger"
          aria-expanded={menu}
          aria-controls="admin-menu"
          onClick={() => setMenu((v) => !v)}
        >
          {menu ? "Fechar" : "Menu"}
          {!menu && <Conta n={total} />}
        </button>
        <nav id="admin-menu" className={menu ? "aberto" : undefined}>
          {MENU.map((g) =>
            g.sub ? (
              <div key={g.label} className={`admin-grupo${aberto === g.label ? " aberto" : ""}`}>
                <button
                  type="button"
                  className={g.sub.some((s) => ativo(pathname, s.href)) ? "active" : undefined}
                  aria-expanded={aberto === g.label}
                  onClick={() => setAberto((a) => (a === g.label ? null : g.label))}
                >
                  {g.label}
                  <Conta n={contadores[g.conta]} />
                  <span className="seta" aria-hidden="true">▾</span>
                </button>
                <div className="admin-sub-menu">
                  {g.sub.map((s) => (
                    <Link key={s.href} href={s.href} className={ativo(pathname, s.href) ? "active" : undefined}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link key={g.href} href={g.href} className={ativo(pathname, g.href) ? "active" : undefined}>
                {g.label}
                <Conta n={contadores[g.conta]} />
              </Link>
            )
          )}
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
