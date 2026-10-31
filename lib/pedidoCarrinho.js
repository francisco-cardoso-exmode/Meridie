"use client";

import { useSyncExternalStore } from "react";
import { normalizarItens, juntarItem, mudarQuantidade, removerItem } from "@/lib/pedido";

/**
 * O pedido em curso (carrinho), guardado no localStorage do browser — sem
 * conta nem cookies. Sincroniza entre separadores (evento "storage").
 * Usar com o hook useCarrinho() nos componentes client.
 */

const CHAVE = "meridie_pedido";
const VAZIO = [];
let cache = null; // lista atual (a mesma referência enquanto não muda)
const ouvintes = new Set();

function ler() {
  if (cache) return cache;
  try {
    cache = normalizarItens(JSON.parse(localStorage.getItem(CHAVE) || "[]"));
  } catch {
    cache = [];
  }
  return cache;
}

function gravar(lista) {
  cache = normalizarItens(lista);
  try {
    if (cache.length) localStorage.setItem(CHAVE, JSON.stringify(cache));
    else localStorage.removeItem(CHAVE);
  } catch {
    /* modo privado / armazenamento cheio: fica só nesta página */
  }
  ouvintes.forEach((f) => f());
}

function subscrever(f) {
  ouvintes.add(f);
  const outroSeparador = (e) => {
    if (e.key !== CHAVE) return;
    cache = null;
    f();
  };
  window.addEventListener("storage", outroSeparador);
  return () => {
    ouvintes.delete(f);
    window.removeEventListener("storage", outroSeparador);
  };
}

export const carrinho = {
  itens: () => ler(),
  juntar: (item) => gravar(juntarItem(ler(), item)),
  quantidade: (chave, q) => gravar(mudarQuantidade(ler(), chave, q)),
  remover: (chave) => gravar(removerItem(ler(), chave)),
  substituir: (lista) => gravar(lista),
  limpar: () => gravar([]),
};

/** Itens do pedido em curso ([] no servidor e na primeira renderização). */
export function useCarrinho() {
  return useSyncExternalStore(subscrever, ler, () => VAZIO);
}
