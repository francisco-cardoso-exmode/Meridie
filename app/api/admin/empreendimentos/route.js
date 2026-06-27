import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });
  const db = await getDb();
  const lista = await db
    .collection("empreendimentos")
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
  const existe = await db
    .collection("empreendimentos")
    .findOne({ slug: doc.slug });
  if (existe) {
    return NextResponse.json(
      { ok: false, erro: "Já existe um empreendimento com esse slug." },
      { status: 409 }
    );
  }

  delete doc._id;
  await db.collection("empreendimentos").insertOne(doc);
  return NextResponse.json({ ok: true, slug: doc.slug });
}
