# Meridie Investments — Plataforma imobiliária Portugal ↔ Brasil

Site de investimento imobiliário transfronteiriço entre **Portugal e o Brasil**,
construído com **Next.js (App Router)**, **MongoDB** e **Nodemailer**, pronto para
deploy na **Vercel**.

> _Capital sem fronteiras. Investimento com precisão._

## Stack

- **Next.js 15** — App Router, Server + Client Components
- **MongoDB** — guarda as submissões do formulário de contacto (ligação _lazy_)
- **Nodemailer** — envia os contactos por email (SMTP)
- **Vercel** — hosting e deploy

## Estrutura

```
meridien/
├── app/
│   ├── layout.js                  # Layout global (Header + Footer)
│   ├── page.js                    # Home (escolha PT/BR, destaques, processo)
│   ├── portugal/page.js           # Mercado PT + explorador com filtros
│   ├── brasil/page.js             # Mercado BR + explorador com filtros
│   ├── empreendimentos/[slug]/    # Página individual de cada imóvel (SSG)
│   ├── como-funciona/page.js      # Processo em 5 passos + pilares de serviço
│   ├── quem-somos/page.js         # Missão, visão, valores e diferenciais
│   ├── parcerias/page.js          # Rede verificada + tornar-se parceiro
│   ├── faq/page.js                # Perguntas frequentes (acordeão)
│   ├── contactos/page.js          # Contactos + formulário
│   ├── globals.css                # Estilos globais (paleta navy/dourado)
│   └── api/contacto/route.js      # Endpoint do formulário (MongoDB + email)
├── components/
│   ├── Header.js · Footer.js · Logo.js
│   ├── EmpreendimentoCard.js      # Cartão de imóvel
│   ├── ListingsExplorer.js        # Filtros (zona/tipo/finalidade/quartos) — client
│   ├── Accordion.js               # FAQ — client
│   └── ContactForm.js             # Formulário (client); aceita assunto pré-preenchido
├── lib/
│   ├── empreendimentos.js         # Dados dos imóveis + helpers (fonte estática)
│   ├── mongodb.js                 # Ligação ao MongoDB (lazy)
│   └── mailer.js                  # Configuração do Nodemailer
└── .env.example                   # Modelo das variáveis de ambiente
```

## Gerir empreendimentos

Os imóveis são uma **fonte estática** em [`lib/empreendimentos.js`](lib/empreendimentos.js).
A navegação e os filtros **não dependem de base de dados** — só o formulário de
contacto usa o backend. Para adicionar um imóvel, acrescenta um objeto ao array
`EMPREENDIMENTOS` (ver os campos e os helpers no topo do ficheiro). As fotos são
atualmente URLs do Unsplash; substituir por fotos reais quando disponíveis.

## Começar (local)

```bash
npm install
cp .env.example .env.local   # preencher os valores
npm run dev                  # http://localhost:3000
```

> O `npm run build` **não** precisa das variáveis de ambiente (a ligação ao
> MongoDB é _lazy_); o runtime do formulário sim.

## Variáveis de ambiente

| Variável       | Descrição                                            |
| -------------- | ---------------------------------------------------- |
| `MONGODB_URI`  | String de ligação ao MongoDB (Atlas)                 |
| `MONGODB_DB`   | Nome da base de dados (ex.: `meridie`)               |
| `SMTP_HOST`    | Servidor SMTP (ex.: `smtp.gmail.com`)                |
| `SMTP_PORT`    | Porta SMTP (`587` ou `465`)                          |
| `SMTP_USER`    | Utilizador / email de envio                          |
| `SMTP_PASS`    | Password ou _app password_                           |
| `CONTACT_TO`   | Email que recebe as mensagens do formulário          |

## Deploy na Vercel

1. Push para um repositório Git (GitHub/GitLab).
2. Em <https://vercel.com> → **Add New Project** → importa o repositório.
3. Em **Settings → Environment Variables**, adiciona as variáveis do `.env.example`.
4. Deploy. A Vercel deteta o Next.js automaticamente.

## Base de dados

As submissões ficam na coleção `contactos`, com os campos: `nome`, `email`,
`assunto`, `mensagem`, `criadoEm`. Nas páginas de empreendimento o campo
`assunto` vem pré-preenchido com o nome do imóvel.
