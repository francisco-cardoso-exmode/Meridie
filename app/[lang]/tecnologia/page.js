import L from "@/components/L";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import SolucaoCard from "@/components/SolucaoCard";
import { notFound } from "next/navigation";
import { getConteudo } from "@/lib/conteudo";
import { allSolucoes } from "@/lib/solucoes";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado } from "@/lib/seo";
import { traduzLista } from "@/lib/i18n/conteudo";

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

// Secções do catálogo: soluções próprias primeiro, depois as de parceiros.
const SECCOES = [
  ["desenvolvemos", "Desenvolvemos", "Produtos próprios, desenhados e mantidos pela nossa equipa."],
  ["representamos", "Representamos", "Soluções de parceiros que selecionámos e representamos comercialmente."],
];

export default async function PaginaTecnologia({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  if (!TECNOLOGIA_VISIVEL) notFound();
  const c = await getConteudo("tecnologia", lang);
  const solucoes = traduzLista(await allSolucoes(), lang);

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

      {SECCOES.map(([tipo, titulo, texto], si) => {
        const lista = solucoes.filter((s) => s.tipo === tipo);
        if (!lista.length) return null;
        return (
          <section key={tipo} className={si % 2 ? undefined : "bg-soft"}>
            <div className="container">
              <Reveal className="section-head">
                <span className="eyebrow">{T(titulo)}</span>
                <h2>{T(texto)}</h2>
              </Reveal>
              <div className="marca-grid">
                {lista.map((s, i) => (
                  <Reveal key={s.slug} delay={(i % 3) * 0.08}>
                    <SolucaoCard s={s} />
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        );
      })}

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
