import { criar } from "@/lib/crudAdmin";
import { validarProduto } from "@/lib/catalogoAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function POST(request) {
  // O slug vem do nome do produto.
  return criar(request, "produtos", {
    slugDoNome: true,
    msgDuplicado: "Já existe um produto com esse nome.",
    validar: validarProduto,
  });
}
