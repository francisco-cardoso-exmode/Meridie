import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { enviarEmailContacto } from "@/lib/mailer";

// O endpoint depende de serviços externos (MongoDB/SMTP) — nunca é pré-renderizado.
export const dynamic = "force-dynamic";

function validarEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request) {
  try {
    const dados = await request.json();
    const nome = (dados.nome || "").trim();
    const email = (dados.email || "").trim();
    const assunto = (dados.assunto || "").trim();
    const mensagem = (dados.mensagem || "").trim();

    // Validação no servidor
    if (!nome || !email || !mensagem) {
      return NextResponse.json(
        { ok: false, erro: "Preenche o nome, o email e a mensagem." },
        { status: 400 }
      );
    }
    if (!validarEmail(email)) {
      return NextResponse.json(
        { ok: false, erro: "O email indicado não é válido." },
        { status: 400 }
      );
    }

    // 1. Guardar no MongoDB
    try {
      const db = await getDb();
      await db.collection("contactos").insertOne({
        nome,
        email,
        assunto,
        mensagem,
        criadoEm: new Date(),
      });
    } catch (dbErro) {
      console.error("Erro a guardar no MongoDB:", dbErro);
      // Não bloqueamos o envio do email por causa da base de dados
    }

    // 2. Enviar email via Nodemailer
    await enviarEmailContacto({ nome, email, assunto, mensagem });

    return NextResponse.json({ ok: true, mensagem: "Mensagem enviada com sucesso." });
  } catch (erro) {
    console.error("Erro no endpoint /api/contacto:", erro);
    return NextResponse.json(
      { ok: false, erro: "Ocorreu um erro ao enviar a mensagem. Tenta novamente." },
      { status: 500 }
    );
  }
}
