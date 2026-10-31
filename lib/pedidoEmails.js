import { getTransporter, wrapper, lerLogo, primeiroNomeSeguro, linha, CONTACTO, NAVY, GOLD } from "@/lib/mailer";
import { getDestinatarios } from "@/lib/config";
import { esc } from "@/lib/emailcards";
import { formataPreco } from "@/lib/catalogo";
import { MOTIVOS } from "@/lib/pedido";

/**
 * Emails do pedido de encomenda / informação: notificação à equipa
 * (destinatários de Definições, como o formulário de contacto) e
 * confirmação ao cliente, no idioma em que fez o pedido.
 */

const SITE_URL = () => process.env.SITE_URL || "https://meridieinvestments.com";

const MOTIVOS_EN = {
  encomenda: "Order request",
  informacao: "Information request",
  demonstracao: "Demo request",
  proposta: "Proposal request",
};

function tabelaItens(itens, lang) {
  const sob = lang === "en" ? "Price on request" : "Sob consulta";
  const linhas = itens
    .map(
      (i) => `<tr>
        <td style="padding:8px 6px;border-bottom:1px solid #e3e8ee;font-size:14px;color:#1a2230;">
          <strong>${esc(i.nome)}</strong>${i.marca ? `<br/><span style="color:#5d6b7e;font-size:12px;">${esc(i.marca)}</span>` : ""}
          ${i.unidade ? `<br/><span style="color:#5d6b7e;font-size:12px;">${esc(i.unidade)}</span>` : ""}
        </td>
        <td style="padding:8px 6px;border-bottom:1px solid #e3e8ee;font-size:14px;text-align:center;">${i.quantidade}</td>
        <td style="padding:8px 6px;border-bottom:1px solid #e3e8ee;font-size:14px;text-align:right;white-space:nowrap;">${
          i.total != null ? esc(formataPreco(i.total, lang)) : sob
        }</td>
      </tr>`
    )
    .join("");
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin:8px 0 4px;">
    <tr>
      <th align="left" style="padding:6px;font-size:12px;color:#5d6b7e;text-transform:uppercase;">${lang === "en" ? "Item" : "Artigo"}</th>
      <th style="padding:6px;font-size:12px;color:#5d6b7e;text-transform:uppercase;">${lang === "en" ? "Qty" : "Qtd."}</th>
      <th align="right" style="padding:6px;font-size:12px;color:#5d6b7e;text-transform:uppercase;">${lang === "en" ? "Total" : "Total"}</th>
    </tr>${linhas}</table>`;
}

function linhaSubtotal(p, lang) {
  if (!p.subtotal) return "";
  const nota = p.semPreco
    ? lang === "en"
      ? " (items with price on request not included)"
      : " (sem os artigos sob consulta)"
    : "";
  return `<p style="margin:10px 0 0;text-align:right;font-size:14px;color:${NAVY};"><strong>${
    lang === "en" ? "Indicative subtotal" : "Subtotal indicativo"
  }: ${esc(formataPreco(p.subtotal, lang))}</strong>${nota}</p>`;
}

/** Notificação interna (equipa). */
export async function enviarPedidoEquipa(pedido) {
  const { attachments, cid } = lerLogo();
  const destinatarios = await getDestinatarios();
  const c = pedido.cliente;
  const motivo = MOTIVOS[pedido.motivo] || "Pedido";
  const linkAdmin = `${SITE_URL()}/admin/pedidos/${pedido._id}`;
  const campo = (rotulo, v) =>
    v ? `<p style="margin:4px 0;color:#1a2230;font-size:14px;"><strong>${rotulo}:</strong> ${esc(v)}</p>` : "";
  const corpo = `
  <tr><td style="padding:36px 24px;">
    <h1 style="margin:0 0 6px;color:${NAVY};font-size:20px;font-family:Georgia,serif;">${esc(motivo)} — ${esc(pedido.referencia)}</h1>
    <p style="margin:0 0 16px;color:#5d6b7e;font-size:13px;">${pedido.area === "tecnologia" ? "Tecnologia" : pedido.area === "misto" ? "Representações + Tecnologia" : "Representações comerciais"} · ${pedido.idioma === "en" ? "inglês" : "português"}</p>
    ${campo("Nome", c.nome)}${campo("Empresa", c.empresa)}${campo("NIF", c.nif)}
    ${campo("Email", c.email)}${campo("Telefone", c.telefone)}${campo("País", c.pais)}
    ${campo("Morada de entrega", c.morada)}
    ${tabelaItens(pedido.itens, "pt")}
    ${linhaSubtotal(pedido, "pt")}
    ${c.notas ? `<div style="margin-top:16px;background:#f5f7fa;border-left:3px solid ${GOLD};padding:14px 16px;border-radius:6px;color:#1a2230;font-size:14px;white-space:pre-wrap;">${esc(c.notas)}</div>` : ""}
    <p style="margin:22px 0 0;"><a href="${esc(linkAdmin)}" style="display:inline-block;background:${GOLD};color:${NAVY};font-weight:bold;text-decoration:none;padding:11px 20px;border-radius:8px;font-size:14px;">Abrir no backoffice</a></p>
  </td></tr>`;
  const texto = [
    `${motivo} — ${pedido.referencia}`,
    `Nome: ${c.nome}`,
    c.empresa && `Empresa: ${c.empresa}`,
    c.nif && `NIF: ${c.nif}`,
    `Email: ${c.email}`,
    c.telefone && `Telefone: ${c.telefone}`,
    c.pais && `País: ${c.pais}`,
    c.morada && `Morada de entrega: ${c.morada}`,
    "",
    ...pedido.itens.map(
      (i) => `- ${i.quantidade} × ${i.nome}${i.unidade ? ` (${i.unidade})` : ""} — ${i.total != null ? formataPreco(i.total) : "sob consulta"}`
    ),
    pedido.subtotal ? `Subtotal indicativo: ${formataPreco(pedido.subtotal)}` : "",
    c.notas ? `\nNotas:\n${c.notas}` : "",
    `\n${linkAdmin}`,
  ]
    .filter((x) => x !== false && x != null)
    .join("\n");
  await getTransporter().sendMail({
    from: `"Site Meridie Investments" <${process.env.SMTP_USER}>`,
    to: destinatarios.length ? destinatarios.join(", ") : CONTACTO(),
    replyTo: c.email,
    subject: `[${motivo}] ${pedido.referencia} — ${linha(c.empresa || c.nome, 80)}`,
    text: texto,
    html: wrapper(corpo, cid ? `cid:${cid}` : null),
    attachments,
  });
}

/**
 * Confirmação ao cliente. Como no formulário de contacto, nenhum texto livre
 * do visitante é repetido (o email vai para o endereço indicado no
 * formulário): só o primeiro nome validado e os itens lidos da base.
 */
export async function enviarConfirmacaoPedido(pedido) {
  const lang = pedido.idioma === "en" ? "en" : "pt";
  const { attachments, cid } = lerLogo();
  const nome = primeiroNomeSeguro(pedido.cliente.nome);
  const motivo = (lang === "en" ? MOTIVOS_EN : MOTIVOS)[pedido.motivo] || "";
  const T =
    lang === "en"
      ? {
          ola: "Hello",
          texto: "We have received your request and will get back to you shortly with availability and conditions. No payment is taken online.",
          ref: "Reference",
          assunto: `We have received your request ${pedido.referencia} — Meridie Investments`,
        }
      : {
          ola: "Olá",
          texto: "Recebemos o seu pedido e vamos responder-lhe brevemente com a disponibilidade e as condições. Não é feito nenhum pagamento online.",
          ref: "Referência",
          assunto: `Recebemos o seu pedido ${pedido.referencia} — Meridie Investments`,
        };
  const corpo = `
  <tr><td style="padding:40px 24px 30px;">
    <h1 style="margin:0 0 6px;color:${NAVY};font-size:22px;font-family:Georgia,serif;">${T.ola}${nome ? `, ${esc(nome)}` : ""}!</h1>
    <p style="color:#5d6b7e;font-size:15px;line-height:1.7;margin:14px 0;">${T.texto}</p>
    <p style="color:${NAVY};font-size:14px;margin:0 0 6px;"><strong>${esc(motivo)}</strong> · ${T.ref} <strong>${esc(pedido.referencia)}</strong></p>
    ${tabelaItens(pedido.itens, lang)}
    ${linhaSubtotal(pedido, lang)}
  </td></tr>`;
  const texto = [
    `${T.ola}${nome ? ` ${nome}` : ""},`,
    "",
    T.texto,
    "",
    `${motivo} · ${T.ref} ${pedido.referencia}`,
    ...pedido.itens.map((i) => `- ${i.quantidade} × ${i.nome}`),
    "",
    "Meridie Investments",
  ].join("\n");
  await getTransporter().sendMail({
    from: `"Meridie Investments" <${process.env.SMTP_USER}>`,
    to: pedido.cliente.email,
    subject: T.assunto,
    html: wrapper(corpo, cid ? `cid:${cid}` : null),
    text: texto,
    attachments,
  });
}
