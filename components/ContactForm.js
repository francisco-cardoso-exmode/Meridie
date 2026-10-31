"use client";

import { useState, useRef, useEffect } from "react";
import L from "@/components/L";
import { enviarEvento } from "@/components/Track";
import { useT } from "@/components/LangProvider";
import { resolverDesafio } from "@/lib/resolverDesafio";

export default function ContactForm({ assuntoInicial = "", origem = "contacto" }) {
  const { t, lang } = useT();
  const [estado, setEstado] = useState({ a: "idle", msg: "" });
  const interesseFeito = useRef(false);
  // Momento em que o formulário apareceu — o servidor rejeita envios
  // instantâneos (bots), junto com o campo-armadilha "website".
  const montadoEm = useRef(0);
  useEffect(() => {
    montadoEm.current = Date.now();
  }, []);

  // Prova anti-bot: começa a ser calculada na primeira interação, para estar
  // pronta (ou quase) quando a pessoa carregar em Enviar.
  const prova = useRef(null);
  function prepararProva() {
    if (!prova.current) prova.current = resolverDesafio().catch(() => null);
    return prova.current;
  }

  // Primeira interação com o formulário = sinal de interesse.
  function marcarInteresse() {
    prepararProva();
    if (interesseFeito.current) return;
    interesseFeito.current = true;
    enviarEvento("interesse", origem);
  }

  async function onSubmit(e) {
    e.preventDefault();
    setEstado({ a: "loading", msg: "" });

    const form = e.currentTarget;
    const dados = {
      nome: form.nome.value,
      email: form.email.value,
      assunto: form.assunto.value,
      mensagem: form.mensagem.value,
      lang,
      ref: origem,
      website: form.website.value,
      t: montadoEm.current ? Date.now() - montadoEm.current : 0,
      prova: await prepararProva(),
    };
    // Cada desafio só serve uma vez: o próximo envio pede outro.
    prova.current = null;

    try {
      const res = await fetch("/api/contacto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados),
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok && json.ok) {
        setEstado({
          a: "ok",
          msg: t("Mensagem enviada! Enviámos-te um email de confirmação e a nossa equipa entrará em contacto muito em breve."),
        });
        enviarEvento("lead_enviada", origem);
        form.reset();
      } else {
        setEstado({ a: "erro", msg: t(json.erro || "Não foi possível enviar.") });
      }
    } catch {
      setEstado({
        a: "erro",
        msg: t("Erro de ligação. Verifica a internet e tenta novamente."),
      });
    }
  }

  return (
    <form className="form-grid" onSubmit={onSubmit} onFocus={marcarInteresse} noValidate>
      <div className="field">
        <label htmlFor="nome">{t("Nome")} *</label>
        <input id="nome" name="nome" type="text" required placeholder={t("O teu nome")} />
      </div>
      <div className="field">
        <label htmlFor="email">Email *</label>
        <input id="email" name="email" type="email" required placeholder={t("email@exemplo.pt")} />
      </div>
      <div className="field full">
        <label htmlFor="assunto">{t("Assunto")}</label>
        <input
          id="assunto"
          name="assunto"
          type="text"
          defaultValue={assuntoInicial}
          placeholder={t("Sobre o que queres falar?")}
        />
      </div>
      <div className="field full">
        <label htmlFor="mensagem">{t("Mensagem")} *</label>
        <textarea id="mensagem" name="mensagem" rows={6} required placeholder={t("Escreve a tua mensagem...")} />
      </div>

      {/* Campo-armadilha para bots: invisível e fora da navegação por teclado. */}
      <div className="campo-armadilha" aria-hidden="true">
        <label htmlFor={`website-${origem}`}>Website</label>
        <input id={`website-${origem}`} name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
      </div>

      <div className="form-status" role="status" aria-live="polite">
        {estado.a === "ok" && <div className="form-msg ok">{estado.msg}</div>}
        {estado.a === "erro" && <div className="form-msg erro">{estado.msg}</div>}
      </div>

      <div className="field full">
        <button type="submit" className="btn btn-primary" disabled={estado.a === "loading"}>
          {estado.a === "loading" ? t("A enviar...") : t("Enviar mensagem")}
        </button>
        <p className="form-privacidade">
          {t("Ao enviar, aceitas que usemos estes dados para te responder, conforme a")}{" "}
          <L href="/privacidade">{t("Política de Privacidade")}</L>.
        </p>
      </div>
    </form>
  );
}
