import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { provaValida } from "@/lib/provaTrabalho";
import { normalizarItens, totaisPedido, areaDoPedido, MOTIVOS } from "@/lib/pedido";
import { resolverItens, novaReferencia } from "@/lib/pedidos";
import { enviarPedidoEquipa, enviarConfirmacaoPedido } from "@/lib/pedidoEmails";

// Pedido de encomenda / informação (Representações e Tecnologia).
// Depende do MongoDB e do SMTP — nunca é pré-renderizado.
export const dynamic = "force-dynamic";

// Tamanhos máximos de cada campo (caracteres).
const MAX = { nome: 100, empresa: 150, nif: 30, email: 254, telefone: 40, pais: 60, morada: 400, notas: 4000 };
const OBRIGATORIOS = ["nome", "email", "telefone", "pais"];

// Um formulário preenchido em menos do que isto é quase de certeza um bot.
const TEMPO_MINIMO_MS = 3000;

const erro = (msg, status) => NextResponse.json({ ok: false, erro: msg }, { status });
const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Resposta "tudo bem" dada aos bots (honeypot/tempo), sem fazer nada.
const okSilencioso = () => NextResponse.json({ ok: true, referencia: "" });

export async function POST(request) {
  try {
    const dados = await request.json().catch(() => null);
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) return erro("Pedido inválido.", 400);

    // Anti-bot: campo-armadilha e tempo de preenchimento.
    if (dados.website) return okSilencioso();
    const t = Number(dados.t);
    if (!Number.isFinite(t) || t < TEMPO_MINIMO_MS) return okSilencioso();

    const cliente = {};
    for (const k of Object.keys(MAX)) {
      const v = dados[k];
      if (v != null && typeof v !== "string") return erro("Pedido inválido.", 400);
      cliente[k] = (v || "").trim();
      if (cliente[k].length > MAX[k]) return erro("Há um campo demasiado longo.", 400);
    }
    if (OBRIGATORIOS.some((k) => !cliente[k])) return erro("Preenche o nome, o email, o telefone e o país.", 400);
    if (!validarEmail(cliente.email)) return erro("O email indicado não é válido.", 400);
    const motivo = Object.hasOwn(MOTIVOS, dados.motivo) ? dados.motivo : "encomenda";
    const lang = dados.lang === "en" ? "en" : "pt";

    const pedidos = normalizarItens(dados.itens);
    if (!pedidos.length) return erro("O pedido está vazio.", 400);

    // Anti-bot: prova de trabalho resolvida pelo browser (uso único).
    if (!(await provaValida(dados.prova)))
      return erro("Não foi possível validar o envio. Recarrega a página e tenta novamente.", 400);

    // Limite por IP: 3 pedidos em 10 minutos e 10 por dia.
    const ip = ipDe(request);
    const [curto, diario] = await Promise.all([
      dentroDoLimite(`pedido:${ip}`, 3, 10 * 60),
      dentroDoLimite(`pedido-dia:${ip}`, 10, 24 * 60 * 60),
    ]);
    if (!curto || !diario) return erro("Demasiados pedidos. Tenta novamente daqui a alguns minutos.", 429);

    // Os itens voltam a ser lidos da base: nome, preço e unidade do momento.
    const itens = await resolverItens(pedidos);
    if (!itens.length) return erro("Os produtos do pedido já não estão disponíveis. Atualiza a página.", 400);
    const tot = totaisPedido(itens);

    const pedido = {
      referencia: novaReferencia(),
      estado: "novo",
      motivo,
      area: areaDoPedido(itens),
      idioma: lang,
      cliente,
      itens: tot.linhas,
      subtotal: tot.subtotal,
      semPreco: tot.semPreco,
      moeda: "EUR",
      notas: [],
      historico: [{ em: new Date(), por: "site", estado: "novo" }],
      criadoEm: new Date(),
    };

    // 1. Guardar (sem base, o pedido não se perde: segue por email).
    let guardado = false;
    let col = null;
    try {
      col = (await getDb()).collection("pedidos");
      const r = await col.insertOne(pedido);
      pedido._id = r.insertedId;
      guardado = true;
    } catch (e) {
      console.error("pedido: erro a guardar no MongoDB:", e?.message || e);
    }

    // 2. Notificar a equipa.
    try {
      await enviarPedidoEquipa(pedido);
    } catch (e) {
      console.error("pedido: erro a enviar o email à equipa:", e?.message || e);
      if (!guardado) throw e;
      await col.updateOne({ _id: pedido._id }, { $set: { emailFalhou: true } }).catch(() => {});
    }

    // 3. Confirmação ao cliente (não bloqueia a resposta).
    try {
      await enviarConfirmacaoPedido(pedido);
    } catch (e) {
      console.error("pedido: erro a enviar a confirmação:", e?.message || e);
    }

    return NextResponse.json({ ok: true, referencia: pedido.referencia });
  } catch (e) {
    console.error("Erro no endpoint /api/pedidos:", e);
    return erro("Ocorreu um erro ao enviar o pedido. Tenta novamente.", 500);
  }
}
