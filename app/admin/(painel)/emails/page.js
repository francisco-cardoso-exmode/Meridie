import { htmlConfirmacao, htmlNotificacao } from "@/lib/mailer";

export const metadata = { title: "Emails" };

export default function AdminEmails() {
  const confirmacao = htmlConfirmacao({
    nome: "João Silva",
    assunto: "Interesse: VIBE Meireles (Fortaleza)",
  });
  const notificacao = htmlNotificacao({
    nome: "João Silva",
    email: "joao@exemplo.com",
    assunto: "Interesse: VIBE Meireles (Fortaleza)",
    mensagem:
      "Olá, gostava de saber mais sobre este empreendimento e as condições de pagamento.",
  });

  return (
    <div className="admin-container">
      <h1>Emails</h1>
      <p className="admin-sub">
        Os emails enviados pelo site e quando são disparados. O envio é feito em
        Node (Nodemailer) via SMTP definido nas variáveis de ambiente.
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
          Para o logótipo aparecer como imagem nos emails, coloca o ficheiro em
          <code> public/email-logo.png</code> (caso contrário usa o nome em texto, como no preview).
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
          Enviado para <code>CONTACT_TO</code> com os dados da submissão (com
          reply-to para o email do cliente).
        </p>
        <iframe className="email-preview" srcDoc={notificacao} title="Email de notificação" />
      </section>
    </div>
  );
}
