import { getDb } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

// Tipos de evento aceites (lista fechada para evitar lixo).
const TIPOS = new Set([
  "empreendimento_visto",
  "pesquisa",
  "filtro",
  "comparacao",
]);

export async function POST(request) {
  try {
    const { tipo, valor } = await request.json();
    if (!TIPOS.has(tipo)) {
      return Response.json({ ok: false }, { status: 400 });
    }
    const v = (valor || "").toString().trim().slice(0, 140);
    if (!v) return Response.json({ ok: true });

    // País de origem dado pela Vercel (sem guardar IP — privacidade/RGPD).
    const pais =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("x-country") ||
      "";

    const db = await getDb();
    await db.collection("eventos").insertOne({
      tipo,
      valor: v,
      pais,
      criadoEm: new Date(),
    });
    return Response.json({ ok: true });
  } catch {
    // Silencioso — tracking nunca pode partir a navegação.
    return Response.json({ ok: false }, { status: 200 });
  }
}
