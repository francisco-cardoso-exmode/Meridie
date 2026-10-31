import "@/components/al/al.css";
import L from "@/components/L";
import Calculadora from "@/components/al/Calculadora";
import { t } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { getConfigAl } from "@/lib/al/config";
import PassosAl from "@/components/al/PassosAl";
import { getConteudo } from "@/lib/conteudo";

export const revalidate = 300;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/inscreve-a-tua-casa", {
    titulo: t(lang, "Inscreve a tua casa em alojamento local"),
    descricao: t(lang, "Anunciamos e gerimos a tua casa em alojamento local em Portugal e no Brasil. Sem custos de entrada, sem fidelização. Calcula quanto podes ganhar."),
  });
}

export default async function InscreveCasa({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const [{ planos }, c] = await Promise.all([getConfigAl(), getConteudo("alojamento", lang)]);

  const vantagens = [
    ["📸", "Inspeção fotográfica a cada estadia", "Antes de cada entrada e depois de cada saída, a nossa equipa fotografa todas as divisões. Vês tudo na tua área — e o hóspede vê o estado em que recebeu a casa."],
    ["🔑", "Reservas diretas, menos comissões", "Além do Airbnb e do Booking, a tua casa aparece no nosso site, onde o hóspede reserva diretamente — sem a comissão da plataforma."],
    ["📊", "Ganhos claros, mês a mês", "Vês as reservas, o calendário e quanto recebes em cada mês, com cada comissão separada."],
    ["🤝", "Sem custos de entrada nem fidelização", "0 € de adesão. Sais quando quiseres, com 30 dias de aviso."],
  ];

  const linhasComparacao = [
    ["Quem cria e mantém o anúncio", "Tu", "Co-anfitrião", "Nós", "Nós"],
    ["Mensagens e apoio aos hóspedes", "Tu", "Co-anfitrião", "Tu", "Nós"],
    ["Check-in, limpezas e lavandaria", "Tu", "Varia", "Tu", "Nós"],
    ["Inspeção fotográfica a cada estadia", "—", "Raramente", "Opcional", "Incluída"],
    ["Reservas diretas no nosso site", "—", "—", "Sim", "Sim"],
    ["Comissão (sobre a estadia, após a plataforma)", "0%", "Estimativa: 15–25%", `${planos.anuncio}%`, `${planos.gestao}% (${planos.reduzida}% com 2+ casas)`],
  ];

  return (
    <div className="al-landing">
      <section className="page-hero al-hero">
        <div className="container">
          <span className="eyebrow">{T("Para proprietários")}</span>
          <h1>{T("A tua casa a render, sem dores de cabeça")}</h1>
          <p>{T("Anunciamos e gerimos a tua casa em alojamento local, em Portugal e no Brasil. Tu escolhes até onde vamos.")}</p>
          <div className="actions">
            <L href="/proprietario/entrar?registo=1" className="btn btn-primary">
              {T("Inscrever a minha casa")}
            </L>{" "}
            <a href="#calculadora" className="btn btn-outline">
              {T("Calcular quanto posso ganhar")}
            </a>
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="grid grid-2 al-vantagens">
            {vantagens.map(([ic, tit, txt]) => (
              <div className="card" key={tit}>
                <div className="al-icone" aria-hidden="true">
                  {ic}
                </div>
                <h3>{T(tit)}</h3>
                <p>{T(txt)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{T("Planos")}</span>
            <h2>{T("Escolhe como queres trabalhar connosco")}</h2>
          </div>
          <div className="grid grid-2 al-planos">
            <div className="card al-plano">
              <h3>{T("Anúncio")}</h3>
              <div className="al-plano-pct">{planos.anuncio}%</div>
              <p>{T("Tu operas a casa (check-ins, limpezas, hóspedes). Nós anunciamos no nosso site — e no Airbnb/Booking — e trazemos reservas diretas.")}</p>
            </div>
            <div className="card al-plano destaque">
              <h3>{T("Gestão completa")}</h3>
              <div className="al-plano-pct">
                {planos.gestao}% <small>· {planos.reduzida}% {T("com 2+ casas ou se compraste através da Meridie")}</small>
              </div>
              <p>{T("Tratamos de tudo: anúncios, preços, hóspedes, check-in, limpezas e inspeções fotográficas a cada estadia. Tu só recebes.")}</p>
            </div>
          </div>
          <ul className="value-list al-condicoes">
            <li>✓ {T("0 € de adesão")}</li>
            <li>✓ {T("Sem fidelização — 30 dias de aviso para sair")}</li>
            <li>✓ {T("Comissão sobre o valor da estadia depois da comissão da plataforma, sem limpeza nem taxa turística")}</li>
            <li>✓ {T("Limpeza paga pelo hóspede, ao custo")}</li>
          </ul>
        </div>
      </section>

      <section>
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{T("Comparação")}</span>
            <h2>{T("Sozinho, com co-anfitrião ou com a Meridie")}</h2>
            <p className="al-nota">{T("Comparação qualitativa; os valores de terceiros são estimativas e variam de caso para caso.")}</p>
          </div>
          <div className="al-tabela-wrap">
            <table className="al-tabela al-comparar">
              <thead>
                <tr>
                  <th />
                  <th>{T("Sozinho no Airbnb")}</th>
                  <th>{T("Co-anfitrião")}</th>
                  <th>Meridie · {T("Anúncio")}</th>
                  <th>Meridie · {T("Gestão completa")}</th>
                </tr>
              </thead>
              <tbody>
                {linhasComparacao.map(([rot, ...cols]) => (
                  <tr key={rot}>
                    <th scope="row">{T(rot)}</th>
                    {cols.map((c, i) => (
                      <td key={i}>{T(c)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <PassosAl eyebrow={c.recebesEyebrow} titulo={c.recebesTitulo} texto={c.recebesTexto} passos={c.passosRecebes} />
        </div>
      </section>

      <section id="calculadora">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">{T("Estimativa")}</span>
            <h2>{T("Quanto podes receber por mês")}</h2>
          </div>
          <Calculadora planos={planos} />
        </div>
      </section>

      <section className="cta-band">
        <div className="container">
          <h2>{T("Pronto para começar?")}</h2>
          <p>{T("Cria a tua conta, regista a casa e a nossa equipa entra em contacto.")}</p>
          <L href="/proprietario/entrar?registo=1" className="btn btn-primary">
            {T("Inscrever a minha casa")}
          </L>
        </div>
      </section>
    </div>
  );
}
