import { allCategorias, allProdutos, garanteSeedCategorias } from "@/lib/representacoes";
import { allMarcas } from "@/lib/marcas";
import { erroCategoria, erroCategoriaProduto, erroProduto, erroSolucao } from "@/lib/catalogo";

/**
 * Validações do backoffice do catálogo que precisam da base (usadas como
 * `validar` / `podeApagar` em lib/crudAdmin.js). Devolvem a mensagem de erro
 * ou null.
 */

const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

// Categorias: dois níveis no máximo; mudar de nível só sem produtos.
export async function validarCategoria(doc, slugAtual, db) {
  await garanteSeedCategorias(db);
  if ("nome" in doc) doc.nome = texto(doc.nome, 120);
  if ("descricao" in doc) doc.descricao = texto(doc.descricao, 2000);
  if ("imagem" in doc) doc.imagem = texto(doc.imagem, 1000);
  if ("parent" in doc) doc.parent = typeof doc.parent === "string" && doc.parent ? doc.parent : null;
  const todas = await allCategorias({ todos: true, estrito: true });
  const e = erroCategoria(doc, todas, slugAtual);
  if (e) return e;
  if (slugAtual && "parent" in doc) {
    const antes = todas.find((c) => c.slug === slugAtual);
    if (antes && (antes.parent || null) !== doc.parent) {
      const usados = (await allProdutos({ todos: true, estrito: true })).filter(
        (p) => p.categoria === slugAtual || p.subcategoria === slugAtual
      );
      if (usados.length)
        return `Esta categoria tem ${usados.length} produto(s): muda-os de categoria antes de a mudar de nível.`;
    }
  }
  return null;
}

// Só se apaga uma categoria vazia (sem subcategorias e sem produtos).
export async function podeApagarCategoria(db, slug) {
  const todas = await allCategorias({ todos: true, estrito: true });
  const filhas = todas.filter((c) => c.parent === slug);
  if (filhas.length)
    return `Tem ${filhas.length} subcategoria(s) (${filhas.map((c) => c.nome).join(", ")}). Apaga-as ou muda-as primeiro.`;
  const produtos = (await allProdutos({ todos: true, estrito: true })).filter(
    (p) => p.categoria === slug || p.subcategoria === slug
  );
  if (produtos.length) return `Tem ${produtos.length} produto(s). Muda-os de categoria ou apaga-os primeiro.`;
  return null;
}

export async function validarProduto(doc, slugAtual) {
  const e = erroProduto(doc);
  if (e) return e;
  if ("categoria" in doc || "subcategoria" in doc || !slugAtual) {
    const cats = await allCategorias({ todos: true, estrito: true });
    const ec = erroCategoriaProduto(doc, cats);
    if (ec) return ec;
  }
  if (doc.marca) {
    const marcas = await allMarcas({ todos: true, estrito: true });
    if (!marcas.some((m) => m.slug === doc.marca)) return "A marca escolhida não existe (pode ter sido apagada).";
  }
  // Um produto novo não pode ficar com o endereço de um produto ainda por
  // migrar (formato antigo, dentro da marca).
  if (!slugAtual) {
    const todos = await allProdutos({ todos: true, estrito: true });
    if (todos.some((p) => p.legado && p.slug === doc.slug))
      return `Já existe um produto com esse nome numa marca ainda por migrar (endereço "${doc.slug}").`;
  }
  return null;
}

export const validarSolucao = (doc) => erroSolucao(doc);
