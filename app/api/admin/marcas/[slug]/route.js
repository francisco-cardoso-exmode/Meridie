import { NextResponse, after } from "next/server";
import { traduzirEmFundo } from "@/lib/traducao";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { garanteSeed } from "@/lib/marcas";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";
// A tradução para inglês corre em segundo plano depois de responder.
export const maxDuration = 120;

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = await params;
  const doc = await request.json().catch(() => null);
  if (!doc) return NextResponse.json({ ok: false }, { status: 400 });
  delete doc._id;
  delete doc.enFonte;
  doc.slug = slug;
  const col = await garanteSeed(await getDb());
  const antes = await col.findOne({ slug }, { projection: { en: 1 } });
  const r = await col.updateOne({ slug }, { $set: doc });
  after(() => traduzirEmFundo("marcas", slug, antes?.en ?? null));
  if (!r.matchedCount) return NextResponse.json({ ok: false }, { status: 404 });
  revalidaSite();
  return NextResponse.json({ ok: true });
}

export async function DELETE(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = await params;
  const col = await garanteSeed(await getDb());
  await col.deleteOne({ slug });
  revalidaSite();
  return NextResponse.json({ ok: true });
}
