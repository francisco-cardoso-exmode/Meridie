"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";

const CompareContext = createContext(null);
const STORAGE_KEY = "meridie_compare";
const MAX = 2;

export function CompareProvider({ children }) {
  const [itens, setItens] = useState([]);

  // Carrega seleção guardada (sobrevive à navegação entre páginas).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItens(JSON.parse(raw).slice(0, MAX));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {}
  }, [itens]);

  const toggle = useCallback((item) => {
    setItens((prev) => {
      const existe = prev.some((x) => x.slug === item.slug);
      if (existe) return prev.filter((x) => x.slug !== item.slug);
      if (prev.length >= MAX) return [prev[prev.length - 1], item]; // substitui o mais antigo
      return [...prev, item];
    });
  }, []);

  const remover = useCallback((slug) => {
    setItens((prev) => prev.filter((x) => x.slug !== slug));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const estaSelecionado = useCallback(
    (slug) => itens.some((x) => x.slug === slug),
    [itens]
  );

  return (
    <CompareContext.Provider
      value={{ itens, toggle, remover, limpar, estaSelecionado, MAX }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare tem de estar dentro de CompareProvider");
  return ctx;
}
