"use client";

import { useState } from "react";
import { useT } from "@/components/LangProvider";
import FotosAl from "@/components/al/FotosAl";
import { pedidoAl } from "@/lib/al/cliente";
import { COMODIDADES, TIPOLOGIAS, DIVISOES_SUGERIDAS, PAISES } from "@/lib/al/regras";

/**
 * Formulário da casa — usado pelo proprietário (PT/EN) e pelo backoffice.
 * modo: "proprietario" | "admin". Sem `casa` = nova casa (só proprietário).
 * Os campos legais mudam com o país: PT pede o n.º de Registo AL; BR pede a
 * confirmação do condomínio e, opcionalmente, a inscrição municipal.
 */
export default function CasaForm({ casa, modo = "proprietario", urlDepois }) {
  const { t, href } = useT();
  const nova = !casa;
  const [c, setC] = useState(() => ({
    pais: "PT",
    titulo: "",
    cidade: "",
    zona: "",
    morada: "",
    tipologia: "",
    quartos: "",
    casasBanho: "",
    capacidade: "",
    precoNoite: "",
    limpeza: "",
    estadiaMinima: 1,
    licencaAL: "",
    inscricaoMunicipal: "",
    condominioPermite: false,
    descricao: "",
    regras: "",
    checkinInfo: "",
    comodidades: [],
    divisoes: [...DIVISOES_SUGERIDAS],
    fotos: [],
    plano: "gestao",
    comissaoReduzida: false,
    ...(casa || {}),
    lat: casa?.coordenadas?.lat ?? "",
    lng: casa?.coordenadas?.lng ?? "",
  }));
  const [novaDiv, setNovaDiv] = useState("");
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const set = (k) => (e) => setC((x) => ({ ...x, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value }));
  const moeda = PAISES[c.pais]?.moeda || "EUR";

  function toggleComodidade(k) {
    setC((x) => ({ ...x, comodidades: x.comodidades.includes(k) ? x.comodidades.filter((y) => y !== k) : [...x.comodidades, k] }));
  }
  function moverDiv(i, d) {
    setC((x) => {
      const l = [...x.divisoes];
      const j = i + d;
      if (j < 0 || j >= l.length) return x;
      [l[i], l[j]] = [l[j], l[i]];
      return { ...x, divisoes: l };
    });
  }

  async function guardar(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: t("A guardar…") });
    const { lat, lng, slug, estado: _e, proprietarioId, criadoEm, atualizadoEm, moeda: _m, estadoEm, trancaAte, ...resto } = c;
    const body = { ...resto, coordenadas: { lat, lng } };
    if (modo !== "admin") delete body.comissaoReduzida;
    const url =
      modo === "admin"
        ? `/api/admin/alojamento/casas/${casa.slug}`
        : nova
          ? "/api/proprietario/casas"
          : `/api/proprietario/casas/${casa.slug}`;
    const r = await pedidoAl(url, { method: nova ? "POST" : "PUT", body });
    if (!r.ok) return setEstado({ a: "erro", msg: t(r.erro) });
    if (nova) {
      window.location.href = href(`/proprietario/casas/${r.slug}`);
      return;
    }
    setEstado({ a: "ok", msg: t("Guardado.") });
    if (urlDepois) window.location.href = urlDepois;
  }

  return (
    <form className="al-form" onSubmit={guardar}>
      <fieldset>
        <legend>{t("A casa")}</legend>
        <div className="al-grelha">
          <label>
            {t("País")}
            <select value={c.pais} onChange={set("pais")}>
              {Object.entries(PAISES).map(([k, p]) => (
                <option key={k} value={k}>
                  {t(p.nome)}
                </option>
              ))}
            </select>
          </label>
          <label className="al-larga">
            {t("Título do anúncio")}
            <input value={c.titulo} onChange={set("titulo")} required maxLength={120} placeholder={t("ex.: T2 com varanda perto da praia")} />
          </label>
          <label>
            {t("Cidade")}
            <input value={c.cidade} onChange={set("cidade")} list="al-cidades" maxLength={120} />
            <datalist id="al-cidades">
              {(PAISES[c.pais]?.cidades || []).map((x) => (
                <option key={x} value={x} />
              ))}
            </datalist>
          </label>
          <label>
            {t("Zona / bairro")}
            <input value={c.zona} onChange={set("zona")} maxLength={120} />
          </label>
          <label className="al-larga">
            {t("Morada")} <small>({t("privada — só a equipa a vê")})</small>
            <input value={c.morada} onChange={set("morada")} maxLength={300} autoComplete="street-address" />
          </label>
          <label>
            {t("Tipologia")}
            <select value={c.tipologia} onChange={set("tipologia")}>
              <option value="">—</option>
              {TIPOLOGIAS.map((x) => (
                <option key={x} value={x}>
                  {t(x)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {t("Quartos")}
            <input type="number" min={0} value={c.quartos ?? ""} onChange={set("quartos")} />
          </label>
          <label>
            {t("Casas de banho")}
            <input type="number" min={0} value={c.casasBanho ?? ""} onChange={set("casasBanho")} />
          </label>
          <label>
            {t("Capacidade (hóspedes)")}
            <input type="number" min={1} value={c.capacidade ?? ""} onChange={set("capacidade")} />
          </label>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("Preço e regras")}</legend>
        <div className="al-grelha">
          <label>
            {t("Preço por noite")} ({moeda})
            <input type="number" min={0} step="0.01" inputMode="decimal" value={c.precoNoite ?? ""} onChange={set("precoNoite")} />
          </label>
          <label>
            {t("Limpeza (paga pelo hóspede)")} ({moeda})
            <input type="number" min={0} step="0.01" inputMode="decimal" value={c.limpeza ?? ""} onChange={set("limpeza")} />
          </label>
          <label>
            {t("Estadia mínima (noites)")}
            <input type="number" min={1} max={90} value={c.estadiaMinima ?? 1} onChange={set("estadiaMinima")} />
          </label>
          <label>
            {t("Plano")}
            <select value={c.plano} onChange={set("plano")}>
              <option value="gestao">{t("Gestão completa")}</option>
              <option value="anuncio">{t("Anúncio")}</option>
            </select>
          </label>
          {modo === "admin" && (
            <label className="al-check">
              <input type="checkbox" checked={!!c.comissaoReduzida} onChange={set("comissaoReduzida")} />
              Comissão reduzida (comprou através da Meridie). Com 2+ casas ativas é automática.
            </label>
          )}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("Licenças")}</legend>
        {c.pais === "BR" ? (
          <div className="al-grelha">
            <label>
              {t("Inscrição municipal (opcional)")}
              <input value={c.inscricaoMunicipal || ""} onChange={set("inscricaoMunicipal")} maxLength={60} />
            </label>
            <label className="al-check al-larga">
              <input type="checkbox" checked={!!c.condominioPermite} onChange={set("condominioPermite")} />
              {t("O condomínio permite locação por temporada (obrigatório para publicar)")}
            </label>
          </div>
        ) : (
          <label>
            {t("N.º de Registo de Alojamento Local (RNAL)")} <small>({t("obrigatório para publicar")})</small>
            <input value={c.licencaAL || ""} onChange={set("licencaAL")} maxLength={120} placeholder="12345/AL" />
          </label>
        )}
      </fieldset>

      <fieldset>
        <legend>{t("Descrição")}</legend>
        <label>
          {t("Descrição")} <small>({t("em português — a versão inglesa é traduzida automaticamente")})</small>
          <textarea rows={7} value={c.descricao} onChange={set("descricao")} maxLength={6000} />
        </label>
        <label>
          {t("Regras da casa")}
          <textarea rows={3} value={c.regras} onChange={set("regras")} maxLength={3000} />
        </label>
        <label>
          {t("Instruções de entrada")} <small>({t("privadas — só os hóspedes confirmados as veem")})</small>
          <textarea rows={4} value={c.checkinInfo} onChange={set("checkinInfo")} maxLength={4000} placeholder={t("Códigos, chaves, estacionamento, Wi-Fi…")} />
        </label>
      </fieldset>

      <fieldset>
        <legend>{t("Comodidades")}</legend>
        <div className="al-chips">
          {Object.entries(COMODIDADES).map(([k, rot]) => (
            <label key={k} className={`al-chip${c.comodidades.includes(k) ? " on" : ""}`}>
              <input type="checkbox" checked={c.comodidades.includes(k)} onChange={() => toggleComodidade(k)} />
              {t(rot)}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("Divisões (para as inspeções)")}</legend>
        <p className="al-nota">{t("A equipa fotografa cada divisão antes e depois de cada estadia.")}</p>
        <ul className="al-divs">
          {c.divisoes.map((d, i) => (
            <li key={`${d}-${i}`}>
              <span>{d}</span>
              <button type="button" aria-label={t("Subir")} onClick={() => moverDiv(i, -1)}>↑</button>
              <button type="button" aria-label={t("Descer")} onClick={() => moverDiv(i, 1)}>↓</button>
              <button type="button" aria-label={t("Remover")} onClick={() => setC((x) => ({ ...x, divisoes: x.divisoes.filter((_, j) => j !== i) }))}>
                ×
              </button>
            </li>
          ))}
        </ul>
        <div className="al-linha2">
          <input value={novaDiv} onChange={(e) => setNovaDiv(e.target.value)} placeholder={t("ex.: Quarto 2")} maxLength={60} />
          <button
            type="button"
            className="al-btn al-btn-sec"
            onClick={() => {
              const v = novaDiv.trim();
              if (v && !c.divisoes.includes(v)) setC((x) => ({ ...x, divisoes: [...x.divisoes, v] }));
              setNovaDiv("");
            }}
          >
            + {t("Acrescentar")}
          </button>
        </div>
      </fieldset>

      <fieldset>
        <legend>{t("Fotografias")}</legend>
        <p className="al-nota">{t("A primeira é a foto principal do anúncio.")}</p>
        <FotosAl
          value={c.fotos}
          onChange={(fotos) => setC((x) => ({ ...x, fotos }))}
          rota={modo === "admin" ? "/api/admin/upload" : "/api/proprietario/upload"}
          pasta="casas"
          max={40}
          camara={modo !== "admin"}
        />
      </fieldset>

      <fieldset>
        <legend>{t("Localização no mapa (opcional)")}</legend>
        <p className="al-nota">{t("No site mostramos só a zona aproximada, nunca a porta.")}</p>
        <div className="al-linha2">
          <label>
            Latitude
            <input inputMode="decimal" value={c.lat} onChange={set("lat")} placeholder="38.7223" />
          </label>
          <label>
            Longitude
            <input inputMode="decimal" value={c.lng} onChange={set("lng")} placeholder="-9.1393" />
          </label>
        </div>
      </fieldset>

      {estado.msg && <p className={`al-msg ${estado.a === "erro" ? "erro" : "ok"}`}>{estado.msg}</p>}
      <div className="al-acoes-fixas">
        <button type="submit" className="al-btn al-btn-grande" disabled={estado.a === "loading"}>
          {nova ? t("Criar casa") : t("Guardar alterações")}
        </button>
      </div>
    </form>
  );
}
