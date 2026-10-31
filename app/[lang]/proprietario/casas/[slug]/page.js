import { notFound } from "next/navigation";
import L from "@/components/L";
import CasaForm from "@/components/al/CasaForm";
import Calendario from "@/components/al/Calendario";
import Relatorio from "@/components/al/Relatorio";
import NavProprietario from "@/components/al/NavProprietario";
import { EnviarAnalise, Bloqueios } from "@/components/al/AcoesProprietario";
import { t, tf } from "@/lib/i18n";
import { exigirProprietario, metaPrivada, dataCurta } from "@/lib/al/paginas";
import { casaDoProprietario } from "@/lib/al/casas";
import { listarReservas } from "@/lib/al/reservas";
import { relatoriosDasCasas } from "@/lib/al/tarefas";
import { faltaParaPublicar } from "@/lib/al/validacao";
import { ROTULO_ESTADO_CASA, ROTULO_ORIGEM, noitesOcupadas, hojeLisboa, formatarValor, moedaDe } from "@/lib/al/regras";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "A minha casa");
}

export default async function CasaProprietario({ params }) {
  const { lang, slug } = await params;
  const T = (x) => t(lang, x);
  const p = await exigirProprietario(lang);
  const casa = await casaDoProprietario(slug, p.id);
  if (!casa) notFound();
  const hoje = hojeLisboa();
  const reservas = await listarReservas({ casaSlug: slug, estado: { $ne: "cancelada" } });
  const bloqueios = reservas.filter((r) => r.bloqueio && r.saida > hoje);
  const estadias = reservas.filter((r) => !r.bloqueio);
  const ocupadas = noitesOcupadas(estadias.filter((r) => r.estado !== "pedido"), { desde: hoje });
  const marcadas = noitesOcupadas(bloqueios, { desde: hoje });
  const relatorios = await relatoriosDasCasas([slug]);
  const falta = faltaParaPublicar(casa);
  const moeda = moedaDe(casa);

  return (
    <div className="container al-pagina">
      <NavProprietario lang={lang} nome={p.nome} />
      <L href="/proprietario" className="al-voltar">
        ← {T("As tuas casas")}
      </L>
      <div className="al-cab">
        <h1>{casa.titulo}</h1>
        <span className={`al-badge ${casa.estado}`}>{T(ROTULO_ESTADO_CASA[casa.estado])}</span>
      </div>

      <div className="al-cartao">
        {casa.estado === "rascunho" && (
          <>
            {falta.length > 0 ? (
              <p className="al-nota">
                {T("Para enviar para análise falta:")} {falta.map((f) => T(f)).join(", ")}.
              </p>
            ) : (
              <p className="al-nota">{T("Está tudo preenchido. Envia para análise — a nossa equipa revê e publica.")}</p>
            )}
            {falta.length === 0 && <EnviarAnalise slug={slug} />}
          </>
        )}
        {casa.estado === "em_analise" && <p className="al-nota">{T("A nossa equipa está a rever a casa. Avisamos-te quando for aprovada.")}</p>}
        {casa.estado === "aprovada" && <p className="al-nota">{T("Aprovada! Vai ser publicada em breve.")}</p>}
        {casa.estado === "publicada" && (
          <p className="al-nota">
            {T("Publicada no site.")} <L href={`/alojamento/${slug}`}>{T("Ver anúncio")}</L>
          </p>
        )}
        {casa.estado === "suspensa" && <p className="al-nota">{T("Suspensa — fala connosco para a reativar.")}</p>}
      </div>

      <h2>{T("Calendário")}</h2>
      <Calendario ocupadas={ocupadas} marcadas={marcadas} hoje={hoje} />
      <h3>{T("Bloquear datas")}</h3>
      <Bloqueios slug={slug} bloqueios={bloqueios} hoje={hoje} />

      <h2>{T("Reservas")}</h2>
      {estadias.length === 0 ? (
        <p className="al-nota">{T("Sem reservas por agora.")}</p>
      ) : (
        <div className="al-tabela-wrap">
          <table className="al-tabela">
            <thead>
              <tr>
                <th>{T("Datas")}</th>
                <th>{T("Hóspede")}</th>
                <th>{T("Origem")}</th>
                <th>{T("Valor")}</th>
                <th>{T("Estado")}</th>
              </tr>
            </thead>
            <tbody>
              {estadias.map((r) => (
                <tr key={r.id}>
                  <td>
                    {dataCurta(r.entrada, lang)} → {dataCurta(r.saida, lang)}
                    <br />
                    <small>{tf(lang, "{n} noites", { n: r.noites })}</small>
                  </td>
                  <td>{String(r.hospede?.nome || "").split(" ")[0]}</td>
                  <td>{T(ROTULO_ORIGEM[r.origem] || r.origem)}</td>
                  <td>{formatarValor(r.valor, r.moeda || moeda, lang)}</td>
                  <td>
                    <span className={`al-badge ${r.estado}`}>{T({ pedido: "Pedido", confirmada: "Confirmada", concluida: "Concluída" }[r.estado] || r.estado)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2>{T("Inspeções")}</h2>
      {relatorios.length === 0 ? (
        <p className="al-nota">{T("Os relatórios de inspeção (com fotos de cada divisão) aparecem aqui depois de cada entrada e saída.")}</p>
      ) : (
        relatorios.map((r) => <Relatorio key={r.id} tarefa={r} lang={lang} />)
      )}

      <h2>{T("Editar a casa")}</h2>
      <CasaForm casa={casa} />
    </div>
  );
}
