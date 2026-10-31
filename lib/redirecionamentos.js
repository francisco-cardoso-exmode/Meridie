/**
 * Endereços antigos do site → novos (301, no middleware — corre no Edge, por
 * isso sem dependências de servidor). Recebe e devolve caminhos internos (PT);
 * o middleware aplica o idioma (/en/brands/x → /en/commercial-representation/brands/x).
 */

// "Marcas" (Bebidas & Alimentação) passou a fazer parte das Representações
// comerciais; cada marca mantém a sua página em /representacoes/marcas/<slug>.
const MARCAS = /^\/marcas(?:\/([^/]+))?\/?$/;

export function destinoLegado(interno) {
  const m = MARCAS.exec(String(interno || ""));
  if (!m) return null;
  return m[1] ? `/representacoes/marcas/${m[1]}` : "/representacoes";
}
