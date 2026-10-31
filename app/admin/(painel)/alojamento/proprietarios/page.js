import Link from "next/link";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import { listarProprietarios } from "@/lib/al/contas";
import { todasAsCasas } from "@/lib/al/casas";
import { opcoesDeMapa } from "@/lib/al/admin";
import { ROTULO_PLANO, PAISES } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Proprietários" };

export default async function ProprietariosAdmin() {
  const { dados, semBase } = await leAdmin(async () => {
    const [donos, casas] = await Promise.all([listarProprietarios(), todasAsCasas()]);
    return { donos, casas };
  }, { donos: [], casas: [] });
  const { donos, casas } = dados;

  const itens = donos.map((p) => {
    const minhas = casas.filter((c) => c.proprietarioId === p.id);
    const paises = [...new Set(minhas.map((c) => c.pais || "PT"))];
    return {
      id: p.id,
      busca: [p.nome, p.email, p.telefone, p.nif].join(" ").toLowerCase(),
      // País: o das casas (um proprietário com casas nos dois países aparece em "PT+BR").
      facetas: { pais: paises.sort().join("+") || "—", plano: p.plano },
      ordem: { nome: p.nome || "", criadoEm: new Date(p.criadoEm || 0).getTime() },
      node: (
        <div className="admin-row">
          <div className="admin-row-main">
            <div className="admin-row-title">{p.nome}</div>
            <div className="admin-row-sub">
              {p.email} · {p.telefone || "sem telefone"} {p.nif ? `· NIF ${p.nif}` : ""} · prefere {ROTULO_PLANO[p.plano] || "—"} · desde{" "}
              {p.criadoEm ? new Date(p.criadoEm).toLocaleDateString("pt-PT") : "—"}
            </div>
            <div className="admin-row-sub">
              {minhas.length
                ? minhas.map((c, i) => (
                    <span key={c.slug}>
                      {i > 0 && " · "}
                      <Link href={`/admin/alojamento/casas/${c.slug}`}>{c.titulo}</Link> ({c.estado})
                    </span>
                  ))
                : "Sem casas"}
            </div>
          </div>
        </div>
      ),
    };
  });

  const paisesOpc = [...new Set(itens.map((i) => i.facetas.pais))].map((v) => ({
    v,
    label: v.split("+").map((k) => PAISES[k]?.nome || k).join(" + "),
  }));

  return (
    <div className="admin-container">
      <h1>Proprietários</h1>
      <p className="admin-sub">Registam-se em /proprietario. A recuperação de password é feita por eles, por email.</p>
      <AvisoSemBase mostrar={semBase} />
      <ListaFiltravel
        itens={itens}
        placeholder="Nome, email, telefone…"
        facetas={[
          { k: "pais", label: "País", opcoes: paisesOpc },
          { k: "plano", label: "Plano", opcoes: opcoesDeMapa(ROTULO_PLANO) },
        ]}
        ordens={[
          { k: "criadoEm", label: "Mais recentes", desc: true },
          { k: "nome", label: "Nome" },
        ]}
        ordemPadrao="criadoEm"
      />
    </div>
  );
}
