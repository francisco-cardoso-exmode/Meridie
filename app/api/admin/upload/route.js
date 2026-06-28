import { put } from "@vercel/blob";
import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Upload simples pelo servidor: recebe o ficheiro e guarda no Vercel Blob.
// Só usa BLOB_READ_WRITE_TOKEN (sem webhooks/tokens de cliente).
export async function POST(request) {
  if (!(await isAdmin()))
    return NextResponse.json({ ok: false, erro: "Não autorizado" }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, erro: "Sem ficheiro." }, { status: 400 });
    }
    const nome = file.name || `upload-${Date.now()}`;
    const blob = await put(nome, file, { access: "public", addRandomSuffix: true });
    return NextResponse.json({ ok: true, url: blob.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, erro: e?.message || "Falha no upload." },
      { status: 500 }
    );
  }
}
