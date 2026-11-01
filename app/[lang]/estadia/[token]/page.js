import { notFound } from "next/navigation";
import Relatorio from "@/components/al/Relatorio";
import ProblemaHospede from "@/components/al/ProblemaHospede";
import PagarEstadia from "@/components/al/PagarEstadia";
import InstalarApp from "@/components/al/InstalarApp";
import { t, tf } from "@/lib/i18n";
import { metaPrivada, dataCurta } from "@/lib/al/paginas";
import { reservaPorToken } from "@/lib/al/reservas";
import { casaPorSlug } from "@/lib/al/casas";
import { relatorioEntrada } from "@/lib/al/tarefas";
import { getEmpresa } from "@/lib/config";
import { whatsappHref, telHref } from "@/lib/contactoLinks";
import { formatarValor, totalHospede, podePagarOnline, hojeLisboa } from "@/lib/al/regras";
import { pagamentoDisponivel } from "@/lib/pagamentos";
import { traduzDoc } from "@/lib/i18n/conteudo";
import Icon from "@/components/Icon";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang, token } = await params;
  return {
    ...metaPrivada(lang, "A tua estadia"),
    // App do hóspede: manifest próprio desta reserva (abre no link pessoal).
    manifest: `/api/estadia/manifest/${encodeURIComponent(token)}${lang === "en" ? "?lang=en" : ""}`,
    appleWebApp: { capable: true, title: t(lang, "A minha estadia"), statusBarStyle: "default" },
    icons: { apple: "/pwa/apple-touch-icon.png" },
  };
}

export const viewport = { themeColor: "#1b3f6e" };

/**
 * Página do hóspede: entra pelo link pessoal (token) enviado na confirmação.
 * Token inválido, reserva cancelada ou sem base → 404 (não diz qual).
 * Instruções de entrada e morada só com a reserva confirmada.
 */
export default async function Estadia({ params, searchParams }) {
  const { lang, token } = await params;
  const voltouDoPagamento = (await searchParams)?.pagamento === "ok";
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
  // Morada e instruções de entrada (códigos de porta) só até ao dia da saída.
  const mostrarEntrada = confirmada && hojeLisboa() <= r.saida;
  const wa = whatsappHref(empresa.telefone, tf(lang, "Olá! Tenho uma reserva em {casa} ({e} → {s}).", { casa: r.casaTitulo, e: r.entrada, s: r.saida }));
  const tel = telHref(empresa.telefone);
  const moeda = r.moeda || "EUR";
  const v = (x) => formatarValor(x, moeda, lang, { decimais: 2 });
  const total = totalHospede(r);
  const estadoPag = r.pagamento?.estado;
  const pagar = podePagarOnline(r) && pagamentoDisponivel(r.pais);

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
          {r.valor > 0 && (r.origem === "direta" || pagar) && (
            <>
              <dt>{T("Valor da estadia")}</dt>
              <dd>{v(r.valor)}</dd>
              {r.limpeza > 0 && (
                <>
                  <dt>{T("Limpeza")}</dt>
                  <dd>{v(r.limpeza)}</dd>
                </>
              )}
              {r.taxaServico > 0 && (
                <>
                  <dt>{T("Taxa de serviço")}</dt>
                  <dd>{v(r.taxaServico)}</dd>
                </>
              )}
              <dt>{T("Total")}</dt>
              <dd>
                <strong>{v(total)}</strong>
              </dd>
              {estadoPag === "pago" && (
                <>
                  <dt>{T("Pagamento")}</dt>
                  <dd className="al-ok"><Icon name="check" size={16} /> {T("Pago")}</dd>
                </>
              )}
              {estadoPag === "reembolsado" && (
                <>
                  <dt>{T("Pagamento")}</dt>
                  <dd>{T("Reembolsado")}</dd>
                </>
              )}
            </>
          )}
          <dt>{T("Estado")}</dt>
          <dd>{T(confirmada ? "Confirmada" : "Concluída")}</dd>
        </dl>
      </div>

      {pagar && (
        <div className="al-cartao">
          {voltouDoPagamento || estadoPag === "pendente" ? (
            <p>
              {T(
                voltouDoPagamento
                  ? "Obrigado! Estamos a confirmar o pagamento — atualiza esta página daqui a um minuto. Se pagaste por Multibanco, a confirmação chega quando o pagamento for feito."
                  : "Tens um pagamento iniciado. Se ainda não o concluíste, podes pagar outra vez aqui."
              )}
            </p>
          ) : (
            <p>{tf(lang, "Para garantir a reserva, faz o pagamento de {v}.", { v: v(total) })}</p>
          )}
          <PagarEstadia token={token} rotulo={tf(lang, "Pagar {v}", { v: v(total) })} />
          <p className="al-nota">{T("Pagamento seguro pelo Stripe. Não guardamos os dados do teu cartão.")}</p>
        </div>
      )}

      {mostrarEntrada && casa && (casa.morada || casa.checkinInfo) && (
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
      {confirmada && <InstalarApp texto={T("Guarda esta página no telemóvel: a reserva, as instruções de entrada e o nosso contacto ficam a um toque durante toda a estadia.")} />}
      {casa?.regras && (
        <>
          <h2>{T("Regras da casa")}</h2>
          <p className="al-descricao">{casa.regras}</p>
        </>
      )}
    </div>
  );
}
