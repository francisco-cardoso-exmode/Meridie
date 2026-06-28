import { createHash } from "crypto";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/mongodb";
import { empreendimentoBySlug, regiaoDoEmpreendimento } from "@/lib/store";
import { mesmaZona, zonaLabel } from "@/lib/compare";
import {
  referenciaDe,
  formatarPreco,
  precoDual,
  PAIS_LABEL,
} from "@/lib/empreendimentos";

export const maxDuration = 30;

const MODEL = "claude-haiku-4-5";
const CACHE_DIAS = 30;

const linhas = (a) => (Array.isArray(a) && a.length ? a : null);

function precoTxt(e) {
  if (e.precoTipo === "consulta") return "Sob consulta";
  const dual = precoDual(e.preco, e.moeda);
  if (!dual) return "Sob consulta";
  const prefixo = e.precoTipo === "desde" ? "Desde " : "";
  return `${prefixo}${dual.principal} (≈ ${dual.secundario})`;
}

function descreve(e, n) {
  const t =
    Array.isArray(e.tipologias) && e.tipologias.length
      ? e.tipologias
          .map((x) =>
            [x.nome, x.area && `${x.area} m²`, x.preco && formatarPreco(x.preco, e.moeda)]
              .filter(Boolean)
              .join(" — ")
          )
          .join("; ")
      : "—";
  return [
    `EMPREENDIMENTO ${n}: ${e.nome} (Ref. ${referenciaDe(e)})`,
    `Localização: ${zonaLabel(e)}, ${PAIS_LABEL[e.pais] || e.pais}`,
    `Tipologia: ${e.tipo || "—"} · Finalidade: ${e.finalidade || "—"} · Estado: ${e.estado || "—"}`,
    `Preço: ${precoTxt(e)}`,
    `Quartos: ${e.quartos ?? "?"} · Casas de banho: ${e.casasBanho ?? "?"} · Área: ${e.area ? e.area + " m²" : "?"}`,
    `Tipologias disponíveis: ${t}`,
    linhas(e.caracteristicas) && `Características: ${e.caracteristicas.join(", ")}`,
    linhas(e.proximidades) && `Proximidades: ${e.proximidades.join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function descreveZona(r) {
  if (!r) return "";
  return [
    `\nZONA (partilhada pelos dois): ${r.nome}`,
    r.conhecidaPor && `Conhecida por: ${r.conhecidaPor}`,
    linhas(r.oQueVer) && `O que ver / espaços: ${r.oQueVer.join(", ")}`,
    linhas(r.transportes) && `Transportes e acessos: ${r.transportes.join(", ")}`,
    linhas(r.distancias) &&
      `Distâncias: ${r.distancias.map((d) => `${d.local} ${d.km} km`).join(", ")}`,
  ]
    .filter(Boolean)
    .join("\n");
}

const SISTEMA = `És o consultor especialista da Meridie Investments, plataforma de investimento imobiliário entre Portugal e o Brasil.
O cliente está a comparar DOIS empreendimentos DA MESMA ZONA do nosso portfólio para decidir em qual investir. AMBOS são boas oportunidades — o objetivo é ajudá-lo a perceber qual se adapta melhor às SUAS necessidades.

IDIOMA: Português de Portugal (PT-PT).

REGRAS OBRIGATÓRIAS:
1. Fala SEMPRE de forma POSITIVA sobre os dois empreendimentos — são ambos do nosso portfólio.
2. NUNCA menciones defeitos, problemas, riscos ou aspetos negativos de qualquer um deles.
3. NUNCA digas que um é "pior", "mais fraco" ou "menos bom" que o outro — apresenta as diferenças como vantagens de cada um para perfis diferentes.
4. Destaca os PONTOS FORTES de cada um: preço/entrada, tipologias e área, estado (pronto/em construção/planta), características e a localização na zona (espaços, escolas, transportes, distâncias).
5. Fala do potencial de investimento de forma positiva para ambos.
6. Termina com uma orientação tipo "ideal para quem…" para cada um, sem nunca desvalorizar nenhum.

FORMATO: parágrafos curtos e, quando útil, bullets a começar por "- ". Podes destacar a negrito com **texto**. NÃO uses tabelas nem títulos markdown com # (cardinais). Máximo ~180 palavras. Direto e útil, sem encher.`;

export async function POST(request) {
  try {
    const { a: slugA, b: slugB } = await request.json();
    const a = await empreendimentoBySlug(slugA);
    const b = await empreendimentoBySlug(slugB);

    if (!a || !b) {
      return Response.json({ erro: "Empreendimentos não encontrados." }, { status: 404 });
    }
    if (!mesmaZona(a, b)) {
      return Response.json(
        { erro: "Só dá para comparar dois empreendimentos da mesma zona." },
        { status: 400 }
      );
    }

    const regiao = await regiaoDoEmpreendimento(a);
    const conteudo = `${descreve(a, 1)}\n\n${descreve(b, 2)}\n${descreveZona(
      regiao
    )}\n\nCompara os dois e ajuda o investidor a escolher.`;

    const key = createHash("sha256")
      .update(`${MODEL}::${SISTEMA}::${conteudo}`)
      .digest("hex");

    // Cache: a mesma comparação (e mesmos dados) não volta a chamar a IA.
    let db = null;
    if (process.env.MONGODB_URI) {
      try {
        db = await getDb();
        const cached = await db.collection("comparacoes_cache").findOne({ key });
        const ttl = Date.now() - CACHE_DIAS * 24 * 60 * 60 * 1000;
        if (cached?.analise && cached.criadoEm?.getTime?.() > ttl) {
          return Response.json({ analise: cached.analise, cache: true });
        }
      } catch {
        db = null;
      }
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { erro: "Análise por IA ainda não configurada (falta ANTHROPIC_API_KEY)." },
        { status: 503 }
      );
    }

    const client = new Anthropic();
    const msg = await client.messages.create({
      model: MODEL,
      max_tokens: 700,
      system: SISTEMA,
      messages: [{ role: "user", content: conteudo }],
    });
    const analise = (msg.content || [])
      .map((blk) => (blk.type === "text" ? blk.text : ""))
      .join("")
      .trim();

    if (!analise) {
      return Response.json({ erro: "A IA não devolveu resposta." }, { status: 502 });
    }

    if (db) {
      try {
        await db
          .collection("comparacoes_cache")
          .updateOne(
            { key },
            { $set: { key, analise, criadoEm: new Date() } },
            { upsert: true }
          );
      } catch {}
    }

    return Response.json({ analise });
  } catch (err) {
    console.error("comparar:", err?.message || err);
    return Response.json({ erro: "Erro ao gerar a análise." }, { status: 500 });
  }
}
