"use client";

/**
 * Janelas próprias em vez de alert/confirm/prompt do browser (browser apenas).
 * Usa o <dialog> nativo (foco preso lá dentro, Esc fecha) e devolve uma Promise:
 * - avisar(texto)                       → undefined
 * - confirmar(texto, { ok, perigo })    → true/false
 * - pedirTexto(texto, { tipo, minimo }) → o texto ou null (cancelado)
 * Sem React: monta e desmonta o elemento à mão, para se poder chamar de
 * qualquer lado (handlers, hooks) sem provider.
 */

function abrir({ titulo, texto, ok = "OK", cancelar = null, perigo = false, campo = null }) {
  return new Promise((resolve) => {
    const d = document.createElement("dialog");
    d.className = "dialogo";
    const form = document.createElement("form");
    form.method = "dialog";

    if (titulo) {
      const h = document.createElement("h3");
      h.textContent = titulo;
      form.append(h);
    }
    const p = document.createElement("p");
    p.textContent = texto;
    form.append(p);

    let input = null;
    if (campo) {
      input = document.createElement("input");
      input.type = campo.tipo || "text";
      if (campo.minimo) input.minLength = campo.minimo;
      input.required = true;
      input.autocomplete = campo.tipo === "password" ? "new-password" : "off";
      form.append(input);
    }

    const botoes = document.createElement("div");
    botoes.className = "dialogo-botoes";
    if (cancelar) {
      const c = document.createElement("button");
      c.type = "button";
      c.className = "btn btn-outline escuro";
      c.textContent = cancelar;
      c.onclick = () => d.close("cancelar");
      botoes.append(c);
    }
    const b = document.createElement("button");
    b.type = "submit";
    b.value = "ok";
    b.className = perigo ? "btn btn-perigo" : "btn btn-primary";
    b.textContent = ok;
    botoes.append(b);
    form.append(botoes);
    d.append(form);

    d.addEventListener("close", () => {
      const sim = d.returnValue === "ok";
      d.remove();
      resolve(campo ? (sim ? input.value : null) : cancelar ? sim : undefined);
    });
    // Clicar fora da janela = cancelar.
    d.addEventListener("click", (e) => e.target === d && d.close("cancelar"));

    document.body.append(d);
    d.showModal();
    (input || b).focus();
  });
}

export const avisar = (texto, opcoes = {}) => abrir({ texto, ...opcoes });

export const confirmar = (texto, opcoes = {}) => abrir({ texto, cancelar: "Cancelar", ...opcoes });

export const pedirTexto = (texto, { tipo = "text", minimo, ...opcoes } = {}) =>
  abrir({ texto, cancelar: "Cancelar", campo: { tipo, minimo }, ...opcoes });
