import PedidoPagina from "@/components/PedidoPagina";
import { t } from "@/lib/i18n";
import { metaPagina } from "@/lib/seo";

// O pedido vive no browser (localStorage): a página é sempre a mesma.
export async function generateMetadata({ params }) {
  const { lang } = await params;
  return metaPagina(lang, "/pedido", {
    titulo: t(lang, "O meu pedido"),
    descricao: t(lang, "Revê os produtos e as quantidades e envia o pedido — respondemos com a disponibilidade e as condições."),
    // Página pessoal (o conteúdo é o carrinho de cada visitante).
    indexar: false,
  });
}

export default async function PaginaPedido({ params }) {
  const { lang } = await params;
  const T = (x) => t(lang, x);
  return (
    <>
      <section className="page-hero pequeno">
        <div className="container">
          <span className="eyebrow">{T("Pedido de encomenda")}</span>
          <h1>{T("O meu pedido")}</h1>
          <p>{T("Revê os produtos e as quantidades e envia o pedido — respondemos com a disponibilidade e as condições. Sem pagamento online.")}</p>
        </div>
      </section>
      <section>
        <div className="container">
          <PedidoPagina />
        </div>
      </section>
    </>
  );
}
