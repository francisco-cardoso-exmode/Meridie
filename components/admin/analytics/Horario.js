import Link from "next/link";
import { Ranking } from "@/components/admin/analytics/Quadros";

const fmtN = (n, casas = 0) =>
  Number(n || 0).toLocaleString("pt-PT", { minimumFractionDigits: casas, maximumFractionDigits: casas });

const MEDIA = {
  168: "média de uma hora da semana",
  7: "média de um dia da semana",
  24: "média de uma hora do dia",
};

/**
 * Painel do horário escolhido (dia e/ou hora, no mapa de calor ou nos
 * gráficos): números desse horário face ao período e os quadros principais
 * só desse horário. Os filtros dia/hora aplicam-se à página toda.
 */
export function PainelHorario({ titulo, periodoTxt, resumo, paginas, leads, quadros, limparHref, ocorrenciasTxt }) {
  const { visitas, pct, media, razao, nSlots, porOcorrencia } = resumo;
  let comparacao = "sem visitas no período";
  if (razao != null) {
    if (razao >= 1.05) comparacao = `${fmtN(razao, razao < 10 ? 1 : 0)}× a ${MEDIA[nSlots]}`;
    else if (razao <= 0.95) comparacao = `abaixo da ${MEDIA[nSlots]} (${fmtN(razao, 1)}×)`;
    else comparacao = `na ${MEDIA[nSlots]}`;
  }
  return (
    <section className="an-horario" id="an-horario" aria-labelledby="an-horario-t">
      <div className="an-horario-topo">
        <div>
          <p className="an-horario-rot">Horário escolhido</p>
          <h2 id="an-horario-t">
            {titulo} <span className="muted">· {periodoTxt}</span>
          </h2>
        </div>
        <Link href={limparHref} className="an-chip" scroll={false}>
          Limpar horário <span aria-hidden="true">×</span>
        </Link>
      </div>
      <dl className="an-horario-nums">
        <div>
          <dt>Visitas</dt>
          <dd>{fmtN(visitas)}</dd>
        </div>
        <div>
          <dt>Páginas vistas</dt>
          <dd>{fmtN(paginas)}</dd>
        </div>
        <div>
          <dt>Leads</dt>
          <dd>{fmtN(leads)}</dd>
        </div>
        <div>
          <dt>Do total do período</dt>
          <dd>{fmtN(pct, pct < 10 ? 1 : 0)}%</dd>
        </div>
        <div>
          <dt>Face à média</dt>
          <dd className="an-horario-comp">{comparacao}</dd>
          <dd className="an-horario-nota">média: {fmtN(media, media < 10 ? 1 : 0)} visitas</dd>
        </div>
      </dl>
      {porOcorrencia != null && (
        <p className="an-horario-oc muted">
          {ocorrenciasTxt}: {fmtN(porOcorrencia, porOcorrencia < 10 ? 1 : 0)} visitas de cada vez, em média.
        </p>
      )}
      <div className="an-grid">
        {quadros.map((q) => (
          <Ranking
            key={q.titulo}
            titulo={q.titulo}
            linhas={q.linhas}
            total={q.total}
            mostrar={5}
            vazio="Nada neste horário."
          />
        ))}
      </div>
    </section>
  );
}
