import Link from "next/link";
import { urlPrevisualizar } from "@/lib/previsualizacao";
import { allEmpreendimentos } from "@/lib/store";
import { formatarPreco, referenciaDe, precoEmEuros, PAIS_LABEL } from "@/lib/empreendimentos";
import { thumbUrl } from "@/lib/format";
import DeleteButton from "@/components/admin/DeleteButton";
import RefCopy from "@/components/admin/RefCopy";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { leAdmin } from "@/lib/leituraAdmin";
import ListaFiltravel from "@/components/admin/ListaFiltravel";

export const dynamic = "force-dynamic";
export const metadata = { title: "Empreendimentos" };

export default async function AdminEmpreendimentos() {
  const { dados: lista, semBase } = await leAdmin(
    () => allEmpreendimentos({ todos: true, estrito: true }),
    []
  );

  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Empreendimentos</h1>
          <p className="admin-sub">
            {semBase ? "—" : lista.length} no total. Cada card é um empreendimento.
          </p>
        </div>
        <Link href="/admin/empreendimentos/novo" className="btn btn-primary">
          + Novo
        </Link>
      </div>

      <AvisoSemBase mostrar={semBase} />
      <ListaFiltravel
        placeholder="Pesquisar por referência, nome, cidade, zona…"
        facetas={[
          { k: "pais", label: "País" },
          { k: "cidade", label: "Cidade" },
          { k: "tipo", label: "Tipologia" },
          { k: "finalidade", label: "Finalidade" },
          { k: "estado", label: "Estado" },
          { k: "visivel", label: "Visibilidade", opcoes: [{ v: "publicado", label: "Publicados" }, { v: "oculto", label: "Ocultos" }] },
          { k: "destaque", label: "Destaque", opcoes: [{ v: "sim", label: "Em destaque" }, { v: "nao", label: "Sem destaque" }] },
        ]}
        ordens={[
          { k: "ref", label: "Referência" },
          { k: "nome", label: "Nome" },
          { k: "preco", label: "Preço (mais baixo)" },
          { k: "precoDesc", label: "Preço (mais alto)", desc: true },
          { k: "cidade", label: "Cidade" },
        ]}
        itens={lista.map((e) => ({
          id: e.slug,
          busca: [referenciaDe(e), e.nome, e.slug, e.cidade, e.zona, e.tipo, e.construtora, e.morada].filter(Boolean).join(" "),
          facetas: {
            pais: PAIS_LABEL[e.pais] || e.pais,
            cidade: e.cidade,
            tipo: e.tipo,
            finalidade: e.finalidade,
            estado: e.estado,
            visivel: e.publicado === false ? "oculto" : "publicado",
            destaque: e.destaque ? "sim" : "nao",
          },
          ordem: {
            ref: referenciaDe(e),
            nome: e.nome,
            preco: precoEmEuros(e) || null,
            precoDesc: precoEmEuros(e) || null,
            cidade: e.cidade,
          },
          node: (
          <div className="admin-row">
            <div
              className="admin-thumb"
              style={{ backgroundImage: `url(${thumbUrl(e.imagens?.[0]) || ""})` }}
            />
            <div className="admin-row-main">
              <div className="admin-row-title">
                {e.nome}
                {e.destaque && <span className="tag-dest">DESTAQUE</span>}
                {e.publicado === false && <span className="tag-oculto">OCULTO</span>}
              </div>
              <div className="admin-row-sub">
                {e.cidade} · {e.zona} · {e.tipo} · {formatarPreco(e.preco, e.moeda)}
              </div>
            </div>
            <RefCopy valor={referenciaDe(e)} />
            <div className="admin-row-actions">
              <a href={urlPrevisualizar(`/empreendimentos/${encodeURIComponent(e.slug)}`)} target="_blank" className="admin-link">
                {e.publicado === false ? "Pré-visualizar" : "Ver"}
              </a>
              <Link href={`/admin/empreendimentos/${encodeURIComponent(e.slug)}`} className="admin-link">
                Editar
              </Link>
              <DeleteButton slug={e.slug} nome={e.nome} />
            </div>
          </div>
          ),
        }))}
      />
    </div>
  );
}
