import NavProprietario from "@/components/al/NavProprietario";
import { t, LOCALE } from "@/lib/i18n";
import { exigirProprietario, metaPrivada } from "@/lib/al/paginas";
import { casasDoProprietario, nCasasAtivas } from "@/lib/al/casas";
import { listarReservas } from "@/lib/al/reservas";
import { getConfigAl } from "@/lib/al/config";
import { ganhosPorMes, percentagemComissao, formatarValor, ROTULO_PLANO } from "@/lib/al/regras";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Ganhos");
}

export default async function Ganhos({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const p = await exigirProprietario(lang);
  const [casas, config, ativas] = await Promise.all([casasDoProprietario(p.id), getConfigAl(), nCasasAtivas(p.id)]);
  const reduzidaAuto = ativas >= 2;
  const pct = Object.fromEntries(
    casas.map((c) => [c.slug, percentagemComissao(c.plano, { reduzida: reduzidaAuto || c.comissaoReduzida }, config)])
  );
  const reservas = casas.length ? await listarReservas({ casaSlug: { $in: casas.map((c) => c.slug) } }) : [];
  const meses = ganhosPorMes(reservas, (r) => pct[r.casaSlug] ?? 0, config);
  const nomeMes = (m) =>
    new Date(`${m}-15T12:00:00Z`).toLocaleDateString(LOCALE[lang], { month: "long", year: "numeric", timeZone: "UTC" });

  return (
    <div className="container al-pagina">
      <NavProprietario lang={lang} nome={p.nome} ativo="ganhos" />
      <h1>{T("Ganhos")}</h1>
      <p className="al-nota">
        {T("Por mês de entrada dos hóspedes, com reservas confirmadas e concluídas. A comissão da plataforma (Airbnb/Booking) é aproximada; a comissão Meridie é sobre o valor depois dessa comissão. Limpeza e taxa turística não entram nas contas.")}
      </p>

      <div className="al-cartao">
        <strong>{T("As tuas comissões")}</strong>
        <ul className="al-lista-simples">
          {casas.map((c) => (
            <li key={c.slug}>
              <span>{c.titulo}</span>
              <span>
                {T(ROTULO_PLANO[c.plano] || "")} · {pct[c.slug]}%
              </span>
            </li>
          ))}
        </ul>
      </div>

      {meses.length === 0 ? (
        <p className="al-nota">{T("Ainda sem reservas confirmadas.")}</p>
      ) : (
        <div className="al-tabela-wrap">
          <table className="al-tabela">
            <thead>
              <tr>
                <th>{T("Mês")}</th>
                <th>{T("Reservas")}</th>
                <th>{T("Bruto")}</th>
                <th>{T("Plataformas")}</th>
                <th>{T("Meridie")}</th>
                <th>{T("Para ti")}</th>
              </tr>
            </thead>
            <tbody>
              {meses.map((m) => {
                const v = (x) => formatarValor(x, m.moeda, lang, { decimais: 2 });
                return (
                  <tr key={`${m.mes}-${m.moeda}`}>
                    <td>
                      {nomeMes(m.mes)} <small>{m.moeda}</small>
                    </td>
                    <td>
                      {m.reservas} <small>({m.noites} {T("noites")})</small>
                    </td>
                    <td>{v(m.bruto)}</td>
                    <td>−{v(m.ota)}</td>
                    <td>−{v(m.meridie)}</td>
                    <td>
                      <strong>{v(m.proprietario)}</strong>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
