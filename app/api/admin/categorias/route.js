import { criar } from "@/lib/crudAdmin";
import { validarCategoria } from "@/lib/catalogoAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function POST(request) {
  // O slug vem do nome da categoria.
  return criar(request, "categorias", {
    slugDoNome: true,
    msgDuplicado: "Já existe uma categoria com esse nome.",
    validar: validarCategoria,
  });
}
