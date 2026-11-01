import Icon from "@/components/Icon";
import { t } from "@/lib/i18n";

/**
 * Ecrãs de demonstração das apps (proprietário e hóspede) para as páginas
 * públicas: desenhados em HTML/CSS com dados de exemplo — não leem a base.
 */

function Telemovel({ titulo, children, className = "" }) {
  return (
    <div className={`demo-tlm ${className}`} aria-hidden="true">
      <div className="demo-ecra">
        <div className="demo-topo">
          <span className="demo-marca">MERIDIE</span>
          <span className="demo-titulo">{titulo}</span>
        </div>
        <div className="demo-corpo">{children}</div>
      </div>
    </div>
  );
}

const Linha = ({ a, b, forte }) => (
  <div className={`demo-linha${forte ? " forte" : ""}`}>
    <span>{a}</span>
    <span>{b}</span>
  </div>
);

// Ocupação de exemplo de novembro: [primeiro dia, último dia].
const OCUPADO = [
  [3, 6],
  [7, 12],
  [15, 17],
  [21, 27],
];
const ocupado = (d) => OCUPADO.some(([a, b]) => d >= a && d <= b);

export function DemoProprietario({ lang }) {
  const T = (x) => t(lang, x);
  const DIAS = lang === "en" ? ["M", "T", "W", "T", "F", "S", "S"] : ["S", "T", "Q", "Q", "S", "S", "D"];
  const BARRAS = [38, 52, 70, 96, 88, 64];
  return (
    <div className="demo-tlms">
      <Telemovel titulo={T("Ganhos")} className="lado">
        <p className="demo-sub">{T("Outubro 2026")}</p>
        <div className="demo-valor">1 842 €</div>
        <p className="demo-sub">{T("a receber depois das estadias")}</p>
        <div className="demo-barras">
          {BARRAS.map((h, i) => (
            <span key={i} style={{ height: `${h}%` }} className={i === 4 ? "on" : ""} />
          ))}
        </div>
        <div className="demo-cartao">
          <Linha a={T("Estadias (4)")} b="2 246 €" />
          <Linha a={T("Comissão (18%)")} b="− 404 €" />
          <Linha a={T("A receber")} b="1 842 €" forte />
        </div>
      </Telemovel>

      <Telemovel titulo={T("Calendário")} className="meio">
        <p className="demo-sub">{T("Casa em Lagos · Novembro")}</p>
        <div className="demo-cal">
          {DIAS.map((d, i) => (
            <b key={`d${i}`}>{d}</b>
          ))}
          {/* 1 de novembro de 2026 é domingo */}
          {Array.from({ length: 6 }, (_, i) => (
            <span key={`v${i}`} />
          ))}
          {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
            <span key={d} className={ocupado(d) ? "ocupado" : ""}>
              {d}
            </span>
          ))}
        </div>
        <div className="demo-cartao">
          <strong>Ana M.</strong>
          <span className="demo-sub">{T("7 → 12 nov · 5 noites · 2 hóspedes")}</span>
          <span className="demo-badge">{T("Confirmada")}</span>
        </div>
      </Telemovel>

      <Telemovel titulo={T("Inspeção de saída")} className="lado">
        <p className="demo-sub">{T("Casa em Lagos · 12 nov")}</p>
        <div className="demo-fotos">
          {["Sala", "Cozinha", "Quarto", "Casa de banho", "Varanda", "Entrada"].map((d, i) => (
            <div key={d} className={`demo-foto f${i}`}>
              <Icon name="camera" size={16} />
              <span>{T(d)}</span>
            </div>
          ))}
        </div>
        <div className="demo-cartao demo-ok">
          <Icon name="shield-check" size={18} />
          <span>{T("18 fotografias · sem danos")}</span>
        </div>
      </Telemovel>
    </div>
  );
}

export function DemoHospede({ lang }) {
  const T = (x) => t(lang, x);
  return (
    <div className="demo-tlms dois">
      <Telemovel titulo={T("A tua estadia")} className="lado">
        <p className="demo-sub">{T("Casa em Lagos")}</p>
        <div className="demo-cartao">
          <Linha a={T("Entrada")} b={T("7 nov")} />
          <Linha a={T("Saída")} b={T("12 nov")} />
          <Linha a={T("Noites")} b="5" />
          <Linha a={T("Total")} b="684,60 €" forte />
          <div className="demo-pago">
            <Icon name="check" size={14} /> {T("Pago")}
          </div>
        </div>
        <div className="demo-cartao">
          <strong>{T("Inspeção de entrada")}</strong>
          <span className="demo-sub">{T("18 fotografias do estado da casa antes da tua chegada")}</span>
        </div>
      </Telemovel>

      <Telemovel titulo={T("Como entrar")} className="meio">
        <div className="demo-cartao">
          <span className="demo-sub">{T("Morada")}</span>
          <strong>Rua do Castelo 12, Lagos</strong>
        </div>
        <div className="demo-cartao">
          <span className="demo-sub">{T("Código da porta")}</span>
          <div className="demo-codigo">4 8 2 7</div>
        </div>
        <div className="demo-botao">WhatsApp</div>
        <div className="demo-botao sec">{T("Reportar um problema")}</div>
      </Telemovel>
    </div>
  );
}
