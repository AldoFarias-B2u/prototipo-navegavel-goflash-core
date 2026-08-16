/**
 * GOFLASH CORE - ABASTECIMENTO MOCK DATABASE
 * Base de dados simulada para o módulo de Planos de Abastecimento do ERP GoMarket.
 * Permite fácil adição e alteração de filiais, produtos e planos cadastrados.
 */

const AbastecimentoMock = {
  // 1. Filiais / Unidades de Negócio (Lojas Autônomas e CD)
  filiais: [
    { id: 'cd-01', nome: 'CD Central - Distribuição São Paulo', tipo: 'Centro de Distribuição', cidade: 'São Paulo - SP' },
    { id: 'lj-01', nome: 'Minimercado Condomínio Parque das Flores (Loja 01)', tipo: 'Loja Autônoma', cidade: 'São Paulo - SP' },
    { id: 'lj-02', nome: 'Minimercado Condomínio Grand Tower (Loja 02)', tipo: 'Loja Autônoma', cidade: 'Campinas - SP' },
    { id: 'lj-03', nome: 'Minimercado Edifício Infinity (Loja 03)', tipo: 'Loja Autônoma', cidade: 'São Bernardo - SP' },
    { id: 'lj-04', nome: 'GoMarket Express Paulista (Loja 04)', tipo: 'Loja Autônoma', cidade: 'São Paulo - SP' }
  ],

  // 2. Categorias de Produtos
  categorias: [
    { id: 'bebidas', nome: 'Bebidas e Refrigerantes', icone: 'local_bar' },
    { id: 'snacks', nome: 'Snacks, Salgados e Petiscos', icone: 'fastfood' },
    { id: 'doces', nome: 'Doces, Chocolates e Balas', icone: 'cake' },
    { id: 'laticinios', nome: 'Laticínios e Queijos', icone: 'breakfast_dining' },
    { id: 'congelados', nome: 'Congelados e Pratos Prontos', icone: 'ac_unit' },
    { id: 'higiene', nome: 'Higiene e Conveniência', icone: 'sanitizer' }
  ],

  // 3. Catálogo Realista de Produtos de Minimercado
  produtos: [
    // --- Bebidas ---
    { id: 'prod-01', ean: '7894900010015', nome: 'Coca-Cola Original 350ml Lata', categoria: 'bebidas', marca: 'Coca-Cola', un: 'UN', preco: 5.50, idealPadrao: 24, minimoPadrao: 6 },
    { id: 'prod-02', ean: '7894900010022', nome: 'Coca-Cola Sem Açúcar 350ml Lata', categoria: 'bebidas', marca: 'Coca-Cola', un: 'UN', preco: 5.50, idealPadrao: 18, minimoPadrao: 4 },
    { id: 'prod-03', ean: '7891991000856', nome: 'Cerveja Heineken Puro Malte 330ml Long Neck', categoria: 'bebidas', marca: 'Heineken', un: 'UN', preco: 8.90, idealPadrao: 24, minimoPadrao: 6 },
    { id: 'prod-04', ean: '7891991010831', nome: 'Cerveja Stella Artois 330ml Long Neck', categoria: 'bebidas', marca: 'Ambev', un: 'UN', preco: 8.50, idealPadrao: 18, minimoPadrao: 4 },
    { id: 'prod-05', ean: '7891055310012', nome: 'Energético Red Bull Energy Drink 250ml', categoria: 'bebidas', marca: 'Red Bull', un: 'UN', preco: 11.90, idealPadrao: 16, minimoPadrao: 4 },
    { id: 'prod-06', ean: '7894900700015', nome: 'Água Mineral Crystal Sem Gás 500ml', categoria: 'bebidas', marca: 'Crystal', un: 'UN', preco: 3.50, idealPadrao: 30, minimoPadrao: 8 },
    { id: 'prod-07', ean: '7894900700022', nome: 'Água Mineral Crystal Com Gás 500ml', categoria: 'bebidas', marca: 'Crystal', un: 'UN', preco: 3.80, idealPadrao: 18, minimoPadrao: 4 },
    { id: 'prod-08', ean: '7896005800108', nome: 'Suco Natural One Laranja Integral 900ml', categoria: 'bebidas', marca: 'Natural One', un: 'UN', preco: 13.90, idealPadrao: 10, minimoPadrao: 2 },

    // --- Snacks & Salgados ---
    { id: 'prod-09', ean: '7892840222018', nome: 'Batata Ruffles Original 76g', categoria: 'snacks', marca: 'Elma Chips', un: 'UN', preco: 7.90, idealPadrao: 16, minimoPadrao: 4 },
    { id: 'prod-10', ean: '7892840222025', nome: 'Doritos Queijo Nacho 78g', categoria: 'snacks', marca: 'Elma Chips', un: 'UN', preco: 8.50, idealPadrao: 20, minimoPadrao: 5 },
    { id: 'prod-11', ean: '7892840222032', nome: 'Batata Pringles Original 114g', categoria: 'snacks', marca: 'Pringles', un: 'UN', preco: 12.90, idealPadrao: 12, minimoPadrao: 3 },
    { id: 'prod-12', ean: '7896001201015', nome: 'Amendoim Japonês Dori 120g', categoria: 'snacks', marca: 'Dori', un: 'UN', preco: 4.90, idealPadrao: 14, minimoPadrao: 3 },
    { id: 'prod-13', ean: '7891000100014', nome: 'Biscoito Club Social Original 141g', categoria: 'snacks', marca: 'Mondelez', un: 'UN', preco: 5.20, idealPadrao: 15, minimoPadrao: 4 },

    // --- Doces & Chocolates ---
    { id: 'prod-14', ean: '7891000248815', nome: 'Chocolate Bis ao Leite 126g', categoria: 'doces', marca: 'Lacta', un: 'UN', preco: 6.90, idealPadrao: 18, minimoPadrao: 4 },
    { id: 'prod-15', ean: '7891000248822', nome: 'Barra de Chocolate Lacta ao Leite 80g', categoria: 'doces', marca: 'Lacta', un: 'UN', preco: 7.50, idealPadrao: 14, minimoPadrao: 3 },
    { id: 'prod-16', ean: '7622210815124', nome: 'Chocolate KitKat 4 Fingers 41,5g', categoria: 'doces', marca: 'Nestlé', un: 'UN', preco: 4.50, idealPadrao: 24, minimoPadrao: 6 },
    { id: 'prod-17', ean: '7895800300014', nome: 'Balas Halls Extra Forte 28g', categoria: 'doces', marca: 'Mondelez', un: 'UN', preco: 2.50, idealPadrao: 30, minimoPadrao: 8 },
    { id: 'prod-18', ean: '7895800300021', nome: 'Goma de Mascar Trident Menta 8g', categoria: 'doces', marca: 'Mondelez', un: 'UN', preco: 3.20, idealPadrao: 30, minimoPadrao: 8 },

    // --- Laticínios & Queijos ---
    { id: 'prod-19', ean: '7891000053112', nome: 'Iogurte Grego Danone Tradicional 90g', categoria: 'laticinios', marca: 'Danone', un: 'UN', preco: 4.80, idealPadrao: 12, minimoPadrao: 3 },
    { id: 'prod-20', ean: '7891000053129', nome: 'Queijo Mussarela Fatiado Polenghi 150g', categoria: 'laticinios', marca: 'Polenghi', un: 'UN', preco: 11.50, idealPadrao: 10, minimoPadrao: 2 },
    { id: 'prod-21', ean: '7891000053136', nome: 'Requeijão Cremoso Danone Copo 200g', categoria: 'laticinios', marca: 'Danone', un: 'UN', preco: 9.90, idealPadrao: 8, minimoPadrao: 2 },

    // --- Congelados & Pratos Prontos ---
    { id: 'prod-22', ean: '7891515432014', nome: 'Pizza Individual Sadia Mussarela 240g', categoria: 'congelados', marca: 'Sadia', un: 'UN', preco: 14.90, idealPadrao: 10, minimoPadrao: 2 },
    { id: 'prod-23', ean: '7891515432021', nome: 'Lasanha à Bolonhesa Seara 350g', categoria: 'congelados', marca: 'Seara', un: 'UN', preco: 13.90, idealPadrao: 8, minimoPadrao: 2 },
    { id: 'prod-24', ean: '7891058012015', nome: 'Picolé Magnum Clássico Kibon 85ml', categoria: 'congelados', marca: 'Kibon', un: 'UN', preco: 14.50, idealPadrao: 12, minimoPadrao: 3 },

    // --- Higiene & Conveniência ---
    { id: 'prod-25', ean: '7891030012014', nome: 'Creme Dental Colgate Total 12 90g', categoria: 'higiene', marca: 'Colgate', un: 'UN', preco: 6.90, idealPadrao: 8, minimoPadrao: 2 },
    { id: 'prod-26', ean: '7891030012021', nome: 'Sabonete Dove Original 90g', categoria: 'higiene', marca: 'Dove', un: 'UN', preco: 4.20, idealPadrao: 12, minimoPadrao: 3 },
    { id: 'prod-27', ean: '7891030012038', nome: 'Pilhas Alcalinas Duracell AAA com 2 un', categoria: 'higiene', marca: 'Duracell', un: 'UN', preco: 18.90, idealPadrao: 6, minimoPadrao: 1 }
  ],

  // 4. Planos Iniciais Pré-Cadastrados
  planosIniciais: [
    {
      id: 'PLN-001',
      nome: 'Mix Essencial - Minimercado Parque das Flores',
      filialId: 'lj-01',
      filialNome: 'Minimercado Condomínio Parque das Flores (Loja 01)',
      descricao: 'Plano padrão com sortimento de bebidas, lanches rápidos e congelados para condomínio residencial.',
      status: 'ativo',
      dataCriacao: '12/08/2026',
      dataAtualizacao: '15/08/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-02', estoqueIdeal: 18, estoqueMinimo: 4 },
        { produtoId: 'prod-03', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-05', estoqueIdeal: 16, estoqueMinimo: 4 },
        { produtoId: 'prod-06', estoqueIdeal: 30, estoqueMinimo: 8 },
        { produtoId: 'prod-09', estoqueIdeal: 16, estoqueMinimo: 4 },
        { produtoId: 'prod-10', estoqueIdeal: 20, estoqueMinimo: 5 },
        { produtoId: 'prod-14', estoqueIdeal: 18, estoqueMinimo: 4 },
        { produtoId: 'prod-16', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-19', estoqueIdeal: 12, estoqueMinimo: 3 },
        { produtoId: 'prod-22', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-24', estoqueIdeal: 12, estoqueMinimo: 3 }
      ]
    },
    {
      id: 'PLN-002',
      nome: 'Mix Bebidas Geladas & Happy Hour - Grand Tower',
      filialId: 'lj-02',
      filialNome: 'Minimercado Condomínio Grand Tower (Loja 02)',
      descricao: 'Plano focado em alta rotação de cervejas artesanais, refrigerantes, petiscos e energéticos.',
      status: 'ativo',
      dataCriacao: '10/08/2026',
      dataAtualizacao: '14/08/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 36, estoqueMinimo: 10 },
        { produtoId: 'prod-02', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-03', estoqueIdeal: 48, estoqueMinimo: 12 },
        { produtoId: 'prod-04', estoqueIdeal: 36, estoqueMinimo: 8 },
        { produtoId: 'prod-05', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-09', estoqueIdeal: 20, estoqueMinimo: 5 },
        { produtoId: 'prod-10', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-11', estoqueIdeal: 16, estoqueMinimo: 4 },
        { produtoId: 'prod-12', estoqueIdeal: 18, estoqueMinimo: 4 }
      ]
    },
    {
      id: 'PLN-003',
      nome: 'Sortimento Completo - Edifício Infinity',
      filialId: 'lj-03',
      filialNome: 'Minimercado Edifício Infinity (Loja 03)',
      descricao: 'Plano com 3 gôndolas e 2 refrigeradores verticais, mix completo de conveniência.',
      status: 'ativo',
      dataCriacao: '05/08/2026',
      dataAtualizacao: '11/08/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-03', estoqueIdeal: 24, estoqueMinimo: 6 },
        { produtoId: 'prod-06', estoqueIdeal: 30, estoqueMinimo: 8 },
        { produtoId: 'prod-08', estoqueIdeal: 12, estoqueMinimo: 3 },
        { produtoId: 'prod-09', estoqueIdeal: 16, estoqueMinimo: 4 },
        { produtoId: 'prod-10', estoqueIdeal: 20, estoqueMinimo: 5 },
        { produtoId: 'prod-14', estoqueIdeal: 18, estoqueMinimo: 4 },
        { produtoId: 'prod-17', estoqueIdeal: 30, estoqueMinimo: 8 },
        { produtoId: 'prod-19', estoqueIdeal: 12, estoqueMinimo: 3 },
        { produtoId: 'prod-20', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-22', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-25', estoqueIdeal: 8, estoqueMinimo: 2 },
        { produtoId: 'prod-26', estoqueIdeal: 12, estoqueMinimo: 3 }
      ]
    },
    {
      id: 'PLN-004',
      nome: 'Estoque Pulmão - CD Central São Paulo',
      filialId: 'cd-01',
      filialNome: 'CD Central - Distribuição São Paulo',
      descricao: 'Plano matriz do CD com estoque máximo de segurança para distribuição em rede.',
      status: 'ativo',
      dataCriacao: '01/08/2026',
      dataAtualizacao: '08/08/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 240, estoqueMinimo: 60 },
        { produtoId: 'prod-02', estoqueIdeal: 180, estoqueMinimo: 40 },
        { produtoId: 'prod-03', estoqueIdeal: 240, estoqueMinimo: 60 },
        { produtoId: 'prod-04', estoqueIdeal: 180, estoqueMinimo: 40 },
        { produtoId: 'prod-05', estoqueIdeal: 160, estoqueMinimo: 30 },
        { produtoId: 'prod-06', estoqueIdeal: 300, estoqueMinimo: 80 },
        { produtoId: 'prod-09', estoqueIdeal: 160, estoqueMinimo: 40 },
        { produtoId: 'prod-10', estoqueIdeal: 200, estoqueMinimo: 50 },
        { produtoId: 'prod-14', estoqueIdeal: 180, estoqueMinimo: 40 },
        { produtoId: 'prod-16', estoqueIdeal: 240, estoqueMinimo: 60 },
        { produtoId: 'prod-22', estoqueIdeal: 100, estoqueMinimo: 25 },
        { produtoId: 'prod-24', estoqueIdeal: 120, estoqueMinimo: 30 }
      ]
    },
    {
      id: 'PLN-005',
      nome: 'Mix Sazonal de Inverno (Inativo)',
      filialId: 'lj-01',
      filialNome: 'Minimercado Condomínio Parque das Flores (Loja 01)',
      descricao: 'Plano com sopas e bebidas quentes sazonais, desativado temporariamente.',
      status: 'inativo',
      dataCriacao: '15/07/2026',
      dataAtualizacao: '15/07/2026',
      itens: [
        { produtoId: 'prod-08', estoqueIdeal: 15, estoqueMinimo: 3 },
        { produtoId: 'prod-13', estoqueIdeal: 20, estoqueMinimo: 5 },
        { produtoId: 'prod-15', estoqueIdeal: 15, estoqueMinimo: 3 },
        { produtoId: 'prod-23', estoqueIdeal: 12, estoqueMinimo: 2 }
      ]
    }
  ],

  // 5. Inicialização e Persistência no LocalStorage
  STORAGE_KEY: 'goflash_planos_abastecimento',

  getPlanos() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage de planos:', e);
    }
    // Salva cópia inicial se não existir
    this.savePlanos(this.planosIniciais);
    return [...this.planosIniciais];
  },

  savePlanos(planos) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(planos));
    } catch (e) {
      console.warn('Erro ao salvar no localStorage:', e);
    }
  },

  getProdutoById(id) {
    return this.produtos.find(p => p.id === id);
  },

  getFilialById(id) {
    return this.filiais.find(f => f.id === id);
  }
};

window.AbastecimentoMock = AbastecimentoMock;
