import { getCambio, CAMBIO_TTL } from "@/lib/cambio";

// O browser pede aqui a cotação do momento (ver components/CambioProvider.js).
// O cache é feito em lib/cambio.js, por isso a rota é sempre dinâmica.
export const dynamic = "force-dynamic";

export async function GET() {
  const c = await getCambio();
  // Taxa de recurso (fontes em baixo): cache curta, para a CDN não a servir
  // durante 15 minutos depois de as fontes voltarem.
  const sMaxAge = c.aoVivo ? CAMBIO_TTL : 60;
  const swr = c.aoVivo ? 3600 : 60;
  return Response.json(
    {
      taxa: c.taxa,
      aoVivo: c.aoVivo,
      atualizadoEm: c.atualizadoEm ? new Date(c.atualizadoEm).toISOString() : null,
    },
    {
      headers: {
        "Cache-Control": `public, s-maxage=${sMaxAge}, stale-while-revalidate=${swr}`,
      },
    }
  );
}
