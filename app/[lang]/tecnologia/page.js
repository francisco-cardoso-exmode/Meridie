import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import { notFound } from "next/navigation";
import { getConteudo } from "@/lib/conteudo";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado } from "@/lib/seo";
import { traduzDoc, traduzLista } from "@/lib/i18n/conteudo";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  // Área escondida: a página dá 404, sem canonical nem "index".
  if (!TECNOLOGIA_VISIVEL) return metaNaoEncontrado(lang);
  const c = await getConteudo("tecnologia", lang);
  return metaPagina(lang, "/tecnologia", {
    titulo: t(lang, "Tecnologia"),
    descricao: c.heroTexto,
  });
}

export default async function PaginaTecnologia({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  if (!TECNOLOGIA_VISIVEL) notFound();
  const c = await getConteudo("tecnologia", lang);

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
          <div className="grid grid-3">
            {c.cards.map((d, i) => (
              <Reveal className="card" key={d.id} delay={i * 0.1}>
                {d.icone && <div className="icon"><Icon name={d.icone} /></div>}
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <L href="/contactos" className="btn btn-primary">{T("Procuro uma solução")}</L>
              <L href="/contactos" className="btn btn-outline">{T("Quero representar a minha solução")}</L>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
