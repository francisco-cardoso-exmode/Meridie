import L from "@/components/L";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Política de Cookies"),
    description: t(lang, "O que são cookies, quais a Meridie Investments utiliza e como podes gerir o teu consentimento."),
    alternates: alternates(lang, "/cookies"),
  };
}

export default async function CookiesPage({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  return (
    <div className="pagina-area">
      <div className="container legal">
        <h1>{T("Política de Cookies")}</h1>
        <p className="legal-data">{T("Última atualização: 28 de junho de 2026")}</p>

        <p>
          {T("Os cookies são pequenos ficheiros guardados no teu dispositivo quando visitas um site. Servem para o fazer funcionar e, com a tua autorização, para perceber como é utilizado.")}
        </p>

        <h2>{T("Cookies que utilizamos")}</h2>
        <ul>
          <li>
            <strong>{T("Essenciais")}</strong>{" "}{T("— necessários ao funcionamento do site e para guardar a tua escolha de consentimento. Não precisam de autorização.")}
          </li>
          <li>
            <strong>{T("De análise (Google Analytics)")}</strong>{" "}{T("— ajudam-nos a perceber que páginas e empreendimentos são mais vistos, para melhorar o site. Só são ativados se clicares em")}{" "}<strong>{T("Aceitar")}</strong>{" "}{T("no aviso de cookies.")}
          </li>
        </ul>

        <h2>{T("Estatísticas sem cookies")}</h2>
        <p>
          {T("Medimos também, de forma")}{" "}<strong>{T("anónima e sem cookies")}</strong>{T(", as páginas vistas, pesquisas e filtros usados (sem guardar o teu IP). Estes dados não te identificam.")}
        </p>

        <h2>{T("Como gerir o consentimento")}</h2>
        <p>
          {T("Podes")}{" "}<strong>{T("aceitar ou rejeitar")}</strong>{" "}{T("os cookies de análise no aviso que surge ao entrar. Para mudar de ideias mais tarde, limpa os dados do site no teu navegador (o aviso volta a aparecer) ou ajusta as definições de cookies do navegador. Também podes desativar cookies diretamente nas opções do teu browser.")}
        </p>

        <p>
          {T("Para saber como tratamos os dados, vê a")}{" "}
          <L href="/privacidade">{T("Política de Privacidade")}</L>.
        </p>

        <p className="legal-nota">
          {T("Este texto é um modelo de boa-fé e não substitui aconselhamento jurídico.")}
        </p>
      </div>
    </div>
  );
}
