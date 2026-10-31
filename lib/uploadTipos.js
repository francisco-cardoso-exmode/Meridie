// Tipos e tamanhos aceites nos uploads do backoffice (servidor e browser).

export const TIPOS_IMAGEM = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"];
export const TIPOS_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];

export const MAX_IMAGEM = 25 * 1024 * 1024; // 25 MB (antes de reduzir no browser)
export const MAX_VIDEO = 500 * 1024 * 1024; // 500 MB

// Extensão do nome do ficheiro para cada tipo (o Blob deduz o tipo pela extensão).
export const EXTENSAO = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

export const eVideo = (nome) => /\.(mp4|webm|mov)$/i.test(nome || "");
