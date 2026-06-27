import Link from "next/link";
import { notFound } from "next/navigation";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import ContactForm from "@/components/ContactForm";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import {
  EMPREENDIMENTOS,
  getEmpreendimentoBySlug,
  getEmpreendimentos,
  formatarPreco,
  PAIS_LABEL,
} from "@/lib/empreendimentos";

export function generateStaticParams() {
  return EMPREENDIMENTOS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = getEmpreendimentoBySlug(slug);
  if (!e) return { title: "Empreendimento não encontrado" };
  return {
    title: `${e.nome} — ${e.cidade}`,
    description: e.resumo,
  };
}

export default async function PaginaEmpreendimento({ params }) {
  const { slug } = await params;
  const e = getEmpreendimentoBySlug(slug);
  if (!e) notFound();

  const paisLabel = PAIS_LABEL[e.pais];
  const semelhantes = getEmpreendimentos({ pais: e.pais })
    .filter((x) => x.slug !== e.slug)
    .slice(0, 3);

  return (
    <>
      <div className="prop-hero">
        <div className="container">
          <nav className="breadcrumb">
            <Link href="/">Início</Link> ·{" "}
            <Link href={`/${e.pais}`}>{paisLabel}</Link> · {e.nome}
          </nav>
          <div className="gallery">
            <div className="main">
              <img src={e.imagens[0]} alt={e.nome} />
            </div>
            <div className="side">
              {e.imagens.slice(1, 3).map((img, i) => (
                <div key={i}>
                  <img src={img} alt={`${e.nome} — foto ${i + 2}`} loading="lazy" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <section style={{ paddingTop: 40 }}>
        <div className="container">
          <div className="prop-detail-grid">
            {/* Coluna principal */}
            <div>
              <div className="prop-badges" style={{ position: "static", marginBottom: 12 }}>
                <span className="badge gold">{e.tipo}</span>
                <span className="badge navy">{e.estado}</span>
                <span className="badge">{e.finalidade}</span>
              </div>
              <h1 style={{ fontSize: "2.2rem", marginBottom: 6 }}>{e.nome}</h1>
              <p style={{ fontSize: "1.05rem", color: "var(--muted)", marginBottom: 4 }}>
                {e.cidade} · {e.zona} · {paisLabel}
              </p>
              {e.construtora && (
                <p style={{ fontSize: "0.9rem", color: "var(--muted)" }}>
                  Construtora: <strong>{e.construtora}</strong>
                  {e.morada ? ` · ${e.morada}` : ""}
                </p>
              )}

              <div className="spec-row">
                <div className="spec-box">
                  <div className="v">{e.quartos}</div>
                  <div className="l">{e.quartos === 1 ? "Quarto" : "Quartos"}</div>
                </div>
                <div className="spec-box">
                  <div className="v">{e.casasBanho}</div>
                  <div className="l">Casas de banho</div>
                </div>
                <div className="spec-box">
                  <div className="v">{e.area}</div>
                  <div className="l">m² de área</div>
                </div>
                <div className="spec-box">
                  <div className="v" style={{ color: "var(--gold)" }}>
                    <Icon name={e.estado === "Pronto" ? "check" : "trending-up"} size={26} />
                  </div>
                  <div className="l">{e.estado}</div>
                </div>
              </div>

              <h2 style={{ fontSize: "1.4rem", margin: "8px 0 12px" }}>Descrição</h2>
              <p style={{ marginBottom: 28 }}>{e.descricao}</p>

              {e.tipologias && (
                <>
                  <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Tipologias</h2>
                  <ul className="feature-list" style={{ marginBottom: 28 }}>
                    {e.tipologias.map((t) => (
                      <li key={t}>
                        <span className="check"><Icon name="layers" size={18} /></span>
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              <h2 style={{ fontSize: "1.4rem", marginBottom: 12 }}>Características</h2>
              <ul className="feature-list">
                {e.caracteristicas.map((c) => (
                  <li key={c}>
                    <span className="check"><Icon name="check" size={18} /></span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>

              {e.proximidades && (
                <>
                  <h2 style={{ fontSize: "1.4rem", margin: "28px 0 12px" }}>
                    Localização & proximidades
                  </h2>
                  <ul className="feature-list">
                    {e.proximidades.map((p) => (
                      <li key={p}>
                        <span className="check"><Icon name="pin" size={18} /></span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Aside — preço + interesse */}
            <aside className="prop-aside">
              <div className="price-big">{formatarPreco(e.preco, e.moeda)}</div>
              <div className="price-sub">
                {e.finalidade} · {e.cidade}, {paisLabel}
              </div>
              <ContactForm assuntoInicial={`Interesse: ${e.nome} (${e.cidade})`} />
            </aside>
          </div>
        </div>
      </section>

      {semelhantes.length > 0 && (
        <section className="bg-soft">
          <div className="container">
            <Reveal className="section-head" style={{ marginBottom: 28 }}>
              <span className="eyebrow">Continuar a explorar</span>
              <h2>Outros empreendimentos em {paisLabel}</h2>
            </Reveal>
            <div className="listing-grid">
              {semelhantes.map((x, i) => (
                <Reveal key={x.slug} delay={(i % 3) * 0.08}>
                  <EmpreendimentoCard e={x} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
