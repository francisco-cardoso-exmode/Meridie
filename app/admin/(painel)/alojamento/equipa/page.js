import ListaFiltravel from "@/components/admin/ListaFiltravel";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import { AcoesMembro, NovoMembro } from "@/components/al/admin/AdminAl";
import { leAdmin } from "@/lib/leituraAdmin";
import { listarEquipa } from "@/lib/al/contas";

export const dynamic = "force-dynamic";
export const metadata = { title: "Alojamento · Equipa" };

export default async function EquipaAdminPagina() {
  const { dados: equipa, semBase } = await leAdmin(() => listarEquipa(), []);
  const itens = equipa.map((m) => ({
    id: m.email,
    busca: `${m.nome} ${m.email}`.toLowerCase(),
    facetas: { ativo: m.ativo === false ? "nao" : "sim" },
    ordem: { nome: m.nome || "" },
    node: (
      <div className="admin-row">
        <div className="admin-row-main">
          <div className="admin-row-title">
            {m.nome} {m.ativo === false && <span className="tag-oculto">INATIVO</span>}
            {m.ativo !== false && !m.temPassword && <span className="tag-oculto">CONVITE POR ACEITAR</span>}
          </div>
          <div className="admin-row-sub">{m.email}</div>
        </div>
        <AcoesMembro m={{ nome: m.nome, email: m.email, ativo: m.ativo }} />
      </div>
    ),
  }));
  return (
    <div className="admin-container">
      <h1>Equipa de terreno</h1>
      <p className="admin-sub">
        Quem faz inspeções e limpezas. Ao acrescentar uma pessoa, ela recebe um convite por email para definir a password e instalar a app;
        depois entra em <a href="/equipa">/equipa</a> (contas separadas do backoffice — não têm acesso aqui). Desativar termina as sessões abertas.
      </p>
      <AvisoSemBase mostrar={semBase} />
      <ListaFiltravel
        itens={itens}
        placeholder="Nome ou email…"
        facetas={[{ k: "ativo", label: "Ativo", opcoes: [{ v: "sim", label: "Sim" }, { v: "nao", label: "Não" }] }]}
        ordens={[{ k: "nome", label: "Nome" }]}
        ordemPadrao="nome"
      />
      <h2>Acrescentar pessoa</h2>
      <NovoMembro />
    </div>
  );
}
