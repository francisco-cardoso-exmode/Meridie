"use client";

import L from "@/components/L";
import { useT } from "@/components/LangProvider";

/**
 * Logo oficial da Meridie Investments (símbolo + marca, horizontal, dourado).
 * `size` = altura em px. `variant="stacked"` acrescenta o slogan por baixo.
 */
export default function Logo({
  href = "/",
  size = 38,
  variant = "inline",
  className = "",
}) {
  const { t } = useT();
  const content = (
    <span className={`logo logo-${variant} ${className}`.trim()}>
      <img
        src="/logo-horizontal.svg"
        alt="Meridie Investments"
        className="logo-img"
        style={{ height: size, width: "auto" }}
      />
      {variant === "stacked" && (
        <span className="logo-tagline">
          {t("Capital sem fronteiras. Investimento com precisão.")}
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <L href={href} className="logo-link" aria-label={t("Meridie Investments — início")}>
      {content}
    </L>
  );
}
