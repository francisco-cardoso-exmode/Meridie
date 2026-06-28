import Link from "next/link";

export const metadata = {
  title: "Política de Cookies",
  description:
    "O que são cookies, quais a Meridie Investments utiliza e como podes gerir o teu consentimento.",
};

export default function CookiesPage() {
  return (
    <div className="pagina-area">
      <div className="container legal">
        <h1>Política de Cookies</h1>
        <p className="legal-data">Última atualização: 28 de junho de 2026</p>

        <p>
          Os cookies são pequenos ficheiros guardados no teu dispositivo quando visitas um
          site. Servem para o fazer funcionar e, com a tua autorização, para perceber como é
          utilizado.
        </p>

        <h2>Cookies que utilizamos</h2>
        <ul>
          <li>
            <strong>Essenciais</strong> — necessários ao funcionamento do site e para guardar
            a tua escolha de consentimento. Não precisam de autorização.
          </li>
          <li>
            <strong>De análise (Google Analytics)</strong> — ajudam-nos a perceber que páginas
            e empreendimentos são mais vistos, para melhorar o site. Só são ativados se
            clicares em <strong>Aceitar</strong> no aviso de cookies.
          </li>
        </ul>

        <h2>Estatísticas sem cookies</h2>
        <p>
          Medimos também, de forma <strong>anónima e sem cookies</strong>, as páginas vistas,
          pesquisas e filtros usados (sem guardar o teu IP). Estes dados não te identificam.
        </p>

        <h2>Como gerir o consentimento</h2>
        <p>
          Podes <strong>aceitar ou rejeitar</strong> os cookies de análise no aviso que surge
          ao entrar. Para mudar de ideias mais tarde, limpa os dados do site no teu navegador
          (o aviso volta a aparecer) ou ajusta as definições de cookies do navegador. Também
          podes desativar cookies diretamente nas opções do teu browser.
        </p>

        <p>
          Para saber como tratamos os dados, vê a{" "}
          <Link href="/privacidade">Política de Privacidade</Link>.
        </p>

        <p className="legal-nota">
          Este texto é um modelo de boa-fé e não substitui aconselhamento jurídico.
        </p>
      </div>
    </div>
  );
}
