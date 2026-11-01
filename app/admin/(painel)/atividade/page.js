import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { leAdmin } from "@/lib/leituraAdmin";
import AvisoSemBase from "@/components/admin/AvisoSemBase";
import LixoAcoes from "@/components/admin/LixoAcoes";
import { DIAS_LIXO, ROTULO_COLECAO, hrefAdmin, esvaziarExpirados } from "@/lib/lixo";

export const dynamic = "force-dynamic";
export const metadata = { title: "Atividade e lixo" };

const quando = (d) =>
  new Date(d).toLocaleString("pt-PT", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Lisbon" });
const diasAte = (d) => Math.max(0, Math.ceil((new Date(d).getTime() - Date.now()) / 864e5));

export default async function Atividade() {
  const { dados, semBase } = await leAdmin(async () => {
    const db = await getDb();
    await esvaziarExpirados(db);
    return Promise.all([
      db.collection("lixo").find({}, { projection: { doc: 0 } }).sort({ apagadoEm: -1 }).limit(200).toArray(),
      db.collection("atividade").find({}).sort({ em: -1 }).limit(100).toArray(),
    ]);
  }, [[], []]);
  const [lixo, atividade] = dados;

  return (
    <div className="admin-container">
      <h1>Atividade e lixo</h1>
      <p className="admin-sub">
        O que se apaga no backoffice fica aqui {DIAS_LIXO} dias e pode ser recuperado. Em baixo, quem mudou o quê.
      </p>
      <AvisoSemBase mostrar={semBase} />

      <h2 className="admin-h2">Lixo</h2>
      {lixo.length === 0 ? (
        <div className="empty-state"><p>O lixo está vazio.</p></div>
      ) : (
        <div className="admin-list">
          {lixo.map((l) => (
            <div key={String(l._id)} className="admin-row">
              <div className="admin-row-main">
                <div className="admin-row-title">
                  {l.nome || l.slug} <span className="tag-oculto">{(ROTULO_COLECAO[l.colecao] || l.colecao).toUpperCase()}</span>
                </div>
                <div className="admin-row-sub">
                  Apagado a {quando(l.apagadoEm)} por {l.apagadoPor} · sai de vez daqui a {diasAte(l.expiraEm)} dia(s)
                </div>
              </div>
              <LixoAcoes id={String(l._id)} nome={l.nome || l.slug} editar={hrefAdmin(l.colecao, l.slug)} />
            </div>
          ))}
        </div>
      )}

      <h2 className="admin-h2" style={{ marginTop: 36 }}>Últimas alterações</h2>
      {atividade.length === 0 ? (
        <div className="empty-state"><p>Ainda sem registos — aparecem a partir de agora, a cada criação, edição ou remoção.</p></div>
      ) : (
        <ul className="atividade-lista">
          {atividade.map((a) => (
            <li key={String(a._id)}>
              <span className="atividade-quando">{quando(a.em)}</span>
              <span>
                <strong>{a.por}</strong> {a.acao} {(ROTULO_COLECAO[a.colecao] || a.colecao).toLowerCase()}{" "}
                {a.acao === "editou" || a.acao === "criou" || a.acao === "recuperou" ? (
                  <Link href={hrefAdmin(a.colecao, a.slug)} className="admin-link">{a.nome || a.slug}</Link>
                ) : (
                  <em>{a.nome || a.slug}</em>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
