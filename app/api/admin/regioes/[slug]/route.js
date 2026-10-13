import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });

  const { slug } = await params;
  const doc = await request.json().catch(() => null);
  if (!doc) return NextResponse.json({ ok: false }, { status: 400 });

  delete doc._id;
  delete doc.enFonte;
  doc.slug = slug;

  const db = await getDb();
  const antes = await db.collection("regioes").findOne({ slug }, { projection: { en: 1 } });
  const r = await db.collection("regioes").updateOne({ slug }, { $set: doc });
  if (!r.matchedCount)
    return NextResponse.json({ ok: false, erro: "Não encontrado." }, { status: 404 });
  revalidaSite();
  after(() => traduzirEmFundo("regioes", slug, antes?.en ?? null));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = await params;
  const db = await getDb();
  await db.collection("regioes").deleteOne({ slug });
  revalidaSite();
  return NextResponse.json({ ok: true });
}
