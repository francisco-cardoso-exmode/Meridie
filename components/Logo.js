import Link from "next/link";

/**
 * LogoMark — símbolo geométrico da Meridie Investments recriado em SVG.
 * Inspirado no "compasso/roseta" do logo original: anéis concêntricos,
 * mira (crosshair), diagonais em X, losango inscrito e flor de 4 pétalas.
 * Usa `currentColor`, por isso herda a cor do contexto (texto).
 */
export function LogoMark({ size = 40, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      role="img"
      aria-label="Símbolo Meridie Investments"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Mira / crosshair */}
      <line x1="60" y1="6" x2="60" y2="114" />
      <line x1="16" y1="60" x2="104" y2="60" />

      {/* Anéis concêntricos */}
      <circle cx="60" cy="60" r="46" />
      <circle cx="60" cy="60" r="40" />

      {/* Diagonais em X (entre os vértices das pétalas) */}
      <line x1="32" y1="32" x2="88" y2="88" />
      <line x1="88" y1="32" x2="32" y2="88" />

      {/* Losango inscrito */}
      <polygon points="60,32 88,60 60,88 32,60" />

      {/* Flor de 4 pétalas (vesica) — uma pétala rodada 4×  */}
      <g>
        <path d="M60,32 A39.6,39.6 0 0 1 88,60 A39.6,39.6 0 0 1 60,32 Z" />
        <path
          d="M60,32 A39.6,39.6 0 0 1 88,60 A39.6,39.6 0 0 1 60,32 Z"
          transform="rotate(90 60 60)"
        />
        <path
          d="M60,32 A39.6,39.6 0 0 1 88,60 A39.6,39.6 0 0 1 60,32 Z"
          transform="rotate(180 60 60)"
        />
        <path
          d="M60,32 A39.6,39.6 0 0 1 88,60 A39.6,39.6 0 0 1 60,32 Z"
          transform="rotate(270 60 60)"
        />
      </g>
    </svg>
  );
}

/**
 * Logo — símbolo + marca textual "MERIDIE INVESTMENTS".
 * `variant="stacked"` mostra também o slogan por baixo.
 */
export default function Logo({
  href = "/",
  size = 38,
  variant = "inline",
  className = "",
}) {
  const content = (
    <span className={`logo logo-${variant} ${className}`.trim()}>
      <LogoMark size={size} className="logo-mark" />
      <span className="logo-text">
        <span className="logo-word">
          MERIDIE <span>INVESTMENTS</span>
        </span>
        {variant === "stacked" && (
          <span className="logo-tagline">
            Capital sem fronteiras. Investimento com precisão.
          </span>
        )}
      </span>
    </span>
  );

  if (!href) return content;
  return (
    <Link href={href} className="logo-link" aria-label="Meridie Investments — início">
      {content}
    </Link>
  );
}
