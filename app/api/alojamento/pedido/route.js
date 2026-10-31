import { NextResponse } from "next/server";
import { casaPublica } from "@/lib/al/casas";
import { criarPedido } from "@/lib/al/reservas";
import { erroDatas, hojeLisboa, noitesEntre } from "@/lib/al/regras";
import { texto, emailValido } from "@/lib/al/validacao";
import { avisarEquipa, emailPedidoHospede } from "@/lib/al/emails";
import { provaValida } from "@/lib/provaTrabalho";
import { dentroDoLimite, ipDe } from "@/lib/rateLimit";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

const erro = (msg, status = 400) => NextResponse.json({ ok: false, erro: msg }, { status });

/**
 * "Pedir reserva" na página de uma casa. Cria uma reserva em estado "pedido"
 * (ainda não ocupa o calendário) e avisa a equipa e o hóspede. Anti-bot:
 * honeypot, prova de trabalho (lib/provaTrabalho.js) e limite por IP.
 * Sem pagamento online nesta fase.
 */
export async function POST(request) {
  const d = await request.json().catch(() => null);
  if (!d || typeof d !== "object" || Array.isArray(d)) return erro("Pedido inválido.");
  if (d.website) return NextResponse.json({ ok: true }); // honeypot: finge que correu bem

  const nome = texto(d.nome, 100);
  const email = texto(d.email, 254).toLowerCase();
  const telefone = texto(d.telefone, 40);
  const mensagem = texto(d.mensagem, 2000);
  const hospedes = Math.round(Number(d.hospedes));
  const lang = d.lang === "en" ? "en" : "pt";
  if (!nome || !emailValido(email)) return erro("Indica o teu nome e um email válido.");
  if (!Number.isFinite(hospedes) || hospedes < 1) return erro("Indica o número de hóspedes.");

  if (!(await provaValida(d.prova)))
    return erro("Não foi possível validar o envio. Recarrega a página e tenta novamente.");
  const ip = ipDe(request);
  const [curto, diario] = await Promise.all([
    dentroDoLimite(`al-pedido:${ip}`, 3, 10 * 60),
    dentroDoLimite(`al-pedido-dia:${ip}`, 10, 24 * 60 * 60),
  ]);
  if (!curto || !diario) return erro("Demasiados pedidos. Tenta novamente daqui a alguns minutos.", 429);

  const r = await casaPublica(typeof d.casa === "string" ? d.casa : "");
  if (!r) return erro("Esta casa já não está disponível.", 404);
  const { casa, ocupadas } = r;
  const invalidas = erroDatas({ entrada: d.entrada, saida: d.saida, hoje: hojeLisboa(), estadiaMinima: casa.estadiaMinima });
  if (invalidas) return erro(invalidas);
  if (casa.capacidade && hospedes > casa.capacidade) return erro("Esta casa não tem capacidade para tantos hóspedes.");
  const ocupado = new Set(ocupadas);
  for (let i = 0, n = noitesEntre(d.entrada, d.saida); i < n; i++) {
    const dia = new Date(Date.parse(`${d.entrada}T00:00:00Z`) + i * 86400000).toISOString().slice(0, 10);
    if (ocupado.has(dia)) return erro("Algumas destas noites já estão ocupadas. Escolhe outras datas.");
  }

  try {
    const id = await criarPedido({
      casa,
      hospede: { nome, email, telefone },
      entrada: d.entrada,
      saida: d.saida,
      hospedes,
      mensagem,
      lang,
    });
    await avisarEquipa({
      assunto: `Pedido de reserva — ${casa.titulo}`,
      titulo: "Novo pedido de reserva",
      campos: [
        ["Casa", casa.titulo],
        ["Datas", `${d.entrada} → ${d.saida}`],
        ["Hóspedes", hospedes],
        ["Nome", nome],
        ["Email", email],
        ["Telefone", telefone],
        ["Mensagem", mensagem],
      ],
      link: `${SITE_URL}/admin/alojamento/reservas?id=${id}`,
      replyTo: email,
    }).catch((e) => console.error("aviso pedido:", e?.message || e));
    await emailPedidoHospede({ para: email, nome, casa: casa.titulo, entrada: d.entrada, saida: d.saida, lang }).catch((e) =>
      console.error("email pedido hóspede:", e?.message || e)
    );
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("pedido de reserva:", e);
    return erro("Ocorreu um erro ao enviar o pedido. Tenta novamente.", 500);
  }
}
