import { atualizar, apagar } from "@/lib/crudAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  return atualizar(request, params, "marcas");
}

export async function DELETE(request, { params }) {
  return apagar(params, "marcas");
}
