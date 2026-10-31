// Ligações diretas de contacto (telefone, email, WhatsApp) a partir dos dados
// da empresa. Devolvem null quando o dado não existe — nunca há placeholders.

const digitos = (tel) => String(tel || "").replace(/[^\d+]/g, "");

export function telHref(tel) {
  const d = digitos(tel);
  return d.replace(/\D/g, "").length >= 6 ? `tel:${d}` : null;
}

export function mailHref(email, assunto) {
  const e = String(email || "").trim();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return null;
  return `mailto:${e}${assunto ? `?subject=${encodeURIComponent(assunto)}` : ""}`;
}

// WhatsApp (wa.me): número em formato internacional, só dígitos.
export function whatsappHref(tel, mensagem) {
  const d = digitos(tel).replace(/\D/g, "");
  if (d.length < 8) return null;
  return `https://wa.me/${d}${mensagem ? `?text=${encodeURIComponent(mensagem)}` : ""}`;
}
