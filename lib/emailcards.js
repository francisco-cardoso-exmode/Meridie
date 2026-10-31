import { formatarPreco } from "@/lib/empreendimentos";
import { caminho } from "@/lib/i18n";

// Blocos HTML (email-safe, estilos inline) reutilizados nos emails automáticos
// e no gerador de assinatura. Sem dependências de servidor — pode correr no cliente.

const NAVY = "#1b3f6e";
const GOLD = "#c89b3c";
const SERIF = "Athelas, Georgia, 'Times New Roman', serif";

// Escapa texto e atributos para HTML. Também usado em lib/mailer.js — tudo o
// que vem da base de dados ou de um formulário passa por aqui antes do HTML.
export function esc(s = "") {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function cardsHTML(emps, baseUrl, { titulo = "Empreendimentos em destaque", lang = "pt" } = {}) {
  if (!emps?.length) return "";
  const cells = emps
    .slice(0, 3)
    .map((e) => {
      const link = `${baseUrl}${caminho(lang, `/empreendimentos/${encodeURIComponent(e.slug || "")}`)}`;
      return `
      <td width="33%" valign="top" style="padding:5px;">
        <a href="${esc(link)}" style="text-decoration:none;color:${NAVY};display:block;border:1px solid #e3e8ee;border-radius:10px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;">
          <img src="${esc(e.imagens?.[0] || "")}" width="160" height="100" style="display:block;width:100%;height:100px;object-fit:cover;" alt="" />
          <span style="display:block;padding:8px 10px;">
            <span style="display:block;font-size:11px;color:#5d6b7e;">${esc(e.cidade || "")}</span>
            <strong style="display:block;font-size:13px;color:${NAVY};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(e.nome || "")}</strong>
            <span style="display:block;font-size:13px;color:${GOLD};font-weight:bold;">${e.preco ? esc(formatarPreco(e.preco, e.moeda, lang)) : ""}</span>
          </span>
        </a>
      </td>`;
    })
    .join("");
  return `
    <div style="font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;margin:16px 0 6px;font-family:${SERIF};">${esc(titulo)}</div>
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
    ? `<img src="${esc(logoUrl)}" width="200" style="display:block;max-width:200px;height:auto;margin-bottom:8px;" alt="Meridie Investments" />`
    : `<div style="font-family:Georgia,serif;color:${NAVY};font-size:18px;letter-spacing:2px;">MERIDIE <span style="color:${GOLD}">INVESTMENTS</span></div>`;

  const contacto = [
    telefone &&
      `<a href="tel:${esc(telefone.replace(/\s/g, ""))}" style="color:${NAVY};text-decoration:none;">${esc(telefone)}</a>`,
    email &&
      `<a href="mailto:${esc(email)}" style="color:${NAVY};text-decoration:none;">${esc(email)}</a>`,
    `<a href="${esc(baseUrl)}" style="color:${GOLD};text-decoration:none;">${esc((baseUrl || "").replace(/^https?:\/\//, ""))}</a>`,
  ]
    .filter(Boolean)
    .join(" &nbsp;·&nbsp; ");

  return `
  <table role="presentation" cellpadding="0" cellspacing="0" style="font-family:Helvetica,Arial,sans-serif;color:${NAVY};max-width:520px;">
    <tr><td style="padding-bottom:6px;">${logo}</td></tr>
    <tr><td>
      ${nome ? `<div style="font-size:17px;font-weight:bold;color:${NAVY};">${esc(nome)}</div>` : ""}
      ${cargo ? `<div style="font-size:13px;color:${NAVY};margin-bottom:5px;">${esc(cargo)}</div>` : ""}
      <div style="font-family:${SERIF};font-size:12px;font-weight:bold;color:${GOLD};margin-bottom:2px;">Capital sem fronteiras. Investimento com precisão.</div>
      <div style="font-size:12px;color:${NAVY};">Investimento imobiliário Portugal ↔ Brasil</div>
      <div style="font-size:12px;margin-top:5px;">${contacto}</div>
    </td></tr>
    ${empreendimentos.length ? `<tr><td style="padding-top:6px;">${cardsHTML(empreendimentos, baseUrl, { titulo: "Oportunidades em destaque" })}</td></tr>` : ""}
  </table>`;
}
