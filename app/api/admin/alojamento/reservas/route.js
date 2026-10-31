import { NextResponse } from "next/server";
import { isAdmin, utilizadorAtual } from "@/lib/adminAuth";
import { casaPorSlug } from "@/lib/al/casas";
import { criarReservaManual, reservaPorId } from "@/lib/al/reservas";
import { avisarConfirmacao } from "@/lib/al/avisos";
import { texto } from "@/lib/al/validacao";
import { revalidaSite } from "@/lib/revalida";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * Reserva criada à mão no backoffice (ex.: vinda do Airbnb/Booking, ou por
 * telefone). Com "confirmar", verifica sobreposições, cria as inspeções e
 * envia ao hóspede o link da estadia (se houver email).
 */
export async function POST(request) {
  if (!(await isAdmin())) return erro("A tua sessão expirou. Entra noutra janela e volta a guardar.", 401);
  const b = (await request.json().catch(() => null)) || {};
  const casa = await casaPorSlug(String(b.casaSlug || ""));
  if (!casa) return erro("Escolhe a casa.");
  const hospede = {
    nome: texto(b.hospede?.nome, 100),
    email: texto(b.hospede?.email, 254).toLowerCase(),
    telefone: texto(b.hospede?.telefone, 40),
  };
  if (!hospede.nome) return erro("Indica o nome do hóspede.");
  const r = await criarReservaManual({
    casa,
    hospede,
    entrada: b.entrada,
    saida: b.saida,
    valor: b.valor,
    limpeza: b.limpeza,
    origem: b.origem,
    confirmar: b.confirmar === true,
    nota: texto(b.nota, 1000),
    idioma: b.idioma,
    criadoPor: `admin:${(await utilizadorAtual()) || "global"}`,
  });
  if (r.erro) return erro(r.erro, 409);
  let aviso = null;
  if (r.token) aviso = await avisarConfirmacao(await reservaPorId(r.id), r.token);
  revalidaSite();
  return NextResponse.json({ ok: true, id: r.id, link: aviso?.link || null, emailEnviado: !!aviso?.emailEnviado });
}
