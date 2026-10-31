// Aviso no topo das páginas do backoffice quando a leitura da base de dados falhou.
export default function AvisoSemBase({ mostrar = true }) {
  if (!mostrar) return null;
  return (
    <div className="aviso-sem-base" role="alert">
      <strong>Sem ligação à base de dados</strong> — os dados mostrados podem não estar
      atualizados. Não graves alterações agora: recarrega a página daqui a pouco.
    </div>
  );
}
