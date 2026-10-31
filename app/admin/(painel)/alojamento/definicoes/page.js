import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { DefinicoesAl } from "@/components/al/admin/AdminAl";
import { leAdmin } from "@/lib/leituraAdmin";
import { getConfigAl } from "@/lib/al/config";
import { CONFIG_PADRAO } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Definições" };

export default async function DefinicoesAlPagina() {
  const { dados: config, semBase } = await leAdmin(() => getConfigAl({ estrito: true }), CONFIG_PADRAO);
  return (
    <div className="admin-container">
      <h1>Definições do Alojamento</h1>
      <p className="admin-sub">
        Usadas nos ganhos dos proprietários e na calculadora de &quot;Inscreve a tua casa&quot;. A comissão Meridie é sobre o valor da estadia depois
        da comissão da plataforma (sem limpeza nem taxa turística).
      </p>
      <AvisoSemBase mostrar={semBase} />
      {!semBase && <DefinicoesAl config={config} />}
    </div>
  );
}
