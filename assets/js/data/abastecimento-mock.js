/**
 * GOFLASH CORE - ABASTECIMENTO MOCK DATABASE
 * Base de dados simulada fiel às telas de referência (Imagem 1, 2 e 3).
 */

const AbastecimentoMock = {
  // 1. Filiais / Lojas Autônomas
  filiais: [
    { id: 'filial-03', codigo: '003', nome: 'Mini Mercado 03 Simples Nacional', tipo: 'Loja Autônoma' },
    { id: 'filial-01', codigo: '001', nome: 'Mini Mercado 01', tipo: 'Loja Autônoma' },
    { id: 'filial-02', codigo: '002', nome: 'Mini Mercado 02 Condomínio Grand Tower', tipo: 'Loja Autônoma' },
    { id: 'cd-01', codigo: '099', nome: 'CD Central - Distribuição São Paulo', tipo: 'Centro de Distribuição' }
  ],

  // 2. Categorias
  categorias: [
    { id: 'BEBIDAS', nome: 'Bebidas e Refrigerantes' },
    { id: 'SNACKS', nome: 'Snacks, Salgados e Petiscos' },
    { id: 'DOCES', nome: 'Doces, Chocolates e Balas' },
    { id: 'LATICINIOS', nome: 'Laticínios e Frios' },
    { id: 'CONGELADOS', nome: 'Congelados e Prontos' },
    { id: 'HIGIENE', nome: 'Higiene e Conveniência' }
  ],

  // 3. Catálogo de Produtos com Imagens Reais
  produtos: [
    {
      id: 'prod-01',
      ean: '7898938890113',
      nome: 'Energético Ultra Fiesta Mango Zero Açúcar Monster Lata 473ml',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/monster-mango.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-02',
      ean: '7898341430123',
      nome: 'Suco Uva Caixa 200ml',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/suco-uva.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-03',
      ean: '7894900701715',
      nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 1l',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/coca-zero-1l.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-04',
      ean: '7898770420011',
      nome: 'Energético Ultra Strawberry Dreams Zero Açúcar Monster Lata 473ml',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/monster-strawberry.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-05',
      ean: '1220000250222',
      nome: 'Energético Ultra Watermelon Zero Açúcar Monster Lata 473ml',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/monster-watermelon.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-06',
      ean: '7891991008785',
      nome: 'Refrigerante Zero Açúcar Guaraná Antarctica Garrafa 1,5l',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/guarana-zero.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-07',
      ean: '7894900701609',
      nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 600ml',
      grupo: 'BEBIDAS',
      imagem: '../assets/images/products/coca-zero-600ml.jpg',
      idealPadrao: 10,
      minimoPadrao: 2
    },
    {
      id: 'prod-08',
      ean: '7892840222018',
      nome: 'Batata Ruffles Original 76g',
      grupo: 'SNACKS',
      imagem: '../assets/images/products/ruffles-chips.jpg',
      idealPadrao: 12,
      minimoPadrao: 3
    },
    {
      id: 'prod-09',
      ean: '7892840222025',
      nome: 'Doritos Queijo Nacho 78g',
      grupo: 'SNACKS',
      imagem: '../assets/images/products/doritos-snack.jpg',
      idealPadrao: 15,
      minimoPadrao: 4
    },
    {
      id: 'prod-10',
      ean: '7891000248815',
      nome: 'Chocolate Bis ao Leite 126g',
      grupo: 'DOCES',
      imagem: '../assets/images/products/bis-wafer.jpg',
      idealPadrao: 14,
      minimoPadrao: 3
    }
  ],

  // 4. Planos Pré-Cadastrados Fiéis à Imagem 1 e 3
  planosIniciais: [
    {
      id: 'pln-000004',
      codigo: '000004',
      nome: 'Plano teste 03',
      descricao: '',
      filialId: 'filial-03',
      filialNome: 'Mini Mercado 03 Simples Nacional',
      status: 'ativo',
      dataCriacao: '16/08/2026',
      itens: []
    },
    {
      id: 'pln-000003',
      codigo: '000003',
      nome: 'Plano MiniMercado 03',
      descricao: 'Nenhuma descrição informada',
      filialId: 'filial-03',
      filialNome: 'Mini Mercado 03 Simples Nacional',
      status: 'ativo',
      dataCriacao: '15/08/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-02', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-03', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-04', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-05', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-06', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-07', estoqueIdeal: 10, estoqueMinimo: 2 }
      ]
    },
    {
      id: 'pln-000001',
      codigo: '000001',
      nome: 'Plano teste',
      descricao: 'Plano piloto inicial',
      filialId: 'filial-01',
      filialNome: 'Mini Mercado 01',
      status: 'ativo',
      dataCriacao: '01/04/2026',
      itens: [
        { produtoId: 'prod-01', estoqueIdeal: 8, estoqueMinimo: 2 },
        { produtoId: 'prod-03', estoqueIdeal: 12, estoqueMinimo: 3 },
        { produtoId: 'prod-08', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-09', estoqueIdeal: 12, estoqueMinimo: 3 }
      ]
    },
    {
      id: 'pln-000002',
      codigo: '000002',
      nome: 'Plano Teste MiniMercado 01',
      descricao: 'Mix complementar',
      filialId: 'filial-01',
      filialNome: 'Mini Mercado 01',
      status: 'ativo',
      dataCriacao: '05/05/2026',
      itens: [
        { produtoId: 'prod-02', estoqueIdeal: 15, estoqueMinimo: 3 },
        { produtoId: 'prod-04', estoqueIdeal: 10, estoqueMinimo: 2 },
        { produtoId: 'prod-06', estoqueIdeal: 12, estoqueMinimo: 3 },
        { produtoId: 'prod-08', estoqueIdeal: 14, estoqueMinimo: 4 },
        { produtoId: 'prod-10', estoqueIdeal: 18, estoqueMinimo: 4 }
      ]
    }
  ],

  STORAGE_KEY: 'goflash_planos_abastecimento_v2',

  getPlanos() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Erro ao ler localStorage:', e);
    }
    this.savePlanos(this.planosIniciais);
    return JSON.parse(JSON.stringify(this.planosIniciais));
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
