import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request) {
  const { password } = await request.json().catch(() => ({}));

  if (password && password === process.env.ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("meridie_admin", process.env.ADMIN_SESSION || "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 horas
    });
    return res;
  }

  return NextResponse.json(
    { ok: false, erro: "Password incorreta." },
    { status: 401 }
  );
}
