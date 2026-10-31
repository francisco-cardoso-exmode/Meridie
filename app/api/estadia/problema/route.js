import { NextResponse } from "next/server";
import { reservaPorToken, adicionarProblema } from "@/lib/al/reservas";
import { texto, listaFotos } from "@/lib/al/validacao";
import { avisarEquipa } from "@/lib/al/emails";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

// "Reportar um problema" na página da estadia (token do link no corpo, não no URL).
export async function POST(request) {
  const b = (await request.json().catch(() => null)) || {};
  if (!(await dentroDoLimite(`al-problema:${ipDe(request)}`, 10, 60 * 60)))
    return erro("Demasiados pedidos. Tenta novamente daqui a alguns minutos.", 429);
  const r = await reservaPorToken(b.token);
  if (!r) return erro("Este link já não é válido.", 404);
  const msg = texto(b.texto, 3000);
  const fotos = listaFotos(b.fotos, 10);
  if (!msg && !fotos.length) return erro("Descreve o problema ou junta uma foto.");
  try {
    await adicionarProblema(r.id, { texto: msg, fotos });
    await avisarEquipa({
      assunto: `Problema reportado — ${r.casaTitulo || r.casaSlug}`,
      titulo: "Problema reportado pelo hóspede",
      campos: [
        ["Casa", r.casaTitulo || r.casaSlug],
        ["Datas", `${r.entrada} → ${r.saida}`],
        ["Hóspede", `${r.hospede?.nome || ""} <${r.hospede?.email || ""}> ${r.hospede?.telefone || ""}`],
        ["Problema", msg],
        ["Fotos", fotos.length ? fotos.join("\n") : ""],
      ],
      link: `${SITE_URL}/admin/alojamento/reservas?id=${r.id}`,
      replyTo: r.hospede?.email,
    }).catch((e) => console.error("aviso problema:", e?.message || e));
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("problema estadia:", e);
    return erro("Ocorreu um erro. Tenta novamente.", 500);
  }
}
