import { atualizar, apagar } from "@/lib/crudAdmin";
import { validarIntervalos } from "@/lib/intervalo";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  // Quartos/casas de banho: "2" ou "1-3" (lib/intervalo.js).
  return atualizar(request, params, "empreendimentos", { validar: validarIntervalos });
}

export async function DELETE(request, { params }) {
  return apagar(params, "empreendimentos");
}
