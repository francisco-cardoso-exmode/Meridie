import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const db = await getDb();
  const lista = await db.collection("anuncios").find({}, { projection: { _id: 0 } }).toArray();
  return NextResponse.json({ ok: true, lista });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const doc = await request.json().catch(() => null);
  if (!doc?.slug || !doc?.titulo)
    return NextResponse.json({ ok: false, erro: "Slug e título obrigatórios." }, { status: 400 });
  const db = await getDb();
  if (await db.collection("anuncios").findOne({ slug: doc.slug }))
    return NextResponse.json({ ok: false, erro: "Já existe um anúncio com esse slug." }, { status: 409 });
  delete doc._id;
  await db.collection("anuncios").insertOne(doc);
  return NextResponse.json({ ok: true, slug: doc.slug });
}
