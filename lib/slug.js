/**
 * Slugs (o endereço de cada empreendimento/região/marca/anúncio).
 * Sem dependências de servidor — usado também nos formulários do backoffice.
 */

export const slugify = (s) =>
  (s || "")
    .toString()
    .replace(/²/g, "2")
    .replace(/³/g, "3")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

// Palavras que já são rotas do site/backoffice (ex.: /admin/marcas/novo).
export const SLUGS_RESERVADOS = [
  "novo",
  "nova",
  "editar",
  "admin",
  "api",
  "en",
  "pt",
  "todos",
  "todas",
  "pesquisa",
  "comparar",
];

/** Devolve a mensagem de erro, ou null se o slug é válido. */
export function erroSlug(slug) {
  if (typeof slug !== "string" || !slug) return "Slug em falta.";
  if (slug.length > 100) return "Slug demasiado comprido (máx. 100 caracteres).";
  if (!/^[a-z0-9-]+$/.test(slug) || /^-|-$/.test(slug))
    return "Slug inválido: usa só letras minúsculas sem acentos, números e hífenes.";
  if (SLUGS_RESERVADOS.includes(slug))
    return `"${slug}" é uma palavra reservada do site — escolhe outro slug/nome.`;
  return null;
}
