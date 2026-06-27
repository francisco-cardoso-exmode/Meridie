import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getRedes, setRedes } from "@/lib/config";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, redes: await getRedes() });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  await setRedes({
    instagram: String(body.instagram || "").trim(),
    linkedin: String(body.linkedin || "").trim(),
  });
  return NextResponse.json({ ok: true });
}
