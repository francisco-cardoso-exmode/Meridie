import { criar } from "@/lib/crudAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function POST(request) {
  // O slug vem do nome da marca.
  return criar(request, "marcas", {
    slugDoNome: true,
    msgDuplicado: "Já existe uma marca com esse nome.",
  });
}
