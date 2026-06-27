import nodemailer from "nodemailer";

export function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para os outros
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function enviarEmailContacto({ nome, email, assunto, mensagem }) {
  const transporter = getTransporter();

  const para = process.env.CONTACT_TO || process.env.SMTP_USER;

  await transporter.sendMail({
    from: `"Site Meridie Investments" <${process.env.SMTP_USER}>`,
    to: para,
    replyTo: email,
    subject: `[Contacto] ${assunto || "Nova mensagem do site"}`,
    text: `Nome: ${nome}\nEmail: ${email}\nAssunto: ${assunto || "(sem assunto)"}\n\n${mensagem}`,
    html: `
      <h2>Nova mensagem do site Meridie Investments</h2>
      <p><strong>Nome:</strong> ${nome}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Assunto:</strong> ${assunto || "(sem assunto)"}</p>
      <hr />
      <p style="white-space:pre-wrap">${mensagem}</p>
    `,
  });
}
