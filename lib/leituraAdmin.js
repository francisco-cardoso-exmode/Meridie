/**
 * Leituras do backoffice: em vez de mostrar dados de exemplo (ou zeros) quando
 * a base de dados falha, devolve `semBase: true` para a página mostrar o aviso
 * (components/admin/AvisoSemBase) e não deixar gravar por cima de dados reais.
 * Usar com as funções em modo `estrito: true`.
 */
export async function leAdmin(fn, vazio) {
  try {
    return { dados: await fn(), semBase: false };
  } catch (e) {
    console.error("leitura do backoffice:", e?.message || e);
    return { dados: vazio, semBase: true };
  }
}
