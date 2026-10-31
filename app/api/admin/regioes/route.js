import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { isAdmin } from "@/lib/adminAuth";
import { criar } from "@/lib/crudAdmin";

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
  return criar(request, "regioes", {
    msgDuplicado: "Já existe uma região/zona com esse slug.",
  });
}
