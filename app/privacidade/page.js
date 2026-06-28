import Link from "next/link";
import { getEmpresa } from "@/lib/config";

export const metadata = {
  title: "Política de Privacidade",
  description:
    "Como a Meridie Investments recolhe, usa e protege os teus dados pessoais, e quais os teus direitos ao abrigo do RGPD.",
};

export const dynamic = "force-dynamic";

export default async function PrivacidadePage() {
  const emp = await getEmpresa();
  const denom = emp.denominacao || "Meridie Investments";
  const nif = emp.nif || "[NIF a indicar]";
  const morada = emp.morada || "[morada a indicar]";
  const email = emp.email || "geral@meridie.pt";
  return (
    <div className="pagina-area">
      <div className="container legal">
        <h1>Política de Privacidade</h1>
        <p className="legal-data">Última atualização: 28 de junho de 2026</p>

        <p>
          A presente Política explica como a <strong>Meridie Investments</strong> trata os
          dados pessoais dos utilizadores deste site, em conformidade com o Regulamento
          Geral sobre a Proteção de Dados (RGPD — Regulamento (UE) 2016/679) e a legislação
          nacional aplicável.
        </p>

        <h2>1. Responsável pelo tratamento</h2>
        <p>
          {denom}, NIF {nif}, com sede em {morada}. Contacto para assuntos de privacidade:{" "}
          <strong>{email}</strong>.
        </p>

        <h2>2. Que dados recolhemos</h2>
        <ul>
          <li>
            <strong>Dados de contacto que nos forneces</strong> através dos formulários
            (nome, email e a mensagem/assunto que escreves).
          </li>
          <li>
            <strong>Dados de navegação anónimos</strong> — páginas e empreendimentos vistos,
            pesquisas e filtros usados, e o país de acesso. Não guardamos o teu endereço IP.
          </li>
          <li>
            <strong>Cookies de análise</strong> (Google Analytics), apenas se deres o teu
            consentimento — ver a <Link href="/cookies">Política de Cookies</Link>.
          </li>
        </ul>

        <h2>3. Para que usamos os dados e com que base legal</h2>
        <ul>
          <li>
            <strong>Responder aos teus pedidos de contacto</strong> e dar seguimento ao
            interesse num empreendimento — base legal: diligências pré-contratuais e o teu
            consentimento.
          </li>
          <li>
            <strong>Melhorar o site e perceber como é usado</strong> (estatísticas) — base
            legal: interesse legítimo (dados anónimos) e, para os cookies de análise, o teu
            consentimento.
          </li>
        </ul>

        <h2>4. Durante quanto tempo guardamos</h2>
        <p>
          Os pedidos de contacto são guardados pelo período necessário para dar resposta e
          gerir a relação, e depois eliminados ou anonimizados. As estatísticas são tratadas
          de forma agregada.
        </p>

        <h2>5. Com quem partilhamos</h2>
        <p>
          Não vendemos os teus dados. Recorremos a prestadores que nos ajudam a operar o
          serviço — alojamento do site (Vercel), envio de emails e, com consentimento, o
          Google Analytics. Estes tratam os dados por nossa conta e segundo as nossas
          instruções.
        </p>

        <h2>6. Os teus direitos</h2>
        <p>
          Tens direito a aceder, retificar, apagar, limitar ou opor-te ao tratamento dos teus
          dados, bem como à portabilidade e a retirar o consentimento a qualquer momento. Para
          exercer estes direitos, contacta <strong>{email}</strong>. Podes também
          apresentar reclamação à autoridade de controlo (em Portugal, a CNPD —{" "}
          <a href="https://www.cnpd.pt" target="_blank" rel="noopener">www.cnpd.pt</a>).
        </p>

        <h2>7. Segurança</h2>
        <p>
          Adotamos medidas técnicas e organizativas adequadas para proteger os dados contra
          acesso, perda ou alteração não autorizados.
        </p>

        <h2>8. Alterações</h2>
        <p>
          Esta Política pode ser atualizada. A data no topo indica a última versão.
        </p>

        <p className="legal-nota">
          Este texto é um modelo de boa-fé e não substitui aconselhamento jurídico. Confirma
          os dados da empresa e o seu enquadramento com um profissional antes de publicar.
        </p>
      </div>
    </div>
  );
}
