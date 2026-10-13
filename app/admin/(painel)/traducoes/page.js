import TraducoesAdmin from "@/components/admin/TraducoesAdmin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Traduções" };

export default function PaginaTraducoes() {
  return (
    <div className="admin-container">
      <div className="admin-head">
        <div>
          <h1>Traduções (inglês)</h1>
          <p className="admin-sub">
            O site tem versão inglesa em <code>/en</code>. Sempre que gravas algo em português, a
            versão inglesa é atualizada automaticamente. Aqui vês o que ainda falta traduzir e podes
            traduzir tudo de uma vez.
          </p>
        </div>
      </div>
      <TraducoesAdmin />
    </div>
  );
}
