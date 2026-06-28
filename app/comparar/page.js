import Link from "next/link";
import { empreendimentoBySlug, regiaoDoEmpreendimento } from "@/lib/store";
import { referenciaDe, PAIS_LABEL } from "@/lib/empreendimentos";
import { mesmaZona, zonaLabel, cidadeLabel } from "@/lib/compare";
import PrecoDual from "@/components/PrecoDual";
import CompareAnalysis from "@/components/compare/CompareAnalysis";

export const revalidate = 60;

export const metadata = {
  title: "Comparar empreendimentos",
  description:
    "Compare dois empreendimentos da mesma zona lado a lado — preço, tipologias, área e a zona (o que ver, transportes, distâncias).",
};

const lista = (arr) => (Array.isArray(arr) && arr.length ? arr : null);

function tipologiasTxt(e) {
  if (!Array.isArray(e.tipologias) || !e.tipologias.length) return "—";
  return e.tipologias.map((t) => t.nome).filter(Boolean).join(", ") || "—";
}

export default async function CompararPage({ searchParams }) {
  const sp = (await searchParams) || {};
  const a = await empreendimentoBySlug(sp.a);
  const b = await empreendimentoBySlug(sp.b);

  if (!a || !b || a.slug === b.slug) {
    return (
      <div className="pagina-area">
        <div className="container" style={{ padding: "60px 0" }}>
          <h1>Comparador</h1>
          <p className="muted">
            Escolhe <strong>dois</strong> empreendimentos da mesma zona para
            comparar. Em cada cartão tens o botão <em>⇄ Comparar</em>.
          </p>
          <Link href="/empreendimentos" className="btn btn-primary" style={{ marginTop: 16 }}>
            Ver empreendimentos
          </Link>
        </div>
      </div>
    );
  }

  if (!mesmaZona(a, b)) {
    return (
      <div className="pagina-area">
        <div className="container" style={{ padding: "60px 0" }}>
          <h1>Comparador</h1>
          <p className="muted">
            Só dá para comparar dois empreendimentos da <strong>mesma zona</strong>.
            <br />
            {a.nome} ({zonaLabel(a)}) e {b.nome} ({zonaLabel(b)}) estão em zonas diferentes.
          </p>
          <Link href="/empreendimentos" className="btn btn-primary" style={{ marginTop: 16 }}>
            Voltar aos empreendimentos
          </Link>
        </div>
      </div>
    );
  }

  // Mesma zona → contexto da zona (partilhado) vem de qualquer um dos dois.
  const regiao = await regiaoDoEmpreendimento(a);

  const linhas = [
    { k: "Referência", v: (x) => `Ref. ${referenciaDe(x)}` },
    { k: "Zona / bairro", v: (x) => x.zona || "—" },
    { k: "Tipologia", v: (x) => x.tipo || "—" },
    { k: "Estado", v: (x) => x.estado || "—" },
    { k: "Finalidade", v: (x) => x.finalidade || "—" },
    { k: "Quartos", v: (x) => x.quartos ?? "—" },
    { k: "Casas de banho", v: (x) => x.casasBanho ?? "—" },
    { k: "Área", v: (x) => (x.area ? `${x.area} m²` : "—") },
    { k: "Tipologias", v: tipologiasTxt },
  ];

  return (
    <div className="pagina-area">
      <div className="container comparador">
        <nav className="breadcrumb" style={{ marginBottom: 8 }}>
          <Link href="/empreendimentos">Empreendimentos</Link> · Comparar
        </nav>
        <p className="comp-zona">
          Comparação em <strong>{cidadeLabel(a)}</strong> ·{" "}
          {PAIS_LABEL[a.pais] || a.pais}
        </p>

        {/* Cabeçalho: os dois empreendimentos com o símbolo = no meio */}
        <div className="comp-head">
          {[a, b].map((x, i) => (
            <div className="comp-card" key={x.slug}>
              <Link href={`/empreendimentos/${x.slug}`} className="comp-img">
                <img src={x.imagens?.[0] || ""} alt={x.nome} />
              </Link>
              <h2>{x.nome}</h2>
              <div className="comp-preco">
                <PrecoDual preco={x.preco} moeda={x.moeda} tipo={x.precoTipo} />
              </div>
              {i === 0 && <span className="comp-eq" aria-hidden>=</span>}
            </div>
          ))}
        </div>

        {/* Tabela comparativa */}
        <div className="comp-tabela">
          {linhas.map((l) => (
            <div className="comp-row" key={l.k}>
              <div className="comp-cell">{l.v(a)}</div>
              <div className="comp-key">{l.k}</div>
              <div className="comp-cell">{l.v(b)}</div>
            </div>
          ))}
        </div>

        {/* Características de cada um */}
        <div className="comp-listas">
          {[a, b].map((x) => (
            <div key={x.slug}>
              <h3>{x.nome}</h3>
              {lista(x.caracteristicas) ? (
                <ul className="comp-feats">
                  {x.caracteristicas.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="muted">Sem características listadas.</p>
              )}
            </div>
          ))}
        </div>

        {/* Contexto da zona (escolas, espaços, transportes, distâncias) */}
        {regiao &&
          (lista(regiao.oQueVer) ||
            lista(regiao.transportes) ||
            lista(regiao.distancias)) && (
            <div className="comp-zona-box">
              <h3>A zona — {zonaLabel(a)}</h3>
              <div className="comp-zona-grid">
                {lista(regiao.oQueVer) && (
                  <div>
                    <h4>O que ver / espaços</h4>
                    <ul>
                      {regiao.oQueVer.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lista(regiao.transportes) && (
                  <div>
                    <h4>Transportes &amp; acessos</h4>
                    <ul>
                      {regiao.transportes.map((x) => (
                        <li key={x}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {lista(regiao.distancias) && (
                  <div>
                    <h4>Distâncias</h4>
                    <ul>
                      {regiao.distancias.map((d) => (
                        <li key={d.local}>
                          {d.local} — {d.km} km
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {regiao.slug && (
                <Link href={`/regioes/${regiao.slug}`} className="admin-link">
                  Ver página da zona ↗
                </Link>
              )}
            </div>
          )}

        {/* Análise inteligente (IA) */}
        <CompareAnalysis a={a.slug} b={b.slug} nomeA={a.nome} nomeB={b.nome} />
      </div>
    </div>
  );
}
