import { headers } from "next/headers";
import SignatureGenerator from "@/components/admin/SignatureGenerator";
import { allEmpreendimentos } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assinatura" };

export default async function AdminAssinatura() {
  const h = await headers();
  const origin = `${h.get("x-forwarded-proto") || "http"}://${h.get("host")}`;
  const baseUrl = process.env.SITE_URL || origin;
  const logoUrl = `${baseUrl}/meridie_logo.png`;

  const lista = (await allEmpreendimentos()).map((e) => ({
    slug: e.slug,
    nome: e.nome,
    cidade: e.cidade,
    preco: e.preco,
    moeda: e.moeda,
    imagens: e.imagens?.slice(0, 1) || [],
    destaque: !!e.destaque,
  }));

  return (
    <div className="admin-container">
      <h1>Assinatura de email</h1>
      <p className="admin-sub">
        Gera a tua assinatura (com empreendimentos em destaque) e cola no
        Gmail/Outlook.
      </p>
      <SignatureGenerator empreendimentos={lista} baseUrl={baseUrl} logoUrl={logoUrl} />
    </div>
  );
}
