import { t, tf, traduzDoc, traduzLista, alternates } from "@/lib/i18n";
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return {
    title: t(lang, "Termos e Condições"),
    description: t(lang, "Termos e condições de utilização do site da Meridie Investments."),
    alternates: alternates(lang, "/termos"),
  };
}

export default async function TermosPage({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  return (
    <div className="pagina-area">
      <div className="container legal">
        <h1>{T("Termos e Condições de Utilização")}</h1>
        <p className="legal-data">{T("Última atualização: 28 de junho de 2026")}</p>

        <h2>{T("1. Objeto")}</h2>
        <p>
          {T("Estes termos regulam o acesso e a utilização do site da")}{" "}
          <strong>{T("Meridie Investments")}</strong>{T(", plataforma de intermediação de investimento imobiliário entre Portugal e o Brasil. Ao utilizar o site, aceitas estes termos.")}
        </p>

        <h2>{T("2. Natureza da informação")}</h2>
        <p>
          {T("A informação sobre empreendimentos, preços e condições tem caráter informativo e pode ser atualizada a qualquer momento. Não constitui uma oferta vinculativa nem aconselhamento financeiro, fiscal ou jurídico. Qualquer decisão de investimento deve ser confirmada com a nossa equipa e com os profissionais adequados.")}
        </p>

        <h2>{T("3. Utilização do site")}</h2>
        <p>
          {T("Comprometes-te a usar o site de forma lícita e a não realizar ações que possam danificar, sobrecarregar ou comprometer o seu funcionamento ou segurança.")}
        </p>

        <h2>{T("4. Propriedade intelectual")}</h2>
        <p>
          {T("A marca, os textos, o design e os demais conteúdos do site são propriedade da Meridie Investments ou dos respetivos titulares, não podendo ser reproduzidos sem autorização. As imagens de empreendimentos podem pertencer a terceiros e são usadas com finalidade informativa.")}
        </p>

        <h2>{T("5. Links externos")}</h2>
        <p>
          {T("O site pode conter ligações para sites de terceiros (parceiros, hotéis, redes sociais). Não somos responsáveis pelo conteúdo nem pelas práticas de privacidade desses sites.")}
        </p>

        <h2>{T("6. Limitação de responsabilidade")}</h2>
        <p>
          {T("Esforçamo-nos por manter a informação correta e atualizada, mas não garantimos a ausência de erros ou interrupções. Na medida permitida por lei, não nos responsabilizamos por decisões tomadas com base apenas na informação do site.")}
        </p>

        <h2>{T("7. Lei aplicável")}</h2>
        <p>
          {T("Estes termos regem-se pela lei portuguesa. Para a resolução de qualquer litígio são competentes os tribunais portugueses, sem prejuízo das normas aplicáveis ao consumidor.")}
        </p>

        <p className="legal-nota">
          {T("Este texto é um modelo de boa-fé e não substitui aconselhamento jurídico.")}
        </p>
      </div>
    </div>
  );
}
