import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/mongodb";
import { extrair, achata, desachata } from "@/lib/traducaoCampos";

/**
 * Tradução automática PT → EN do conteúdo do backoffice (Claude).
 *
 * Cada documento guarda, além do português, `en` (a versão inglesa, com a
 * mesma forma dos campos traduzíveis) e `enFonte` (o português de que essa
 * tradução partiu). Só se traduz o que é novo ou mudou desde a última vez —
 * correções feitas à mão em inglês mantêm-se enquanto o português não mudar.
 */

const MODELO = "claude-opus-5-5";
const LOTE_MAX_CHARS = 12000;

const SISTEMA = `You translate website content from European Portuguese (pt-PT) to British English for Meridie Investments — a company working in real estate investment between Portugal and Brazil and in the representation of Portuguese wine, food and drink brands.

Rules:
- Translate each value faithfully and naturally, in a professional, warm tone. Do not add or remove information.
- Keep proper nouns as they are: brand, wine, estate and product names (e.g. Quinta da Levada, Murganheira, Azal, Loureiro), people, and company names. Keep Portuguese/Brazilian place names in their usual English form (Lisboa → Lisbon, São Paulo stays São Paulo, Trás-os-Montes stays Trás-os-Montes).
- Keep numbers, units, prices, percentages, codes (DOC, IG, NIF, CPCV, IMT…) and formatting (line breaks, "·", "—") as in the source. Use British spelling.
- Keep Markdown links [text](url) — translate the text, never the URL.
- Return every key you receive, with its English translation as the value.`;

let cliente = null;
const anthropic = () => (cliente ??= new Anthropic());

// Divide o mapa em lotes de tamanho razoável.
function lotes(mapa) {
  const out = [];
  let atual = {};
  let tam = 0;
  for (const [k, v] of Object.entries(mapa)) {
    if (tam + v.length > LOTE_MAX_CHARS && Object.keys(atual).length) {
      out.push(atual);
      atual = {};
      tam = 0;
    }
    atual[k] = v;
    tam += v.length;
  }
  if (Object.keys(atual).length) out.push(atual);
  return out;
}

// Só para testes locais sem chave da API: TRADUCAO_SIMULADA=1 devolve "EN: …".
const simulada = () => !!process.env.TRADUCAO_SIMULADA;
export const traducaoDisponivel = () => simulada() || !!process.env.ANTHROPIC_API_KEY;

/** Traduz um mapa { chave: textoPT } → { chave: textoEN }. */
export async function traduzirTextos(mapa) {
  if (simulada()) return Object.fromEntries(Object.entries(mapa).map(([k, v]) => [k, `EN: ${v}`]));
  const resultado = {};
  for (const lote of lotes(mapa)) {
    // Chaves curtas e seguras para o esquema JSON (t0, t1, …).
    const chaves = Object.keys(lote);
    const entrada = Object.fromEntries(chaves.map((k, i) => [`t${i}`, lote[k]]));
    const props = Object.fromEntries(chaves.map((_, i) => [`t${i}`, { type: "string" }]));

    const resposta = await anthropic().beta.messages.create({
      model: MODELO,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: {
        effort: "low",
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: props,
            required: Object.keys(props),
            additionalProperties: false,
          },
        },
      },
      system: SISTEMA,
      messages: [{ role: "user", content: JSON.stringify(entrada) }],
    });

    if (resposta.stop_reason === "refusal") throw new Error("Tradução recusada pelo modelo.");
    if (resposta.stop_reason === "max_tokens") throw new Error("Tradução incompleta (texto demasiado longo).");
    const texto = resposta.content.find((b) => b.type === "text")?.text;
    const json = JSON.parse(texto || "{}");
    chaves.forEach((k, i) => {
      if (typeof json[`t${i}`] === "string") resultado[k] = json[`t${i}`];
    });
  }
  return resultado;
}

/**
 * Calcula a nova versão inglesa de um documento.
 * - `doc`: o documento já gravado (português atual + en/enFonte).
 * - `enAntes`: a versão inglesa antes desta gravação (para detetar correções
 *   manuais feitas no backoffice).
 * Devolve { en, enFonte } prontos a gravar, ou null se não há nada a fazer.
 */
export async function calcularTraducao(colecao, doc, enAntes = null) {
  const src = achata(extrair(colecao, doc));
  if (!Object.keys(src).length) return null;
  const fonte = achata(doc.enFonte || {});
  const en = achata(doc.en || {});
  const antes = achata(enAntes ?? doc.en ?? {});

  const novoEn = {};
  const novaFonte = {};
  const aTraduzir = {};
  for (const [k, pt] of Object.entries(src)) {
    const manual = en[k] && en[k] !== antes[k]; // editado à mão nesta gravação
    if (manual) {
      novoEn[k] = en[k];
      novaFonte[k] = pt;
    } else if (en[k] && fonte[k] === pt) {
      novoEn[k] = en[k];
      novaFonte[k] = pt;
    } else {
      aTraduzir[k] = pt;
    }
  }
  if (Object.keys(aTraduzir).length) {
    const traduzidos = await traduzirTextos(aTraduzir);
    for (const [k, v] of Object.entries(traduzidos)) {
      novoEn[k] = v;
      novaFonte[k] = src[k];
    }
  }
  return { en: desachata(novoEn), enFonte: desachata(novaFonte), traduzidos: Object.keys(aTraduzir).length };
}

const FILTRO = (colecao, id) => (colecao === "paginas" ? { _id: id } : { slug: id });

/**
 * Traduz um documento da base e grava o resultado. Usado depois de cada
 * gravação no backoffice (em segundo plano) e no botão "Traduzir tudo".
 */
export async function traduzirDocumento(colecao, id, enAntes = null) {
  const col = (await getDb()).collection(colecao);
  const doc = await col.findOne(FILTRO(colecao, id));
  if (!doc) return { ok: false, erro: "Não encontrado." };
  const r = await calcularTraducao(colecao, doc, enAntes);
  if (!r) return { ok: true, traduzidos: 0 };
  await col.updateOne(FILTRO(colecao, id), { $set: { en: r.en, enFonte: r.enFonte } });
  return { ok: true, traduzidos: r.traduzidos };
}

/** Para usar com after(): traduz em segundo plano e regista erros sem falhar. */
export async function traduzirEmFundo(colecao, id, enAntes = null) {
  if (!traducaoDisponivel()) return;
  try {
    await traduzirDocumento(colecao, id, enAntes);
    const { revalidaSite } = await import("@/lib/revalida");
    revalidaSite();
  } catch (e) {
    console.error(`tradução ${colecao}/${id}:`, e?.message || e);
  }
}
