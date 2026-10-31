import { FOTO_REMOTE_PATTERNS } from "./components/fotoHosts.mjs";

// Cabeçalhos de segurança aplicados a todas as respostas.
// Não há CSP de scripts: GA, mosaicos do Leaflet, imagens do Vercel Blob e do
// Unsplash deixariam de funcionar. A proteção contra iframes vem do X-Frame-Options.
const CABECALHOS_SEGURANCA = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Só estes hosts passam pelo otimizador; outros URLs caem para <img>
    // simples via components/Foto.js.
    remotePatterns: FOTO_REMOTE_PATTERNS,
    formats: ["image/avif", "image/webp"],
    // As fotos raramente mudam de URL (uploads novos = URL novo): 30 dias.
    minimumCacheTTL: 2592000,
  },
  async headers() {
    return [{ source: "/:path*", headers: CABECALHOS_SEGURANCA }];
  },
};

export default nextConfig;
