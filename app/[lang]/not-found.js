import L from "@/components/L";

// Página não encontrada (textos nos dois idiomas — o not-found não recebe params).
export default function NaoEncontrado() {
  return (
    <section className="page-hero" style={{ minHeight: "50vh" }}>
      <div className="container">
        <span className="eyebrow">404</span>
        <h1>Página não encontrada · Page not found</h1>
        <p>A página que procura não existe ou mudou de endereço. · The page you are looking for does not exist or has moved.</p>
        <L href="/" className="btn btn-primary" style={{ marginTop: 22 }}>
          Início · Home
        </L>
      </div>
    </section>
  );
}
