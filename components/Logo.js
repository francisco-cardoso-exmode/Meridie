import Link from "next/link";

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
          Capital sem fronteiras. Investimento com precisão.
        </span>
      )}
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="logo-link" aria-label="Meridie Investments — início">
      {content}
    </Link>
  );
}
