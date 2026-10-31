"use client";

import { useMemo, useState } from "react";
import { useT } from "@/components/LangProvider";
import { LOCALE } from "@/lib/i18n";

/**
 * Calendário de disponibilidade: noites ocupadas (só datas — nunca dados de
 * hóspedes). `ocupadas`: ["AAAA-MM-DD", …]; `hoje`: "AAAA-MM-DD".
 * `marcadas` (opcional): noites a destacar (ex.: bloqueios do proprietário).
 */
export default function Calendario({ ocupadas = [], marcadas = [], hoje, meses = 2 }) {
  const { t, lang } = useT();
  const [inicio, setInicio] = useState(0);
  const ocup = useMemo(() => new Set(ocupadas), [ocupadas]);
  const marc = useMemo(() => new Set(marcadas), [marcadas]);
  const base = hoje || new Date().toISOString().slice(0, 10);
  const [ano0, mes0] = [Number(base.slice(0, 4)), Number(base.slice(5, 7)) - 1];
  const diasSemana = useMemo(() => {
    const f = new Intl.DateTimeFormat(LOCALE[lang], { weekday: "narrow", timeZone: "UTC" });
    // 2024-01-01 foi segunda-feira.
    return Array.from({ length: 7 }, (_, i) => f.format(new Date(Date.UTC(2024, 0, 1 + i))));
  }, [lang]);

  const lista = Array.from({ length: meses }, (_, k) => {
    const d = new Date(Date.UTC(ano0, mes0 + inicio + k, 1));
    const ano = d.getUTCFullYear();
    const mes = d.getUTCMonth();
    const nDias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
    const vazio = (d.getUTCDay() + 6) % 7; // segunda = 0
    const nome = new Intl.DateTimeFormat(LOCALE[lang], { month: "long", year: "numeric", timeZone: "UTC" }).format(d);
    const dias = Array.from({ length: nDias }, (_, i) => {
      const iso = `${ano}-${String(mes + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`;
      return { iso, n: i + 1, passado: iso < base, ocupado: ocup.has(iso), marcado: marc.has(iso) };
    });
    return { chave: `${ano}-${mes}`, nome, vazio, dias };
  });

  return (
    <div className="al-cal">
      <div className="al-cal-nav">
        <button type="button" className="al-btn al-btn-sec" disabled={inicio <= 0} onClick={() => setInicio((x) => x - meses)} aria-label={t("Meses anteriores")}>
          ‹
        </button>
        <button type="button" className="al-btn al-btn-sec" disabled={inicio >= 12 - meses} onClick={() => setInicio((x) => x + meses)} aria-label={t("Meses seguintes")}>
          ›
        </button>
      </div>
      <div className="al-cal-meses">
        {lista.map((m) => (
          <div key={m.chave} className="al-cal-mes">
            <div className="al-cal-titulo">{m.nome}</div>
            <div className="al-cal-grelha">
              {diasSemana.map((d, i) => (
                <span key={i} className="al-cal-ds">
                  {d}
                </span>
              ))}
              {Array.from({ length: m.vazio }, (_, i) => (
                <span key={`v${i}`} />
              ))}
              {m.dias.map((d) => (
                <span
                  key={d.iso}
                  className={`al-cal-dia${d.passado ? " passado" : ""}${d.ocupado ? " ocupado" : ""}${d.marcado ? " marcado" : ""}`}
                  title={d.ocupado ? t("Ocupado") : undefined}
                >
                  {d.n}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="al-cal-legenda">
        <span><i className="al-cal-dia" /> {t("Livre")}</span>
        <span><i className="al-cal-dia ocupado" /> {t("Ocupado")}</span>
        {marcadas.length > 0 && <span><i className="al-cal-dia marcado" /> {t("Bloqueado por ti")}</span>}
      </div>
    </div>
  );
}
