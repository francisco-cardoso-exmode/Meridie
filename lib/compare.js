// Comparador de empreendimentos — só se comparam dois do MESMO PAÍS
// (ex.: Lisboa vs Porto, ou São Paulo vs Rio). Nunca Portugal vs Brasil.

export function paisKey(e) {
  return e ? (e.pais || "").toString().trim().toLowerCase() : "";
}

export function comparaveis(a, b) {
  return !!a && !!b && a.slug !== b.slug && paisKey(a) === paisKey(b);
}

// Cidade (ex.: "Lisboa").
export function cidadeLabel(e) {
  return e ? e.cidade || "" : "";
}

// Localização completa (cidade · bairro) — cards e descrição.
export function zonaLabel(e) {
  if (!e) return "";
  return [e.cidade, e.zona].filter(Boolean).join(" · ");
}
