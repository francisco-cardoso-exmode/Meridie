import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Accordion from "@/components/Accordion";
import { getConteudo } from "@/lib/conteudo";
import { t, tf } from "@/lib/i18n";
import { metaPagina, jsonLd } from "@/lib/seo";

// Revalida de hora a hora (o rodapé mostra dados da empresa do backoffice).
export const revalidate = 3600;
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/faq", {
    titulo: t(lang, "Perguntas Frequentes"),
    descricao: t(lang, "Respostas às dúvidas mais comuns sobre investir em imóveis entre Portugal e o Brasil — processo, fiscalidade, custos e honorários."),
  });
}

export default async function FAQ({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("faq", lang);
  // Perguntas seguidas com a mesma categoria formam um grupo.
  const categorias = [];
  for (const it of c.perguntas) {
    const ultima = categorias[categorias.length - 1];
    const item = { q: it.pergunta, a: it.resposta };
    if (ultima && ultima.cat === it.categoria) ultima.itens.push(item);
    else categorias.push({ cat: it.categoria, id: it.id, itens: [item] });
  }
  // Dados estruturados FAQPage (as mesmas perguntas e respostas da página).
  const ldFaq = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: categorias.flatMap((g) =>
      g.itens.map((it) => ({
        "@type": "Question",
        name: it.q,
        acceptedAnswer: { "@type": "Answer", text: it.a },
      }))
    ),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(ldFaq) }} />
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">{c.heroEyebrow}</span>
          <h1>{c.heroTitulo}</h1>
          <p>{c.heroTexto}</p>
        </div>
      </section>

      <section>
        <div className="container" style={{ maxWidth: 820 }}>
          {categorias.map((g) => (
            <Reveal key={g.id}>
              {g.cat && <div className="faq-cat">{g.cat}</div>}
              <Accordion itens={g.itens} />
            </Reveal>
          ))}

          <div className="cta-band" style={{ marginTop: 56 }}>
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <L href="/contactos" className="btn btn-primary">
              {T("Falar connosco")}
            </L>
          </div>
        </div>
      </section>
    </>
  );
}
