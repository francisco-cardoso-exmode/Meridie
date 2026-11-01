"use client";

import { useEffect, useState } from "react";
import { useT } from "@/components/LangProvider";
import Icon from "@/components/Icon";

/**
 * "Instalar a app" (PWA). Android/Chrome: botão que abre o pedido de
 * instalação do browser. iPhone: explica o passo do Safari (não há botão).
 * Já instalada (aberta como app): não mostra nada.
 */
export default function InstalarApp({ texto }) {
  const { t } = useT();
  const [pedido, setPedido] = useState(null);
  const [modo, setModo] = useState("outro");

  useEffect(() => {
    const instalada = window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone;
    if (instalada) return setModo("instalada");
    if (/iphone|ipad|ipod/i.test(navigator.userAgent)) setModo("ios");
    const antes = (e) => {
      e.preventDefault();
      setPedido(e);
    };
    const feito = () => setModo("instalada");
    window.addEventListener("beforeinstallprompt", antes);
    window.addEventListener("appinstalled", feito);
    return () => {
      window.removeEventListener("beforeinstallprompt", antes);
      window.removeEventListener("appinstalled", feito);
    };
  }, []);

  if (modo === "instalada") return null;

  async function instalar() {
    pedido.prompt();
    const { outcome } = await pedido.userChoice.catch(() => ({}));
    if (outcome === "accepted") setModo("instalada");
    setPedido(null);
  }

  return (
    <div className="al-cartao al-instalar">
      <div className="icon">
        <Icon name="phone" />
      </div>
      <div>
        <strong>{t("Instalar a app")}</strong>
        <p className="al-nota">
          {texto}{" "}
          {modo === "ios"
            ? t("No Safari, toca em Partilhar e depois em «Adicionar ao ecrã principal».")
            : !pedido && t("No browser, abre o menu (⋮) e escolhe «Instalar app» ou «Adicionar ao ecrã principal».")}
        </p>
      </div>
      {pedido && (
        <button type="button" className="al-btn" onClick={instalar}>
          {t("Instalar")}
        </button>
      )}
    </div>
  );
}
