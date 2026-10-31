import { getTransporter, wrapper } from "@/lib/mailer";
import { getDestinatarios, destinatariosPorDefeito } from "@/lib/config";
import { esc } from "@/lib/emailcards";

/**
 * Emails do Alojamento Local. Os emails para hóspedes e proprietários nunca
 * repetem texto livre escrito por quem preencheu o formulário (o site não
 * pode servir de "relay" de spam): só datas, o título da casa e o primeiro
 * nome, se for mesmo um nome.
 */

const NAVY = "#1b3f6e";
const GOLD = "#c89b3c";
const NAVY_DARK = "#122c4e";
const DE = () => `"Meridie Alojamento" <${process.env.SMTP_USER}>`;
const linha = (s = "", max = 150) => String(s).replace(/[\r\n\t]+/g, " ").trim().slice(0, max);

function primeiroNome(nome) {
  const n = String(nome || "").trim().split(/\s+/)[0] || "";
  return n.length <= 30 && /^[\p{L}\p{M}'’-]+$/u.test(n) ? n : "";
}

const botao = (href, rotulo) =>
  `<p style="margin:18px 0 22px;"><a href="${esc(href)}" style="display:inline-block;background:${GOLD};color:${NAVY_DARK};font-weight:bold;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;">${esc(rotulo)}</a></p>`;

function bloco(titulo, paragrafos, extra = "") {
  return `<tr><td style="padding:28px 28px 8px;">
    <h2 style="margin:0 0 12px;color:${NAVY};font-size:20px;">${esc(titulo)}</h2>
    ${paragrafos.map((p) => `<p style="margin:0 0 12px;color:#1a2230;font-size:14px;line-height:1.6;">${p}</p>`).join("")}
    ${extra}
  </td></tr>`;
}

async function enviar({ para, assunto, html, texto, replyTo }) {
  await getTransporter().sendMail({ from: DE(), to: para, subject: linha(assunto), html, text: texto, replyTo });
}

async function paraEquipa() {
  const d = await getDestinatarios().catch(() => destinatariosPorDefeito());
  return d.length ? d.join(", ") : process.env.CONTACT_TO || process.env.SMTP_USER;
}

/** Notificação interna (equipa): `campos` = [[rótulo, valor], …]; texto escapado. */
export async function avisarEquipa({ assunto, titulo, campos = [], link, replyTo }) {
  const linhas = campos
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `<strong>${esc(k)}:</strong> <span style="white-space:pre-wrap">${esc(String(v))}</span>`);
  const html = wrapper(bloco(titulo || assunto, linhas, link ? botao(link, "Abrir no backoffice") : ""), null);
  const texto = `${titulo || assunto}\n\n${campos.map(([k, v]) => `${k}: ${v ?? ""}`).join("\n")}${link ? `\n\n${link}` : ""}`;
  await enviar({ para: await paraEquipa(), assunto: `[Alojamento] ${assunto}`, html, texto, replyTo });
}

const TXT = {
  pt: {
    ola: (n) => `Olá${n ? ` ${esc(n)}` : ""},`,
    pedidoAssunto: "Recebemos o teu pedido de reserva — Meridie",
    pedidoTitulo: "Pedido de reserva recebido",
    pedido: (c, e, s) =>
      `Recebemos o teu pedido para <strong>${esc(c)}</strong>, de <strong>${esc(e)}</strong> a <strong>${esc(s)}</strong>. A nossa equipa confirma a disponibilidade e responde-te em breve. O pedido ainda não é uma reserva confirmada.`,
    confAssunto: "Reserva confirmada — Meridie",
    confTitulo: "A tua reserva está confirmada",
    conf: (c, e, s) =>
      `A tua estadia em <strong>${esc(c)}</strong>, de <strong>${esc(e)}</strong> a <strong>${esc(s)}</strong>, está confirmada.`,
    confLink:
      "Na página da tua estadia tens os detalhes da reserva, as instruções de entrada e, no dia da chegada, as fotografias do estado da casa antes da tua entrada. Guarda este link — é pessoal.",
    confBotao: "Abrir a minha estadia",
    recAssunto: "Definir uma nova password — Meridie",
    recTitulo: "Nova password",
    rec: "Foi pedido um link para definires uma nova password. O link é válido durante 30 minutos e só pode ser usado uma vez. Se não foste tu, ignora este email.",
    recBotao: "Definir password",
  },
  en: {
    ola: (n) => `Hello${n ? ` ${esc(n)}` : ""},`,
    pedidoAssunto: "We have received your booking request — Meridie",
    pedidoTitulo: "Booking request received",
    pedido: (c, e, s) =>
      `We have received your request for <strong>${esc(c)}</strong>, from <strong>${esc(e)}</strong> to <strong>${esc(s)}</strong>. Our team will check availability and get back to you shortly. The request is not yet a confirmed booking.`,
    confAssunto: "Booking confirmed — Meridie",
    confTitulo: "Your booking is confirmed",
    conf: (c, e, s) =>
      `Your stay at <strong>${esc(c)}</strong>, from <strong>${esc(e)}</strong> to <strong>${esc(s)}</strong>, is confirmed.`,
    confLink:
      "Your stay page has the booking details, check-in instructions and, on arrival day, photos of the condition of the home before you check in. Keep this link — it is personal.",
    confBotao: "Open my stay",
    recAssunto: "Set a new password — Meridie",
    recTitulo: "New password",
    rec: "A link to set a new password was requested. It is valid for 30 minutes and can only be used once. If it wasn't you, ignore this email.",
    recBotao: "Set password",
  },
};
const T = (lang) => TXT[lang] || TXT.pt;

export async function emailPedidoHospede({ para, nome, casa, entrada, saida, lang }) {
  const x = T(lang);
  const n = primeiroNome(nome);
  const html = wrapper(bloco(x.pedidoTitulo, [x.ola(n), x.pedido(casa, entrada, saida)]), null);
  const texto = `${x.pedidoTitulo}\n\n${casa}: ${entrada} → ${saida}`;
  await enviar({ para, assunto: x.pedidoAssunto, html, texto });
}

export async function emailConfirmacaoHospede({ para, nome, casa, entrada, saida, link, lang }) {
  const x = T(lang);
  const n = primeiroNome(nome);
  const html = wrapper(bloco(x.confTitulo, [x.ola(n), x.conf(casa, entrada, saida), x.confLink], botao(link, x.confBotao)), null);
  const texto = `${x.confTitulo}\n\n${casa}: ${entrada} → ${saida}\n\n${link}`;
  await enviar({ para, assunto: x.confAssunto, html, texto });
}

export async function emailRecuperacao({ para, link, lang }) {
  const x = T(lang);
  const html = wrapper(bloco(x.recTitulo, [x.rec], botao(link, x.recBotao)), null);
  await enviar({ para, assunto: x.recAssunto, html, texto: `${x.rec}\n\n${link}` });
}

/** Aviso ao proprietário (PT/EN): nova reserva confirmada, relatório disponível… */
export async function avisarProprietario({ para, lang, assunto, titulo, paragrafos, link, rotulo }) {
  const html = wrapper(bloco(titulo, paragrafos.map(esc), link ? botao(link, rotulo || "Abrir") : ""), null);
  await enviar({ para, assunto, html, texto: `${titulo}\n\n${paragrafos.join("\n\n")}${link ? `\n\n${link}` : ""}` });
}
