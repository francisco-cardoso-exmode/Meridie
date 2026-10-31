import Link from "next/link";
import { allSolucoes } from "@/lib/solucoes";
import { TIPOS_SOLUCAO, hrefSolucao, temPreco } from "@/lib/catalogo";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Soluções tecnológicas" };

export default async function AdminSolucoes() {
  const { dados: lista, semBase } = await leAdmin(() => allSolucoes({ todos: true, estrito: true }), []);
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Soluções tecnológicas</h1>
          <p className="admin-sub">
            O catálogo da área Tecnologia: soluções que <strong>desenvolvemos</strong> e que{" "}
            <strong>representamos</strong>. Aparecem em{" "}
            <Link href="/tecnologia" target="_blank" className="admin-link">/tecnologia</Link>, cada uma com página
            própria e os botões «Pedir demonstração» / «Pedir proposta» (chegam a Pedidos). Os textos do topo da página
            editam-se em Páginas → Tecnologia.
          </p>
        </div>
        <Link href="/admin/solucoes/novo" className="btn btn-primary">+ Nova</Link>
      </div>
      <AvisoSemBase mostrar={semBase} />
      {!semBase && lista.length === 0 && (
        <div className="empty-state"><p>Ainda não há soluções. Cria a primeira.</p></div>
      )}
      <ListaFiltravel
        placeholder="Pesquisar solução ou parceiro…"
        ordemPadrao="ordem"
        ordens={[
          { k: "ordem", label: "ordem no site" },
          { k: "nome", label: "nome" },
        ]}
        facetas={[
          { k: "tipo", label: "Tipo", opcoes: Object.entries(TIPOS_SOLUCAO).map(([v, label]) => ({ v, label })) },
          {
            k: "preco",
            label: "Preço",
            opcoes: [{ v: "valor", label: "Com preço publicado" }, { v: "consulta", label: "Só sob consulta" }],
          },
        ]}
        itens={lista.map((s) => ({
          id: s.slug,
          busca: `${s.nome} ${s.slug} ${s.parceiro || ""} ${s.tagline || ""}`.toLowerCase(),
          facetas: { tipo: s.tipo, preco: (s.planos || []).some(temPreco) ? "valor" : "consulta" },
          ordem: { nome: s.nome, ordem: Number.isFinite(Number(s.ordem)) ? Number(s.ordem) : 99 },
          node: (
            <div className="admin-row">
              <div className="admin-thumb" style={{ backgroundImage: `url(${thumbUrl(s.imagens?.[0]) || ""})` }} />
              <div className="admin-row-main">
                <div className="admin-row-title">
                  {s.nome}
                  {s.destaque && <span className="tag-dest">DESTAQUE</span>}
                  {s.ativo === false && <span className="tag-oculto">INATIVA</span>}
                </div>
                <div className="admin-row-sub">
                  {TIPOS_SOLUCAO[s.tipo] || s.tipo}
                  {s.parceiro ? ` · ${s.parceiro}` : ""} · {(s.planos || []).length} plano(s)
                </div>
              </div>
              <div className="admin-row-actions">
                <Link href={hrefSolucao(s.slug)} target="_blank" className="admin-link">Ver</Link>
                <Link href={`/admin/solucoes/${encodeURIComponent(s.slug)}`} className="admin-link">Editar</Link>
                <DeleteButton slug={s.slug} nome={s.nome} endpoint="solucoes" />
              </div>
            </div>
          ),
        }))}
      />
    </div>
  );
}
