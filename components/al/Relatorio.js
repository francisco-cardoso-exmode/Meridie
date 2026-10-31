import { t } from "@/lib/i18n";
import { ROTULO_TIPO_TAREFA, ROTULO_ESTADO_DIVISAO } from "@/lib/al/regras";

/**
 * Relatório de uma inspeção (servidor): fotografias e estado por divisão.
 * Só é mostrado em páginas autenticadas (proprietário, equipa, backoffice)
 * ou com o token do hóspede.
 */
export default function Relatorio({ tarefa, lang = "pt", titulo, mostrarNotas = true }) {
  const T = (x) => t(lang, x);
  const r = tarefa?.relatorio;
  if (!r) return null;
  const quando = r.concluidaEm ? new Date(r.concluidaEm).toLocaleString(lang === "en" ? "en-GB" : "pt-PT", { timeZone: "Europe/Lisbon" }) : "";
  return (
    <section className="al-relatorio">
      <h3>
        {titulo || T(ROTULO_TIPO_TAREFA[tarefa.tipo])} <small>· {tarefa.data}</small>
      </h3>
      {quando && <p className="al-nota">{T("Concluída em")} {quando}</p>}
      {(r.porDivisao || []).map((d) => (
        <div key={d.divisao} className="al-rel-div">
          <div className="al-rel-cab">
            <strong>{T(d.divisao)}</strong>
            <span className={`al-estado-div ${d.estado}`}>{T(ROTULO_ESTADO_DIVISAO[d.estado] || d.estado)}</span>
          </div>
          {mostrarNotas && d.notas && <p>{d.notas}</p>}
          {d.fotos?.length > 0 && (
            <div className="al-thumbs">
              {d.fotos.map((u, i) => (
                <a key={u} href={u} target="_blank" rel="noopener noreferrer" className="al-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt={`${T(d.divisao)} — ${i + 1}`} loading="lazy" />
                </a>
              ))}
            </div>
          )}
        </div>
      ))}
      {mostrarNotas && r.observacoes && (
        <p>
          <strong>{T("Observações")}:</strong> {r.observacoes}
        </p>
      )}
    </section>
  );
}
