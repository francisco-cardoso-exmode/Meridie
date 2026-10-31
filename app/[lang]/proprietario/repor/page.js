import { ReporPasswordAl } from "@/components/al/ContaAl";
import { caminho, t } from "@/lib/i18n";
import { metaPrivada } from "@/lib/al/paginas";
import L from "@/components/L";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Nova password");
}

// Link do email "Esqueci-me da password": abrir a página não gasta o token
// (os antivírus abrem links sozinhos) — só o botão "Guardar".
export default async function ReporProprietario({ params, searchParams }) {
  const { lang } = await params;
  const { t: token } = await searchParams;
  const valido = typeof token === "string" && /^[a-f0-9]{64}$/.test(token);
  return (
    <div className="container al-pagina al-estreita">
      {valido ? (
        <ReporPasswordAl papel="proprietario" token={token} destino={caminho(lang, "/proprietario")} />
      ) : (
        <div className="al-cartao">
          <p>{t(lang, "Este link já foi usado ou expirou. Pede um novo.")}</p>
          <L href="/proprietario/entrar">{t(lang, "Entrar")}</L>
        </div>
      )}
    </div>
  );
}
