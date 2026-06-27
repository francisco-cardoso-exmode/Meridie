// Converte um URL de vídeo (YouTube/Vimeo/ficheiro) na fonte de embed.
export function videoSrc(url) {
  if (!url) return null;
  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/
  );
  if (yt) return { tipo: "iframe", src: `https://www.youtube.com/embed/${yt[1]}` };
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return { tipo: "iframe", src: `https://player.vimeo.com/video/${vm[1]}` };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { tipo: "file", src: url };
  return { tipo: "iframe", src: url };
}

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Permite links markdown nos textos: [texto](https://...) → <a>.
// Escapa o resto (conteúdo é de admin, mas escapamos por segurança).
export function textoComLinks(s) {
  if (!s) return "";
  let out = escapeHtml(s);
  out = out.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" class="texto-link">$1</a>'
  );
  return out.replace(/\n/g, "<br/>");
}
