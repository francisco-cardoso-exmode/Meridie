import { getDb } from "@/lib/mongodb";
import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";
import { pagamentoDisponivel } from "@/lib/pagamentos";
import {
  criarContaProprietario,
  linkDadosProprietario,
  estadoContaProprietario,
  linkPainelProprietario,
} from "@/lib/pagamentos/stripe";

/**
 * Como o proprietário recebe a parte dele: conta Stripe Express ligada à
 * Meridie (o próprio proprietário põe a identidade e o IBAN no Stripe — a
 * Meridie nunca vê nem guarda o IBAN). No proprietário fica
 * `stripeConta: { id, ativa, atualizadoEm }`.
 * Só para Portugal; no Brasil paga-se por transferência à mão até haver a
 * conta brasileira.
 */

const col = async () => (await getDb()).collection("al_proprietarios");

/** Recebimentos online possíveis para este proprietário (Stripe ligado na Meridie). */
export const recebimentosDisponiveis = () => pagamentoDisponivel("PT");

/** Estado atual; se a conta ainda não estava ativa, pergunta ao Stripe (pode ter acabado agora o registo). */
export async function estadoRecebimentos(p) {
  const c = p?.stripeConta;
  if (!c?.id) return { ligada: false, ativa: false };
  if (c.ativa) return { ligada: true, ativa: true };
  try {
    const e = await estadoContaProprietario(c.id);
    if (e.ativa) await (await col()).updateOne({ email: p.email }, { $set: { "stripeConta.ativa": true, "stripeConta.atualizadoEm": new Date() } });
    return { ligada: true, ...e };
  } catch (e) {
    console.error("estado conta stripe:", e?.message || e);
    return { ligada: true, ativa: false };
  }
}

/**
 * Endereço para onde mandar o proprietário: o registo no Stripe (cria a
 * conta na primeira vez) ou, já ativa, o painel dele no Stripe.
 */
export async function linkRecebimentos(p, lang = "pt") {
  let id = p.stripeConta?.id;
  if (!id) {
    id = await criarContaProprietario({ email: p.email, pais: "PT" });
    // Só grava se ainda não houver conta (dois cliques seguidos não criam duas).
    const r = await (await col()).updateOne(
      { email: p.email, "stripeConta.id": { $exists: false } },
      { $set: { stripeConta: { id, ativa: false, criadaEm: new Date() } } }
    );
    if (!r.modifiedCount) id = (await (await col()).findOne({ email: p.email }))?.stripeConta?.id || id;
  }
  if (p.stripeConta?.ativa) return linkPainelProprietario(id);
  return linkDadosProprietario(id, {
    retorno: `${SITE_URL}${caminho(lang, "/proprietario")}?recebimentos=1`,
    refazer: `${SITE_URL}/api/al/recebimentos?lang=${lang}`,
  });
}
