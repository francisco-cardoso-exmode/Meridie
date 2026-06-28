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
          <li><strong>Preço + Tipo de preço</strong>: escolhe <strong>Valor exato</strong> (uma casa/terreno único),
            <strong> Desde</strong> (lote/bloco — valor da unidade mais barata → &quot;Desde X&quot;),
            <strong> Intervalo</strong> (mostra &quot;X – Y&quot;; aparece o campo <em>Preço máximo</em>)
            ou <strong>Sob consulta</strong>.</li>
          <li><strong>Estado</strong>: escolhe na lista (por ordem) <strong>Planta → Pré-lançamento → Lançamento → Em construção → Pronto</strong>.
            O visitante pode filtrar os imóveis por este estado.</li>
          <li><strong>Referência</strong>: código do imóvel (ex.: <code>MER-001</code>). Se deixares vazio é gerada automaticamente.
            Aparece no card, na página do imóvel e no assunto do email de interesse.</li>
          <li><strong>Imagens</strong>: <strong>arrasta os ficheiros</strong> para a caixa (ou clica para escolher).
            A 1.ª é a foto principal; podes reordenar e marcar a principal com ★.</li>
          <li><strong>Tipologias</strong>: cada tipo de unidade com o seu preço, no formato <code>nome | área | preço</code>
            (área/preço opcionais) — ideal para lotes e blocos.</li>
          <li><strong>Proximidades</strong>: opcionais, um item por linha — aparecem na página do imóvel.</li>
        </ul>
        <pre>T1 | 52 m² | 220000
T2 | 78 m² | 310000
T3 | 110 m² | 420000</pre>
        <div className="ajuda-aviso">
          💡 <strong>Lote ou bloco de apartamentos?</strong> Põe o <strong>Tipo de preço</strong> em
          <strong> &quot;Desde&quot;</strong> com o valor de entrada e detalha cada unidade no campo
          <strong> Tipologias</strong>. Para uma casa ou terreno único, usa <strong>&quot;Valor exato&quot;</strong>.
        </div>

        <p style={{ marginTop: 16 }}><strong>Exemplos — como o preço fica no site:</strong></p>
        <ul>
          <li>
            <strong>Casa / terreno único</strong> → Tipo de preço <em>Valor exato</em>, Preço <code>350000</code>,
            moeda EUR → aparece <strong>&quot;350.000 €&quot;</strong> (com a conversão <em>≈ R$</em> por baixo).
          </li>
          <li>
            <strong>Lote ou bloco de apartamentos</strong> → Tipo de preço <em>Desde</em>, Preço <code>220000</code>
            (a unidade mais barata) → aparece <strong>&quot;Desde 220.000 €&quot;</strong>. As várias tipologias
            (T1, T2, T3…) aparecem numa tabela na página do imóvel.
          </li>
          <li>
            <strong>Intervalo de preços</strong> → Tipo de preço <em>Intervalo</em>, Preço <code>350000</code> e
            Preço máximo <code>480000</code> → aparece <strong>&quot;350.000 € – 480.000 €&quot;</strong>.
            Bom para um lote/bloco em que queres mostrar o leque de valores.
          </li>
          <li>
            <strong>Sem valor público</strong> → Tipo de preço <em>Sob consulta</em> → aparece
            <strong> &quot;Sob consulta&quot;</strong> (não mostra número).
          </li>
        </ul>
        <p className="email-note">
          No formulário do empreendimento, a <strong>pré-visualização ao lado</strong> mostra-te em tempo real
          como o card e o preço vão ficar — incluindo o &quot;Desde&quot;, o &quot;Sob consulta&quot; e a
          conversão €↔R$. É só ir escrevendo e ver.
        </p>
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
        <h2>5. Imagens &amp; Emails</h2>
        <ul>
          <li><strong>Imagens</strong>: já é por <strong>upload</strong> — arrastas os ficheiros (ou clicas para escolher).
            Aplica-se aos empreendimentos, regiões e publicidade.</li>
          <li>Vê os <strong>templates de email</strong> e quando são enviados em <strong>Emails</strong>.</li>
        </ul>
      </section>

      <section className="ajuda-bloco">
        <h2>6. Publicidade (parceiros / patrocínios)</h2>
        <ul>
          <li><strong>Publicidade global</strong> (menu <strong>Publicidade</strong>): cards que aparecem na Home e na
            página <code>/publicidade</code>. Com <strong>upload de imagem</strong>, título, texto e link.</li>
          <li><strong>Publicidade por região</strong> (no formulário da região): cards de parceiros só naquela zona —
            também com <strong>upload de imagem</strong> (botão &quot;+ Adicionar card&quot;).</li>
        </ul>
      </section>

      <section className="ajuda-bloco">
        <h2>7. Comparador &amp; Filtros (automático)</h2>
        <ul>
          <li><strong>Filtros e pesquisa</strong>: na Home, em <code>/empreendimentos</code> e nas páginas de região,
            o visitante filtra por país, zona, tipologia, finalidade e <strong>preço (mais caro/mais barato)</strong>,
            ou pesquisa por nome/cidade/referência. Funciona sozinho com os imóveis que crias.</li>
          <li><strong>Comparador</strong>: o visitante escolhe <strong>dois imóveis do mesmo país</strong> (botão
            &quot;⇄ Comparar&quot;) — podem ser de cidades diferentes (ex.: Lisboa vs Porto) — e vê uma comparação
            lado a lado + uma <strong>análise por IA</strong> focada no investimento. Não compara Portugal com Brasil.</li>
        </ul>
      </section>
    </div>
  );
}
