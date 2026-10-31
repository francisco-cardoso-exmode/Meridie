import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { enviarEmailContacto, enviarConfirmacaoCliente } from "@/lib/mailer";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { empreendimentoBySlug } from "@/lib/store";

// O endpoint depende de serviços externos (MongoDB/SMTP) — nunca é pré-renderizado.
export const dynamic = "force-dynamic";

// Tamanhos máximos de cada campo (caracteres).
const MAX = { nome: 100, email: 254, assunto: 150, mensagem: 5000, ref: 140 };

// Um formulário preenchido em menos do que isto é quase de certeza um bot.
const TEMPO_MINIMO_MS = 3000;

const SITE_URL = () => process.env.SITE_URL || "https://meridieinvestments.com";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Campo de texto: só aceita string (ou ausente). Devolve null se vier outra coisa.
function texto(v) {
  if (v === undefined || v === null) return "";
  return typeof v === "string" ? v.trim() : null;
}

const erro = (msg, status) => NextResponse.json({ ok: false, erro: msg }, { status });

// Resposta "tudo bem" dada aos bots (honeypot/tempo), sem fazer nada —
// para não lhes dar pistas sobre o que os apanhou.
const okSilencioso = () => NextResponse.json({ ok: true, mensagem: "Mensagem enviada com sucesso." });

export async function POST(request) {
  try {
    let dados;
    try {
      dados = await request.json();
    } catch {
      return erro("Pedido inválido.", 400);
    }
    if (!dados || typeof dados !== "object" || Array.isArray(dados)) {
      return erro("Pedido inválido.", 400);
    }

    // Anti-bot: honeypot (campo escondido "website") e tempo de preenchimento.
    // Clientes antigos não mandam estes campos — nesse caso não se verifica.
    if (dados.website !== undefined && dados.website !== null && dados.website !== "") {
      return okSilencioso();
    }
    if (dados.t !== undefined && dados.t !== null) {
      const t = Number(dados.t);
      if (!Number.isFinite(t) || t < TEMPO_MINIMO_MS) return okSilencioso();
    }

    const nome = texto(dados.nome);
    const email = texto(dados.email);
    const assunto = texto(dados.assunto);
    const mensagem = texto(dados.mensagem);
    const refBruto = texto(dados.ref);
    const lang = dados.lang === "en" ? "en" : "pt";

    // Validação no servidor
    if ([nome, email, assunto, mensagem, refBruto].some((v) => v === null)) {
      return erro("Pedido inválido.", 400);
    }
    if (!nome || !email || !mensagem) {
      return erro("Preenche o nome, o email e a mensagem.", 400);
    }
    if (
      nome.length > MAX.nome ||
      email.length > MAX.email ||
      assunto.length > MAX.assunto ||
      mensagem.length > MAX.mensagem
    ) {
      return erro("A mensagem é demasiado longa.", 400);
    }
    if (!validarEmail(email)) {
      return erro("O email indicado não é válido.", 400);
    }

    // Limite de envios por IP: 3 em 10 minutos e 10 por dia.
    const ip = ipDe(request);
    const [curto, diario] = await Promise.all([
      dentroDoLimite(`contacto:${ip}`, 3, 10 * 60),
      dentroDoLimite(`contacto-dia:${ip}`, 10, 24 * 60 * 60),
    ]);
    if (!curto || !diario) {
      return erro("Demasiados pedidos. Tenta novamente mais tarde.", 429);
    }

    // Origem do formulário: só slugs simples; se for um empreendimento, liga-se a ele.
    const ref = /^[a-z0-9][a-z0-9-]*$/i.test(refBruto) ? refBruto.slice(0, MAX.ref) : "";
    let refUrl = "";
    if (ref) {
      try {
        const emp = await empreendimentoBySlug(ref);
        if (emp) refUrl = `${SITE_URL()}/empreendimentos/${encodeURIComponent(emp.slug)}`;
      } catch {
        /* sem link */
      }
    }

    // 1. Guardar no MongoDB
    let col = null;
    let leadId = null;
    try {
      const db = await getDb();
      col = db.collection("contactos");
      const r = await col.insertOne({
        nome,
        email,
        assunto,
        mensagem,
        idioma: lang,
        ref: ref || null,
        criadoEm: new Date(),
      });
      leadId = r.insertedId;
    } catch (dbErro) {
      console.error("Erro a guardar no MongoDB:", dbErro);
      // Não bloqueamos o envio do email por causa da base de dados
    }

    // 2. Notificar a equipa
    try {
      await enviarEmailContacto({ nome, email, assunto, mensagem, ref, refUrl });
    } catch (mailErro) {
      console.error("Erro a enviar o email de contacto:", mailErro);
      // Se a mensagem ficou guardada, não se perde: marca-se e responde-se ok
      // (evita que o visitante reenvie e se criem duplicados).
      if (!leadId) throw mailErro;
      try {
        await col.updateOne({ _id: leadId }, { $set: { emailFalhou: true } });
      } catch {
        /* ignora */
      }
      return NextResponse.json({ ok: true, mensagem: "Mensagem enviada com sucesso." });
    }

    // 3. Enviar confirmação ao cliente (não bloqueia a resposta se falhar)
    try {
      await enviarConfirmacaoCliente({ nome, email, lang });
    } catch (confErro) {
      console.error("Erro a enviar confirmação ao cliente:", confErro);
    }

    return NextResponse.json({ ok: true, mensagem: "Mensagem enviada com sucesso." });
  } catch (erroGeral) {
    console.error("Erro no endpoint /api/contacto:", erroGeral);
    return erro("Ocorreu um erro ao enviar a mensagem. Tenta novamente.", 500);
  }
}
