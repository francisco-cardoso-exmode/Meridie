import L from "@/components/L";
import Foto from "@/components/Foto";
import NavProprietario from "@/components/al/NavProprietario";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import LigarRecebimentos from "@/components/al/LigarRecebimentos";
import { estadoRecebimentos, recebimentosDisponiveis } from "@/lib/al/recebimentos";
import { t, tf } from "@/lib/i18n";
import { exigirProprietario, metaPrivada, dataCurta } from "@/lib/al/paginas";
import { casasDoProprietario } from "@/lib/al/casas";
import { listarReservas } from "@/lib/al/reservas";
import { ROTULO_ESTADO_CASA, ROTULO_PLANO, hojeLisboa, formatarValor, moedaDe } from "@/lib/al/regras";
import Icon from "@/components/Icon";
import InstalarApp from "@/components/al/InstalarApp";
import ConfirmarEmail from "@/components/al/ConfirmarEmail";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPrivada(lang, "Área de proprietário");
}

export default async function PainelProprietario({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  const p = await exigirProprietario(lang);
  const casas = await casasDoProprietario(p.id);
  // Recebimentos pelo Stripe: só com o Stripe ligado e casas em Portugal.
  const comRecebimentos = recebimentosDisponiveis() && casas.some((c) => (c.pais || "PT") === "PT");
  const receb = comRecebimentos ? await estadoRecebimentos(p) : null;
  const hoje = hojeLisboa();
  const proximas = casas.length
    ? (
        await listarReservas({
          casaSlug: { $in: casas.map((c) => c.slug) },
          estado: { $in: ["confirmada", "pedido"] },
          bloqueio: { $ne: true },
          saida: { $gte: hoje },
        })
      ).sort((a, b) => (a.entrada < b.entrada ? -1 : 1))
    : [];

  return (
    <div className="container al-pagina">
      <NavProprietario lang={lang} nome={p.nome} ativo="painel" />

      {p.emailConfirmado === false && <ConfirmarEmail email={p.email} />}

      <div className="al-cab">
        <h1>{T("As tuas casas")}</h1>
        <L href="/proprietario/casas/nova" className="al-btn">
          + {T("Nova casa")}
        </L>
      </div>

      {casas.length === 0 ? (
        <div className="al-cartao">
          <p>{T("Ainda não tens casas. Começa por criar a primeira — podes guardar como rascunho e completar depois.")}</p>
        </div>
      ) : (
        <div className="al-casas">
          {casas.map((c) => (
            <L key={c.slug} href={`/proprietario/casas/${c.slug}`} className="al-casa-card">
              <div className="al-casa-foto">{c.fotos?.[0] ? <Foto src={c.fotos[0]} alt="" fill sizes="160px" /> : <Icon name="home" size={32} />}</div>
              <div>
                <strong>{c.titulo}</strong>
                <div className="al-sub">
                  {[c.cidade, c.tipologia].filter(Boolean).join(" · ")}
                  {c.precoNoite ? ` · ${formatarValor(c.precoNoite, moedaDe(c), lang)}/${T("noite")}` : ""}
                </div>
                <span className={`al-badge ${c.estado}`}>{T(ROTULO_ESTADO_CASA[c.estado])}</span>{" "}
                <span className="al-badge">{T(ROTULO_PLANO[c.plano] || "")}</span>
              </div>
            </L>
          ))}
        </div>
      )}

      <h2>{T("Próximas reservas")}</h2>
      {proximas.length === 0 ? (
        <p className="al-nota">{T("Sem reservas por agora.")}</p>
      ) : (
        (() => {
          const linha = (r) => (
            <div className="al-lista-linha">
              <strong>{r.casaTitulo}</strong>
              <span>
                {dataCurta(r.entrada, lang)} → {dataCurta(r.saida, lang)} · {tf(lang, "{n} noites", { n: r.noites })} ·{" "}
                {String(r.hospede?.nome || "").split(" ")[0]}
              </span>
              <span className={`al-badge ${r.estado}`}>{T(r.estado === "pedido" ? "Pedido" : "Confirmada")}</span>
            </div>
          );
          // Com muitas reservas, pesquisa (casa, hóspede, data).
          if (proximas.length > 10)
            return (
              <ListaFiltravel
                itens={proximas.map((r) => ({
                  id: r.id,
                  busca: [r.casaTitulo, r.hospede?.nome, r.entrada, r.saida].join(" ").toLowerCase(),
                  ordem: { entrada: r.entrada },
                  node: linha(r),
                }))}
                ordens={[{ k: "entrada", label: T("Entrada") }]}
                placeholder={T("Pesquisar…")}
              />
            );
          return (
            <div className="al-lista">
              {proximas.map((r) => (
                <div key={r.id}>{linha(r)}</div>
              ))}
            </div>
          );
        })()
      )}

      {receb && (
        <>
          <h2>{T("Recebimentos")}</h2>
          <div className="al-cartao">
            {p.emailConfirmado === false ? (
              <p>{T("Confirma primeiro o teu email (aviso no topo desta página) para ligares a conta bancária onde recebes os pagamentos.")}</p>
            ) : receb.ativa ? (
              <>
                <p className="al-ok"><Icon name="check" size={18} /> {T("A tua conta para recebimentos está ativa. Depois de cada estadia transferimos a tua parte para o IBAN que indicaste no Stripe.")}</p>
                <LigarRecebimentos rotulo={T("Ver transferências e IBAN")} secundario />
              </>
            ) : (
              <>
                <p>
                  {T(
                    receb.ligada
                      ? "Falta terminar o registo no Stripe (identidade e IBAN) para recebermos e transferirmos a tua parte de cada reserva."
                      : "Para receberes a tua parte de cada reserva automaticamente, regista o teu IBAN no Stripe, o serviço de pagamentos que usamos. Demora uns 5 minutos — a Meridie nunca vê os teus dados bancários."
                  )}
                </p>
                <LigarRecebimentos rotulo={T(receb.ligada ? "Continuar o registo" : "Ligar a minha conta bancária")} />
              </>
            )}
          </div>
        </>
      )}

      <h2>{T("Documentos")}</h2>
      <div className="al-cartao">
        <p className="al-nota">
          {T("Em breve: contrato de gestão, faturas da comissão e relatórios mensais em PDF. Por agora, pede-nos qualquer documento por email.")}
        </p>
      </div>

      <InstalarApp texto={T("Reservas, ganhos e inspeções da tua casa no ecrã principal do telemóvel, como uma app — sem lojas.")} />
    </div>
  );
}
