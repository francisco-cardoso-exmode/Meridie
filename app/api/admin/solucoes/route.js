import { criar } from "@/lib/crudAdmin";
import { validarSolucao } from "@/lib/catalogoAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function POST(request) {
  // O slug vem do nome da solução.
  return criar(request, "solucoes", {
    slugDoNome: true,
    msgDuplicado: "Já existe uma solução com esse nome.",
    validar: validarSolucao,
  });
}
