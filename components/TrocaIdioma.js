"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { caminho, paraInterno } from "@/lib/i18n";

// PT | EN no menu: leva à mesma página no outro idioma.
export default function TrocaIdioma({ onClick }) {
  const lang = useLang();
  const pathname = usePathname();
  const { interno } = paraInterno(pathname);
  return (
    <span className="troca-idioma">
      {["pt", "en"].map((l) =>
        l === lang ? (
          <span key={l} className="on" aria-current="true">{l.toUpperCase()}</span>
        ) : (
          <Link key={l} href={caminho(l, interno)} hrefLang={l} onClick={onClick}>
            {l.toUpperCase()}
          </Link>
        )
      )}
    </span>
  );
}
