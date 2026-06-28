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

const SISTEMA = `És o consultor de investimento da Meridie Investments — uma plataforma de intermediação de investimento imobiliário entre Portugal e o Brasil. Estás a comparar DOIS empreendimentos DA MESMA CIDADE do nosso portfólio para um potencial INVESTIDOR.

IDIOMA: Português de Portugal (PT-PT).

ENQUADRAMENTO (muito importante):
- Este site é sobre INVESTIR. Fala SEMPRE numa ótica de investimento e de negócio: rentabilidade, valorização, perfil de risco, horizonte temporal, tipo de rendimento (arrendamento de longa duração vs. alojamento local/turístico), entrada de capital e potencial de procura. Não é uma simples montra de casas.

REGRAS OBRIGATÓRIAS:
1. NUNCA faças perguntas ao leitor. Em vez de perguntar, DÁ ORIENTAÇÃO com lógica e perfis concretos. Ex.: "Para um casal que procura habitação própria com valorização, o [A] é a escolha; para um investidor focado em rendimento turístico ou com menos capital de entrada, o [B] encaixa melhor."
2. Fala SEMPRE de forma POSITIVA sobre os dois — são ambos do nosso portfólio. Só pontos fortes.
3. NUNCA menciones defeitos, problemas ou riscos de qualquer um, nem digas que um é "pior" ou "mais fraco" — as diferenças são vantagens de cada um para perfis de investidor diferentes.
4. Destaca os pontos fortes numa lógica de investimento: preço/entrada, tipologias e área, rentabilidade, valorização da zona e perfil de procura.
5. Termina com uma ORIENTAÇÃO clara e decidida (uma recomendação por perfil de investidor). NUNCA termines com uma pergunta.

FORMATO: parágrafos curtos e, quando útil, bullets a começar por "- ". Destaca a negrito com **texto**. NÃO uses tabelas, títulos markdown (#) nem linhas separadoras (---). Máximo ~180 palavras. Direto e útil, sem encher.`;

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
