import Link from "next/link";
import { urlPrevisualizar } from "@/lib/previsualizacao";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import { todasAsCasas } from "@/lib/al/casas";
import { listarProprietarios } from "@/lib/al/contas";
import { opcoes, opcoesDeMapa } from "@/lib/al/admin";
import { ROTULO_ESTADO_CASA, ROTULO_PLANO, PAISES, formatarValor, moedaDe } from "@/lib/al/regras";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Casas" };

export default async function CasasAdmin() {
  const { dados, semBase } = await leAdmin(async () => {
    const [casas, donos] = await Promise.all([todasAsCasas(), listarProprietarios()]);
    return { casas, donos: Object.fromEntries(donos.map((d) => [d.id, d])) };
  }, { casas: [], donos: {} });
  const { casas, donos } = dados;

  const itens = casas.map((c) => {
    const dono = donos[c.proprietarioId];
    return {
      id: c.slug,
      busca: [c.titulo, c.cidade, c.zona, c.slug, dono?.nome, dono?.email].join(" ").toLowerCase(),
      facetas: { pais: c.pais || "PT", estado: c.estado, plano: c.plano, cidade: c.cidade || "" },
      ordem: { atualizadoEm: new Date(c.atualizadoEm || 0).getTime(), titulo: c.titulo || "", preco: Number(c.precoNoite) || 0 },
      node: (
        <div className="admin-row">
          <div className="admin-thumb" style={{ backgroundImage: c.fotos?.[0] ? `url(${c.fotos[0]})` : undefined }} />
          <div className="admin-row-main">
            <div className="admin-row-title">
              {c.titulo} <span className={`al-badge ${c.estado}`}>{ROTULO_ESTADO_CASA[c.estado]}</span>
            </div>
            <div className="admin-row-sub">
              {PAISES[c.pais || "PT"].nome} · {c.cidade || "—"} · {ROTULO_PLANO[c.plano]} ·{" "}
              {c.precoNoite ? `${formatarValor(c.precoNoite, moedaDe(c))}/noite` : "sem preço"} · {dono ? `${dono.nome} <${dono.email}>` : "sem proprietário"}
            </div>
          </div>
          <div className="admin-row-actions">
            <a href={urlPrevisualizar(`/alojamento/${c.slug}`)} target="_blank" className="admin-link">
              {c.estado === "publicada" ? "Ver" : "Pré-visualizar"}
            </a>
            <Link href={`/admin/alojamento/casas/${c.slug}`} className="admin-link">
              Abrir
            </Link>
          </div>
        </div>
      ),
    };
  });

  return (
    <div className="admin-container">
      <h1>Casas</h1>
      <p className="admin-sub">As casas são criadas pelos proprietários na app. Aqui revês, aprovas, publicas e suspendes.</p>
      <AvisoSemBase mostrar={semBase} />
      <ListaFiltravel
        itens={itens}
        placeholder="Título, cidade, proprietário, slug…"
        facetas={[
          { k: "pais", label: "País", opcoes: Object.entries(PAISES).map(([v, p]) => ({ v, label: p.nome })) },
          { k: "estado", label: "Estado", opcoes: opcoesDeMapa(ROTULO_ESTADO_CASA) },
          { k: "plano", label: "Plano", opcoes: opcoesDeMapa(ROTULO_PLANO) },
          { k: "cidade", label: "Cidade", opcoes: opcoes(casas.map((c) => c.cidade)) },
        ]}
        ordens={[
          { k: "atualizadoEm", label: "Mais recentes", desc: true },
          { k: "titulo", label: "Título" },
          { k: "preco", label: "Preço/noite" },
        ]}
        ordemPadrao="atualizadoEm"
      />
    </div>
  );
}
