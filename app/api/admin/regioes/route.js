import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });
  const db = await getDb();
  const lista = await db
    .collection("regioes")
    .find({}, { projection: { _id: 0 } })
    .toArray();
  return NextResponse.json({ ok: true, lista });
}

export async function POST(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });

  const doc = await request.json().catch(() => null);
  if (!doc?.slug || !doc?.nome) {
    return NextResponse.json(
      { ok: false, erro: "Slug e nome são obrigatórios." },
      { status: 400 }
    );
  }

  const db = await getDb();
  if (await db.collection("regioes").findOne({ slug: doc.slug })) {
    return NextResponse.json(
      { ok: false, erro: "Já existe uma região/zona com esse slug." },
      { status: 409 }
    );
  }

  delete doc._id;
  delete doc.enFonte;
  await db.collection("regioes").insertOne(doc);
  revalidaSite();
  after(() => traduzirEmFundo("regioes", doc.slug));
  return NextResponse.json({ ok: true, slug: doc.slug });
}
