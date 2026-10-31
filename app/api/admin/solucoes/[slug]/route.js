import { atualizar, apagar } from "@/lib/crudAdmin";
import { validarSolucao } from "@/lib/catalogoAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  return atualizar(request, params, "solucoes", { validar: validarSolucao });
}

export async function DELETE(request, { params }) {
  return apagar(params, "solucoes");
}
