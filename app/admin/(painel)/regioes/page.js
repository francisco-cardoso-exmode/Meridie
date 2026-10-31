import Link from "next/link";
import { allRegioes } from "@/lib/store";
import { PAIS_LABEL } from "@/lib/empreendimentos";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import ListaFiltravel from "@/components/admin/ListaFiltravel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Regiões & Zonas" };

export default async function AdminRegioes() {
  const { dados: lista, semBase } = await leAdmin(() => allRegioes({ estrito: true }), []);
  const mapaNome = Object.fromEntries(lista.map((r) => [r.slug, r.nome]));

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Regiões & Zonas</h1>
          <p className="admin-sub">
            As regiões de topo aparecem como banners. As zonas pertencem a uma
            região (campo &quot;pertence a&quot;).
          </p>
        </div>
        <Link href="/admin/regioes/novo" className="btn btn-primary">+ Nova</Link>
      </div>

      <AvisoSemBase mostrar={semBase} />
      <ListaFiltravel
        placeholder="Pesquisar por nome, cidade, zona…"
        facetas={[
          { k: "pais", label: "País" },
          { k: "nivel", label: "Tipo", opcoes: [{ v: "regiao", label: "Regiões" }, { v: "zona", label: "Zonas" }] },
          { k: "parent", label: "Região-mãe" },
          { k: "home", label: "Página inicial", opcoes: [{ v: "sim", label: "Na página inicial" }, { v: "nao", label: "Fora da página inicial" }] },
        ]}
        ordens={[{ k: "nome", label: "Nome" }, { k: "pais", label: "País" }]}
        itens={lista.map((r) => ({
          id: r.slug,
          busca: [r.nome, r.slug, ...(r.cidades || []), ...(r.zonas || []), mapaNome[r.parent]].filter(Boolean).join(" "),
          facetas: {
            pais: PAIS_LABEL[r.pais] || r.pais,
            nivel: r.parent ? "zona" : "regiao",
            parent: r.parent ? mapaNome[r.parent] || r.parent : "",
            home: r.destaqueHome ? "sim" : "nao",
          },
          ordem: { nome: r.nome, pais: `${PAIS_LABEL[r.pais] || r.pais} ${r.nome}` },
          node: (
          <div className="admin-row">
            <div className="admin-thumb" style={{ backgroundImage: `url(${thumbUrl(r.imagem) || ""})` }} />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {r.nome}
                {r.parent ? (
                  <span className="tag-dest">ZONA · {mapaNome[r.parent] || r.parent}</span>
                ) : (
                  <span className="tag-real">REGIÃO</span>
                )}
              </div>
              <div className="admin-row-sub">
                {PAIS_LABEL[r.pais]} · liga a: {[...(r.cidades || []), ...(r.zonas || [])].join(", ") || "—"}
              </div>
            </div>
            <div className="admin-row-actions">
              <Link href={`/regioes/${encodeURIComponent(r.slug)}`} target="_blank" className="admin-link">Ver</Link>
              <Link href={`/admin/regioes/${encodeURIComponent(r.slug)}`} className="admin-link">Editar</Link>
              <DeleteButton slug={r.slug} nome={r.nome} endpoint="regioes" />
            </div>
          </div>
          ),
        }))}
      />
    </div>
  );
}
