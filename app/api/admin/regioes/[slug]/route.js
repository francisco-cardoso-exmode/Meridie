import { atualizar, apagar } from "@/lib/crudAdmin";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  return atualizar(request, params, "regioes", {
    validar: (doc, slug) =>
      doc.parent === slug ? "Uma região não pode pertencer a si própria." : null,
  });
}

// Uma região com zonas não se apaga: as zonas ficavam a apontar para nada.
export async function DELETE(request, { params }) {
  return apagar(params, "regioes", {
    podeApagar: async (db, slug) => {
      const zonas = await db
        .collection("regioes")
        .find({ parent: slug }, { projection: { _id: 0, nome: 1, slug: 1 } })
        .toArray();
      if (!zonas.length) return null;
      return (
        `Esta região tem ${zonas.length} zona(s): ${zonas.map((z) => z.nome || z.slug).join(", ")}. ` +
        "Muda-as para outra região (campo \"Pertence a\") ou apaga-as primeiro."
      );
    },
  });
}
