import { readFile } from "fs/promises";
import path from "path";
import SignatureGenerator from "@/components/admin/SignatureGenerator";
import { allEmpreendimentos } from "@/lib/store";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata = { title: "Assinatura" };

async function logoDataUri() {
  try {
    const buf = await readFile(path.join(process.cwd(), "public", "meridie_logo.png"));
    return `data:image/png;base64,${buf.toString("base64")}`;
  } catch {
    return `${SITE_URL}/meridie_logo.png`;
  }
}

export default async function AdminAssinatura() {
  const baseUrl = SITE_URL; // domínio real (para os links de texto da assinatura)
  // Logo embutido (base64) — aparece sempre na pré-visualização e vai colado
  // na assinatura, sem depender de o domínio já estar ativo.
  const logoUrl = await logoDataUri();

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
