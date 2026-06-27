import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });

  const { slug } = await params;
  const doc = await request.json().catch(() => null);
  if (!doc) return NextResponse.json({ ok: false }, { status: 400 });

  delete doc._id;
  doc.slug = slug; // slug é a chave — não muda na edição

  const db = await getDb();
  const r = await db
    .collection("empreendimentos")
    .updateOne({ slug }, { $set: doc });
  if (!r.matchedCount)
    return NextResponse.json({ ok: false, erro: "Não encontrado." }, { status: 404 });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });

  const { slug } = await params;
  const db = await getDb();
  await db.collection("empreendimentos").deleteOne({ slug });
  return NextResponse.json({ ok: true });
}
