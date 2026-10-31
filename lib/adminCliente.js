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

/**
 * Avisa antes de sair da página (fechar, recarregar, mudar de URL) quando há
 * alterações por gravar. Devolve `libertar()` — chamar antes de redirecionar
 * depois de gravar com sucesso.
 */
export function useAvisoSaida(sujo) {
  const estado = useRef({ sujo, livre: false });
  estado.current.sujo = sujo;
  useEffect(() => {
    const aviso = (e) => {
      if (!estado.current.sujo || estado.current.livre) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
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
