"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";

const LINKS = [
  {
    label: "Imobiliário",
    sub: [
      { href: "/portugal", label: "Portugal" },
      { href: "/brasil", label: "Brasil" },
      { href: "/empreendimentos", label: "Toda a oferta" },
      { href: "/como-funciona", label: "Como Funciona" },
    ],
  },
  { href: "/marcas", label: "Marcas" },
  { href: "/tecnologia", label: "Tecnologia" },
  { href: "/publicidade", label: "Parceiros" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/contactos", label: "Contactar", destaque: true },
];

export default function Header() {
  const [hidden, setHidden] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y > last && y > 140) setHidden(true);
      else if (y < last) setHidden(false);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-header${hidden ? " hidden" : ""}`}>
      <div className="container">
        <Logo size={40} />

        <button
          type="button"
          className="nav-toggle"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <Icon name={open ? "x" : "menu"} />
        </button>

        <nav className={`nav${open ? " open" : ""}`}>
          {LINKS.map((l) =>
            l.sub ? (
              <div className="nav-drop" key={l.label}>
                <button type="button" className="nav-drop-btn" aria-haspopup="true">
                  {l.label} <span aria-hidden="true">▾</span>
                </button>
                <div className="nav-drop-menu">
                  {l.sub.map((s) => (
                    <Link key={s.href} href={s.href} onClick={() => setOpen(false)}>
                      {s.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={l.destaque ? "nav-cta" : undefined}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </header>
  );
}
