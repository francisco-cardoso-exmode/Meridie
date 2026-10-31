import { redirect } from "next/navigation";
import ContaAl from "@/components/al/ContaAl";
import { getEquipa } from "@/lib/al/auth";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

export default async function EntrarEquipa() {
  if (await getEquipa()) redirect("/equipa");
  return <ContaAl papel="equipa" destino="/equipa" />;
}
