import Icon from "@/components/Icon";

/**
 * Cartões numerados das secções explicativas do Alojamento Local ("Como
 * funciona a reserva", "Como recebes"). Textos do CMS (página "alojamento").
 */
export default function PassosAl({ eyebrow, titulo, texto, passos, nota }) {
  return (
    <section className="al-passos">
      <div className="section-head">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {titulo && <h2>{titulo}</h2>}
        {texto && <p>{texto}</p>}
      </div>
      <div className={`grid ${passos.length === 4 ? "grid-4" : "grid-3"}`}>
        {passos.map((p, i) => (
          <div className="card" key={p.id}>
            {p.icone && (
              <div className="icon">
                <Icon name={p.icone} />
              </div>
            )}
            <h3>
              <span className="al-passo-num">{i + 1}.</span> {p.titulo}
            </h3>
            <p>{p.texto}</p>
          </div>
        ))}
      </div>
      {nota && <p className="al-nota al-passos-nota">{nota}</p>}
    </section>
  );
}

/** Passos da reserva com o do pagamento a seguir ao 2.º (online ou combinado, conforme o Stripe esteja ligado). */
export function passosDaReserva(c, pagaOnline) {
  const pagamento = {
    id: "pagamento",
    icone: "shield-check",
    titulo: pagaOnline ? c.pagOnlineTitulo : c.pagManualTitulo,
    texto: pagaOnline ? c.pagOnlineTexto : c.pagManualTexto,
  };
  const l = c.passosReserva || [];
  return [...l.slice(0, 2), pagamento, ...l.slice(2)];
}
