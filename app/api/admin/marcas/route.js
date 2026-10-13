import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { garanteSeed } from "./seed";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const doc = await request.json().catch(() => null);
  if (!doc?.slug || !doc?.nome)
    return NextResponse.json({ ok: false, erro: "Slug e nome obrigatórios." }, { status: 400 });
  const col = await garanteSeed(await getDb());
  if (await col.findOne({ slug: doc.slug }))
    return NextResponse.json({ ok: false, erro: "Já existe uma marca com esse nome." }, { status: 409 });
  delete doc._id;
  await col.insertOne(doc);
  revalidaSite();
  return NextResponse.json({ ok: true, slug: doc.slug });
}
