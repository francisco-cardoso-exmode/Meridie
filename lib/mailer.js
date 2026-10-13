import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { getDestinatarios } from "@/lib/config";
import { cardsHTML } from "@/lib/emailcards";
import { empreendimentosDestaque } from "@/lib/store";

const SITE_URL = () => process.env.SITE_URL || "https://meridieinvestments.com";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true para 465
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });
}

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Anexa o logótipo (se existir) e devolve o cid para o HTML.
function lerLogo() {
  try {
    const p = path.join(process.cwd(), "public", "meridie_logo.png");
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
const CONTACTO = () => process.env.CONTACT_TO || process.env.SMTP_USER || "geral@meridieinvestments.com";

function marcaHTML(logoSrc, cor) {
  if (logoSrc)
    return `<img src="${logoSrc}" alt="Meridie Investments" width="150" style="display:block;margin:0 auto;max-width:150px;height:auto" />`;
  return `<div style="font-family:Georgia,'Times New Roman',serif;color:${cor};font-size:26px;letter-spacing:3px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`;
}

function wrapper(corpoHtml, logoSrc) {
  return `<body style="margin:0;padding:0;background:#f5f7fa;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fa;padding:24px 0;"><tr><td align="center">
    <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
      <tr><td style="background:${NAVY};padding:24px 24px;text-align:center;">
        ${marcaHTML(null, "#ffffff")}
        <div style="color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:2px;margin-top:10px;text-transform:uppercase;">Portugal &#8596; Brasil</div>
      </td></tr>
      ${corpoHtml}
      <tr><td style="padding:26px 24px;border-top:1px solid #e3e8ee;background:#ffffff;">
        ${
          logoSrc
            ? `<img src="${logoSrc}" alt="Meridie Investments" width="180" style="display:block;max-width:180px;height:auto;margin-bottom:10px;" />`
            : `<div style="font-family:Georgia,serif;color:${NAVY};font-size:18px;letter-spacing:2px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`
        }
        <div style="color:#5d6b7e;font-size:13px;line-height:1.7;margin-top:8px;">
          Investimento imobiliário entre Portugal e o Brasil<br/>
          <a href="mailto:${esc(CONTACTO())}" style="color:${NAVY};text-decoration:none;">${esc(CONTACTO())}</a>
        </div>
      </td></tr>
      <tr><td style="background:${NAVY_DARK};padding:16px 24px;text-align:center;color:rgba(255,255,255,0.6);font-size:11px;">
        &copy; ${new Date().getFullYear()} Meridie Investments. Todos os direitos reservados.
      </td></tr>
    </table>
  </td></tr></table>
</body>`;
}

/** HTML do email de confirmação ao cliente (também usado no preview). */
// Textos do email de confirmação ao cliente, nos dois idiomas.
const CONF = {
  pt: {
    ola: "Olá",
    recebemos: "Recebemos a sua mensagem e agradecemos o seu interesse. A nossa equipa vai analisar o seu pedido e",
    contacto: "entrará em contacto consigo muito em breve",
    assunto: "Assunto da sua mensagem:",
    faixa1: "Capital sem fronteiras",
    faixa2: "A sua ligação entre Portugal e o Brasil começa aqui.",
    seguir: "O que acontece a seguir?",
    passos: [
      "Analisamos o seu perfil e objetivos de investimento.",
      "Entramos em contacto para uma primeira conversa, sem compromisso.",
      "Apresentamos as oportunidades certas, com apoio jurídico e fiscal nos dois países.",
    ],
    titulo: "Recebemos a sua mensagem — Meridie Investments",
    texto: (n) => `Olá ${n},\n\nRecebemos a sua mensagem e entraremos em contacto muito em breve.\n\nCapital sem fronteiras. A sua ligação entre Portugal e o Brasil começa aqui.\n\nMeridie Investments — Portugal ↔ Brasil`,
  },
  en: {
    ola: "Hello",
    recebemos: "We have received your message — thank you for your interest. Our team will review your request and",
    contacto: "get back to you very soon",
    assunto: "Subject of your message:",
    faixa1: "Capital without borders",
    faixa2: "Your bridge between Portugal and Brazil starts here.",
    seguir: "What happens next?",
    passos: [
      "We review your profile and investment goals.",
      "We get in touch for a first, no-obligation conversation.",
      "We present the right opportunities, with legal and tax support in both countries.",
    ],
    titulo: "We have received your message — Meridie Investments",
    texto: (n) => `Hello ${n},\n\nWe have received your message and will be in touch very soon.\n\nCapital without borders. Your bridge between Portugal and Brazil starts here.\n\nMeridie Investments — Portugal ↔ Brazil`,
  },
};

export function htmlConfirmacao({ nome, assunto, logoSrc = null, cardsBloco = "", lang = "pt" }) {
  const T = CONF[lang] || CONF.pt;
  const primeiroNome = (nome || "").trim().split(" ")[0] || T.ola;
  const corpo = `
  <tr><td style="padding:40px 24px 8px;">
    <h1 style="margin:0 0 6px;color:${NAVY};font-size:22px;font-family:Athelas,Georgia,'Times New Roman',serif;">${T.ola}, ${esc(primeiroNome)}!</h1>
    <p style="color:#5d6b7e;font-size:15px;line-height:1.7;margin:14px 0;">
      ${T.recebemos} <strong style="color:${NAVY};">${T.contacto}</strong>.
    </p>
    ${assunto ? `<p style="color:#5d6b7e;font-size:14px;margin:0 0 6px;">${T.assunto}</p>
      <p style="background:#f5f7fa;padding:12px 16px;border-radius:6px;color:${NAVY};font-size:14px;margin:0 0 14px;">${esc(assunto)}</p>` : ""}
  </td></tr>
  <tr><td style="padding:8px 24px 8px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${NAVY};border-radius:12px;"><tr><td style="padding:26px 28px;text-align:center;">
      <div style="color:${GOLD};font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px;">${T.faixa1}</div>
      <div style="color:#ffffff;font-size:20px;font-family:Georgia,serif;line-height:1.4;">${T.faixa2}</div>
    </td></tr></table>
  </td></tr>
  <tr><td style="padding:22px 24px 36px;">
    <p style="font-size:14px;margin:0 0 6px;font-weight:bold;color:${NAVY};">${T.seguir}</p>
    <p style="color:#5d6b7e;font-size:14px;line-height:1.8;margin:0;">
      ${T.passos.map((p) => `&#10003; ${p}`).join("<br/>")}
    </p>
  </td></tr>
  ${cardsBloco ? `<tr><td style="padding:0 24px 30px;">${cardsBloco}</td></tr>` : ""}`;
  return wrapper(corpo, logoSrc);
}

/** HTML da notificação interna (equipa). */
export function htmlNotificacao({ nome, email, assunto, mensagem, logoSrc = null }) {
  const corpo = `
  <tr><td style="padding:36px 24px;">
    <h1 style="margin:0 0 16px;color:${NAVY};font-size:20px;font-family:Athelas,Georgia,'Times New Roman',serif;">Nova mensagem do site</h1>
    <p style="margin:4px 0;color:#1a2230;font-size:14px;"><strong>Nome:</strong> ${esc(nome)}</p>
    <p style="margin:4px 0;color:#1a2230;font-size:14px;"><strong>Email:</strong> ${esc(email)}</p>
    <p style="margin:4px 0 16px;color:#1a2230;font-size:14px;"><strong>Assunto:</strong> ${esc(assunto) || "(sem assunto)"}</p>
    <div style="background:#f5f7fa;border-left:3px solid ${GOLD};padding:14px 16px;border-radius:6px;color:#1a2230;font-size:14px;white-space:pre-wrap;">${esc(mensagem)}</div>
  </td></tr>`;
  return wrapper(corpo, logoSrc);
}

export async function enviarConfirmacaoCliente({ nome, email, assunto, lang = "pt" }) {
  const T = CONF[lang] || CONF.pt;
  const { attachments, cid } = lerLogo();
  let cardsBloco = "";
  try {
    const emps = await empreendimentosDestaque(3);
    cardsBloco = cardsHTML(emps, SITE_URL(), {
      lang,
      titulo: lang === "en" ? "Featured properties" : "Empreendimentos em destaque",
    });
  } catch {
    /* sem cards se falhar */
  }
  const html = htmlConfirmacao({
    nome,
    assunto,
    logoSrc: cid ? `cid:${cid}` : null,
    cardsBloco,
    lang,
  });
  await getTransporter().sendMail({
    from: `"Meridie Investments" <${process.env.SMTP_USER}>`,
    to: email,
    subject: T.titulo,
    html,
    text: T.texto((nome || "").split(" ")[0]),
    attachments,
  });
}

export async function enviarEmailContacto({ nome, email, assunto, mensagem }) {
  const { attachments, cid } = lerLogo();
  const destinatarios = await getDestinatarios();
  await getTransporter().sendMail({
    from: `"Site Meridie Investments" <${process.env.SMTP_USER}>`,
    to: destinatarios.length ? destinatarios.join(", ") : CONTACTO(),
    replyTo: email,
    subject: `[Contacto] ${assunto || "Nova mensagem do site"}`,
    text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto || "(sem assunto)"}\n\n${mensagem}`,
    html: htmlNotificacao({ nome, email, assunto, mensagem, logoSrc: cid ? `cid:${cid}` : null }),
    attachments,
  });
}

// "Esqueci-me da password" do backoffice — link de entrada de uso único.
export async function enviarLinkAcesso({ email, link }) {
  const corpo = `<tr><td style="padding:28px 28px 8px;">
    <h2 style="margin:0 0 12px;color:${NAVY};font-size:20px;">Acesso ao backoffice</h2>
    <p style="margin:0 0 18px;color:#1a2230;font-size:14px;line-height:1.6;">Foi pedido um link para entrar no backoffice da Meridie Investments. Carrega no botão para entrar — o link é válido durante <strong>30 minutos</strong> e só pode ser usado uma vez.</p>
    <p style="margin:0 0 22px;"><a href="${esc(link)}" style="display:inline-block;background:${GOLD};color:${NAVY_DARK};font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">Entrar no backoffice</a></p>
    <p style="margin:0 0 8px;color:#6b7280;font-size:12px;line-height:1.5;">Se não foste tu a pedir, ignora este email — ninguém consegue entrar sem este link.</p>
  </td></tr>`;
  await getTransporter().sendMail({
    from: `"Meridie Investments" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Link de acesso ao backoffice — Meridie Investments",
    text: `Link de acesso ao backoffice (válido 30 minutos, uso único):\n${link}\n\nSe não foste tu a pedir, ignora este email.`,
    html: wrapper(corpo, null),
  });
}
