import L from "@/components/L";
import { t } from "@/lib/i18n";
import { SairAl } from "@/components/al/ContaAl";

// Barra da app do proprietário (só com sessão).
export default function NavProprietario({ lang, nome, ativo }) {
  const T = (x) => t(lang, x);
  const itens = [
    ["/proprietario", "Painel", "painel"],
    ["/proprietario/ganhos", "Ganhos", "ganhos"],
  ];
  return (
    <nav className="al-nav" aria-label={T("Área de proprietário")}>
      <div className="al-nav-ola">
        {T("Olá")}, <strong>{String(nome || "").split(" ")[0]}</strong>
      </div>
      <div className="al-nav-links">
        {itens.map(([href, rot, k]) => (
          <L key={k} href={href} className={ativo === k ? "on" : undefined}>
            {T(rot)}
          </L>
        ))}
        <SairAl papel="proprietario" destino={lang === "en" ? "/en/owner/entrar" : "/proprietario/entrar"} />
      </div>
    </nav>
  );
}
