import Link from "next/link";
import { PERIODOS, qs, nomePais } from "@/lib/analytics";

const BASE = "/admin/analytics";

const NOMES_FILTRO = { pais: "País", cidade: "Cidade", pagina: "Página", fonte: "Origem" };

/**
 * Barra de filtros (uma linha, por cima de tudo o que filtra). Funciona sem
 * JavaScript: os períodos são links e os campos são formulários GET, por isso
 * o endereço da página fica partilhável com os filtros todos.
 *
 * atual: { periodo, de, ate, pais, cidade, pagina, fonte }
 */
export default function Filtros({ atual, periodo, opcoes, rotuloPagina }) {
  const ocultos = (exceto) =>
    Object.entries(atual)
      .filter(([k, v]) => v && !exceto.includes(k) && (k !== "de" && k !== "ate" ? true : atual.periodo === "pers"))
      .map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />);
  const ativos = Object.keys(NOMES_FILTRO).filter((k) => atual[k]);
  const valorFiltro = (k) =>
    k === "pais" ? nomePais(atual.pais) : k === "pagina" ? rotuloPagina(atual.pagina) : atual[k];

  return (
    <section className="an-filtros" aria-label="Filtros">
      <div className="an-filtros-linha">
        <nav className="an-periodos" aria-label="Período">
          {PERIODOS.filter(([k]) => k !== "pers").map(([k, l]) => (
            <Link
              key={k}
              href={BASE + qs(atual, { periodo: k })}
              className={`an-chip${periodo.preset === k ? " ativo" : ""}`}
              aria-current={periodo.preset === k ? "true" : undefined}
            >
              {l}
            </Link>
          ))}
        </nav>
        <form action={BASE} method="get" className="an-datas">
          {ocultos(["periodo", "de", "ate"])}
          <input type="hidden" name="periodo" value="pers" />
          <label>
            De <input type="date" name="de" defaultValue={periodo.de} max={periodo.ate} required />
          </label>
          <label>
            até <input type="date" name="ate" defaultValue={periodo.ate} required />
          </label>
          <button type="submit" className={`an-chip${periodo.preset === "pers" ? " ativo" : ""}`}>
            Aplicar datas
          </button>
        </form>
      </div>

      <form action={BASE} method="get" className="an-filtros-linha an-campos">
        {ocultos(["pais", "cidade", "pagina", "fonte"])}
        <label>
          País
          <select name="pais" defaultValue={atual.pais || ""}>
            <option value="">Todos</option>
            {[...new Set([...(atual.pais ? [atual.pais] : []), ...opcoes.paises])].map((p) => (
              <option key={p} value={p}>
                {nomePais(p)}
              </option>
            ))}
          </select>
        </label>
        <label>
          Cidade
          <input name="cidade" list="an-l-cidades" defaultValue={atual.cidade || ""} placeholder="Todas" maxLength={80} />
          <datalist id="an-l-cidades">
            {opcoes.cidades.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <label>
          Página
          <input name="pagina" list="an-l-paginas" defaultValue={atual.pagina || ""} placeholder="Todas (ex.: /empreendimentos)" maxLength={140} />
          <datalist id="an-l-paginas">
            {opcoes.paginas.map((c) => (
              <option key={c} value={c}>
                {rotuloPagina(c)}
              </option>
            ))}
          </datalist>
        </label>
        <label>
          Origem
          <input name="fonte" list="an-l-fontes" defaultValue={atual.fonte || ""} placeholder="Todas (ex.: Google)" maxLength={60} />
          <datalist id="an-l-fontes">
            {opcoes.fontes.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </label>
        <button type="submit" className="an-chip ativo">Filtrar</button>
      </form>

      <div className="an-filtros-linha an-ativos">
        {ativos.length > 0 && <span className="muted">A filtrar:</span>}
        {ativos.map((k) => (
          <Link
            key={k}
            href={BASE + qs(atual, k === "pais" ? { pais: null, cidade: null } : { [k]: null })}
            className="an-chip an-chip-filtro"
            title="Tirar este filtro"
          >
            {NOMES_FILTRO[k]}: {valorFiltro(k)} <span aria-hidden="true">×</span>
            <span className="sr-only"> (tirar)</span>
          </Link>
        ))}
        {ativos.length > 1 && (
          <Link href={BASE + qs({ periodo: atual.periodo, de: atual.de, ate: atual.ate })} className="an-limpar">
            Limpar filtros
          </Link>
        )}
        <a
          href={`/api/admin/analytics/export${qs(atual)}`}
          className="an-chip an-exportar"
          download
        >
          Exportar CSV
        </a>
      </div>
    </section>
  );
}
