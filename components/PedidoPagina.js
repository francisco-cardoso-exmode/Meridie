"use client";

import { useEffect, useRef, useState } from "react";
import L from "@/components/L";
import Foto from "@/components/Foto";
import { useT } from "@/components/LangProvider";
import { resolverDesafio } from "@/lib/resolverDesafio";
import { carrinho, useCarrinho } from "@/lib/pedidoCarrinho";
import { chaveItem, normalizarItens, totaisPedido, quantidadeValida, MOTIVOS, MAX_QTD } from "@/lib/pedido";
import { formataPreco } from "@/lib/catalogo";

// Lê "?item=produto:slug" / "?item=solucao:slug:plano" e "?motivo=…" — o
// pedido de um só item (botões "Pedir informação", "Pedir demonstração"…),
// que não mexe no pedido guardado.
function itemDoUrl() {
  const q = new URLSearchParams(window.location.search);
  const [tipo, slug, plano] = (q.get("item") || "").split(":");
  const item = normalizarItens([{ tipo, slug, plano, quantidade: 1 }])[0];
  if (!item) return null;
  const motivo = Object.hasOwn(MOTIVOS, q.get("motivo")) ? q.get("motivo") : "informacao";
  return { item, motivo };
}

// Atualiza a cópia guardada no browser com os dados atuais da base (preço,
// nome, unidade); itens que já não existem ficam marcados.
async function dadosAtuais(itens, lang) {
  try {
    const r = await fetch("/api/pedidos/itens", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itens, lang }),
    });
    const j = await r.json();
    return j.ok ? j.itens : null;
  } catch {
    return null;
  }
}

export default function PedidoPagina() {
  const { t, tf, lang } = useT();
  const guardados = useCarrinho();
  const [unico, setUnico] = useState(null); // { item, motivo } — pedido de um só item
  const [itensUnico, setItensUnico] = useState([]);
  const [pronto, setPronto] = useState(false);
  const [removidos, setRemovidos] = useState(0);
  const [estado, setEstado] = useState({ a: "idle", msg: "", ref: "" });
  const montadoEm = useRef(0);
  const prova = useRef(null);
  const atualizado = useRef(false);

  useEffect(() => {
    montadoEm.current = Date.now();
    const u = itemDoUrl();
    if (u) {
      setUnico(u);
      dadosAtuais([u.item], lang).then((r) => {
        setItensUnico(r?.length ? r.map((x) => ({ ...x, quantidade: x.minimo || 1 })) : []);
        setPronto(true);
      });
    } else setPronto(true);
  }, [lang]);

  // Pedido guardado: atualiza uma vez com os dados atuais.
  useEffect(() => {
    if (unico || atualizado.current || !guardados.length) return;
    atualizado.current = true;
    dadosAtuais(guardados, lang).then((r) => {
      if (!r) return;
      const porChave = new Map(r.map((x) => [chaveItem(x), x]));
      const novos = guardados
        .filter((g) => porChave.has(chaveItem(g)))
        .map((g) => ({ ...porChave.get(chaveItem(g)), quantidade: g.quantidade }));
      setRemovidos(guardados.length - novos.length);
      carrinho.substituir(novos);
    });
  }, [guardados, unico, lang]);

  const itens = unico ? itensUnico : guardados;
  const tot = totaisPedido(itens);
  const motivo = unico?.motivo || "encomenda";

  function mudarQtd(chave, q) {
    if (unico) setItensUnico((l) => l.map((i) => (chaveItem(i) === chave ? { ...i, quantidade: q } : i)));
    else carrinho.quantidade(chave, q);
  }
  function prepararProva() {
    if (!prova.current) prova.current = resolverDesafio().catch(() => null);
    return prova.current;
  }

  async function onSubmit(e) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    setEstado({ a: "loading", msg: "", ref: "" });
    const v = (k) => form.elements[k]?.value || "";
    const dados = {
      nome: v("nome"),
      empresa: v("empresa"),
      nif: v("nif"),
      email: v("email"),
      telefone: v("telefone"),
      pais: v("pais"),
      morada: v("morada"),
      notas: v("notas"),
      website: v("website"),
      motivo,
      lang,
      itens: itens.map(({ tipo, slug, plano, quantidade }) => ({ tipo, slug, plano, quantidade })),
      t: montadoEm.current ? Date.now() - montadoEm.current : 0,
      prova: await prepararProva(),
    };
    prova.current = null; // cada desafio só serve uma vez
    try {
      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok && j.ok) {
        if (!unico) carrinho.limpar();
        setEstado({ a: "ok", msg: "", ref: j.referencia || "" });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setEstado({ a: "erro", msg: t(j.erro || "Não foi possível enviar."), ref: "" });
      }
    } catch {
      setEstado({ a: "erro", msg: t("Erro de ligação. Verifica a internet e tenta novamente."), ref: "" });
    }
  }

  if (estado.a === "ok") {
    return (
      <div className="pedido-ok">
        <h2>{t("Pedido enviado!")}</h2>
        {estado.ref && (
          <p>
            {t("Referência")}: <strong>{estado.ref}</strong>
          </p>
        )}
        <p>{t("Enviámos-te um email de confirmação. A nossa equipa responde em breve com a disponibilidade e as condições.")}</p>
        <div className="pedido-ok-acoes">
          <L href="/representacoes" className="btn btn-primary">{t("Continuar a ver produtos")}</L>
          <L href="/tecnologia" className="btn btn-ghost-escuro">{t("Ver soluções tecnológicas")}</L>
        </div>
      </div>
    );
  }

  if (!pronto) return <p className="rep-contagem">{t("A carregar…")}</p>;

  if (!itens.length) {
    return (
      <div className="empty-state pedido-vazio">
        <p>{unico ? t("Este item já não está disponível.") : t("O teu pedido está vazio.")}</p>
        <p>{t("Escolhe produtos nas Representações comerciais ou uma solução em Tecnologia e acrescenta-os ao pedido.")}</p>
        <div className="pedido-ok-acoes">
          <L href="/representacoes" className="btn btn-primary">{t("Representações comerciais")}</L>
          <L href="/tecnologia" className="btn btn-ghost-escuro">{t("Tecnologia")}</L>
        </div>
      </div>
    );
  }

  return (
    <div className="pedido-grid">
      <div>
        <h2 className="pedido-titulo">{t(MOTIVOS[motivo])}</h2>
        {removidos > 0 && (
          <p className="form-msg erro">
            {removidos === 1
              ? t("Um item do teu pedido já não está disponível e foi retirado.")
              : tf("{n} itens do teu pedido já não estão disponíveis e foram retirados.", { n: removidos })}
          </p>
        )}
        <ul className="pedido-linhas">
          {tot.linhas.map((i) => {
            const k = chaveItem(i);
            return (
              <li key={k} className="pedido-linha">
                <div className="pedido-linha-foto">
                  {i.imagem && <Foto src={i.imagem} alt="" width={120} height={120} sizes="72px" />}
                </div>
                <div className="pedido-linha-info">
                  {i.href ? <L href={i.href}>{i.nome}</L> : <strong>{i.nome}</strong>}
                  {i.marca && <span className="pedido-linha-marca">{i.marca}</span>}
                  <span className="pedido-linha-preco">
                    {i.precoTipo === "valor" && i.preco
                      ? `${formataPreco(i.preco, lang)}${i.unidade ? ` / ${i.unidade}` : ""}`
                      : `${t("Preço sob consulta")}${i.unidade ? ` · ${i.unidade}` : ""}`}
                  </span>
                  {i.disponivel === false && <span className="rep-indisponivel-txt">{t("Indisponível de momento")}</span>}
                </div>
                {i.tipo === "produto" ? (
                  <div className="qtd pequena" role="group" aria-label={tf("Quantidade de {nome}", { nome: i.nome })}>
                    <button type="button" onClick={() => mudarQtd(k, quantidadeValida(i.quantidade - 1, i.minimo))} disabled={i.quantidade <= i.minimo} aria-label={t("Menos")}>−</button>
                    <input
                      type="number"
                      inputMode="numeric"
                      min={i.minimo}
                      max={MAX_QTD}
                      value={i.quantidade}
                      onChange={(e) => mudarQtd(k, quantidadeValida(e.target.value, i.minimo))}
                      aria-label={t("Quantidade")}
                    />
                    <button type="button" onClick={() => mudarQtd(k, quantidadeValida(i.quantidade + 1, i.minimo))} aria-label={t("Mais")}>+</button>
                  </div>
                ) : (
                  <span />
                )}
                <div className="pedido-linha-total">
                  {i.total != null ? formataPreco(i.total, lang) : "—"}
                  {!unico && (
                    <button type="button" className="pedido-remover" onClick={() => carrinho.remover(k)} aria-label={tf("Remover {nome}", { nome: i.nome })}>
                      {t("Remover")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div className="pedido-totais">
          {tot.subtotal > 0 && (
            <p>
              {t("Subtotal indicativo")}: <strong>{formataPreco(tot.subtotal, lang)}</strong>
            </p>
          )}
          {tot.semPreco > 0 && (
            <p className="pedido-nota">
              {tot.semPreco === tot.nLinhas
                ? t("Os preços são enviados com a nossa resposta.")
                : t("Os artigos sob consulta não estão incluídos no subtotal — enviamos o preço com a resposta.")}
            </p>
          )}
          <p className="pedido-nota">{t("Não há pagamento online: respondemos com a disponibilidade, os portes e as condições.")}</p>
        </div>
      </div>

      <form className="form-grid pedido-form" onSubmit={onSubmit} onFocus={prepararProva} noValidate>
        <h2 className="pedido-titulo full">{t("Os teus dados")}</h2>
        <div className="field">
          <label htmlFor="p-nome">{t("Nome")} *</label>
          <input id="p-nome" name="nome" required maxLength={100} autoComplete="name" />
        </div>
        <div className="field">
          <label htmlFor="p-empresa">{t("Empresa")}</label>
          <input id="p-empresa" name="empresa" maxLength={150} autoComplete="organization" />
        </div>
        <div className="field">
          <label htmlFor="p-email">Email *</label>
          <input id="p-email" name="email" type="email" required maxLength={254} autoComplete="email" />
        </div>
        <div className="field">
          <label htmlFor="p-telefone">{t("Telefone")} *</label>
          <input id="p-telefone" name="telefone" type="tel" required maxLength={40} autoComplete="tel" />
        </div>
        <div className="field">
          <label htmlFor="p-pais">{t("País")} *</label>
          <input id="p-pais" name="pais" required maxLength={60} autoComplete="country-name" />
        </div>
        <div className="field">
          <label htmlFor="p-nif">{t("NIF (opcional)")}</label>
          <input id="p-nif" name="nif" maxLength={30} />
        </div>
        {!unico && (
          <div className="field full">
            <label htmlFor="p-morada">{t("Morada de entrega (opcional)")}</label>
            <textarea id="p-morada" name="morada" rows={2} maxLength={400} autoComplete="street-address" />
          </div>
        )}
        <div className="field full">
          <label htmlFor="p-notas">{unico ? t("O que gostavas de saber?") : t("Notas")}</label>
          <textarea id="p-notas" name="notas" rows={4} maxLength={4000} />
        </div>

        {/* Campo-armadilha para bots: invisível e fora da navegação por teclado. */}
        <div className="campo-armadilha" aria-hidden="true">
          <label htmlFor="p-website">Website</label>
          <input id="p-website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
        </div>

        <div className="form-status full" role="status" aria-live="polite">
          {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
        </div>
        <div className="field full">
          <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
            {estado.a === "loading" ? t("A enviar...") : t("Enviar pedido")}
          </button>
          <p className="form-privacidade">
            {t("Ao enviar, aceitas que usemos estes dados para te responder, conforme a")}{" "}
            <L href="/privacidade">{t("Política de Privacidade")}</L>.
          </p>
        </div>
      </form>
    </div>
  );
}
