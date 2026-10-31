import Link from "next/link";
import { TIPOS_EVENTO } from "@/lib/analytics";

const fmtN = (n) => Number(n || 0).toLocaleString("pt-PT");

/**
 * Registo das interações filtradas (mais recentes primeiro), com escolha
 * dos tipos (vários ao mesmo tempo) e páginas de 50. Tudo pelo endereço.
 *
 * linhas: [{ k, quando, tipo, tipoCod, detalhe, pagina, local, dispositivo, origem }]
 * ligarTipo(cod|null) e ligarPagina(n) → endereços.
 */
export function Interacoes({ linhas, total, pagina, paginas, porPagina, tipos, ligarTipo, ligarPagina }) {
  const de = total ? (pagina - 1) * porPagina + 1 : 0;
  const ate = Math.min(total, pagina * porPagina);
  return (
    <div className="an-bloco an-inter">
      <nav className="an-inter-tipos" aria-label="Tipos de interação (podes escolher vários)">
        <Link
          href={ligarTipo(null)}
          className={`an-chip${tipos.length === 0 ? " ativo" : ""}`}
          aria-current={tipos.length === 0 ? "true" : undefined}
        >
          Todas
        </Link>
        {Object.entries(TIPOS_EVENTO).map(([cod, nome]) => {
          const on = tipos.includes(cod);
          return (
            <Link key={cod} href={ligarTipo(cod)} className={`an-chip${on ? " ativo" : ""}`}>
              {nome}
              {on && <span className="sr-only"> (escolhido — clicar tira)</span>}
            </Link>
          );
        })}
      </nav>
      <p className="an-inter-conta muted">
        {total ? (
          <>
            {fmtN(de)}–{fmtN(ate)} de <strong>{fmtN(total)}</strong> interaç{total === 1 ? "ão" : "ões"}, mais
            recentes primeiro
          </>
        ) : (
          "Sem interações com estes filtros."
        )}
      </p>
      {linhas.length > 0 && (
        <div className="an-tabela-wrap an-inter-wrap" tabIndex={0} aria-label="Tabela de interações">
          <table className="an-tabela an-inter-tabela">
            <thead>
              <tr>
                <th scope="col">Data e hora</th>
                <th scope="col">Tipo</th>
                <th scope="col">Detalhe</th>
                <th scope="col">Página</th>
                <th scope="col">Cidade / país</th>
                <th scope="col">Dispositivo</th>
                <th scope="col">Origem</th>
              </tr>
            </thead>
            <tbody>
              {linhas.map((l) => (
                <tr key={l.k}>
                  <th scope="row">{l.quando}</th>
                  <td>
                    <span className={`an-tipo an-tipo-${l.tipoCod}`}>{l.tipo}</span>
                  </td>
                  <td className="an-inter-txt" title={l.detalhe}>
                    {l.detalhe || "—"}
                  </td>
                  <td className="an-inter-txt" title={l.pagina}>
                    {l.pagina || "—"}
                  </td>
                  <td>{l.local || "—"}</td>
                  <td>{l.dispositivo || "—"}</td>
                  <td>{l.origem || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {paginas > 1 && (
        <nav className="an-inter-pags" aria-label="Páginas das interações">
          {pagina > 1 ? (
            <Link href={ligarPagina(pagina - 1)} className="an-chip" rel="prev">
              ‹ Mais recentes
            </Link>
          ) : (
            <span className="an-chip an-chip-off" aria-disabled="true">
              ‹ Mais recentes
            </span>
          )}
          <span className="muted">
            Página {fmtN(pagina)} de {fmtN(paginas)}
          </span>
          {pagina < paginas ? (
            <Link href={ligarPagina(pagina + 1)} className="an-chip" rel="next">
              Mais antigas ›
            </Link>
          ) : (
            <span className="an-chip an-chip-off" aria-disabled="true">
              Mais antigas ›
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
