import { draftMode } from "next/headers";
import { isAdmin } from "@/lib/adminAuth";

/**
 * Pré-visualização do conteúdo oculto (empreendimento não publicado, marca,
 * produto ou solução inativos, casa ainda não publicada). Exige o Draft Mode
 * do Next, ligado pela rota /api/admin/previsualizar, E uma sessão de admin
 * válida. Sem Draft Mode não lê cookies, e as páginas continuam em cache (ISR).
 */
export async function emPrevisualizacao() {
  if (!(await draftMode()).isEnabled) return false;
  return isAdmin();
}

// Link do backoffice para ver uma página pública como ela ficará.
export const urlPrevisualizar = (caminho) => `/api/admin/previsualizar?url=${encodeURIComponent(caminho)}`;

// Só caminhos do próprio site, fora do backoffice e da API.
export function caminhoSeguro(url) {
  if (typeof url !== "string" || !url.startsWith("/") || url.startsWith("//") || /[\\\s]/.test(url)) return null;
  if (/^\/(admin|api)(\/|$|\?)/.test(url)) return null;
  return url;
}
