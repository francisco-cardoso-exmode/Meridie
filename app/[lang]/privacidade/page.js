import L from "@/components/L";
import { getEmpresa } from "@/lib/config";
import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Política de Privacidade"),
    description: t(lang, "Como a Meridie Investments recolhe, usa e protege os teus dados pessoais, e quais os teus direitos ao abrigo do RGPD."),
    alternates: alternates(lang, "/privacidade"),
  };
}

export const dynamic = "force-dynamic";

export default async function PrivacidadePage({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const emp = await getEmpresa();
  const denom = emp.denominacao || "Meridie Investments";
  const nif = emp.nif || t(lang, "[NIF a indicar]");
  const morada = emp.morada || t(lang, "[morada a indicar]");
  const email = emp.email || "geral@meridie.pt";
  return (
    <div className="pagina-area">
      <div className="container legal">
        <h1>{T("Política de Privacidade")}</h1>
        <p className="legal-data">{T("Última atualização: 28 de junho de 2026")}</p>

        <p>
          {T("A presente Política explica como a")}{" "}<strong>{T("Meridie Investments")}</strong>{" "}{T("trata os dados pessoais dos utilizadores deste site, em conformidade com o Regulamento Geral sobre a Proteção de Dados (RGPD — Regulamento (UE) 2016/679) e a legislação nacional aplicável.")}
        </p>

        <h2>{T("1. Responsável pelo tratamento")}</h2>
        <p>
          {tf(lang, "{denom}, NIF {nif}, com sede em {morada}. Contacto para assuntos de privacidade:", { denom, nif, morada })}{" "}
          <strong>{email}</strong>.
        </p>

        <h2>{T("2. Que dados recolhemos")}</h2>
        <ul>
          <li>
            <strong>{T("Dados de contacto que nos forneces")}</strong>{" "}{T("através dos formulários (nome, email e a mensagem/assunto que escreves).")}
          </li>
          <li>
            <strong>{T("Dados de navegação anónimos")}</strong>{" "}{T("— páginas e empreendimentos vistos, pesquisas e filtros usados, e o país de acesso. Não guardamos o teu endereço IP.")}
          </li>
          <li>
            <strong>{T("Cookies de análise")}</strong>{" "}{T("(Google Analytics), apenas se deres o teu consentimento — ver a")}{" "}<L href="/cookies">{T("Política de Cookies")}</L>.
          </li>
        </ul>

        <h2>{T("3. Para que usamos os dados e com que base legal")}</h2>
        <ul>
          <li>
            <strong>{T("Responder aos teus pedidos de contacto")}</strong>{" "}{T("e dar seguimento ao interesse num empreendimento — base legal: diligências pré-contratuais e o teu consentimento.")}
          </li>
          <li>
            <strong>{T("Melhorar o site e perceber como é usado")}</strong>{" "}{T("(estatísticas) — base legal: interesse legítimo (dados anónimos) e, para os cookies de análise, o teu consentimento.")}
          </li>
        </ul>

        <h2>{T("4. Durante quanto tempo guardamos")}</h2>
        <p>
          {T("Os pedidos de contacto são guardados pelo período necessário para dar resposta e gerir a relação, e depois eliminados ou anonimizados. As estatísticas são tratadas de forma agregada.")}
        </p>

        <h2>{T("5. Com quem partilhamos")}</h2>
        <p>
          {T("Não vendemos os teus dados. Recorremos a prestadores que nos ajudam a operar o serviço — alojamento do site (Vercel), envio de emails e, com consentimento, o Google Analytics. Estes tratam os dados por nossa conta e segundo as nossas instruções.")}
        </p>

        <h2>{T("6. Os teus direitos")}</h2>
        <p>
          {T("Tens direito a aceder, retificar, apagar, limitar ou opor-te ao tratamento dos teus dados, bem como à portabilidade e a retirar o consentimento a qualquer momento. Para exercer estes direitos, contacta")}{" "}<strong>{email}</strong>{T(". Podes também apresentar reclamação à autoridade de controlo (em Portugal, a CNPD —")}{" "}
          <a href="https://www.cnpd.pt" target="_blank" rel="noopener">{T("www.cnpd.pt")}</a>).
        </p>

        <h2>{T("7. Segurança")}</h2>
        <p>
          {T("Adotamos medidas técnicas e organizativas adequadas para proteger os dados contra acesso, perda ou alteração não autorizados.")}
        </p>

        <h2>{T("8. Alterações")}</h2>
        <p>
          {T("Esta Política pode ser atualizada. A data no topo indica a última versão.")}
        </p>

        <p className="legal-nota">
          {T("Este texto é um modelo de boa-fé e não substitui aconselhamento jurídico. Confirma os dados da empresa e o seu enquadramento com um profissional antes de publicar.")}
        </p>
      </div>
    </div>
  );
}
