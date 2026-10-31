import L from "@/components/L";
import HeroSplit from "@/components/HeroSplit";
import Reveal from "@/components/Reveal";
import Icon from "@/components/Icon";
import EmpreendimentoCard from "@/components/EmpreendimentoCard";
import RegionBanner from "@/components/RegionBanner";
import { cartaoRegiao } from "@/lib/regioes";
import { regioesHome, regiaoBannerHome } from "@/lib/regioesHome";
import {
  empreendimentosDestaque,
  allRegioes,
  allEmpreendimentos,
} from "@/lib/store";
import { getConteudo } from "@/lib/conteudo";
import { allAnuncios } from "@/lib/anuncios";
import AnuncioCard from "@/components/AnuncioCard";
import AreasCards from "@/components/AreasCards";
import MarcasFaixa from "@/components/MarcasFaixa";
import { allMarcas } from "@/lib/marcas";
import { allProdutos, marcasComProdutos } from "@/lib/representacoes";
import { TECNOLOGIA_VISIVEL } from "@/lib/flags";
import { t } from "@/lib/i18n";
import { metaPagina, DESCRICAO_SITE } from "@/lib/seo";
import { traduzLista } from "@/lib/i18n/conteudo";
import { cartaoEmpreendimento } from "@/lib/empreendimentos";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/", {
    titulo: t(lang, "Meridie Investments — Investimento imobiliário Portugal e Brasil"),
    tituloAbsoluto: true,
    descricao: t(lang, DESCRICAO_SITE),
  });
}

export default async function Home({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const c = await getConteudo("home", lang);
  const areas = TECNOLOGIA_VISIVEL ? await getConteudo("areas", lang) : null;
  // Só os campos que os cards e o explorador usam (ver cartaoEmpreendimento).
  const destaques = traduzLista(await empreendimentosDestaque(6), lang).map(cartaoEmpreendimento);
  const todos = traduzLista(await allEmpreendimentos(), lang).map(cartaoEmpreendimento);
  const regioes = traduzLista(await allRegioes(), lang);
  const anuncios = traduzLista(await allAnuncios({ home: true }), lang);
  const marcas = marcasComProdutos(traduzLista(await allMarcas({ home: true }), lang), await allProdutos());
  // Escolhidas no backoffice (Regiões → "Mostrar na página inicial" / "Banner"),
  // e só as que têm empreendimentos publicados (`todos` já só tem os visíveis).
  const regioesDestaque = regioesHome(regioes, todos);
  const regiaoFooter = regiaoBannerHome(regioes, todos);

  return (
    <>
      {/* Hero split 100vh — escolha Portugal / Brasil */}
      <HeroSplit c={c} />

      {/* Outras áreas — Bebidas & Alimentação e Tecnologia */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">
              {TECNOLOGIA_VISIVEL ? c.areasEyebrowTec : c.areasEyebrow}
            </span>
            <h2>{c.areasTitulo}</h2>
            <p>{c.areasTexto}</p>
          </Reveal>
          {TECNOLOGIA_VISIVEL && <AreasCards areas={["marcas", "tecnologia"]} textos={areas} />}
          {marcas.length > 0 && (
            <Reveal>
              <p className="marcas-faixa-titulo">{c.marcasFaixaTitulo}</p>
              <MarcasFaixa marcas={marcas} />
              <div style={{ marginTop: 26 }}>
                <L href="/representacoes" className="btn btn-primary">{T("Conhecer as marcas")}</L>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* Diferenciais */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.difEyebrow}</span>
            <h2>{c.difTitulo}</h2>
            <p>{c.difTexto}</p>
          </Reveal>
          <div className="grid grid-3">
            {c.diferenciais.map((d, i) => (
              <Reveal className="card" key={d.id} delay={i * 0.1}>
                {d.icone && <div className="icon"><Icon name={d.icone} /></div>}
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Empreendimentos em destaque */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.destaquesEyebrow}</span>
            <h2>{c.destaquesTitulo}</h2>
            <p>{c.destaquesTexto}</p>
          </Reveal>
          <div className="listing-grid">
            {destaques.map((e, i) => (
              <Reveal key={e.slug} delay={(i % 3) * 0.08}>
                <EmpreendimentoCard e={e} />
              </Reveal>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, marginTop: 36, flexWrap: "wrap" }}>
            <L href="/portugal" className="btn btn-primary">
              {T("Ver imóveis em Portugal")}
            </L>
            <L
              href="/brasil"
              className="btn btn-primary"
              style={{ background: "var(--navy)", color: "#fff" }}
            >
              {T("Ver imóveis no Brasil")}
            </L>
            <L href="/empreendimentos" className="btn btn-outline">
              {T("Ver página de toda a oferta")}
            </L>
          </div>
        </div>
      </section>

      {/* Destaques por região (sponsor) */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.regioesEyebrow}</span>
            <h2>{c.regioesTitulo}</h2>
            <p>{c.regioesTexto}</p>
          </Reveal>
          <div className="region-grid">
            {regioesDestaque.map((r, i) => (
              <Reveal key={r.slug} delay={(i % 2) * 0.1}>
                <RegionBanner regiao={cartaoRegiao(r)} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section className="bg-soft">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.perfisEyebrow}</span>
            <h2>{c.perfisTitulo}</h2>
          </Reveal>
          <div className="grid grid-2">
            {c.perfis.map((p, i) => (
              <Reveal className="card" key={p.id} delay={(i % 2) * 0.1}>
                {p.icone && <div className="icon">{p.icone}</div>}
                <h3>{p.titulo}</h3>
                <p>{p.texto}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Como funciona — resumo */}
      <section>
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{c.processoEyebrow}</span>
            <h2>{c.processoTitulo}</h2>
            <p>{c.processoTexto}</p>
          </Reveal>
          <Reveal className="stats">
            {c.passos.map((p, i) => (
              <div className="stat" key={p.id}>
                <div className="num">{i + 1}</div>
                <div className="label">{p.titulo}</div>
              </div>
            ))}
          </Reveal>
          <div style={{ textAlign: "center", marginTop: 36 }}>
            <L href="/como-funciona" className="btn btn-primary">
              {T("Ver o processo completo")}
            </L>
          </div>
        </div>
      </section>

      {/* Banner regional pré-footer */}
      {regiaoFooter && (
        <section className="bg-soft">
          <div className="container">
            <Reveal>
              <RegionBanner regiao={cartaoRegiao(regiaoFooter)} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Publicidade / parceiros */}
      {anuncios.length > 0 && (
        <section>
          <div className="container">
            <Reveal className="section-head">
              <span className="eyebrow">{c.anunciosEyebrow}</span>
              <h2>{c.anunciosTitulo}</h2>
            </Reveal>
            <div className="region-grid">
              {anuncios.map((a, i) => (
                <Reveal key={a.slug} delay={(i % 2) * 0.1}>
                  <AnuncioCard anuncio={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA final */}
      <section>
        <div className="container">
          <Reveal className="cta-band">
            <h2>{c.ctaTitulo}</h2>
            <p>{c.ctaTexto}</p>
            <L href="/contactos" className="btn btn-primary">
              {T("Falar com um especialista")}
            </L>
          </Reveal>
        </div>
      </section>
    </>
  );
}
