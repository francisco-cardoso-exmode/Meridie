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
    confPagar: (v) =>
      `Para garantir a reserva, faz o pagamento de <strong>${esc(v)}</strong> na página da tua estadia (cartão, Apple Pay, Google Pay e outros métodos).`,
    pagoAssunto: "Pagamento recebido — Meridie",
    pagoTitulo: "Pagamento recebido",
    pago: (v, c, e, s) =>
      `Recebemos o teu pagamento de <strong>${esc(v)}</strong> pela estadia em <strong>${esc(c)}</strong>, de <strong>${esc(e)}</strong> a <strong>${esc(s)}</strong>. Está tudo pronto — até breve!`,
    recAssunto: "Definir uma nova password — Meridie",
    recTitulo: "Nova password",
    rec: "Foi pedido um link para definires uma nova password. O link é válido durante 30 minutos e só pode ser usado uma vez. Se não foste tu, ignora este email.",
    recBotao: "Definir password",
    app: "Dica: no telemóvel, guarda esta página no ecrã principal — fica como uma app durante a estadia, sem descarregar nada. iPhone: no Safari, Partilhar → «Adicionar ao ecrã principal». Android: no Chrome, menu ⋮ → «Instalar app».",
    appArea: "Instala a tua área no telemóvel — fica como uma app, sem lojas: iPhone — no Safari, Partilhar → «Adicionar ao ecrã principal»; Android — no Chrome, menu ⋮ → «Instalar app».",
    bvAssunto: "Bem-vindo à Meridie — confirma o teu email",
    bvTitulo: "A tua conta de proprietário está criada",
    bv: "A partir de agora tens a tua área de proprietário na Meridie: as tuas casas, reservas, ganhos e os relatórios fotográficos de cada estadia.",
    bvConfirmar: "Confirma o teu email no botão abaixo. Só depois de confirmado podes ligar a conta bancária onde recebes os pagamentos.",
    bvBotao: "Confirmar o meu email",
    bvEntrar: (url) => `Para voltares a entrar: <a href="${esc(url)}">${esc(url)}</a>, com este email e a password que escolheste. Esta entrada é só para proprietários.`,
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
    confPagar: (v) => `To secure your booking, please pay <strong>${esc(v)}</strong> on your stay page (card, Apple Pay or Google Pay).`,
    pagoAssunto: "Payment received — Meridie",
    pagoTitulo: "Payment received",
    pago: (v, c, e, s) =>
      `We have received your payment of <strong>${esc(v)}</strong> for your stay at <strong>${esc(c)}</strong>, from <strong>${esc(e)}</strong> to <strong>${esc(s)}</strong>. Everything is ready — see you soon!`,
    recAssunto: "Set a new password — Meridie",
    recTitulo: "New password",
    rec: "A link to set a new password was requested. It is valid for 30 minutes and can only be used once. If it wasn't you, ignore this email.",
    recBotao: "Set password",
    app: "Tip: on your phone, save this page to your home screen — it works like an app during your stay, nothing to download. iPhone: in Safari, Share → “Add to Home Screen”. Android: in Chrome, menu ⋮ → “Install app”.",
    appArea: "Install your area on your phone — it works like an app, no app store: iPhone — in Safari, Share → “Add to Home Screen”; Android — in Chrome, menu ⋮ → “Install app”.",
    bvAssunto: "Welcome to Meridie — please confirm your email",
    bvTitulo: "Your owner account is ready",
    bv: "You now have your owner area at Meridie: your homes, bookings, earnings and the photo reports of every stay.",
    bvConfirmar: "Please confirm your email with the button below. You can only connect the bank account where you receive payments once it is confirmed.",
    bvBotao: "Confirm my email",
    bvEntrar: (url) => `To sign in again: <a href="${esc(url)}">${esc(url)}</a>, with this email and the password you chose. This sign-in is for owners only.`,
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

/** `aPagar` (texto já formatado, ex. "512,40 €"): a reserva paga-se online na página da estadia. */
export async function emailConfirmacaoHospede({ para, nome, casa, entrada, saida, link, lang, aPagar }) {
  const x = T(lang);
  const n = primeiroNome(nome);
  const paragrafos = [x.ola(n), x.conf(casa, entrada, saida), ...(aPagar ? [x.confPagar(aPagar)] : []), x.confLink];
  const dica = `<p style="margin:0 0 12px;color:#5b6576;font-size:13px;line-height:1.6;">${esc(x.app)}</p>`;
  const html = wrapper(bloco(x.confTitulo, paragrafos, botao(link, x.confBotao) + dica), null);
  const texto = `${x.confTitulo}\n\n${casa}: ${entrada} → ${saida}${aPagar ? `\n\n${aPagar}` : ""}\n\n${link}`;
  await enviar({ para, assunto: x.confAssunto, html, texto });
}

export async function emailPagamentoHospede({ para, nome, casa, entrada, saida, valor, lang }) {
  const x = T(lang);
  const html = wrapper(bloco(x.pagoTitulo, [x.ola(primeiroNome(nome)), x.pago(valor, casa, entrada, saida)]), null);
  await enviar({ para, assunto: x.pagoAssunto, html, texto: `${x.pagoTitulo}\n\n${casa}: ${entrada} → ${saida} · ${valor}` });
}

export async function emailRecuperacao({ para, link, lang }) {
  const x = T(lang);
  const html = wrapper(bloco(x.recTitulo, [x.rec], botao(link, x.recBotao)), null);
  await enviar({ para, assunto: x.recAssunto, html, texto: `${x.rec}\n\n${link}` });
}

/** Boas-vindas ao proprietário (logo no registo), com o link para confirmar o email. */
export async function emailBoasVindasProprietario({ para, nome, lang, linkConfirmar, linkEntrar }) {
  const x = T(lang);
  const html = wrapper(
    bloco(x.bvTitulo, [x.ola(primeiroNome(nome)), x.bv, x.bvConfirmar], botao(linkConfirmar, x.bvBotao) + `<p style="margin:0 0 12px;color:#1a2230;font-size:14px;line-height:1.6;">${x.bvEntrar(linkEntrar)}</p><p style="margin:0 0 12px;color:#5b6576;font-size:13px;line-height:1.6;">${esc(x.appArea)}</p>`),
    null
  );
  await enviar({ para, assunto: x.bvAssunto, html, texto: `${x.bvTitulo}\n\n${x.bvConfirmar}\n\n${linkConfirmar}\n\n${linkEntrar}` });
}

/** Convite para a app da equipa (só PT): a pessoa define a própria password. */
export async function emailConviteEquipa({ para, nome, link, linkEntrar }) {
  const n = primeiroNome(nome);
  const paragrafos = [
    `Olá${n ? ` ${esc(n)}` : ""},`,
    "Foste adicionado(a) à <strong>app da equipa Meridie</strong> — é onde vês as tarefas do dia (inspeções e limpezas) e tiras as fotografias de cada divisão.",
    "1. Define a tua password no botão abaixo (o link é válido durante 7 dias e só funciona uma vez).",
    "2. No telemóvel, instala a app: iPhone — no Safari, Partilhar → «Adicionar ao ecrã principal»; Android — no Chrome, menu ⋮ → «Instalar app». Não há nada para descarregar das lojas.",
    `3. Para entrares depois: <a href="${esc(linkEntrar)}">${esc(linkEntrar)}</a>, com este email e a tua password. Esta entrada é só para a equipa.`,
  ];
  const html = wrapper(bloco("Bem-vindo(a) à equipa Meridie", paragrafos, botao(link, "Definir a minha password")), null);
  await enviar({
    para,
    assunto: "Convite — app da equipa Meridie",
    html,
    texto: `App da equipa Meridie\n\nDefine a tua password (válido 7 dias): ${link}\n\nDepois entra em: ${linkEntrar}`,
  });
}

/** Aviso ao proprietário (PT/EN): nova reserva confirmada, relatório disponível… */
export async function avisarProprietario({ para, lang, assunto, titulo, paragrafos, link, rotulo }) {
  const html = wrapper(bloco(titulo, paragrafos.map(esc), link ? botao(link, rotulo || "Abrir") : ""), null);
  await enviar({ para, assunto, html, texto: `${titulo}\n\n${paragrafos.join("\n\n")}${link ? `\n\n${link}` : ""}` });
}
