"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { TAXA_EUR_BRL_FALLBACK, CAMBIO_TTL } from "@/lib/cambio";

// Disponibiliza a cotação EUR→BRL a todo o site. O valor inicial vem do
// servidor (layout) e é atualizado no browser: ao abrir a página, de X em X
// minutos e sempre que se volta ao separador — para o preço convertido ser
// sempre o do momento em que está a ser visto.

const CambioContext = createContext(null);

const PADRAO = { taxa: TAXA_EUR_BRL_FALLBACK, aoVivo: false, atualizadoEm: null };

export function CambioProvider({ inicial, children }) {
  const [cambio, setCambio] = useState(inicial?.taxa ? inicial : PADRAO);

  useEffect(() => {
    let ativo = true;

    const atualizar = async () => {
      try {
        const r = await fetch("/api/cambio", { cache: "no-store" });
        if (!r.ok) return;
        const j = await r.json();
        if (ativo && Number(j?.taxa) > 0) setCambio(j);
      } catch {
        /* sem rede — fica a taxa que já se tem */
      }
    };

    atualizar();
    const t = setInterval(atualizar, CAMBIO_TTL * 1000);
    const aoVoltar = () => {
      if (document.visibilityState === "visible") atualizar();
    };
    document.addEventListener("visibilitychange", aoVoltar);

    return () => {
      ativo = false;
      clearInterval(t);
      document.removeEventListener("visibilitychange", aoVoltar);
    };
  }, []);

  return <CambioContext.Provider value={cambio}>{children}</CambioContext.Provider>;
}

// Fora do provider (ex.: testes) devolve a taxa de recurso em vez de rebentar.
export function useCambio() {
  return useContext(CambioContext) || PADRAO;
}

export function useTaxaEurBrl() {
  return useCambio().taxa;
}
