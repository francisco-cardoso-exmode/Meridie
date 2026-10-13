"use client";

import { createContext, useContext } from "react";
import { t as traduz, tf as traduzF, caminho } from "@/lib/i18n";

// Idioma da página atual, para os componentes client.
const LangContext = createContext("pt");

export function LangProvider({ lang, children }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang() {
  return useContext(LangContext);
}

// Atalhos: const { t, tf, href } = useT();
export function useT() {
  const lang = useContext(LangContext);
  return {
    lang,
    t: (s) => traduz(lang, s),
    tf: (s, v) => traduzF(lang, s, v),
    href: (p) => caminho(lang, p),
  };
}
