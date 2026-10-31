"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useLang } from "@/components/LangProvider";
import { caminho, paraInterno } from "@/lib/i18n";

// PT | EN no menu: leva à mesma página no outro idioma, mantendo a query
// string (filtros, comparador ?a=&b=…).
function Ligacoes({ onClick, query = "" }) {
  const lang = useLang();
  const pathname = usePathname();
  const { interno } = paraInterno(pathname);
  const sufixo = query ? `?${query}` : "";
  return (
    <span className="troca-idioma">
      {["pt", "en"].map((l) =>
        l === lang ? (
          <span key={l} className="on" aria-current="true">{l.toUpperCase()}</span>
        ) : (
          <Link key={l} href={`${caminho(l, interno)}${sufixo}`} hrefLang={l} onClick={onClick}>
            {l.toUpperCase()}
          </Link>
        )
      )}
    </span>
  );
}

function ComQuery({ onClick }) {
  const sp = useSearchParams();
  return <Ligacoes onClick={onClick} query={sp?.toString() || ""} />;
}

// useSearchParams obriga a um <Suspense> nas páginas estáticas; enquanto não
// resolve, mostra as ligações sem a query.
export default function TrocaIdioma({ onClick }) {
  return (
    <Suspense fallback={<Ligacoes onClick={onClick} />}>
      <ComQuery onClick={onClick} />
    </Suspense>
  );
}
