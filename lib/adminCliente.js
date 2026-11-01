"use client";

import { useEffect, useRef, useState } from "react";
import { achata, desachata } from "@/lib/traducaoCampos";

/**
 * Utilitários dos formulários do backoffice (browser).
 */

export const MSG_SESSAO = "A tua sessão expirou. Entra noutra janela e volta a guardar.";

/**
 * Envia JSON para uma rota /api/admin e devolve sempre um objeto
 * { ok, erro?, status, ...resposta } — nunca rebenta com respostas que não são
 * JSON (ex.: 413 ou 500 da Vercel). Sessão expirada (401) → MSG_SESSAO, sem
 * sair da página (o que foi escrito não se perde).
 */
export async function pedidoAdmin(url, { method = "POST", body } = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    return { ok: false, erro: "Erro de ligação. Verifica a internet e tenta de novo." };
  }
  const json = await res.json().catch(() => null);
  if (res.status === 401) return { ok: false, status: 401, erro: MSG_SESSAO };
  if (res.ok && json?.ok) return { ...json, status: res.status };
  return {
    ok: false,
    status: res.status,
    erro:
      json?.erro ||
      (res.status === 413
        ? "Pedido demasiado grande."
        : `Não foi possível guardar (erro ${res.status}). Tenta de novo.`),
  };
}

export const MSG_SAIR = "Tens alterações por gravar. Sair sem gravar?";

/**
 * Avisa antes de sair da página (fechar, recarregar, mudar de URL, ou clicar
 * num link do próprio site, como o menu) quando há alterações por gravar.
 * Devolve `libertar()` — chamar antes de redirecionar depois de gravar com sucesso.
 */
export function useAvisoSaida(sujo, mensagem = MSG_SAIR) {
  const estado = useRef({ sujo, livre: false, mensagem });
  estado.current.sujo = sujo;
  estado.current.mensagem = mensagem;
  useEffect(() => {
    const preso = () => estado.current.sujo && !estado.current.livre;
    const aviso = (e) => {
      if (!preso()) return;
      e.preventDefault();
      e.returnValue = "";
    };
    // Os links internos (next/link) mudam de página sem "beforeunload": apanha
    // o clique antes do React (fase de captura na window) e pergunta.
    const clique = (e) => {
      if (!preso() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return; // sai do site: o beforeunload trata
      if (url.pathname === window.location.pathname && url.search === window.location.search) return; // só âncora
      if (window.confirm(estado.current.mensagem)) {
        estado.current.livre = true;
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    window.addEventListener("beforeunload", aviso);
    window.addEventListener("click", clique, true);
    return () => {
      window.removeEventListener("beforeunload", aviso);
      window.removeEventListener("click", clique, true);
    };
  }, []);
  return () => {
    estado.current.livre = true;
  };
}

// Chaves inglesas alteradas à mão (mapa plano) em relação às carregadas.
export function enAlterado(plano, original) {
  return Object.fromEntries(Object.entries(plano).filter(([k, v]) => v !== (original[k] ?? "")));
}

/**
 * Estado do painel "Versão inglesa": guarda só as correções feitas à mão nesta
 * edição (`enEditado`, mapa plano). É só isso que se envia ao gravar — o
 * servidor junta-o ao inglês atual da base, para uma tradução automática que
 * tenha terminado entretanto não ser tomada por correção manual.
 */
export function useEnEditado(enInicial) {
  const [base] = useState(() => achata(enInicial || {}));
  const [enEditado, setEnEditado] = useState({});
  return {
    enEditado,
    temEnEditado: Object.keys(enEditado).length > 0,
    enMostrado: desachata({ ...base, ...enEditado }),
    mudarEn: (_, plano) => setEnEditado(enAlterado(plano, base)),
  };
}

// Novo id para itens de listas editáveis (produtos, cards…).
export const novoId = () =>
  `n${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
