import { sessaoAtual } from "@/lib/al/sessoes";
import { proprietarioPorEmail, membroEquipa } from "@/lib/al/contas";

/**
 * Quem está a usar as apps do Alojamento Local (validado na base em cada
 * pedido — o email vem da sessão, nunca de um cookie editável).
 * Devolvem null sem sessão, com a conta apagada/desativada ou se a base falhar.
 */

export async function getProprietario() {
  try {
    const s = await sessaoAtual("proprietario");
    if (!s) return null;
    const p = await proprietarioPorEmail(s.email);
    return p ? { ...p, sessaoHash: s.hash } : null;
  } catch (e) {
    console.error("sessão proprietário:", e?.message || e);
    return null;
  }
}

export async function getEquipa() {
  try {
    const s = await sessaoAtual("equipa");
    if (!s) return null;
    const m = await membroEquipa(s.email);
    return m && m.ativo !== false ? { ...m, sessaoHash: s.hash } : null;
  } catch (e) {
    console.error("sessão equipa:", e?.message || e);
    return null;
  }
}
