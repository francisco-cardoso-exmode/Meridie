import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";
import { casaPorSlug } from "@/lib/al/casas";
import { proprietarioPorId } from "@/lib/al/contas";
import { emailConfirmacaoHospede, emailPagamentoHospede, avisarProprietario, avisarEquipa } from "@/lib/al/emails";
import { emailValido } from "@/lib/al/validacao";
import { formatarValor, totalHospede } from "@/lib/al/regras";
import { pagamentoDisponivel } from "@/lib/pagamentos";

/** Link pessoal da estadia do hóspede. */
export const linkEstadia = (token, lang = "pt") => `${SITE_URL}${caminho(lang, `/estadia/${token}`)}`;

/**
 * Depois de confirmar uma reserva: manda ao hóspede o link da estadia (se
 * houver email — nas reservas do Airbnb o email pode ser o mascarado da
 * plataforma) e avisa o proprietário. Nunca lança: devolve o link.
 */
export async function avisarConfirmacao(reserva, token) {
  const link = linkEstadia(token, reserva.idioma);
  const email = reserva.hospede?.email;
  let emailEnviado = false;
  if (emailValido(email)) {
    try {
      await emailConfirmacaoHospede({
        para: email,
        nome: reserva.hospede?.nome,
        casa: reserva.casaTitulo || reserva.casaSlug,
        entrada: reserva.entrada,
        saida: reserva.saida,
        link,
        lang: reserva.idioma,
        // Reserva direta ainda por pagar e pagamento online ligado: pede o pagamento.
        aPagar:
          reserva.origem === "direta" && reserva.pagamento?.estado !== "pago" && pagamentoDisponivel(reserva.pais)
            ? formatarValor(totalHospede(reserva), reserva.moeda || "EUR", reserva.idioma, { decimais: 2 })
            : null,
      });
      emailEnviado = true;
    } catch (e) {
      console.error("email confirmação hóspede:", e?.message || e);
    }
  }
  try {
    const casa = await casaPorSlug(reserva.casaSlug);
    const dono = casa && (await proprietarioPorId(casa.proprietarioId));
    if (dono?.email)
      await avisarProprietario({
        para: dono.email,
        assunto: `Nova reserva confirmada — ${casa.titulo}`,
        titulo: "Nova reserva confirmada",
        paragrafos: [`"${casa.titulo}": ${reserva.entrada} → ${reserva.saida} (${reserva.noites} noites).`],
        link: `${SITE_URL}/proprietario/casas/${casa.slug}`,
        rotulo: "Ver na minha área",
      });
  } catch (e) {
    console.error("aviso proprietário reserva:", e?.message || e);
  }
  return { link, emailEnviado };
}

/**
 * Pagamento recebido / reembolsado / em duplicado (vindo do webhook): avisa a
 * equipa e, quando fica pago, manda o recibo simples ao hóspede. Pode lançar.
 */
export async function avisarPagamento(reserva, { estado, duplicado }) {
  const valor = formatarValor(reserva.pagamento?.valorPago ?? totalHospede(reserva), reserva.moeda || "EUR", "pt", { decimais: 2 });
  const titulo = duplicado
    ? "Pagamento em duplicado — reembolsar no Stripe"
    : estado === "reembolsado"
      ? "Reserva reembolsada"
      : "Pagamento recebido";
  await avisarEquipa({
    assunto: `${titulo} — ${reserva.casaTitulo || reserva.casaSlug}`,
    titulo,
    campos: [
      ["Casa", reserva.casaTitulo || reserva.casaSlug],
      ["Datas", `${reserva.entrada} → ${reserva.saida}`],
      ["Hóspede", `${reserva.hospede?.nome || ""} <${reserva.hospede?.email || ""}>`],
      ["Valor", valor],
    ],
    link: `${SITE_URL}/admin/alojamento/reservas?q=${reserva.id}`,
  });
  if (estado === "pago" && !duplicado && emailValido(reserva.hospede?.email))
    await emailPagamentoHospede({
      para: reserva.hospede.email,
      nome: reserva.hospede?.nome,
      casa: reserva.casaTitulo || reserva.casaSlug,
      entrada: reserva.entrada,
      saida: reserva.saida,
      valor: formatarValor(reserva.pagamento?.valorPago ?? totalHospede(reserva), reserva.moeda || "EUR", reserva.idioma, { decimais: 2 }),
      lang: reserva.idioma,
    });
}
