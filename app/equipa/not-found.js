import Link from "next/link";

export default function NaoEncontrada() {
  return (
    <div className="al-cartao">
      <p>Não encontrada — pode estar atribuída a outra pessoa.</p>
      <Link href="/equipa">← Voltar a Hoje</Link>
    </div>
  );
}
