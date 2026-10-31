import Link from "next/link";
import { percentagem } from "@/lib/analytics";

const fmtN = (n, casas = 0) =>
  Number(n || 0).toLocaleString("pt-PT", { minimumFractionDigits: casas, maximumFractionDigits: casas });

/**
 * Variação face ao período anterior. `pp` = diferença em pontos percentuais
 * (para taxas). Seta + texto, nunca só a cor.
 */
function Delta({ valor, pp }) {
  if (valor === null) return <span className="an-delta novo">novo (sem dados antes)</span>;
  if (valor === 0) return <span className="an-delta igual">= igual ao período anterior</span>;
  const sobe = valor > 0;
  return (
    <span className={`an-delta ${sobe ? "sobe" : "desce"}`}>
      <span aria-hidden="true">{sobe ? "▲" : "▼"}</span> {sobe ? "+" : "−"}
      {fmtN(Math.abs(valor), Math.abs(valor) < 10 && !Number.isInteger(valor) ? 1 : 0)}
      {pp ? " p.p." : "%"} <span className="an-delta-vs">vs. anterior</span>
    </span>
  );
}

/** Fila de indicadores do período: [{ l, v, casas?, sufixo?, delta, pp?, nota? }]. */
export function Kpis({ itens }) {
  return (
    <div className="an-kpis">
      {itens.map((k) => (
        <div className="admin-stat an-kpi" key={k.l}>
          <div className="l">{k.l}</div>
          <div className="n">
            {fmtN(k.v, k.casas || 0)}
            {k.sufixo || ""}
          </div>
          <Delta valor={k.delta} pp={k.pp} />
          {k.nota && <div className="an-kpi-nota">{k.nota}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * Ranking com barras, número e % do total. Cada linha pode ser um link que
 * aplica um filtro (ex.: clicar num país mostra as cidades desse país).
 * linhas: [{ k, rotulo, n, extra?, href?, ativo? }]
 */
export function Ranking({ titulo, linhas, total, nota, vazio = "Sem dados neste período.", mostrar = 10 }) {
  const soma = total || linhas.reduce((a, l) => a + l.n, 0);
  const max = Math.max(1, ...linhas.map((l) => l.n));
  const linha = (l) => {
    const conteudo = (
      <>
        <span className="an-bar-label" title={l.rotulo}>{l.rotulo}</span>
        <span className="an-bar-track">
          <span className="an-bar-fill" style={{ width: `${(l.n / max) * 100}%` }} />
        </span>
        <span className="an-bar-val">
          {fmtN(l.n)}
          <small> · {fmtN(percentagem(l.n, soma), percentagem(l.n, soma) < 10 ? 1 : 0)}%</small>
          {l.extra ? <small className="an-bar-extra"> {l.extra}</small> : null}
        </span>
      </>
    );
    return (
      <li key={l.k} className={l.ativo ? "ativo" : undefined}>
        {l.href ? (
          <Link href={l.href} className="an-bar-link" scroll={false}>
            {conteudo}
          </Link>
        ) : (
          <div className="an-bar-link">{conteudo}</div>
        )}
      </li>
    );
  };
  return (
    <div className="an-bloco">
      <h3>{titulo}</h3>
      {nota && <p className="an-bloco-nota">{nota}</p>}
      {linhas.length === 0 ? (
        <p className="muted">{vazio}</p>
      ) : (
        <>
          <ul className="an-bars an-rank">{linhas.slice(0, mostrar).map(linha)}</ul>
          {linhas.length > mostrar && (
            <details className="an-mais">
              <summary>Ver mais {linhas.length - mostrar}</summary>
              <ul className="an-bars an-rank">{linhas.slice(mostrar).map(linha)}</ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}
