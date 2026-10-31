import { notFound } from "next/navigation";
import Relatorio from "@/components/al/Relatorio";
import ProblemaHospede from "@/components/al/ProblemaHospede";
import { t, tf } from "@/lib/i18n";
import { metaPrivada, dataCurta } from "@/lib/al/paginas";
import { reservaPorToken } from "@/lib/al/reservas";
import { casaPorSlug } from "@/lib/al/casas";
import { relatorioEntrada } from "@/lib/al/tarefas";
import { getEmpresa } from "@/lib/config";
import { whatsappHref, telHref } from "@/lib/contactoLinks";
import { formatarValor } from "@/lib/al/regras";
import { traduzDoc } from "@/lib/i18n/conteudo";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "A tua estadia");
}

/**
 * Página do hóspede: entra pelo link pessoal (token) enviado na confirmação.
 * Token inválido, reserva cancelada ou sem base → 404 (não diz qual).
 * Instruções de entrada e morada só com a reserva confirmada.
 */
export default async function Estadia({ params }) {
  const { lang, token } = await params;
  const T = (x) => t(lang, x);
  const r = await reservaPorToken(token).catch(() => null);
  if (!r) notFound();
  const [casaPt, relatorio, empresa] = await Promise.all([
    casaPorSlug(r.casaSlug).catch(() => null),
    relatorioEntrada(r.id).catch(() => null),
    getEmpresa(),
  ]);
  const casa = traduzDoc(casaPt, lang);
  const confirmada = r.estado === "confirmada";
  const wa = whatsappHref(empresa.telefone, tf(lang, "Olá! Tenho uma reserva em {casa} ({e} → {s}).", { casa: r.casaTitulo, e: r.entrada, s: r.saida }));
  const tel = telHref(empresa.telefone);

  return (
    <div className="container al-pagina al-estreita">
      <span className="eyebrow">{T("A tua estadia")}</span>
      <h1>{r.casaTitulo || casa?.titulo}</h1>

      <div className="al-cartao">
        <dl className="al-dados">
          <dt>{T("Entrada")}</dt>
          <dd>{dataCurta(r.entrada, lang)}</dd>
          <dt>{T("Saída")}</dt>
          <dd>{dataCurta(r.saida, lang)}</dd>
          <dt>{T("Noites")}</dt>
          <dd>{r.noites}</dd>
          {r.hospedes ? (
            <>
              <dt>{T("Hóspedes")}</dt>
              <dd>{r.hospedes}</dd>
            </>
          ) : null}
          {r.valor > 0 && r.origem === "direta" && (
            <>
              <dt>{T("Valor da estadia")}</dt>
              <dd>
                {formatarValor(r.valor, r.moeda || "EUR", lang, { decimais: 2 })}
                {r.limpeza > 0 && ` + ${T("limpeza")} ${formatarValor(r.limpeza, r.moeda || "EUR", lang, { decimais: 2 })}`}
              </dd>
            </>
          )}
          <dt>{T("Estado")}</dt>
          <dd>{T(confirmada ? "Confirmada" : "Concluída")}</dd>
        </dl>
      </div>

      {confirmada && casa && (casa.morada || casa.checkinInfo) && (
        <>
          <h2>{T("Como entrar")}</h2>
          <div className="al-cartao">
            {casa.morada && (
              <p>
                <strong>{T("Morada")}:</strong> {casa.morada}
              </p>
            )}
            {casa.checkinInfo && <p className="al-descricao">{casa.checkinInfo}</p>}
          </div>
        </>
      )}

      <h2>{T("Fotografias do estado da casa antes da tua entrada")}</h2>
      {relatorio ? (
        <Relatorio tarefa={relatorio} lang={lang} titulo={T("Inspeção de entrada")} mostrarNotas={false} />
      ) : (
        <p className="al-nota">{T("A nossa equipa inspeciona e fotografa a casa no dia da tua chegada. As fotografias aparecem aqui assim que a inspeção estiver concluída.")}</p>
      )}

      <h2>{T("Precisas de ajuda?")}</h2>
      <div className="al-ajuda-botoes">
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="al-btn al-btn-grande">
            WhatsApp
          </a>
        )}
        {tel && (
          <a href={tel} className="al-btn al-btn-sec al-btn-grande">
            {T("Ligar")}
          </a>
        )}
      </div>
      {confirmada && <ProblemaHospede token={token} />}
      {casa?.regras && (
        <>
          <h2>{T("Regras da casa")}</h2>
          <p className="al-descricao">{casa.regras}</p>
        </>
      )}
    </div>
  );
}
