import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";
import { garanteSeedCategorias } from "@/lib/representacoes";

export const dynamic = "force-dynamic";

// Nova ordem das categorias irmãs: { slugs: ["a", "b", …] } → ordem 1, 2, …
export async function POST(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: "A tua sessão expirou." }, { status: 401 });
  const corpo = await request.json().catch(() => null);
  const slugs = corpo?.slugs;
  if (
    !Array.isArray(slugs) ||
    !slugs.length ||
    slugs.length > 200 ||
    !slugs.every((s) => typeof s === "string" && /^[a-z0-9-]{1,100}$/.test(s))
  )
    return NextResponse.json({ ok: false, erro: "Pedido inválido." }, { status: 400 });
  const db = await getDb();
  await garanteSeedCategorias(db);
  await db.collection("categorias").bulkWrite(
    slugs.map((slug, i) => ({
      updateOne: { filter: { slug }, update: { $set: { ordem: i + 1, atualizadoEm: new Date() } } },
    }))
  );
  revalidaSite();
  return NextResponse.json({ ok: true });
}
