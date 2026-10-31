import {
  escalaEixo,
  rotuloCurto,
  rotuloLongo,
  inicioBalde,
  DIAS_GRELHA,
} from "@/lib/analytics";

const fmtN = (n) => Number(n || 0).toLocaleString("pt-PT");

// Que barras levam rótulo no eixo (cerca de 8, a começar na primeira).
function indicesEixo(chaves, gran) {
  const n = chaves.length;
  if (gran === "hora") {
    const passo = n > 24 ? 6 : 3;
    return chaves.map((c, i) => (+c.slice(11, 13) % passo === 0 ? i : -1)).filter((i) => i >= 0);
  }
  const passo = Math.max(1, Math.ceil(n / 8));
  return chaves.map((_, i) => i).filter((i) => i % passo === 0);
}

function rotuloEixo(chave, gran, multiDia) {
  // Em vários dias por hora, a meia-noite mostra a data.
  if (gran === "hora" && multiDia && chave.endsWith("T00")) return rotuloCurto(chave.slice(0, 10), "dia");
  return rotuloCurto(chave, gran);
}

/**
 * Gráfico de colunas de uma série no tempo (HTML/CSS, sem bibliotecas):
 * colunas finas do período, um traço com o valor do período anterior no
 * mesmo ponto, picos a dourado e um rótulo de valor só no maior.
 * Cada coluna mostra os números ao passar o rato ou com o teclado.
 */
export function Evolucao({ titulo, unidade, serie, anterior, gran, picos = [], agora }) {
  const n = serie.length;
  const max = Math.max(0, ...serie.map((b) => b.n), ...anterior.slice(0, n).map((b) => b.n));
  const { topo, marcas } = escalaEixo(max);
  const ehPico = new Set(picos.map((p) => p.i));
  const maior = picos[0]?.i;
  const eixo = new Set(indicesEixo(serie.map((b) => b.chave), gran));
  const multiDia = gran === "hora" && serie.length > 0 && serie[0].chave.slice(0, 10) !== serie[n - 1].chave.slice(0, 10);
  const total = serie.reduce((a, b) => a + b.n, 0);
  const totalAnt = anterior.reduce((a, b) => a + b.n, 0);

  return (
    <figure className="an-evo">
      <figcaption className="an-evo-topo">
        <h3>{titulo}</h3>
        <ul className="an-legenda" aria-label="Legenda">
          <li><span className="an-key an-key-bar" /> Este período</li>
          <li><span className="an-key an-key-pico" /> Picos</li>
          <li><span className="an-key an-key-ant" /> Período anterior</li>
        </ul>
      </figcaption>
      <div className="an-evo-area">
        <div className="an-evo-y" aria-hidden="true">
          {marcas.map((m) => (
            <span key={m} style={{ bottom: `${(m / topo) * 100}%` }}>{fmtN(m)}</span>
          ))}
        </div>
        <div className="an-evo-plot">
          {marcas.map((m) => (
            <span key={m} className="an-evo-grid" style={{ bottom: `${(m / topo) * 100}%` }} />
          ))}
          <div className="an-evo-cols" role="list">
            {serie.map((b, i) => {
              const ant = anterior[i];
              const futuro = agora && inicioBalde(b.chave, gran) > agora;
              const lado = i < n / 3 ? " an-tip-esq" : i > (2 * n) / 3 ? " an-tip-dir" : "";
              return (
                <div
                  key={b.chave}
                  className={`an-col${ehPico.has(i) ? " pico" : ""}${futuro ? " futuro" : ""}`}
                  role="listitem"
                  tabIndex={0}
                  aria-label={`${rotuloLongo(b.chave, gran)}: ${fmtN(b.n)} ${unidade}${ant ? `; período anterior ${fmtN(ant.n)}` : ""}`}
                >
                  {b.n > 0 && (
                    <span className="an-col-bar" style={{ height: `${(b.n / topo) * 100}%` }}>
                      {i === maior && <span className="an-col-val">{fmtN(b.n)}</span>}
                    </span>
                  )}
                  {ant && ant.n > 0 && (
                    <span className="an-col-ant" style={{ bottom: `${(ant.n / topo) * 100}%` }} />
                  )}
                  <span className={`an-tip${lado}`} aria-hidden="true">
                    <strong>{fmtN(b.n)}</strong> {unidade}
                    <br />
                    <span>{rotuloLongo(b.chave, gran)}</span>
                    {ant && (
                      <>
                        <br />
                        <span className="an-tip-ant">
                          anterior: {fmtN(ant.n)} ({rotuloLongo(ant.chave, gran)})
                        </span>
                      </>
                    )}
                    {futuro && (
                      <>
                        <br />
                        <em>ainda não passou</em>
                      </>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="an-evo-x" aria-hidden="true">
        {serie.map((b, i) =>
          eixo.has(i) ? (
            <span key={b.chave} style={{ left: `${((i + 0.5) / n) * 100}%` }}>
              {rotuloEixo(b.chave, gran, multiDia)}
            </span>
          ) : null
        )}
      </div>
      <p className="an-evo-total">
        Total: <strong>{fmtN(total)}</strong> {unidade} · período anterior: {fmtN(totalAnt)}
      </p>
    </figure>
  );
}

/** Tabela com os mesmos números dos gráficos (acessível, sem depender do rato). */
export function TabelaSerie({ visitas, paginas, anteriorV, gran }) {
  return (
    <details className="an-tabela-det">
      <summary>Ver os números em tabela</summary>
      <div className="an-tabela-wrap">
        <table className="an-tabela">
          <thead>
            <tr>
              <th scope="col">Período</th>
              <th scope="col">Visitas</th>
              <th scope="col">Páginas vistas</th>
              <th scope="col">Visitas (período anterior)</th>
            </tr>
          </thead>
          <tbody>
            {visitas.map((b, i) => (
              <tr key={b.chave}>
                <th scope="row">{rotuloLongo(b.chave, gran)}</th>
                <td>{fmtN(b.n)}</td>
                <td>{fmtN(paginas[i]?.n)}</td>
                <td>{anteriorV[i] ? fmtN(anteriorV[i].n) : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

// Escala sequencial de um só tom (azul da marca), do claro ao escuro.
const NIVEIS = 5;
function nivel(n, max) {
  if (!n || !max) return 0;
  return Math.min(NIVEIS, Math.max(1, Math.ceil((n / max) * NIVEIS)));
}

/** Mapa de calor: dia da semana × hora (Lisboa), em visitas. */
export function MapaCalor({ grelha }) {
  const max = Math.max(0, ...grelha.flat());
  const totalDia = grelha.map((l) => l.reduce((a, b) => a + b, 0));
  return (
    <figure className="an-calor">
      <div className="an-calor-grid" role="table" aria-label="Visitas por dia da semana e hora">
        <div role="row" className="an-calor-linha an-calor-horas">
          <span role="columnheader" />
          {Array.from({ length: 24 }, (_, h) => (
            <span role="columnheader" key={h} aria-label={`${h}h`}>
              {h % 3 === 0 ? `${h}h` : ""}
            </span>
          ))}
          <span role="columnheader" className="an-calor-tot">Total</span>
        </div>
        {grelha.map((linha, d) => (
          <div role="row" className="an-calor-linha" key={d}>
            <span role="rowheader" className="an-calor-dia">{DIAS_GRELHA[d]}</span>
            {linha.map((n, h) => (
              <span
                role="cell"
                key={h}
                className={`an-calor-cel n${nivel(n, max)}`}
                title={`${DIAS_GRELHA[d]}, ${h}h–${h + 1}h: ${fmtN(n)} visita${n === 1 ? "" : "s"}`}
                aria-label={`${DIAS_GRELHA[d]} ${h}h: ${fmtN(n)}`}
              />
            ))}
            <span role="cell" className="an-calor-tot">{fmtN(totalDia[d])}</span>
          </div>
        ))}
      </div>
      <figcaption className="an-calor-escala">
        <span>menos</span>
        {Array.from({ length: NIVEIS + 1 }, (_, i) => (
          <span key={i} className={`an-calor-cel n${i}`} aria-hidden="true" />
        ))}
        <span>mais{max ? ` (máx. ${fmtN(max)} por hora)` : ""}</span>
      </figcaption>
    </figure>
  );
}
