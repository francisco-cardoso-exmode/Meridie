import Link from "next/link";
import {
  escalaEixo,
  rotuloCurto,
  rotuloLongo,
  inicioBalde,
  indiceMaior,
  DIAS_GRELHA,
  DIAS_FRASE,
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

const visitasTxt = (n) => `${fmtN(n)} visita${n === 1 ? "" : "s"}`;

/**
 * Mapa de calor: dia da semana × hora (Lisboa), em visitas. Cada célula é um
 * link que escolhe esse dia e hora; o nome do dia escolhe só o dia, a hora
 * escolhe só a hora (clicar outra vez tira). A grelha é sempre a completa
 * (sem os filtros dia/hora), com o horário escolhido realçado.
 *
 * ligar(mudar) → endereço com os filtros alterados; sel = { dia, hora }.
 */
export function MapaCalor({ grelha, ligar, sel = {} }) {
  const max = Math.max(0, ...grelha.flat());
  const totalDia = grelha.map((l) => l.reduce((a, b) => a + b, 0));
  const temSel = sel.dia != null || sel.hora != null;
  // Ao escolher, salta para o painel do horário; ao tirar, fica onde está.
  const ir = (m) =>
    Object.values(m).some((v) => v != null)
      ? { href: ligar(m) + "#an-horario" }
      : { href: ligar(m), scroll: false };
  const realce = (d, h) =>
    temSel && (sel.dia == null || sel.dia === d + 1) && (sel.hora == null || sel.hora === h);
  const soDia = (d) => sel.dia === d + 1 && sel.hora == null;
  const soHora = (h) => sel.hora === h && sel.dia == null;
  return (
    <figure className={`an-calor${temSel ? " com-sel" : ""}`}>
      <div className="an-calor-scroll">
        <div className="an-calor-grid" role="table" aria-label="Visitas por dia da semana e hora">
          <div role="row" className="an-calor-linha an-calor-horas">
            <span role="columnheader" />
            {Array.from({ length: 24 }, (_, h) => (
              <span role="columnheader" key={h}>
                <Link
                  {...ir(soHora(h) ? { hora: null } : { hora: h, dia: null })}
                  className={`an-calor-eixo${sel.hora === h ? " ativo" : ""}`}
                  aria-label={soHora(h) ? `${h}h (tirar a hora)` : `Todas as visitas das ${h}h`}
                  aria-current={sel.hora === h ? "true" : undefined}
                  title={`${h}h–${h + 1}h`}
                >
                  {h}
                </Link>
              </span>
            ))}
            <span role="columnheader" className="an-calor-tot">Total</span>
          </div>
          {grelha.map((linha, d) => (
            <div role="row" className="an-calor-linha" key={d}>
              <span role="rowheader" className="an-calor-dia">
                <Link
                  {...ir(soDia(d) ? { dia: null } : { dia: d + 1, hora: null })}
                  className={`an-calor-eixo${sel.dia === d + 1 ? " ativo" : ""}`}
                  aria-label={soDia(d) ? `${DIAS_FRASE[d]} (tirar o dia)` : `Todas as visitas de ${DIAS_FRASE[d]}`}
                  aria-current={sel.dia === d + 1 ? "true" : undefined}
                >
                  {DIAS_GRELHA[d]}
                </Link>
              </span>
              {linha.map((n, h) => {
                const eSel = sel.dia === d + 1 && sel.hora === h;
                return (
                  <span role="cell" key={h}>
                    <Link
                      {...ir(eSel ? { dia: null, hora: null } : { dia: d + 1, hora: h })}
                      className={`an-calor-cel n${nivel(n, max)}${realce(d, h) ? " realce" : ""}${eSel ? " sel" : ""}`}
                      title={`${DIAS_GRELHA[d]}, ${h}h–${h + 1}h: ${visitasTxt(n)}`}
                      aria-label={`${DIAS_FRASE[d]} às ${h}h: ${visitasTxt(n)}${eSel ? " (escolhido — clicar tira)" : ""}`}
                      aria-current={eSel ? "true" : undefined}
                    />
                  </span>
                );
              })}
              <span role="cell" className="an-calor-tot">{fmtN(totalDia[d])}</span>
            </div>
          ))}
        </div>
      </div>
      <figcaption className="an-calor-escala">
        <span>menos</span>
        {Array.from({ length: NIVEIS + 1 }, (_, i) => (
          <span key={i} className={`an-calor-cel n${i}`} aria-hidden="true" />
        ))}
        <span>mais{max ? ` (máx. ${fmtN(max)} por hora)` : ""}</span>
        <span className="an-calor-dica">Clica numa célula, num dia ou numa hora para filtrar.</span>
      </figcaption>
    </figure>
  );
}

/**
 * Colunas por categoria fixa (dias da semana ou horas), clicáveis: cada
 * coluna escolhe esse dia/hora (clicar na escolhida tira). A escolhida fica
 * realçada (as outras esbatidas) e a mais movimentada a dourado, com o valor.
 *
 * itens: [{ rotulo, longo, n, href, sel }]; eixo(i) → mostra rótulo no eixo?
 */
export function ColunasClicaveis({ titulo, itens, unidade = "visitas", eixo = () => true }) {
  const n = itens.length;
  const max = Math.max(0, ...itens.map((b) => b.n));
  const { topo, marcas } = escalaEixo(max);
  const maior = indiceMaior(itens.map((b) => b.n));
  const temSel = itens.some((b) => b.sel);
  const total = itens.reduce((a, b) => a + b.n, 0);
  return (
    <figure className={`an-evo an-dim${temSel ? " com-sel" : ""}`}>
      <figcaption className="an-evo-topo">
        <h3>{titulo}</h3>
        <ul className="an-legenda" aria-label="Legenda">
          <li><span className="an-key an-key-pico" /> Mais movimentado</li>
          {temSel && <li><span className="an-key an-key-sel" /> Escolhido</li>}
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
          <div className="an-evo-cols">
            {itens.map((b, i) => {
              const lado = i < n / 3 ? " an-tip-esq" : i > (2 * n) / 3 ? " an-tip-dir" : "";
              return (
                <Link
                  key={i}
                  href={b.href}
                  scroll={b.href.includes("#") ? undefined : false}
                  className={`an-col${i === maior ? " pico" : ""}${b.sel ? " sel" : ""}`}
                  aria-label={`${b.longo}: ${fmtN(b.n)} ${unidade}${i === maior ? " (o mais movimentado)" : ""}${b.sel ? " — escolhido, clicar tira" : ""}`}
                  aria-current={b.sel ? "true" : undefined}
                >
                  {b.n > 0 && (
                    <span className="an-col-bar" style={{ height: `${(b.n / topo) * 100}%` }}>
                      {(i === maior || b.sel) && <span className="an-col-val">{fmtN(b.n)}</span>}
                    </span>
                  )}
                  <span className={`an-tip${lado}`} aria-hidden="true">
                    <strong>{fmtN(b.n)}</strong> {unidade}
                    <br />
                    <span>{b.longo}</span>
                    {total > 0 && (
                      <>
                        <br />
                        <span className="an-tip-ant">{fmtN(Math.round((b.n / total) * 1000) / 10)}% do total</span>
                      </>
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
      <div className="an-evo-x" aria-hidden="true">
        {itens.map((b, i) =>
          eixo(i) ? (
            <span key={i} className={b.sel ? "ativo" : undefined} style={{ left: `${((i + 0.5) / n) * 100}%` }}>
              {b.rotulo}
            </span>
          ) : null
        )}
      </div>
      <p className="an-evo-total">
        Total: <strong>{fmtN(total)}</strong> {unidade}
      </p>
    </figure>
  );
}
