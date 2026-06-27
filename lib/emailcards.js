import { formatarPreco } from "@/lib/empreendimentos";

// Blocos HTML (email-safe, estilos inline) reutilizados nos emails automáticos
// e no gerador de assinatura. Sem dependências de servidor — pode correr no cliente.

const NAVY = "#1b3f6e";
const GOLD = "#c89b3c";

export function cardsHTML(emps, baseUrl, { titulo = "Empreendimentos em destaque" } = {}) {
  if (!emps?.length) return "";
  const cells = emps
    .slice(0, 3)
    .map(
      (e) => `
      <td width="33%" valign="top" style="padding:5px;">
        <a href="${baseUrl}/empreendimentos/${e.slug}" style="text-decoration:none;color:${NAVY};display:block;border:1px solid #e3e8ee;border-radius:10px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
          <img src="${e.imagens?.[0] || ""}" width="100%" style="display:block;width:100%;height:92px;object-fit:cover;" alt="" />
          <span style="display:block;padding:8px 10px;">
            <span style="font-size:11px;color:#5d6b7e;">${e.cidade || ""}</span><br/>
            <strong style="font-size:13px;color:${NAVY};">${e.nome || ""}</strong><br/>
            <span style="font-size:13px;color:${GOLD};font-weight:bold;">${e.preco ? formatarPreco(e.preco, e.moeda) : ""}</span>
          </span>
        </a>
      </td>`
    )
    .join("");
  return `
    <div style="font-size:11px;color:#5d6b7e;text-transform:uppercase;letter-spacing:1px;margin:16px 0 6px;font-family:Helvetica,Arial,sans-serif;">${titulo}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>`;
}

export function assinaturaHTML({
  nome = "",
  cargo = "",
  telefone = "",
  email = "",
  logoUrl = "",
  empreendimentos = [],
  baseUrl = "",
}) {
  const logo = logoUrl
    ? `<img src="${logoUrl}" width="150" style="display:block;max-width:150px;height:auto;margin-bottom:8px;" alt="Meridie Investments" />`
    : `<div style="font-family:Georgia,serif;color:${NAVY};font-size:18px;letter-spacing:2px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`;

  const contacto = [
    telefone &&
      `<a href="tel:${telefone.replace(/\s/g, "")}" style="color:${NAVY};text-decoration:none;">${telefone}</a>`,
    email &&
      `<a href="mailto:${email}" style="color:${NAVY};text-decoration:none;">${email}</a>`,
    `<a href="${baseUrl}" style="color:${GOLD};text-decoration:none;">${(baseUrl || "").replace(/^https?:\/\//, "")}</a>`,
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;color:#1a2230;max-width:520px;">
    <tr><td style="padding-bottom:6px;">${logo}</td></tr>
    <tr><td>
      ${nome ? `<div style="font-size:15px;font-weight:bold;color:${NAVY};">${nome}</div>` : ""}
      ${cargo ? `<div style="font-size:12px;color:#5d6b7e;margin-bottom:4px;">${cargo}</div>` : ""}
      <div style="font-size:12px;color:#5d6b7e;">Investimento imobiliário Portugal ↔ Brasil</div>
      <div style="font-size:12px;margin-top:4px;">${contacto}</div>
    </td></tr>
    ${empreendimentos.length ? `<tr><td style="padding-top:6px;">${cardsHTML(empreendimentos, baseUrl, { titulo: "Oportunidades em destaque" })}</td></tr>` : ""}
  </table>`;
}
