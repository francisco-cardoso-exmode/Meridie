import Link from "next/link";
import { exigirEquipa, dataCurta } from "@/lib/al/paginas";
import { tarefasDaEquipa } from "@/lib/al/tarefas";
import { ROTULO_TIPO_TAREFA } from "@/lib/al/regras";
import { SairAl } from "@/components/al/ContaAl";
import ListaFiltravel from "@/components/admin/ListaFiltravel";
import Icon from "@/components/Icon";
import InstalarApp from "@/components/al/InstalarApp";

export const dynamic = "force-dynamic";
export const metadata = { title: "Hoje" };

const ICONE = { inspecao_entrada: "key", inspecao_saida: "camera", limpeza: "sparkles" };
const ESTADO = { pendente: "Por fazer", em_curso: "Em curso", concluida: "Feita" };

const cartao = (x) => (
  <Link href={`/equipa/tarefa/${x.id}`} className={`al-tarefa ${x.estado}`}>
    <span className="al-tarefa-ic" aria-hidden="true">
      <Icon name={ICONE[x.tipo]} />
    </span>
    <span className="al-tarefa-txt">
      <strong>{ROTULO_TIPO_TAREFA[x.tipo]}</strong>
      <span>{x.casaTitulo || x.casaSlug}</span>
      <small>
        {dataCurta(x.data)} · {ESTADO[x.estado]}
        {!x.atribuidaA && " · por atribuir"}
      </small>
    </span>
    <span aria-hidden="true">›</span>
  </Link>
);

// "Hoje": tarefas atrasadas, de hoje e de amanhã — as minhas e as por atribuir.
export default async function Hoje() {
  const m = await exigirEquipa();
  const { hoje, tarefas } = await tarefasDaEquipa(m.email);
  const grupos = [
    ["Atrasadas", tarefas.filter((x) => x.data < hoje && x.estado !== "concluida")],
    ["Hoje", tarefas.filter((x) => x.data === hoje)],
    ["Amanhã", tarefas.filter((x) => x.data > hoje)],
  ].filter(([, l]) => l.length);

  return (
    <div>
      <div className="al-cab">
        <h1>Olá, {String(m.nome || "").split(" ")[0]}</h1>
        <SairAl papel="equipa" destino="/equipa/entrar" />
      </div>
      <p className="al-nota">{dataCurta(hoje)}</p>
      {grupos.length === 0 && <p className="al-cartao">Sem tarefas para hoje.</p>}
      {tarefas.length > 10 && (
        <ListaFiltravel
          itens={tarefas.map((x) => ({
            id: x.id,
            busca: [x.casaTitulo, x.casaSlug, ROTULO_TIPO_TAREFA[x.tipo], x.data].join(" ").toLowerCase(),
            ordem: { data: x.data },
            node: cartao(x),
          }))}
          ordens={[{ k: "data", label: "Data" }]}
          placeholder="Procurar casa ou tarefa…"
        />
      )}
      {tarefas.length <= 10 && grupos.map(([titulo, lista]) => (
        <section key={titulo}>
          <h2>{titulo}</h2>
          <div className="al-tarefas">
            {lista.map((x) => (
              <div key={x.id}>{cartao(x)}</div>
            ))}
          </div>
        </section>
      ))}
      <InstalarApp texto="As tarefas do dia no ecrã principal do telemóvel, como uma app." />
    </div>
  );
}
