import { notFound } from "next/navigation";
import L from "@/components/L";
import ProjetoGaleria from "@/components/ProjetoGaleria";
import RegionMap from "@/components/RegionMap";
import PrecoDual from "@/components/PrecoDual";
import Calendario from "@/components/al/Calendario";
import PedidoReserva from "@/components/al/PedidoReserva";
import { t, tf } from "@/lib/i18n";
import { metaPagina, metaNaoEncontrado } from "@/lib/seo";
import { traduzDoc } from "@/lib/i18n/conteudo";
import { casaPublica } from "@/lib/al/casas";
import { COMODIDADES, PAISES, hojeLisboa, moedaDe, formatarValor, percentagemTaxaServico } from "@/lib/al/regras";
import { getConfigAl } from "@/lib/al/config";
import { pagamentoDisponivel } from "@/lib/pagamentos";
import Icon from "@/components/Icon";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  const { lang, slug } = await params;
  const r = await casaPublica(slug);
  if (!r) return metaNaoEncontrado(lang);
  const c = traduzDoc(r.casa, lang);
  return metaPagina(lang, `/alojamento/${slug}`, {
    titulo: c.titulo,
    descricao: String(c.descricao || "").slice(0, 160) || t(lang, "Alojamento local Meridie"),
    imagem: c.fotos?.[0],
  });
}

export default async function CasaPagina({ params }) {
  const { lang, slug } = await params;
  const T = (x) => t(lang, x);
  const r = await casaPublica(slug);
  if (!r) notFound();
  const c = traduzDoc(r.casa, lang);
  const hoje = hojeLisboa();
  const moeda = moedaDe(c);
  const pais = c.pais || "PT";
  const pagaOnline = pagamentoDisponivel(pais);
  const pctTaxa = pagaOnline ? percentagemTaxaServico(pais, await getConfigAl()) : 0;
  const mapa = c.coordenadas ? { lat: c.coordenadas.lat, lng: c.coordenadas.lng, zoom: 14 } : null;

  return (
    <div className="container al-pagina">
      <nav className="breadcrumb" aria-label="breadcrumb">
        <L href="/alojamento">{T("Alojamento local")}</L> / <span>{c.cidade}</span>
      </nav>
      <h1 className="al-titulo-casa">{c.titulo}</h1>
      <p className="al-sub">
        {[c.zona, c.cidade, T(PAISES[c.pais || "PT"]?.nome)].filter(Boolean).join(", ")}
      </p>

      <ProjetoGaleria imagens={c.fotos || []} nome={c.titulo} />

      <div className="al-casa-grelha">
        <div>
          <div className="spec-row">
            {c.tipologia && (
              <div className="spec-box">
                <div className="v">{T(c.tipologia)}</div>
                <div className="l">{T("Tipologia")}</div>
              </div>
            )}
            {c.capacidade ? (
              <div className="spec-box">
                <div className="v">{c.capacidade}</div>
                <div className="l">{T("Hóspedes")}</div>
              </div>
            ) : null}
            {c.quartos != null && (
              <div className="spec-box">
                <div className="v">{c.quartos}</div>
                <div className="l">{T("Quartos")}</div>
              </div>
            )}
            {c.casasBanho != null && (
              <div className="spec-box">
                <div className="v">{c.casasBanho}</div>
                <div className="l">{T("Casas de banho")}</div>
              </div>
            )}
          </div>

          {c.descricao && <p className="al-descricao">{c.descricao}</p>}

          {c.comodidades?.length > 0 && (
            <>
              <h2>{T("Comodidades")}</h2>
              <ul className="feature-list al-comodidades">
                {c.comodidades.map((k) => (
                  <li key={k} className="al-ok"><Icon name="check" size={16} /> {T(COMODIDADES[k] || k)}</li>
                ))}
              </ul>
            </>
          )}

          {c.regras && (
            <>
              <h2>{T("Regras da casa")}</h2>
              <p className="al-descricao">{c.regras}</p>
            </>
          )}

          <h2>{T("Disponibilidade")}</h2>
          <Calendario ocupadas={r.ocupadas} hoje={hoje} />

          {mapa && (
            <>
              <h2>{T("Localização aproximada")}</h2>
              <RegionMap mapa={mapa} nome={c.titulo} />
            </>
          )}

          <p className="al-nota">
            {c.pais === "BR"
              ? c.inscricaoMunicipal
                ? `${T("Inscrição municipal")}: ${c.inscricaoMunicipal}`
                : null
              : c.licencaAL
                ? `${T("Registo AL")}: ${c.licencaAL}`
                : null}
          </p>
        </div>

        <aside className="prop-aside al-aside" id="reservar">
          <div className="price-big">
            <PrecoDual preco={c.precoNoite} moeda={moeda} sub={T("/ noite")} />
          </div>
          <div className="price-sub">
            {c.limpeza > 0 && `${T("Limpeza")}: ${formatarValor(c.limpeza, moeda, lang)} · `}
            {c.estadiaMinima > 1 ? tf(lang, "Mínimo {n} noites", { n: c.estadiaMinima }) : T("Mínimo 1 noite")}
          </div>
          <PedidoReserva casa={{ slug: c.slug, precoNoite: c.precoNoite, limpeza: c.limpeza, estadiaMinima: c.estadiaMinima, capacidade: c.capacidade, moeda }} pctTaxa={pctTaxa} pagaOnline={pagaOnline} ocupadas={r.ocupadas} hoje={hoje} />
        </aside>
      </div>
    </div>
  );
}
