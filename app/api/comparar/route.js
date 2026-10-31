import { createHash } from "crypto";
import { normalizaTipologia } from "@/lib/tipologias";
import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "@/lib/mongodb";
import { empreendimentoBySlug, regiaoDoEmpreendimento } from "@/lib/store";
import { comparaveis, zonaLabel } from "@/lib/compare";
import {
  referenciaDe,
  formatarPreco,
  precoDual,
  PAIS_LABEL,
} from "@/lib/empreendimentos";
import { getTaxaEurBrl } from "@/lib/cambio";
import { formataIntervalo } from "@/lib/intervalo";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";

export const maxDuration = 30;

const MODEL = "claude-haiku-5-5";
const CACHE_DIAS = 30;

const linhas = (a) => (Array.isArray(a) && a.length ? a : null);

function precoTxt(e, taxa) {
  if (e.precoTipo === "consulta") return "Sob consulta";
  const dual = precoDual(e.preco, e.moeda, taxa);
  if (!dual) return "Sob consulta";
  if (e.precoTipo === "intervalo" && Number(e.precoMax) > Number(e.preco)) {
    const dMax = precoDual(Number(e.precoMax), e.moeda, taxa);
    return `${dual.principal} a ${dMax.principal} (≈ ${dual.secundario} a ${dMax.secundario})`;
  }
  const prefixo = e.precoTipo === "desde" ? "Desde " : "";
  return `${prefixo}${dual.principal} (≈ ${dual.secundario})`;
}

function descreve(e, n, regiao, taxa) {
  const ctx = regiao
    ? [
        regiao.conhecidaPor && `Cidade/zona conhecida por: ${regiao.conhecidaPor}`,
        linhas(regiao.oQueVer) && `O que ver / espaços: ${regiao.oQueVer.join(", ")}`,
        linhas(regiao.transportes) && `Transportes e acessos: ${regiao.transportes.join(", ")}`,
        linhas(regiao.distancias) &&
          `Distâncias: ${regiao.distancias.map((d) => `${d.local} ${d.km} km`).join(", ")}`,
      ].filter(Boolean)
    : [];
  return [
    `EMPREENDIMENTO ${n}: ${e.nome} (Ref. ${referenciaDe(e)})`,
    `Localização: ${zonaLabel(e)}, ${PAIS_LABEL[e.pais] || e.pais}`,
    `Tipologia: ${e.tipo || "—"} · Finalidade: ${e.finalidade || "—"} · Estado: ${e.estado || "—"}`,
    `Preço: ${precoTxt(e, taxa)}`,
    // Número ou intervalo ("1–3" = há unidades de 1 a 3).
    `Quartos: ${formataIntervalo(e.quartos) || "?"} · Casas de banho: ${formataIntervalo(e.casasBanho) || "?"} · Área: ${e.area ? e.area + " m²" : "?"}`,
    `Tipologias disponíveis: ${tipologiasStr(e)}`,
    linhas(e.caracteristicas) && `Características: ${e.caracteristicas.join(", ")}`,
    linhas(e.proximidades) && `Proximidades: ${e.proximidades.join(", ")}`,
    ...ctx,
  ]
    .filter(Boolean)
    .join("\n");
}

function tipologiasStr(e) {
  if (!Array.isArray(e.tipologias) || !e.tipologias.length) return "—";
  return e.tipologias
    .map(normalizaTipologia)
    .filter(Boolean)
    .map((x) =>
      [
        x.nome,
        x.area,
        x.disponibilidade === "vendido" || x.disponibilidade === "esgotado"
          ? x.disponibilidade
          : x.precoTipo === "valor"
            ? formatarPreco(x.preco, e.moeda)
            : "preço sob consulta",
        x.disponibilidade === "reservado" && "reservado",
      ]
        .filter(Boolean)
        .join(" — ")
    )
    .join("; ");
}

const SISTEMA = `És o consultor de investimento da Meridie Investments — uma plataforma de intermediação de investimento imobiliário entre Portugal e o Brasil. Estás a comparar DOIS empreendimentos DO MESMO PAÍS do nosso portfólio para um potencial INVESTIDOR. Podem ser da mesma cidade ou de cidades diferentes do mesmo país (ex.: Lisboa vs Porto, ou São Paulo vs Rio) — nesse caso valoriza o carácter de cada cidade (ex.: Lisboa mais cosmopolita, Porto mais histórico e pitoresco) como vantagens distintas.

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

// Mensagem genérica para o visitante — o detalhe fica só no log do servidor.
const ERRO_GENERICO = "Erro ao gerar a análise.";

export async function POST(request) {
  try {
    const corpo = await request.json().catch(() => null);
    const { a: s1, b: s2, lang } = corpo || {};
    if (typeof s1 !== "string" || typeof s2 !== "string" || !s1 || !s2) {
      return Response.json({ erro: "Empreendimentos não encontrados." }, { status: 404 });
    }
    const emIngles = lang === "en";

    // Ordem fixa: A×B e B×A são a mesma comparação (e a mesma entrada de cache).
    const [slugA, slugB] = [s1, s2].sort();
    const a = await empreendimentoBySlug(slugA);
    const b = await empreendimentoBySlug(slugB);

    // Empreendimentos ocultos (publicado === false) não existem para o público.
    if (!a || !b || a.publicado === false || b.publicado === false) {
      return Response.json({ erro: "Empreendimentos não encontrados." }, { status: 404 });
    }
    if (!comparaveis(a, b)) {
      return Response.json(
        { erro: "Só dá para comparar dois empreendimentos do mesmo país." },
        { status: 400 }
      );
    }

    const [regiaoA, regiaoB, taxa] = await Promise.all([
      regiaoDoEmpreendimento(a),
      regiaoDoEmpreendimento(b),
      getTaxaEurBrl(),
    ]);
    const conteudo = `${descreve(a, 1, regiaoA, taxa)}\n\n${descreve(
      b,
      2,
      regiaoB,
      taxa
    )}\n\nCompara os dois e ajuda o investidor a escolher, enaltecendo as diferenças e vantagens de cada um.${
      emIngles ? "\n\nEscreve a resposta em inglês (British English)." : ""
    }`;

    // A chave de cache usa a descrição sem o câmbio ao vivo (taxa de recurso),
    // para que uma variação da cotação não obrigue a gerar tudo de novo.
    const conteudoEstavel = `${descreve(a, 1, regiaoA)}\n\n${descreve(b, 2, regiaoB)}`;
    const key = createHash("sha256")
      .update(`${MODEL}::${SISTEMA}::${emIngles ? "en::" : ""}${conteudoEstavel}`)
      .digest("hex");

    // Cache: a mesma comparação (e mesmos dados) não volta a chamar a IA.
    // Sem cache não se chama a IA — sem ela, cada visita seria uma chamada paga.
    let db;
    try {
      if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI não definido");
      db = await getDb();
      const cached = await db.collection("comparacoes_cache").findOne({ key });
      const ttl = Date.now() - CACHE_DIAS * 24 * 60 * 60 * 1000;
      if (cached?.analise && cached.criadoEm?.getTime?.() > ttl) {
        return Response.json({ analise: cached.analise, cache: true });
      }
    } catch (err) {
      console.error("comparar: cache indisponível:", err?.message || err);
      return Response.json({ erro: ERRO_GENERICO }, { status: 503 });
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      console.error("comparar: falta ANTHROPIC_API_KEY");
      return Response.json({ erro: ERRO_GENERICO }, { status: 503 });
    }

    // Só se limita o que chega à IA (as respostas em cache são grátis).
    if (!(await dentroDoLimite(`comparar:${ipDe(request)}`, 10, 60 * 60))) {
      return Response.json(
        { erro: "Demasiados pedidos. Tenta novamente daqui a alguns minutos." },
        { status: 429 }
      );
    }

    const client = new Anthropic({ timeout: 20000, maxRetries: 1 });
    const msg = await client.messages.create({
      model: MODEL,
      // O Haiku 5.5 pensa por omissão e o raciocínio conta para max_tokens:
      // esforço baixo e margem suficiente para não cortar a resposta (~180 palavras).
      max_tokens: 2000,
      output_config: { effort: "low" },
      system: SISTEMA,
      messages: [{ role: "user", content: conteudo }],
    });
    if (msg.stop_reason === "refusal") {
      console.error("comparar: pedido recusado pelo modelo", msg.stop_details?.category);
      return Response.json({ erro: ERRO_GENERICO }, { status: 502 });
    }
    const analise = (msg.content || [])
      .map((blk) => (blk.type === "text" ? blk.text : ""))
      .join("")
      .trim();

    if (!analise || msg.stop_reason === "max_tokens") {
      console.error("comparar: resposta vazia ou cortada", msg.stop_reason);
      return Response.json({ erro: ERRO_GENERICO }, { status: 502 });
    }

    try {
      await db
        .collection("comparacoes_cache")
        .updateOne(
          { key },
          { $set: { key, analise, criadoEm: new Date() } },
          { upsert: true }
        );
    } catch (err) {
      console.error("comparar: falha a guardar em cache:", err?.message || err);
    }

    return Response.json({ analise });
  } catch (err) {
    console.error("comparar:", err?.message || err);
    return Response.json({ erro: ERRO_GENERICO }, { status: 500 });
  }
}
