// Comparador de empreendimentos — só se podem comparar dois da MESMA zona.
// A "zona" é a combinação país + cidade + zona (normalizada).

// A unidade de comparação é a CIDADE (país + cidade). Dois empreendimentos só
// se comparam se forem da mesma cidade; o bairro/zona entra como diferença.
export function zonaKey(e) {
  if (!e) return "";
  return [e.pais, e.cidade]
    .map((x) => (x || "").toString().trim().toLowerCase())
    .join("::");
}

export function mesmaZona(a, b) {
  return !!a && !!b && zonaKey(a) === zonaKey(b);
}

// Cidade (unidade de comparação) — usado nos títulos "na zona de …".
export function cidadeLabel(e) {
  return e ? e.cidade || "" : "";
}

// Localização completa (cidade · bairro) — usado nos cards e na descrição.
export function zonaLabel(e) {
  if (!e) return "";
  return [e.cidade, e.zona].filter(Boolean).join(" · ");
}
