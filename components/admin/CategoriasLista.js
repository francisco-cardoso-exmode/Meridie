"use client";

import { useState } from "react";
import Link from "next/link";
import DeleteButton from "@/components/admin/DeleteButton";
import { pedidoAdmin } from "@/lib/adminCliente";

/**
 * Árvore de categorias do backoffice: categorias de topo e as suas
 * subcategorias, com ↑ ↓ para mudar a ordem entre irmãs (grava logo).
 * `arvore`: [{ slug, nome, ativo, n, filhos: [...] }] — `n` = nº de produtos.
 */
export default function CategoriasLista({ arvore: inicial }) {
  const [arvore, setArvore] = useState(inicial);
  const [aGravar, setAGravar] = useState(false);
  const [erro, setErro] = useState("");
  const [q, setQ] = useState("");
  const termo = q.trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
  const bate = (c) => !termo || `${c.nome} ${c.slug}`.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").includes(termo);

  async function mover(lista, i, d, aplicar) {
    const j = i + d;
    if (j < 0 || j >= lista.length || aGravar || termo) return;
    const nova = [...lista];
    [nova[i], nova[j]] = [nova[j], nova[i]];
    const antes = arvore;
    aplicar(nova);
    setAGravar(true);
    setErro("");
    const r = await pedidoAdmin("/api/admin/categorias/ordem", { body: { slugs: nova.map((c) => c.slug) } });
    setAGravar(false);
    if (!r.ok) {
      setArvore(antes);
      setErro(r.erro);
    }
  }

  const linha = (c, i, irmas, aplicar, sub = false) => (
    <div className={`admin-row${sub ? " cat-sub" : ""}`} key={c.slug}>
      <div className="cat-ordem">
        <button type="button" className="btn-ghost" onClick={() => mover(irmas, i, -1, aplicar)} disabled={i === 0 || aGravar} aria-label="Subir">↑</button>
        <button type="button" className="btn-ghost" onClick={() => mover(irmas, i, 1, aplicar)} disabled={i === irmas.length - 1 || aGravar} aria-label="Descer">↓</button>
      </div>
      <div className="admin-row-main">
        <div className="admin-row-title">
          {sub ? "↳ " : ""}
          {c.nome}
          {c.ativo === false && <span className="tag-oculto">INATIVA</span>}
        </div>
        <div className="admin-row-sub">
          /{c.slug} · {c.n} produto(s){!sub && c.filhos?.length ? ` · ${c.filhos.length} subcategoria(s)` : ""}
        </div>
      </div>
      <div className="admin-row-actions">
        <Link href={`/admin/categorias/${encodeURIComponent(c.slug)}`} className="admin-link">Editar</Link>
        <DeleteButton slug={c.slug} nome={c.nome} endpoint="categorias" />
      </div>
    </div>
  );

  return (
    <div className="lista-filtravel">
      <div className="admin-filtros">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Pesquisar categoria…" aria-label="Pesquisar" />
        {termo && <span className="admin-row-sub">A ordem (↑ ↓) muda-se sem pesquisa.</span>}
      </div>
      <div className="admin-list">
        {erro && <div className="form-msg erro">{erro}</div>}
        {arvore
          .filter((c) => bate(c) || c.filhos.some(bate))
          .map((c, i) => (
            <div key={c.slug} className="cat-grupo">
              {linha(c, i, arvore, setArvore)}
              {c.filhos
                .filter((f) => bate(c) || bate(f))
                .map((f, k) =>
                  linha(f, k, c.filhos, (nova) => setArvore((a) => a.map((x) => (x.slug === c.slug ? { ...x, filhos: nova } : x))), true)
                )}
            </div>
          ))}
      </div>
    </div>
  );
}
