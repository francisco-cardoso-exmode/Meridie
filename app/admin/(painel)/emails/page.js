import Link from "next/link";
import { headers } from "next/headers";
import { htmlConfirmacao, htmlNotificacao } from "@/lib/mailer";
import { cardsHTML, assinaturaHTML } from "@/lib/emailcards";
import { empreendimentosDestaque } from "@/lib/store";

export const metadata = { title: "Emails & Assinaturas" };
export const dynamic = "force-dynamic";

export default async function AdminEmails() {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") || "http"}://${h.get("host")}`;
  const logoSrc = `${origin}/meridie_logo.png`;
  const destaque = await empreendimentosDestaque(3);
  const cardsBloco = cardsHTML(destaque, origin);

  const confirmacao = htmlConfirmacao({
    nome: "João Silva",
    assunto: "Interesse: VIBE Meireles (Fortaleza)",
    logoSrc,
    cardsBloco,
  });
  const notificacao = htmlNotificacao({
    nome: "João Silva",
    email: "joao@exemplo.com",
    assunto: "Interesse: VIBE Meireles (Fortaleza)",
    mensagem:
      "Olá, gostava de saber mais sobre este empreendimento e as condições de pagamento.",
    logoSrc,
  });
  const assinatura = assinaturaHTML({
    nome: "Paulo Rocha",
    cargo: "Meridie Investments Capital",
    telefone: "+351 210 000 000",
    email: "paulo.rocha@meridieinvestments.com",
    logoUrl: `${origin}/meridie_logo.png`,
    empreendimentos: destaque.slice(0, 2),
    baseUrl: origin,
  });

  return (
    <div className="admin-container">
      <h1>Emails &amp; Assinaturas</h1>
      <p className="admin-sub">
        Exemplos dos emails enviados pelo site e da assinatura. O envio é feito
        em Node (Nodemailer) via SMTP definido nas variáveis de ambiente.
      </p>

      <div className="email-how">
        <p>
          <strong>Quando alguém submete o formulário de contacto</strong> (página
          de contactos ou &quot;Tenho interesse&quot; num empreendimento), acontecem 3 coisas:
        </p>
        <ol>
          <li>A mensagem é guardada no MongoDB (coleção <code>contactos</code>).</li>
          <li>É enviada uma <strong>notificação à equipa</strong> para <code>CONTACT_TO</code>.</li>
          <li>É enviado um <strong>email de confirmação</strong> a quem submeteu.</li>
        </ol>
        <p className="email-note">
          O logótipo dos emails é o ficheiro <code>public/meridie_logo.png</code>.
        </p>
      </div>

      <section className="email-block">
        <h2>1. Confirmação ao cliente</h2>
        <p className="admin-sub">
          Enviado automaticamente a quem submete o formulário. Assunto:
          <em> &quot;Recebemos a sua mensagem — Meridie Investments&quot;</em>.
        </p>
        <iframe className="email-preview" srcDoc={confirmacao} title="Email de confirmação" />
      </section>

      <section className="email-block">
        <h2>2. Notificação à equipa</h2>
        <p className="admin-sub">
          Enviado para os destinatários definidos em <Link href="/admin/definicoes" className="admin-link">Definições</Link> (Paulo e Helder), com reply-to para o email do cliente.
        </p>
        <iframe className="email-preview" srcDoc={notificacao} title="Email de notificação" />
      </section>

      <section className="email-block">
        <h2>3. Assinatura (exemplo)</h2>
        <p className="admin-sub">
          Exemplo de assinatura com empreendimentos em destaque. Gera a tua em{" "}
          <Link href="/admin/assinatura" className="admin-link">Assinatura</Link> e cola no Gmail/Outlook.
        </p>
        <div className="sig-preview" dangerouslySetInnerHTML={{ __html: assinatura }} />
      </section>
    </div>
  );
}
