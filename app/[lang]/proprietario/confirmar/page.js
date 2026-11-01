import L from "@/components/L";
import Icon from "@/components/Icon";
import { t } from "@/lib/i18n";
import { metaPrivada } from "@/lib/al/paginas";
import { confirmarEmailProprietario } from "@/lib/al/contas";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Confirmar email");
}

/** Link do email de boas-vindas: confirma o email do proprietário. */
export default async function ConfirmarEmail({ params, searchParams }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const email = await confirmarEmailProprietario((await searchParams)?.t).catch(() => null);
  return (
    <div className="container al-pagina al-estreita">
      <div className="al-cartao al-conta">
        {email ? (
          <>
            <h1 className="al-ok">
              <Icon name="check" size={26} /> {T("Email confirmado")}
            </h1>
            <p>{T("Obrigado! Já podes ligar a tua conta bancária para receberes os pagamentos das reservas.")}</p>
          </>
        ) : (
          <>
            <h1>{T("Link inválido ou expirado")}</h1>
            <p>{T("Entra na tua área de proprietário e pede um novo email de confirmação.")}</p>
          </>
        )}
        <L href="/proprietario" className="al-btn al-btn-grande">
          {T("Ir para a minha área")}
        </L>
      </div>
    </div>
  );
}
