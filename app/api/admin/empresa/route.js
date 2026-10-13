import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";
import { getEmpresa, setEmpresa } from "@/lib/config";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, empresa: await getEmpresa() });
}

export async function POST(request) {
  if (!(await isAdmin())) return NextResponse.json({ ok: false }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  await setEmpresa(body);
  revalidaSite();
  return NextResponse.json({ ok: true });
}
