// Hosts de imagens remotas que o otimizador do Next (/_next/image) aceita.
// Fonte única: usado em next.config.mjs (images.remotePatterns) e em
// components/Foto.js (decide entre next/image e <img> simples).
//
// - Vercel Blob: uploads do backoffice (o subdomínio é o id do store).
// - Unsplash: fotos de exemplo em lib/empreendimentos.js e lib/regioes.js.
// - vibemeireles.com.br: fotos do empreendimento Vibe Meireles (seed).
export const FOTO_REMOTE_PATTERNS = [
  { protocol: "https", hostname: "*.public.blob.vercel-storage.com", pathname: "/**" },
  { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
  { protocol: "https", hostname: "vibemeireles.com.br", pathname: "/**" },
];

const permitido = (host) =>
  FOTO_REMOTE_PATTERNS.some(({ hostname }) =>
    hostname.startsWith("*.")
      ? // "*." = exatamente um subdomínio, como no Next
        host.endsWith(hostname.slice(1)) && /^[^.]+$/.test(host.slice(0, -(hostname.length - 1)))
      : host === hostname
  );

/**
 * true se o src pode passar pelo next/image: caminho local (/...) ou https
 * num host da lista. SVG e data:/blob: ficam de fora (sem ganho / não suportado).
 */
export function fotoOtimizavel(src) {
  if (typeof src !== "string" || !src) return false;
  if (/\.svg(\?|#|$)/i.test(src)) return false;
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    const u = new URL(src);
    return u.protocol === "https:" && permitido(u.hostname);
  } catch {
    return false;
  }
}
