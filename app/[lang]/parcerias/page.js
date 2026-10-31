import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

// Revalida de hora a hora (o rodapé mostra dados da empresa do backoffice).
export const revalidate = 3600;
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/parcerias", {
    titulo: t(lang, "Parcerias"),
    descricao: t(lang, "A rede Meridie reúne corretores certificados, advogados e contabilistas verificados em Portugal e no Brasil. Conheça os nossos parceiros ou candidate-se a integrar a rede."),
  });
}

export default async function Parcerias({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("parcerias", lang);
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.redeEyebrow}</span>
            <h2>{c.redeTitulo}</h2>
          </Reveal>
          <div className="profile-grid">
            {c.rede.map((p, i) => (
              <Reveal className="profile-card" key={p.id} delay={(i % 2) * 0.1}>
                {p.icone && <div className="pico"><Icon name={p.icone} /></div>}
                <div>
                  <h3 style={{ fontSize: "1.15rem", marginBottom: 6 }}>{p.titulo}</h3>
                  <p>{p.texto}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-soft">
        <div className="container">
          <div className="grid grid-2" style={{ alignItems: "center", gap: 48 }}>
            <Reveal>
              <span className="eyebrow">{c.parceiroEyebrow}</span>
              <h2 style={{ fontSize: "1.9rem", marginBottom: 14 }}>
                {c.parceiroTitulo}
              </h2>
              <p style={{ marginBottom: 14 }}>{c.parceiroTexto}</p>
              <L href="/contactos" className="btn btn-primary">
                {T("Candidatar-me à rede")}
              </L>
            </Reveal>
            <Reveal as="ul" delay={0.1} className="value-list">
              {c.parceiroVantagens.map((v) => (
                <li key={v.id}>
                  <span className="check"><Icon name="check" size={18} /></span>
                  <span>{v.texto}</span>
                </li>
              ))}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
