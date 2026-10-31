import Link from "next/link";
import { ReporPasswordAl } from "@/components/al/ContaAl";

export const dynamic = "force-dynamic";
export const metadata = { title: "Nova password" };

export default async function ReporEquipa({ searchParams }) {
  const { t } = await searchParams;
  if (typeof t !== "string" || !/^[a-f0-9]{64}$/.test(t))
    return (
      <div className="al-cartao">
        <p>Este link já foi usado ou expirou. Pede um novo.</p>
        <Link href="/equipa/entrar">Entrar</Link>
      </div>
    );
  return <ReporPasswordAl papel="equipa" token={t} destino="/equipa" />;
}
