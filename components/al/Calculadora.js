"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import { simularCalculadora, formatarValor, PAISES } from "@/lib/al/regras";

// Preço por noite inicial de cada país (só para a calculadora abrir com um exemplo).
const PRECO_EXEMPLO = { PT: 95, BR: 350 };

/**
 * Calculadora de rendimento ("Inscreve a tua casa"): estimativa mensal para
 * o proprietário sozinho no Airbnb, com co-anfitrião e com cada plano
 * Meridie. Comissões das plataformas editáveis e marcadas como aproximadas.
 */
export default function Calculadora({ planos }) {
  const { t, lang } = useT();
  const [e, setE] = useState({ pais: "PT", precoNoite: PRECO_EXEMPLO.PT, ocupacao: 60, diretas: 20, taxaOta: 15, taxaCoanfitriao: 20, reduzida: false });
  const set = (k) => (ev) => setE((x) => ({ ...x, [k]: ev.target.type === "checkbox" ? ev.target.checked : ev.target.value }));
  const moeda = PAISES[e.pais].moeda;
  const r = simularCalculadora({
    ...e,
    pctAnuncio: planos.anuncio,
    pctGestao: e.reduzida ? planos.reduzida : planos.gestao,
  });
  const v = (x) => formatarValor(x, moeda, lang);
  const max = Math.max(r.sozinho, r.coanfitriao, r.anuncio, r.gestao, 1);

  const linhas = [
    { k: "sozinho", rotulo: t("Sozinho no Airbnb"), nota: t("tu fazes tudo: anúncio, mensagens, check-ins, limpezas"), valor: r.sozinho },
    { k: "coanf", rotulo: t("Com co-anfitrião"), nota: t("estimativa — a % varia muito"), valor: r.coanfitriao },
    { k: "anuncio", rotulo: `Meridie — ${t("Anúncio")} (${planos.anuncio}%)`, nota: t("tu operas; nós anunciamos e trazemos reservas diretas"), valor: r.anuncio, nosso: true },
    {
      k: "gestao",
      rotulo: `Meridie — ${t("Gestão completa")} (${e.reduzida ? planos.reduzida : planos.gestao}%)`,
      nota: t("nós tratamos de tudo; tu recebes"),
      valor: r.gestao,
      nosso: true,
    },
  ];

  return (
    <div className="al-calc">
      <div className="al-calc-entradas">
        <label>
          {t("País")}
          <select
            value={e.pais}
            onChange={(ev) => setE((x) => ({ ...x, pais: ev.target.value, precoNoite: PRECO_EXEMPLO[ev.target.value] }))}
          >
            {Object.entries(PAISES).map(([k, p]) => (
              <option key={k} value={k}>
                {t(p.nome)} ({p.moeda})
              </option>
            ))}
          </select>
        </label>
        <label>
          {t("Preço por noite")} ({moeda})
          <input type="number" min={0} inputMode="decimal" value={e.precoNoite} onChange={set("precoNoite")} />
        </label>
        <label>
          {t("Ocupação")}: <strong>{e.ocupacao}%</strong>
          <input type="range" min={0} max={100} value={e.ocupacao} onChange={set("ocupacao")} />
        </label>
        <label>
          {t("Reservas diretas (sem comissão de plataforma)")}: <strong>{e.diretas}%</strong>
          <input type="range" min={0} max={100} value={e.diretas} onChange={set("diretas")} />
        </label>
        <label>
          {t("Comissão da plataforma (aprox.)")} %
          <input type="number" min={0} max={50} step="0.5" value={e.taxaOta} onChange={set("taxaOta")} />
        </label>
        <label>
          {t("Comissão de um co-anfitrião (aprox.)")} %
          <input type="number" min={0} max={50} step="0.5" value={e.taxaCoanfitriao} onChange={set("taxaCoanfitriao")} />
        </label>
        <label className="al-check">
          <input type="checkbox" checked={e.reduzida} onChange={set("reduzida")} />
          {t("Tenho 2 ou mais casas, ou comprei através da Meridie")}
        </label>
      </div>
      <div className="al-calc-saida" aria-live="polite">
        <p className="al-calc-bruto">
          {t("Receita bruta estimada por mês")}: <strong>{v(r.bruto)}</strong> <small>({r.noites} {t("noites")})</small>
        </p>
        {linhas.map((l) => (
          <div key={l.k} className={`al-calc-linha${l.nosso ? " nosso" : ""}`}>
            <div className="al-calc-rot">
              <strong>{l.rotulo}</strong>
              <small>{l.nota}</small>
            </div>
            <div className="al-calc-barra">
              <span style={{ width: `${Math.round((l.valor / max) * 100)}%` }} />
            </div>
            <div className="al-calc-valor">{v(l.valor)}</div>
          </div>
        ))}
        <p className="al-nota">
          {t("Estimativa mensal para o proprietário, antes de impostos e de custos fixos (condomínio, energia, consumíveis). A limpeza é paga pelo hóspede ao custo e a taxa turística é entregue ao município — nenhuma entra nestas contas. A comissão Meridie é calculada sobre o valor da estadia depois da comissão da plataforma. As comissões do Airbnb/Booking e dos co-anfitriões são aproximadas: confirma as tuas.")}
        </p>
      </div>
    </div>
  );
}
