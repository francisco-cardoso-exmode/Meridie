import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para os outros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Escapa HTML para evitar injeção a partir dos campos do formulário.
function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Se existir public/email-logo.png, anexa-o e devolve o cid para usar no HTML.
function lerLogo() {
  try {
    const p = path.join(process.cwd(), "public", "email-logo.png");
    if (fs.existsSync(p)) {
      return {
        attachments: [{ filename: "meridie.png", path: p, cid: "logomeridie" }],
        cid: "logomeridie",
      };
    }
  } catch {
    /* ignora */
  }
  return { attachments: [], cid: null };
}

const NAVY = "#1b3f6e";
const NAVY_DARK = "#122c4e";
const GOLD = "#c89b3c";

// Cabeçalho com logótipo (imagem se existir, senão wordmark tipográfico).
function cabecalho(cid) {
  const marca = cid
    ? `<img src="cid:${cid}" alt="Meridie Investments" width="150" style="display:block;margin:0 auto;max-width:150px;height:auto" />`
    : `<div style="font-family:Georgia,'Times New Roman',serif;color:#ffffff;font-size:26px;letter-spacing:3px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`;
  return `
  <tr>
    <td style="background:${NAVY};padding:32px 24px;text-align:center;">
      ${marca}
      <div style="color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:2px;margin-top:10px;text-transform:uppercase;">Portugal &#8596; Brasil</div>
    </td>
  </tr>`;
}

// Rodapé / assinatura.
function rodape(cid) {
  const assinatura = cid
    ? `<img src="cid:${cid}" alt="Meridie Investments" width="120" style="display:block;max-width:120px;height:auto;margin-bottom:10px;" />`
    : `<div style="font-family:Georgia,serif;color:${NAVY};font-size:18px;letter-spacing:2px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`;
  return `
  <tr>
    <td style="padding:26px 32px;border-top:1px solid #e3e8ee;background:#ffffff;">
      ${assinatura}
      <div style="color:#5d6b7e;font-size:13px;line-height:1.7;margin-top:8px;">
        Investimento imobiliário entre Portugal e o Brasil<br/>
        <a href="mailto:${esc(process.env.CONTACT_TO || process.env.SMTP_USER || "")}" style="color:${NAVY};text-decoration:none;">${esc(process.env.CONTACT_TO || process.env.SMTP_USER || "")}</a>
      </div>
    </td>
  </tr>
  <tr>
    <td style="background:${NAVY_DARK};padding:16px 32px;text-align:center;color:rgba(255,255,255,0.6);font-size:11px;">
      &copy; ${new Date().getFullYear()} Meridie Investments. Todos os direitos reservados.
    </td>
  </tr>`;
}

function wrapper(corpoHtml, cid) {
  return `
  <body style="margin:0;padding:0;background:#f5f7fa;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:24px 0;">
      <tr><td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
          ${cabecalho(cid)}
          ${corpoHtml}
          ${rodape(cid)}
        </table>
      </td></tr>
    </table>
  </body>`;
}

/**
 * Email de confirmação enviado a QUEM submete o formulário.
 */
export async function enviarConfirmacaoCliente({ nome, email, assunto }) {
  const { attachments, cid } = lerLogo();
  const primeiroNome = (nome || "").trim().split(" ")[0] || "Olá";

  const corpo = `
  <tr>
    <td style="padding:40px 32px 8px;">
      <h1 style="margin:0 0 6px;color:${NAVY};font-size:22px;">Olá, ${esc(primeiroNome)}!</h1>
      <p style="color:#5d6b7e;font-size:15px;line-height:1.7;margin:14px 0;">
        Recebemos a sua mensagem e agradecemos o seu interesse. A nossa equipa vai
        analisar o seu pedido e <strong style="color:${NAVY};">entrará em contacto consigo muito em breve</strong>.
      </p>
      ${
        assunto
          ? `<p style="color:#5d6b7e;font-size:14px;margin:0 0 6px;">Assunto da sua mensagem:</p>
             <p style="background:#f5f7fa;border-left:3px solid ${GOLD};padding:12px 16px;border-radius:6px;color:${NAVY};font-size:14px;margin:0 0 14px;">${esc(assunto)}</p>`
          : ""
      }
    </td>
  </tr>
  <tr>
    <td style="padding:8px 32px 8px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:12px;">
        <tr><td style="padding:26px 28px;text-align:center;">
          <div style="color:${GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">Capital sem fronteiras</div>
          <div style="color:#ffffff;font-size:20px;font-family:Georgia,serif;line-height:1.4;">A sua ligação entre Portugal e o Brasil começa aqui.</div>
        </td></tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="padding:22px 32px 36px;">
      <p style="color:#5d6b7e;font-size:14px;margin:0 0 6px;font-weight:bold;color:${NAVY};">O que acontece a seguir?</p>
      <p style="color:#5d6b7e;font-size:14px;line-height:1.8;margin:0;">
        &#10003; Analisamos o seu perfil e objetivos de investimento.<br/>
        &#10003; Entramos em contacto para uma primeira conversa, sem compromisso.<br/>
        &#10003; Apresentamos as oportunidades certas, com apoio jurídico e fiscal nos dois países.
      </p>
    </td>
  </tr>`;

  await getTransporter().sendMail({
    from: `"Meridie Investments" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Recebemos a sua mensagem — Meridie Investments",
    html: wrapper(corpo, cid),
    text: `Olá ${primeiroNome},\n\nRecebemos a sua mensagem e entraremos em contacto muito em breve.\n\nCapital sem fronteiras. A sua ligação entre Portugal e o Brasil começa aqui.\n\nMeridie Investments — Portugal ↔ Brasil`,
    attachments,
  });
}

/**
 * Notificação interna (para a equipa) com os dados da submissão.
 */
export async function enviarEmailContacto({ nome, email, assunto, mensagem }) {
  const para = process.env.CONTACT_TO || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from: `"Site Meridie Investments" <${process.env.SMTP_USER}>`,
    to: para,
    replyTo: email,
    subject: `[Contacto] ${assunto || "Nova mensagem do site"}`,
    text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto || "(sem assunto)"}\n\n${mensagem}`,
    html: `
      <h2 style="color:#1b3f6e;">Nova mensagem do site Meridie Investments</h2>
      <p><strong>Nome:</strong> ${esc(nome)}</p>
      <p><strong>Email:</strong> ${esc(email)}</p>
      <p><strong>Assunto:</strong> ${esc(assunto) || "(sem assunto)"}</p>
      <hr />
      <p style="white-space:pre-wrap">${esc(mensagem)}</p>
    `,
  });
}
