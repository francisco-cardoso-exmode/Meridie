/**
 * Regiões e zonas — banners, páginas /regioes/[slug] e ligação aos empreendimentos.
 * Campos editáveis no backoffice. Uma zona é uma região com `parent`.
 */
import { EMPREENDIMENTOS } from "@/lib/empreendimentos";

const u = (id) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1600&q=72`;

export const REGIOES = [
  {
    slug: "lisboa",
    nome: "Lisboa",
    pais: "portugal",
    cidades: ["Lisboa"],
    imagem: u("1555881400-74d7acaacd8b"),
    nivel: "cidade",
    tagline: "A capital das sete colinas, sobre o Tejo.",
    descricao:
      "Mercado maduro, liquidez máxima e procura internacional constante. Lisboa combina rendimento de arrendamento estável com valorização consistente — o ativo prime por excelência em Portugal.",
    sobre:
      "Construída sobre sete colinas à beira do rio Tejo, Lisboa é uma das capitais mais antigas da Europa. Dos becos medievais de Alfama, abraçados pelo Castelo de São Jorge, ao esplendor manuelino de Belém de onde partiram as caravelas dos Descobrimentos, a cidade da luz vive entre miradouros, fado e gastronomia. Reerguida após o terramoto de 1755 com a Baixa Pombalina, é hoje um íman para capital, talento e turismo internacional.",
    crescimento:
      "O turismo em Lisboa cresceu de forma sustentada na última década, com procura recorde de dormidas e um aeroporto entre os de maior tráfego da Península Ibérica — pressão que sustenta as rendas e a valorização dos imóveis.",
    conhecidaPor:
      "Pela Torre de Belém, pelo Castelo de São Jorge e pelos elétricos amarelos.",
    oQueVer: [
      "Castelo de São Jorge e bairro de Alfama",
      "Torre de Belém e Mosteiro dos Jerónimos",
      "Praça do Comércio e Baixa Pombalina",
      "Miradouros e casas de fado",
      "Oceanário no Parque das Nações",
    ],
    transportes: [
      "Aeroporto Humberto Delgado a ~7 km do centro",
      "Metro, comboio e elétricos em toda a cidade",
      "Gare do Oriente — alta velocidade e ligações internacionais",
    ],
    distancias: [
      { local: "Aeroporto", km: 7 },
      { local: "Cascais", km: 30 },
      { local: "Sintra", km: 28 },
    ],
    destaques: [
      { icon: "landmark", titulo: "Centro histórico", texto: "Alfama, o Castelo de São Jorge e a Sé — séculos de história em ruas medievais." },
      { icon: "waves", titulo: "Frente ribeirinha", texto: "O Tejo, Belém e o Padrão dos Descobrimentos — a Lisboa dos Descobrimentos." },
      { icon: "sparkles", titulo: "Cultura & vida", texto: "Miradouros, fado, museus e uma das melhores cenas gastronómicas da Europa." },
    ],
    mapa: { lat: 38.7223, lng: -9.1393, zoom: 12 },
    pontos: [
      { nome: "Alfama & Castelo de São Jorge", tipo: "historico", lat: 38.7139, lng: -9.1335 },
      { nome: "Belém", tipo: "historico", lat: 38.6979, lng: -9.2065 },
      { nome: "Parque das Nações", tipo: "cidade", lat: 38.7633, lng: -9.095 },
      { nome: "Bairro Alto & Chiado", tipo: "cidade", lat: 38.713, lng: -9.145 },
    ],
    vantagens: [
      "Mercado prime com liquidez garantida",
      "Procura de arrendamento urbano permanente",
      "Forte atração de capital e talento internacional",
      "Proteção patrimonial em Euro",
    ],
  },
  {
    slug: "porto",
    nome: "Porto",
    pais: "portugal",
    cidades: ["Porto"],
    imagem: u("1558642084-fd07fae5282e"),
    nivel: "cidade",
    tagline: "Onde o Douro encontra o Atlântico.",
    descricao:
      "A segunda cidade de Portugal vive uma valorização acelerada, impulsionada pelo turismo, pela vida universitária e por um centro histórico Património Mundial com enorme procura para alojamento local.",
    sobre:
      "Debruçada sobre o rio Douro, a Invicta é uma cidade de granito, azulejo e vinho, cujas origens remontam ao povoado romano de Portus Cale — que deu nome a Portugal. A Ribeira, Património Mundial pela UNESCO, desce em escadarias até às margens, ligadas a Vila Nova de Gaia pela icónica Ponte D. Luís I. Do outro lado do rio, as caves envelhecem o famoso Vinho do Porto desde o século XVII.",
    crescimento:
      "Eleito várias vezes Melhor Destino Europeu, o Porto registou um dos maiores crescimentos turísticos de Portugal, impulsionado pela expansão de voos low-cost e pelo alojamento local — com forte reflexo nos preços do imobiliário.",
    conhecidaPor: "Pela Ribeira, pela Ponte D. Luís I e pelo Vinho do Porto.",
    oQueVer: [
      "Ribeira e cais ribeirinho (UNESCO)",
      "Ponte D. Luís I e caves de Gaia",
      "Livraria Lello",
      "Torre dos Clérigos",
      "Foz do Douro e a orla marítima",
    ],
    transportes: [
      "Aeroporto Sá Carneiro a ~11 km",
      "Metro do Porto e autocarros",
      "Estação de São Bento (azulejos icónicos)",
    ],
    distancias: [
      { local: "Aeroporto", km: 11 },
      { local: "Gaia (caves)", km: 3 },
      { local: "Foz / mar", km: 6 },
    ],
    destaques: [
      { icon: "landmark", titulo: "Ribeira UNESCO", texto: "O centro histórico Património Mundial, em escadarias até ao rio." },
      { icon: "wine", titulo: "Douro & vinho do Porto", texto: "As caves de Gaia e os cruzeiros no rio que deu nome ao néctar." },
      { icon: "sparkles", titulo: "Azulejo & design", texto: "Da Livraria Lello às fachadas de azulejo — uma cidade fotogénica." },
    ],
    mapa: { lat: 41.1579, lng: -8.6291, zoom: 12 },
    pontos: [
      { nome: "Ribeira", tipo: "historico", lat: 41.1408, lng: -8.611 },
      { nome: "Ponte D. Luís I", tipo: "historico", lat: 41.1399, lng: -8.6094 },
      { nome: "Caves de Gaia", tipo: "gastronomia", lat: 41.1336, lng: -8.611 },
      { nome: "Foz do Douro", tipo: "praia", lat: 41.15, lng: -8.67 },
    ],
    vantagens: [
      "Valorização acima da média nacional",
      "Turismo em crescimento sustentado",
      "Centro histórico UNESCO com forte procura",
      "Preço de entrada inferior a Lisboa",
    ],
  },
  {
    slug: "algarve",
    nome: "Algarve",
    pais: "portugal",
    cidades: ["Vilamoura"],
    zonas: ["Algarve"],
    imagem: u("1564507592333-c60657eea523"),
    nivel: "regiao",
    tagline: "Falésias douradas e mar cor de turquesa.",
    descricao:
      "O Algarve mantém uma procura internacional constante e um mercado de luxo resiliente. Praias, golfe e clima fazem dele o destino preferido para segunda habitação e investimento de férias premium.",
    sobre:
      "O litoral sul de Portugal é uma sucessão de falésias cor de ouro, grutas escavadas pelo mar e praias de águas cristalinas. Com raízes árabes — o nome vem de Al-Gharb, 'o ocidente' — a região guarda na arquitetura a marca de séculos de história. Da Praia da Marinha à gruta de Benagil, passando pelas marinas de Vilamoura e pela Lagos dos navegadores, o Algarve oferece mais de 300 dias de sol por ano.",
    crescimento:
      "Destino de férias nº1 de Portugal, o Algarve mantém ocupação turística elevada com visitantes de toda a Europa e procura crescente fora da época alta — sustentando rendimentos de arrendamento acima da média nacional.",
    conhecidaPor: "Pelas praias de falésias douradas e pela gruta de Benagil.",
    oQueVer: [
      "Praia da Marinha",
      "Gruta de Benagil (de barco ou caiaque)",
      "Marina de Vilamoura",
      "Lagos e a Ponta da Piedade",
      "Campos de golfe de classe mundial",
    ],
    transportes: [
      "Aeroporto de Faro a ~25 km",
      "Autoestrada A22 (Via do Infante)",
      "Comboio regional ao longo da costa",
    ],
    distancias: [
      { local: "Aeroporto de Faro", km: 25 },
      { local: "Praia", km: 3 },
      { local: "Marina de Vilamoura", km: 2 },
    ],
    destaques: [
      { icon: "umbrella", titulo: "Praias & falésias", texto: "Praia da Marinha, Benagil e dezenas de enseadas de águas turquesa." },
      { icon: "flag", titulo: "Golfe & resorts", texto: "Campos de classe mundial e resorts de luxo com procura global." },
      { icon: "sailboat", titulo: "Marina de Vilamoura", texto: "Náutica, restauração e vida sofisticada junto ao mar." },
    ],
    mapa: { lat: 37.117, lng: -8.25, zoom: 10 },
    pontos: [
      { nome: "Praia da Marinha", tipo: "praia", lat: 37.0905, lng: -8.4123 },
      { nome: "Gruta de Benagil", tipo: "praia", lat: 37.0876, lng: -8.425 },
      { nome: "Marina de Vilamoura", tipo: "cidade", lat: 37.073, lng: -8.118 },
      { nome: "Lagos histórico", tipo: "historico", lat: 37.1028, lng: -8.673 },
    ],
    vantagens: [
      "Procura internacional ao longo de todo o ano",
      "Mercado de luxo resiliente",
      "Rendimento elevado em arrendamento de férias",
      "Qualidade de vida e clima excecionais",
    ],
  },
  {
    slug: "sao-paulo",
    nome: "São Paulo",
    pais: "brasil",
    cidades: ["São Paulo"],
    imagem: u("1583416750470-965b2707b355"),
    nivel: "cidade",
    tagline: "O motor económico da América Latina.",
    descricao:
      "São Paulo é o maior mercado imobiliário do Brasil, com liquidez, mercado maduro e rendimento de arrendamento urbano estável. A diversidade de bairros oferece opções para todos os perfis de investidor.",
    sobre:
      "Fundada por jesuítas em 1554 e transformada pelo ciclo do café e pela industrialização, São Paulo é hoje a maior metrópole do hemisfério sul e o coração financeiro, cultural e gastronómico do Brasil. Da Avenida Paulista — com o MASP — aos Jardins e à efervescência criativa da Vila Madalena, a cidade nunca pára e é a capital gastronómica do país.",
    crescimento:
      "Maior polo de negócios da América Latina, São Paulo combina turismo corporativo intenso, grandes eventos e uma classe urbana em expansão — fatores que sustentam uma procura de arrendamento estável durante todo o ano.",
    conhecidaPor: "Pela Avenida Paulista, pelo MASP e pela gastronomia.",
    oQueVer: [
      "Avenida Paulista e MASP",
      "Parque Ibirapuera",
      "Mercado Municipal (Mercadão)",
      "Vila Madalena (arte de rua e bares)",
      "Pinacoteca do Estado",
    ],
    transportes: [
      "Aeroporto de Guarulhos (GRU) a ~25 km",
      "Aeroporto de Congonhas (doméstico) a ~8 km",
      "Rede de metro e CPTM extensa",
    ],
    distancias: [
      { local: "Guarulhos (GRU)", km: 25 },
      { local: "Congonhas (CGH)", km: 8 },
      { local: "Av. Paulista", km: 3 },
    ],
    destaques: [
      { icon: "buildings", titulo: "Metrópole & negócios", texto: "Avenida Paulista e Faria Lima — o maior polo financeiro da região." },
      { icon: "sparkles", titulo: "Cultura & museus", texto: "MASP, Pinacoteca e uma agenda cultural inesgotável." },
      { icon: "utensils", titulo: "Capital gastronómica", texto: "Da alta cozinha aos botecos — referência gastronómica do Brasil." },
    ],
    mapa: { lat: -23.5505, lng: -46.6333, zoom: 12 },
    pontos: [
      { nome: "Avenida Paulista & MASP", tipo: "cidade", lat: -23.5614, lng: -46.6559 },
      { nome: "Jardins", tipo: "cidade", lat: -23.568, lng: -46.668 },
      { nome: "Pinheiros", tipo: "cidade", lat: -23.567, lng: -46.701 },
      { nome: "Parque Ibirapuera", tipo: "natureza", lat: -23.5874, lng: -46.6576 },
    ],
    vantagens: [
      "Maior mercado e maior liquidez do Brasil",
      "Rendimento de arrendamento urbano estável",
      "Polos financeiros e tecnológicos em expansão",
      "Diversidade de bairros e tickets de entrada",
    ],
  },
  {
    slug: "rio-de-janeiro",
    nome: "Rio de Janeiro",
    pais: "brasil",
    cidades: ["Rio de Janeiro"],
    imagem: u("1483729558449-99ef09a8c325"),
    nivel: "cidade",
    tagline: "Entre o mar e a montanha, a cidade maravilhosa.",
    descricao:
      "Do icónico Ipanema à Barra da Tijuca em expansão, o Rio combina turismo permanente, imóveis de prestígio e procura internacional — ideal para férias ou arrendamento de curta duração.",
    sobre:
      "Poucas cidades no mundo abraçam mar e montanha como o Rio de Janeiro. Capital do Brasil durante quase dois séculos, guarda palácios imperiais e um centro histórico rico. O Cristo Redentor, no Corcovado, e o Pão de Açúcar vigiam praias lendárias como Copacabana e Ipanema, enquanto a Floresta da Tijuca — a maior floresta urbana do planeta — cobre as encostas.",
    crescimento:
      "Cartão-postal do Brasil, o Rio mantém um fluxo turístico internacional permanente e recebe grandes eventos mundiais, sustentando uma procura forte e constante por arrendamento de curta duração nas zonas nobres.",
    conhecidaPor:
      "Pelo Cristo Redentor, pelo Pão de Açúcar e pelas praias de Copacabana e Ipanema.",
    oQueVer: [
      "Cristo Redentor (Corcovado)",
      "Pão de Açúcar (bondinho)",
      "Praias de Copacabana e Ipanema",
      "Lagoa Rodrigo de Freitas",
      "Jardim Botânico e Floresta da Tijuca",
    ],
    transportes: [
      "Aeroporto do Galeão (GIG) a ~20 km",
      "Santos Dumont (doméstico) a ~10 km",
      "Metro do Rio e VLT no centro",
    ],
    distancias: [
      { local: "Galeão (GIG)", km: 20 },
      { local: "Santos Dumont", km: 10 },
      { local: "Praia", km: 1 },
    ],
    destaques: [
      { icon: "umbrella", titulo: "Praias icónicas", texto: "Copacabana e Ipanema — areia, calçada portuguesa e estilo de vida." },
      { icon: "mountain", titulo: "Montanhas & miradouros", texto: "Cristo Redentor e Pão de Açúcar, vistas inesquecíveis sobre a baía." },
      { icon: "tree", titulo: "Natureza urbana", texto: "A Floresta da Tijuca, a maior floresta urbana do mundo." },
    ],
    mapa: { lat: -22.9068, lng: -43.1729, zoom: 11 },
    pontos: [
      { nome: "Cristo Redentor", tipo: "montanha", lat: -22.9519, lng: -43.2105 },
      { nome: "Pão de Açúcar", tipo: "montanha", lat: -22.9486, lng: -43.1566 },
      { nome: "Ipanema", tipo: "praia", lat: -22.9869, lng: -43.2065 },
      { nome: "Copacabana", tipo: "praia", lat: -22.9711, lng: -43.1822 },
    ],
    vantagens: [
      "Turismo permanente e procura internacional",
      "Imóveis icónicos de elevado prestígio",
      "Forte potencial de arrendamento de curta duração",
      "Zonas em expansão com infraestrutura moderna",
    ],
  },
  {
    slug: "nordeste",
    nome: "Nordeste",
    pais: "brasil",
    cidades: ["Fortaleza"],
    zonas: ["Nordeste"],
    imagem: u("1518639192441-8fce0a366e2e"),
    nivel: "regiao",
    tagline: "Praias paradisíacas e sol o ano inteiro.",
    descricao:
      "A região de maior crescimento turístico do Brasil oferece a combinação rara de preço de entrada competitivo e rentabilidades de arrendamento acima da média. Fortaleza, Natal e Maceió lideram a procura.",
    sobre:
      "O litoral do Nordeste brasileiro é um dos mais deslumbrantes do mundo: praias de areia branca, dunas douradas, falésias coloridas e mar quente e calmo durante todo o ano. Foi aqui que o Brasil começou, na costa onde aportaram os primeiros navegadores portugueses. De Fortaleza a Jericoacoara, das dunas de Natal às águas de Maceió, a região combina beleza natural rara com preços de entrada acessíveis.",
    crescimento:
      "A região de maior crescimento turístico do Brasil tem atraído novos voos diretos internacionais e forte investimento hoteleiro, impulsionando a valorização do litoral e a procura por imóveis frente-mar.",
    conhecidaPor: "Pelas praias paradisíacas, pelas dunas e por Jericoacoara.",
    oQueVer: [
      "Jericoacoara (Ceará)",
      "Praia do Futuro (Fortaleza)",
      "Dunas de Genipabu (Natal)",
      "Praias e falésias de Maceió",
      "Cumbuco — kitesurf e buggy",
    ],
    transportes: [
      "Aeroportos internacionais em Fortaleza, Natal e Recife",
      "Voos diretos para a Europa",
      "Estradas litorâneas cénicas entre destinos",
    ],
    distancias: [
      { local: "Aeroporto de Fortaleza", km: 6 },
      { local: "Jericoacoara", km: 300 },
      { local: "Praia", km: 1 },
    ],
    destaques: [
      { icon: "umbrella", titulo: "Praias & dunas", texto: "De Jericoacoara a Maceió — areia branca, dunas e mar morno." },
      { icon: "sun", titulo: "Sol o ano todo", texto: "Clima tropical e temperaturas amenas em todas as estações." },
      { icon: "coins", titulo: "Yields elevadas", texto: "Preço de entrada competitivo com rentabilidade acima da média." },
    ],
    mapa: { lat: -5.5, lng: -37.5, zoom: 6 },
    pontos: [
      { nome: "Fortaleza", tipo: "praia", lat: -3.7319, lng: -38.5267 },
      { nome: "Jericoacoara", tipo: "praia", lat: -2.7956, lng: -40.5137 },
      { nome: "Natal (dunas)", tipo: "praia", lat: -5.7945, lng: -35.211 },
      { nome: "Maceió", tipo: "praia", lat: -9.6498, lng: -35.7089 },
    ],
    vantagens: [
      "Yields de arrendamento acima da média",
      "Preço de entrada muito competitivo",
      "Região de maior crescimento turístico do país",
      "Imóveis frente-mar com forte procura",
    ],
  },
  {
    slug: "fortaleza",
    nome: "Fortaleza",
    pais: "brasil",
    parent: "nordeste",
    cidades: ["Fortaleza"],
    zonas: ["Meireles"],
    imagem: u("1506929562872-bb421503ef21"),
    nivel: "cidade",
    tagline: "Sol o ano inteiro e a melhor orla do Nordeste.",
    descricao:
      "Capital do Ceará, Fortaleza alia praias urbanas vibrantes a um mercado imobiliário em valorização — com o Meireles à cabeça, o bairro mais procurado da orla.",
    sobre:
      "Capital do Ceará e uma das maiores cidades do Nordeste, Fortaleza nasceu em torno do forte que lhe deu o nome e cresceu virada para o mar. A Avenida Beira-Mar, com o seu calçadão à beira da praia do Meireles, é o cartão-postal da cidade — ladeada por arranha-céus, hotéis e a melhor gastronomia. Do boémio Praia de Iracema à badalada Praia do Futuro, Fortaleza alia sol o ano inteiro a uma orla urbana movimentada, sendo porta de entrada para Jericoacoara e Canoa Quebrada.",
    crescimento:
      "Fortaleza é um dos principais destinos turísticos do Brasil e ganhou novas ligações aéreas internacionais diretas para a Europa, reforçando a procura hoteleira e a valorização da orla — em especial no Meireles, onde o preço por m² lidera a cidade.",
    conhecidaPor: "Pela Avenida Beira-Mar, pelo Meireles e pelas praias urbanas.",
    oQueVer: [
      "Avenida Beira-Mar e calçadão",
      "Praia de Iracema e Ponte dos Ingleses",
      "Praia do Futuro (barracas de praia)",
      "Mercado Central de Fortaleza",
      "Catedral Metropolitana",
    ],
    transportes: [
      "Aeroporto Pinto Martins a ~8 km",
      "VLT e rede de autocarros urbanos",
      "Acesso fácil a Jericoacoara e Canoa Quebrada",
    ],
    distancias: [
      { local: "Aeroporto", km: 8 },
      { local: "Beira-Mar / Meireles", km: 1 },
      { local: "Praia do Futuro", km: 7 },
    ],
    destaques: [
      { icon: "umbrella", titulo: "Orla & praias", texto: "Beira-Mar, Praia de Iracema e Praia do Futuro — o calçadão mais movimentado do Nordeste." },
      { icon: "utensils", titulo: "Gastronomia & lazer", texto: "A Av. Beira-Mar concentra restaurantes, feirinha de artesanato e vida noturna." },
      { icon: "buildings", titulo: "Meireles premium", texto: "O bairro mais valorizado de Fortaleza, à beira-mar e com tudo a pé." },
    ],
    mapa: { lat: -3.728, lng: -38.49, zoom: 13 },
    pontos: [
      { nome: "Meireles", tipo: "cidade", lat: -3.728, lng: -38.491 },
      { nome: "Avenida Beira-Mar", tipo: "praia", lat: -3.722, lng: -38.491 },
      { nome: "Praia de Iracema", tipo: "praia", lat: -3.719, lng: -38.512 },
      { nome: "Praça Portugal", tipo: "cidade", lat: -3.735, lng: -38.493 },
      { nome: "Praia do Futuro", tipo: "praia", lat: -3.74, lng: -38.45 },
    ],
    vantagens: [
      "Orla urbana valorizada e procura constante",
      "Studios de alta rentabilidade para locação",
      "Sol e turismo durante todo o ano",
      "Meireles — endereço mais nobre da cidade",
    ],
  },
];

export function getRegioes({ pais } = {}) {
  let list = REGIOES.filter((r) => !r.parent);
  if (pais) list = list.filter((r) => r.pais === pais);
  return list;
}

export function getRegiaoBySlug(slug) {
  return REGIOES.find((r) => r.slug === slug) || null;
}

export function getSubRegioes(slug) {
  return REGIOES.filter((r) => r.parent === slug);
}

export function getEmpreendimentosPorRegiao(regiao) {
  if (!regiao) return [];
  return EMPREENDIMENTOS.filter(
    (e) => regiao.cidades?.includes(e.cidade) || regiao.zonas?.includes(e.zona)
  );
}
