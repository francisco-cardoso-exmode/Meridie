import { NextResponse } from "next/server";
import { reservaPorToken } from "@/lib/al/reservas";
import { caminho, t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Manifest da app do hóspede: um por reserva, para a app instalada abrir
 * diretamente no link pessoal da estadia. Token inválido → 404 (como a página).
 */
export async function GET(request, { params }) {
  const { token } = await params;
  const lang = new URL(request.url).searchParams.get("lang") === "en" ? "en" : "pt";
  const r = await reservaPorToken(token).catch(() => null);
  if (!r) return new NextResponse(null, { status: 404 });
  const inicio = caminho(lang, `/estadia/${token}`);
  const manifest = {
    id: inicio,
    name: `Meridie — ${r.casaTitulo || t(lang, "A tua estadia")}`,
    short_name: t(lang, "A minha estadia"),
    description: t(lang, "A tua reserva, as instruções de entrada e o contacto da equipa, sempre à mão."),
    start_url: inicio,
    scope: inicio,
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#1b3f6e",
    lang: lang === "en" ? "en" : "pt-PT",
    icons: [
      { src: "/pwa/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/pwa/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/pwa/maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
  return NextResponse.json(manifest, {
    headers: { "Content-Type": "application/manifest+json", "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex" },
  });
}
