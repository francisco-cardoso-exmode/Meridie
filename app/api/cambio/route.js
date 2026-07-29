import { getCambio, CAMBIO_TTL } from "@/lib/cambio";

// O browser pede aqui a cotação do momento (ver components/CambioProvider.js).
// O cache é feito em lib/cambio.js, por isso a rota é sempre dinâmica.
export const dynamic = "force-dynamic";

export async function GET() {
  const c = await getCambio();
  return Response.json(
    {
      taxa: c.taxa,
      aoVivo: c.aoVivo,
      atualizadoEm: c.atualizadoEm ? new Date(c.atualizadoEm).toISOString() : null,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${CAMBIO_TTL}, stale-while-revalidate=3600`,
      },
    }
  );
}
