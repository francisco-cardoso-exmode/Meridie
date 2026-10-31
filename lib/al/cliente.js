"use client";

/**
 * Pedido JSON das apps do Alojamento Local (browser). Devolve sempre
 * { ok, erro?, status, ...resposta } — nunca rebenta com respostas não-JSON.
 */
export async function pedidoAl(url, { method = "POST", body } = {}) {
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
  if (res.ok && json?.ok) return { ...json, status: res.status };
  return { ok: false, status: res.status, erro: json?.erro || `Erro ${res.status}. Tenta de novo.` };
}
