import { SITE_URL } from "@/lib/site";
import { caminho } from "@/lib/i18n";
import { casaPorSlug } from "@/lib/al/casas";
import { proprietarioPorId } from "@/lib/al/contas";
import { emailConfirmacaoHospede, avisarProprietario } from "@/lib/al/emails";
import { emailValido } from "@/lib/al/validacao";

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
