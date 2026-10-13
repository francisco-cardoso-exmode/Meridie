import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { garanteSeed } from "@/lib/marcas";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const doc = await request.json().catch(() => null);
  if (!doc?.slug || !doc?.nome)
    return NextResponse.json({ ok: false, erro: "Slug e nome obrigatórios." }, { status: 400 });
  const col = await garanteSeed(await getDb());
  if (await col.findOne({ slug: doc.slug }))
    return NextResponse.json({ ok: false, erro: "Já existe uma marca com esse nome." }, { status: 409 });
  delete doc._id;
  delete doc.enFonte;
  await col.insertOne(doc);
  after(() => traduzirEmFundo("marcas", doc.slug));
  revalidaSite();
  return NextResponse.json({ ok: true, slug: doc.slug });
}
