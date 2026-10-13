"use client";

import { useEffect, useState } from "react";
import L from "@/components/L";
import Logo from "@/components/Logo";
import Icon from "@/components/Icon";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { useT } from "@/components/LangProvider";
import TrocaIdioma from "@/components/TrocaIdioma";

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
  ...(TECNOLOGIA_VISIVEL ? [{ href: "/tecnologia", label: "Tecnologia" }] : []),
  { href: "/publicidade", label: "Parceiros" },
  { href: "/quem-somos", label: "Quem Somos" },
  { href: "/contactos", label: "Contactar", destaque: true },
];

export default function Header() {
  const { t } = useT();
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
          aria-label={open ? t("Fechar menu") : t("Abrir menu")}
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
                  {t(l.label)} <span aria-hidden="true">▾</span>
                </button>
                <div className="nav-drop-menu">
                  {l.sub.map((s) => (
                    <L key={s.href} href={s.href} onClick={() => setOpen(false)}>
                      {t(s.label)}
                    </L>
                  ))}
                </div>
              </div>
            ) : (
              <L
                key={l.href}
                href={l.href}
                className={l.destaque ? "nav-cta" : undefined}
                onClick={() => setOpen(false)}
              >
                {t(l.label)}
              </L>
            )
          )}
          <TrocaIdioma onClick={() => setOpen(false)} />
        </nav>
      </div>
    </header>
  );
}
