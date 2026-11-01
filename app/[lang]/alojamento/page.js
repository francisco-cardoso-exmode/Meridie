import L from "@/components/L";
import Foto from "@/components/Foto";
import Icon from "@/components/Icon";
import PrecoDual from "@/components/PrecoDual";
import { t, tf, caminho } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";
import { traduzLista } from "@/lib/i18n/conteudo";
import { casasPublicadas, cidadesComCasas } from "@/lib/al/casas";
import { PAISES, paisValido, dataValida, hojeLisboa, moedaDe } from "@/lib/al/regras";
import PassosAl, { passosDaReserva } from "@/components/al/PassosAl";
import { getConteudo } from "@/lib/conteudo";
import { pagamentoDisponivel } from "@/lib/pagamentos";

export async function generateMetadata({ params, searchParams }) {
  const { lang } = await params;
  const sp = await searchParams;
  const filtrado = Object.keys(sp || {}).length > 0;
  return metaPagina(lang, "/alojamento", {
    titulo: t(lang, "Alojamento local — casas para férias"),
    descricao: t(lang, "Casas para estadias curtas em Portugal e no Brasil, geridas pela Meridie. Pede a tua reserva diretamente, sem comissões de plataforma."),
    // Pesquisas filtradas não se indexam (conteúdo duplicado).
    indexar: !filtrado,
  });
}

const s = (v, max = 60) => (typeof v === "string" ? v.slice(0, max) : "");

export default async function Alojamento({ params, searchParams }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const sp = (await searchParams) || {};
  const f = {
    pais: paisValido(sp.pais) ? sp.pais : "",
    cidade: s(sp.cidade),
    entrada: dataValida(sp.entrada) ? sp.entrada : "",
    saida: dataValida(sp.saida) ? sp.saida : "",
    hospedes: /^\d{1,2}$/.test(sp.hospedes || "") ? sp.hospedes : "",
  };
  const [casas, cidades, c] = await Promise.all([casasPublicadas(f), cidadesComCasas(), getConteudo("alojamento", lang)]);
  const lista = traduzLista(casas, lang);
  const hoje = hojeLisboa();
  const semFiltros = !Object.values(f).some(Boolean);
  const qs = f.entrada && f.saida ? `?entrada=${f.entrada}&saida=${f.saida}${f.hospedes ? `&hospedes=${f.hospedes}` : ""}` : "";

  return (
    <div className="container al-pagina">
      <div className="section-head" style={{ marginBottom: 20 }}>
        <span className="eyebrow">{T("Alojamento local")}</span>
        <h1 style={{ fontSize: "2rem" }}>{T("Casas para estadias curtas")}</h1>
        <p>{T("Casas inspecionadas pela nossa equipa antes de cada entrada. Pede a reserva diretamente — confirmamos a disponibilidade e enviamos-te tudo por email.")}</p>
      </div>

      <form className="al-filtros" method="get" action={caminho(lang, "/alojamento")}>
        <label>
          {T("País")}
          <select name="pais" defaultValue={f.pais}>
            <option value="">{T("Todos")}</option>
            {Object.entries(PAISES).map(([k, p]) => (
              <option key={k} value={k}>
                {T(p.nome)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {T("Cidade")}
          <select name="cidade" defaultValue={f.cidade}>
            <option value="">{T("Todas")}</option>
            {cidades
              .filter((c) => !f.pais || c.pais === f.pais)
              .map((c) => (
                <option key={`${c.pais}-${c.cidade}`} value={c.cidade}>
                  {c.cidade}
                </option>
              ))}
          </select>
        </label>
        <label>
          {T("Entrada")}
          <input type="date" name="entrada" min={hoje} defaultValue={f.entrada} />
        </label>
        <label>
          {T("Saída")}
          <input type="date" name="saida" min={hoje} defaultValue={f.saida} />
        </label>
        <label>
          {T("Hóspedes")}
          <input type="number" name="hospedes" min={1} max={30} defaultValue={f.hospedes} />
        </label>
        <button type="submit" className="al-btn">
          {T("Procurar")}
        </button>
      </form>

      {lista.length === 0 && semFiltros ? (
        <div className="al-vazio">
          <div className="icon">
            <Icon name="home" />
          </div>
          <div>
            <h2>{T("As primeiras casas estão a chegar")}</h2>
            <p>{T("Estamos a preparar e a inspecionar as primeiras casas. Se procuras uma estadia em Portugal ou no Brasil, fala connosco e ajudamos-te a encontrar.")}</p>
          </div>
          <L href="/contactos" className="btn btn-primary">
            {T("Falar connosco")}
          </L>
        </div>
      ) : lista.length === 0 ? (
        <div className="empty-state">
          <p>{T("Não encontrámos casas com estes critérios. Experimenta outras datas ou outra cidade.")}</p>
        </div>
      ) : (
        <div className="listing-grid">
          {lista.map((c) => (
            <L key={c.slug} href={`/alojamento/${c.slug}${qs}`} className="prop-card al-card">
              <div className="prop-media">
                {c.fotos?.[0] && <Foto src={c.fotos[0]} alt={c.titulo} fill sizes="(max-width: 700px) 100vw, 360px" />}
                <div className="prop-badges">
                  <span className="badge navy">{T(PAISES[c.pais || "PT"]?.nome)}</span>
                </div>
              </div>
              <div className="prop-body">
                <div className="prop-loc">{[c.zona, c.cidade].filter(Boolean).join(", ")}</div>
                <h3>{c.titulo}</h3>
                <div className="prop-specs">
                  {c.tipologia && <span>{T(c.tipologia)}</span>}
                  {c.capacidade ? <span>{tf(lang, "{n} hóspedes", { n: c.capacidade })}</span> : null}
                  {c.quartos != null && <span>{tf(lang, "{n} quartos", { n: c.quartos })}</span>}
                </div>
                <div className="prop-foot">
                  <div className="prop-price">
                    <PrecoDual preco={c.precoNoite} moeda={moedaDe(c)} sub={T("/ noite")} />
                  </div>
                </div>
              </div>
            </L>
          ))}
        </div>
      )}

      <PassosAl
        eyebrow={c.reservaEyebrow}
        titulo={c.reservaTitulo}
        texto={c.reservaTexto}
        passos={passosDaReserva(c, pagamentoDisponivel("PT"))}
        nota={c.reservaNota}
      />

      <div className="cta-band al-cta">
        <h2>{T("Tens uma casa?")}</h2>
        <p>{T("Anunciamos e gerimos a tua casa em alojamento local, com inspeções fotográficas antes e depois de cada estadia.")}</p>
        <L href="/inscreve-a-tua-casa" className="btn btn-primary">
          {T("Inscreve a tua casa")}
        </L>
      </div>
    </div>
  );
}
