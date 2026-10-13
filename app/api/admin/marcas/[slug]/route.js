import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { garanteSeed } from "../seed";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const { slug } = await params;
  const doc = await request.json().catch(() => null);
  if (!doc) return NextResponse.json({ ok: false }, { status: 400 });
  delete doc._id;
  doc.slug = slug;
  const col = await garanteSeed(await getDb());
  const r = await col.updateOne({ slug }, { $set: doc });
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
