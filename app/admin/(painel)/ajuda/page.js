export const metadata = { title: "Ajuda" };

export default function AdminAjuda() {
  return (
    <div className="admin-container ajuda">
      <h1>Ajuda — como pôr o conteúdo</h1>
      <p className="admin-sub">
        Guia rápido para gerir o site sem mexer em código. Tudo o que crias aqui
        fica guardado e aparece no site em menos de 1 minuto.
      </p>

      <section className="ajuda-bloco">
        <h2>1. Empreendimentos</h2>
        <p>Cada empreendimento é um card/imóvel. Em <strong>Empreendimentos → + Novo</strong>:</p>
        <ul>
          <li><strong>Slug</strong>: o endereço (ex.: <code>vibe-meireles-fortaleza</code>) — sem espaços nem acentos.</li>
          <li><strong>Cidade</strong> e <strong>Zona</strong>: é o que <strong>liga o imóvel à página de região/zona</strong> (ver ponto 2).</li>
          <li><strong>Construtora</strong>: se preencheres, o imóvel é tratado como &quot;real&quot; e <strong>aparece primeiro</strong> na Home e nas listagens.</li>
          <li><strong>Em destaque</strong>: aparece na secção de destaques da Home.</li>
          <li><strong>Imagens</strong>: um URL por linha (a 1.ª é a foto principal do card).</li>
          <li><strong>Tipologias</strong> e <strong>Proximidades</strong>: opcionais, um item por linha — aparecem na página do imóvel.</li>
        </ul>
      </section>

      <section className="ajuda-bloco">
        <h2>2. Regiões e Zonas (a ligação)</h2>
        <p>
          Uma <strong>região</strong> é uma área grande (ex.: Nordeste, Lisboa).
          Uma <strong>zona</strong> é uma área dentro de uma região (ex.: Fortaleza,
          dentro do Nordeste) — basta escolher o campo <strong>&quot;Pertence a&quot;</strong>.
        </p>
        <p><strong>Como liga aos imóveis:</strong> no formulário da região/zona, os campos
          <strong> Cidades</strong> e <strong>Zonas</strong> dizem quais os imóveis que pertencem ali.
          Exemplo: a zona <em>Fortaleza</em> tem cidade <code>Fortaleza</code> e zona <code>Meireles</code> —
          por isso o VIBE Meireles (cidade Fortaleza) aparece nessa página.
        </p>
        <div className="ajuda-aviso">
          ⚠️ Se puseres num imóvel uma <strong>cidade/zona que ainda não tem página</strong>,
          cria essa região/zona aqui em <strong>Regiões &amp; Zonas → + Nova</strong> com a mesma
          cidade/zona nos campos de ligação. Caso contrário o imóvel funciona,
          mas o card &quot;A zona&quot; no fundo da página não aparece.
        </div>
      </section>

      <section className="ajuda-bloco">
        <h2>3. Formatos especiais (região/zona)</h2>
        <p><strong>Destaques</strong> — um por linha, no formato <code>icone | título | texto</code>:</p>
        <pre>umbrella | Praias &amp; dunas | Areia branca e mar morno o ano todo.
mountain | Serras | Miradouros com vistas inesquecíveis.</pre>
        <p>Ícones disponíveis: <code>landmark, waves, sparkles, wine, umbrella, flag, sailboat, buildings, utensils, mountain, tree, sun, coins</code>.</p>

        <p style={{ marginTop: 16 }}><strong>Pontos do mapa</strong> — um por linha, no formato <code>nome | tipo | latitude | longitude</code>:</p>
        <pre>Meireles | cidade | -3.728 | -38.491
Praia de Iracema | praia | -3.719 | -38.512</pre>
        <p>Tipos (definem a cor do pino): <code>historico</code> (dourado), <code>praia</code> (azul-mar),
          <code> montanha</code>/<code>natureza</code> (verde), <code>cidade</code> (navy), <code>gastronomia</code> (vermelho).</p>
        <p className="email-note">
          Dica: para obter as coordenadas, abre o Google Maps, clica com o botão direito no sítio
          e copia os dois números (latitude, longitude).
        </p>
      </section>

      <section className="ajuda-bloco">
        <h2>4. Banners da Home</h2>
        <p>
          As <strong>regiões de topo</strong> (sem &quot;Pertence a&quot;) são as que podem aparecer como
          banners na Home e nas páginas Portugal/Brasil. As zonas aparecem dentro da
          página da sua região.
        </p>
      </section>

      <section className="ajuda-bloco">
        <h2>5. Emails &amp; imagens</h2>
        <ul>
          <li>Vê os <strong>templates de email</strong> e quando são enviados em <strong>Emails</strong>.</li>
          <li>As fotos são, por agora, <strong>por URL</strong>. O upload de ficheiros para storage é o próximo passo.</li>
        </ul>
      </section>
    </div>
  );
}
