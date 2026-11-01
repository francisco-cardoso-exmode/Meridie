// Faixa fixa nas páginas de conteúdo oculto vistas em pré-visualização (só admin).
export default function AvisoPrevisualizacao({ caminho, editar }) {
  return (
    <div className="aviso-previsualizacao" role="status">
      <strong>Pré-visualização</strong>
      <span>Esta página ainda não está publicada — só tu a vês.</span>
      {editar && <a href={editar}>Voltar a editar</a>}
      <a href={`/api/admin/previsualizar/sair?url=${encodeURIComponent(caminho)}`}>Sair da pré-visualização</a>
    </div>
  );
}
