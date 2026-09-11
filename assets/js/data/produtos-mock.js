/**
 * GOFLASH CORE - BASE DE DADOS CENTRALIZADA E CANÔNICA DE PRODUTOS
 * Fonte Única de Verdade (Single Source of Truth) para todo o protótipo navegável.
 * Contém produtos cadastrados com seus respectivos EANs, categorias, marcas,
 * preços de venda/custo e caminhos de imagens fidedignos e individuais.
 */

(function () {
  'use strict';

  // 1. Catálogo Mestre Canônico
  const PRODUTOS_DATABASE = [
    // --- BEBIDAS E REFRIGERANTES (BASE DO PLANO PILOTO) ---
    {
      id: 1,
      ean: '7898938890113',
      nome: 'Energético Ultra Fiesta Mango Zero Açúcar Monster Lata 473ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Monster Energy',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/monster-mango.jpg',
      imagem: '../assets/images/products/monster-mango.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 6,
      estoqueCd: 24,
      sugestao: 4,
      aRepor: 4,
      preco: 8.90,
      precoCusto: 5.50
    },
    {
      id: 2,
      ean: '7898341430123',
      nome: 'Suco Uva Caixa 200ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Del Valle',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/suco-uva.jpg',
      imagem: '../assets/images/products/suco-uva.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 6,
      estoqueCd: 18,
      sugestao: 4,
      aRepor: 4,
      preco: 4.50,
      precoCusto: 2.80
    },
    {
      id: 3,
      ean: '7894900701715',
      nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 1l',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Coca-Cola',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/coca-zero-1l.jpg',
      imagem: '../assets/images/products/coca-zero-1l.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 6,
      estoqueCd: 30,
      sugestao: 4,
      aRepor: 4,
      preco: 6.90,
      precoCusto: 4.20
    },
    {
      id: 4,
      ean: '7898770420011',
      nome: 'Energético Ultra Strawberry Dreams Zero Açúcar Monster Lata 473ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Monster Energy',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/monster-strawberry.jpg',
      imagem: '../assets/images/products/monster-strawberry.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 1,
      estoqueCd: 15,
      sugestao: 9,
      aRepor: 9,
      preco: 8.90,
      precoCusto: 5.50
    },
    {
      id: 5,
      ean: '1220000250222',
      nome: 'Energético Ultra Watermelon Zero Açúcar Monster Lata 473ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Monster Energy',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/monster-watermelon.jpg',
      imagem: '../assets/images/products/monster-watermelon.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 1,
      estoqueCd: 20,
      sugestao: 9,
      aRepor: 9,
      preco: 8.90,
      precoCusto: 5.50
    },
    {
      id: 6,
      ean: '7891991008785',
      nome: 'Refrigerante Zero Açúcar Guaraná Antarctica Garrafa 1,5l',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Guaraná Antarctica',
      fornecedor: 'Ambev Distribuição',
      foto: '../assets/images/products/guarana-zero.jpg',
      imagem: '../assets/images/products/guarana-zero.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 5,
      estoqueCd: 25,
      sugestao: 5,
      aRepor: 5,
      preco: 7.20,
      precoCusto: 4.50
    },
    {
      id: 7,
      ean: '7894900701609',
      nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 600ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Coca-Cola',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/coca-zero-600ml.jpg',
      imagem: '../assets/images/products/coca-zero-600ml.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 0,
      estoqueCd: 40,
      sugestao: 10,
      aRepor: 10,
      preco: 5.50,
      precoCusto: 3.30
    },

    // --- REFRIGERANTES COMPLEMENTARES ---
    {
      id: 9,
      ean: '7891991002684',
      nome: 'Refrigerante Zero Açúcar Guaraná Lata 350ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Guaraná Antarctica',
      fornecedor: 'Ambev Distribuição',
      foto: '../assets/images/products/guarana-zero-lata.jpg',
      imagem: '../assets/images/products/guarana-zero-lata.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 5,
      estoqueCd: 36,
      sugestao: 5,
      aRepor: 5,
      preco: 4.20,
      precoCusto: 2.50
    },
    {
      id: 110,
      ean: '7894900011517',
      nome: 'Refrigerante Fanta Laranja Lata 350ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Fanta',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/fanta-laranja-lata.jpg',
      imagem: '../assets/images/products/fanta-laranja-lata.jpg',
      estoqueIdeal: 12,
      minimoCritico: 3,
      estoqueLoja: 2,
      estoqueCd: 30,
      sugestao: 10,
      aRepor: 10,
      preco: 4.20,
      precoCusto: 2.60
    },

    // --- ENERGÉTICOS E BEBIDAS ESPECIAIS ---
    {
      id: 115,
      ean: '611269101713',
      nome: 'Energético Red Bull Sem Açúcar 250ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Red Bull',
      fornecedor: 'Red Bull Brasil',
      foto: '../assets/images/products/redbull-sugarfree.jpg',
      imagem: '../assets/images/products/redbull-sugarfree.jpg',
      estoqueIdeal: 12,
      minimoCritico: 3,
      estoqueLoja: 4,
      estoqueCd: 24,
      sugestao: 8,
      aRepor: 8,
      preco: 10.90,
      precoCusto: 6.80
    },
    {
      id: 116,
      ean: '9002490100070',
      nome: 'Energético Red Bull Energy Drink 250ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Red Bull',
      fornecedor: 'Red Bull Brasil',
      foto: '../assets/images/products/redbull-tradicional.jpg',
      imagem: '../assets/images/products/redbull-tradicional.jpg',
      estoqueIdeal: 16,
      minimoCritico: 4,
      estoqueLoja: 6,
      estoqueCd: 36,
      sugestao: 10,
      aRepor: 10,
      preco: 10.90,
      precoCusto: 6.80
    },
    {
      id: 117,
      ean: '70847022305',
      nome: 'Energético Monster Energy Absolutely Zero Lata 473ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Monster Energy',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/monster-zero.jpg',
      imagem: '../assets/images/products/monster-zero.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 3,
      estoqueCd: 20,
      sugestao: 7,
      aRepor: 7,
      preco: 8.90,
      precoCusto: 5.50
    },
    {
      id: 118,
      ean: '7898938890090',
      nome: 'Energético Monster Energy Ultra Peachy Keen Lata 473ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Monster Energy',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/monster-peachy.jpg',
      imagem: '../assets/images/products/monster-peachy.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 2,
      estoqueCd: 18,
      sugestao: 8,
      aRepor: 8,
      preco: 8.90,
      precoCusto: 5.50
    },
    {
      id: 119,
      ean: '7891000000011',
      nome: 'Água Mineral Sem Gás Garrafa 500ml',
      grupo: 'Bebidas e Refrigerantes',
      categoria: 'Bebidas e Refrigerantes',
      marca: 'Crystal',
      fornecedor: 'Coca-Cola FEMSA',
      foto: '../assets/images/products/agua-mineral.jpg',
      imagem: '../assets/images/products/agua-mineral.jpg',
      estoqueIdeal: 24,
      minimoCritico: 6,
      estoqueLoja: 8,
      estoqueCd: 72,
      sugestao: 16,
      aRepor: 16,
      preco: 3.50,
      precoCusto: 1.20
    },

    // --- CERVEJAS E ALCOÓLICOS ---
    {
      id: 8,
      ean: '7891149103102',
      nome: 'Cerveja Skol Pilsen Lata 269ml',
      grupo: 'Cervejas e Alcoólicos',
      categoria: 'Cervejas e Alcoólicos',
      marca: 'Skol',
      fornecedor: 'Ambev Distribuição',
      foto: '../assets/images/products/skol-lata-269ml.jpg',
      imagem: '../assets/images/products/skol-lata-269ml.jpg',
      estoqueIdeal: 12,
      minimoCritico: 4,
      estoqueLoja: 0,
      estoqueCd: 48,
      sugestao: 12,
      aRepor: 12,
      preco: 3.89,
      precoCusto: 2.40
    },
    {
      id: 106,
      ean: '7891079012345',
      nome: 'Cerveja Heineken Puro Malte Garrafa Long Neck 330ml',
      grupo: 'Cervejas e Alcoólicos',
      categoria: 'Cervejas e Alcoólicos',
      marca: 'Heineken',
      fornecedor: 'Heineken Brasil',
      foto: '../assets/images/products/heineken-long-neck.jpg',
      imagem: '../assets/images/products/heineken-long-neck.jpg',
      estoqueIdeal: 24,
      minimoCritico: 6,
      estoqueLoja: 2,
      estoqueCd: 72,
      sugestao: 22,
      aRepor: 22,
      preco: 7.90,
      precoCusto: 5.10
    },
    {
      id: 107,
      ean: '7891962012018',
      nome: 'Cerveja Stella Artois Puro Malte Long Neck 330ml',
      grupo: 'Cervejas e Alcoólicos',
      categoria: 'Cervejas e Alcoólicos',
      marca: 'Stella Artois',
      fornecedor: 'Ambev Distribuição',
      foto: '../assets/images/products/stella-artois-long-neck.jpg',
      imagem: '../assets/images/products/stella-artois-long-neck.jpg',
      estoqueIdeal: 18,
      minimoCritico: 4,
      estoqueLoja: 0,
      estoqueCd: 54,
      sugestao: 18,
      aRepor: 18,
      preco: 6.99,
      precoCusto: 4.60
    },
    {
      id: 113,
      ean: '7891149200108',
      nome: 'Cerveja Corona Extra Garrafa Long Neck 330ml',
      grupo: 'Cervejas e Alcoólicos',
      categoria: 'Cervejas e Alcoólicos',
      marca: 'Corona',
      fornecedor: 'Ambev Distribuição',
      foto: '../assets/images/products/corona-long-neck.jpg',
      imagem: '../assets/images/products/corona-long-neck.jpg',
      estoqueIdeal: 18,
      minimoCritico: 4,
      estoqueLoja: 3,
      estoqueCd: 40,
      sugestao: 15,
      aRepor: 15,
      preco: 8.90,
      precoCusto: 5.80
    },

    // --- SNACKS E SALGADINHOS ---
    {
      id: 101,
      ean: '7891000100103',
      nome: 'Salgadinho Doritos Queijo Nacho 140g',
      grupo: 'Snacks e Salgadinhos',
      categoria: 'Snacks e Salgadinhos',
      marca: 'Doritos',
      fornecedor: 'PepsiCo Alimentos (Elma Chips)',
      foto: '../assets/images/products/doritos-snack.jpg',
      imagem: '../assets/images/products/doritos-snack.jpg',
      estoqueIdeal: 12,
      minimoCritico: 3,
      estoqueLoja: 0,
      estoqueCd: 45,
      sugestao: 12,
      aRepor: 12,
      preco: 9.90,
      precoCusto: 6.20
    },
    {
      id: 102,
      ean: '7891000245601',
      nome: 'Batata Frita Ruffles Original 76g',
      grupo: 'Snacks e Salgadinhos',
      categoria: 'Snacks e Salgadinhos',
      marca: 'Ruffles',
      fornecedor: 'PepsiCo Alimentos (Elma Chips)',
      foto: '../assets/images/products/ruffles-chips.jpg',
      imagem: '../assets/images/products/ruffles-chips.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 2,
      estoqueCd: 32,
      sugestao: 8,
      aRepor: 8,
      preco: 7.50,
      precoCusto: 4.80
    },
    {
      id: 111,
      ean: '7891000300107',
      nome: 'Salgadinho Cheetos Requeijão 115g',
      grupo: 'Snacks e Salgadinhos',
      categoria: 'Snacks e Salgadinhos',
      marca: 'Cheetos',
      fornecedor: 'PepsiCo Alimentos (Elma Chips)',
      foto: '../assets/images/products/cheetos-requeijao.jpg',
      imagem: '../assets/images/products/cheetos-requeijao.jpg',
      estoqueIdeal: 15,
      minimoCritico: 4,
      estoqueLoja: 0,
      estoqueCd: 35,
      sugestao: 15,
      aRepor: 15,
      preco: 8.50,
      precoCusto: 5.30
    },

    // --- DOCES E CHOCOLATES ---
    {
      id: 103,
      ean: '7622210567890',
      nome: 'Chocolate Bis Wafer Ao Leite Caixa 126g',
      grupo: 'Doces e Chocolates',
      categoria: 'Doces e Chocolates',
      marca: 'Bis / Lacta',
      fornecedor: 'Mondelēz Brasil (Lacta)',
      foto: '../assets/images/products/bis-wafer.jpg',
      imagem: '../assets/images/products/bis-wafer.jpg',
      estoqueIdeal: 15,
      minimoCritico: 4,
      estoqueLoja: 1,
      estoqueCd: 50,
      sugestao: 14,
      aRepor: 14,
      preco: 5.90,
      precoCusto: 3.70
    },
    {
      id: 104,
      ean: '7891000315507',
      nome: 'Chocolate KitKat 4 Fingers Ao Leite 41,5g',
      grupo: 'Doces e Chocolates',
      categoria: 'Doces e Chocolates',
      marca: 'KitKat',
      fornecedor: 'Nestlé Brasil',
      foto: '../assets/images/products/kitkat-ao-leite.jpg',
      imagem: '../assets/images/products/kitkat-ao-leite.jpg',
      estoqueIdeal: 20,
      minimoCritico: 5,
      estoqueLoja: 0,
      estoqueCd: 60,
      sugestao: 20,
      aRepor: 20,
      preco: 4.50,
      precoCusto: 2.80
    },
    {
      id: 105,
      ean: '7891008123409',
      nome: 'Biscoito Recheado Passatempo Chocolate 130g',
      grupo: 'Doces e Chocolates',
      categoria: 'Doces e Chocolates',
      marca: 'Passatempo',
      fornecedor: 'Nestlé Brasil',
      foto: '../assets/images/products/passatempo-chocolate.jpg',
      imagem: '../assets/images/products/passatempo-chocolate.jpg',
      estoqueIdeal: 15,
      minimoCritico: 3,
      estoqueLoja: 2,
      estoqueCd: 35,
      sugestao: 13,
      aRepor: 13,
      preco: 3.90,
      precoCusto: 2.30
    },
    {
      id: 112,
      ean: '7622300990710',
      nome: 'Barra de Chocolate Lacta Diamante Negro 90g',
      grupo: 'Doces e Chocolates',
      categoria: 'Doces e Chocolates',
      marca: 'Lacta',
      fornecedor: 'Mondelēz Brasil (Lacta)',
      foto: '../assets/images/products/diamante-negro.jpg',
      imagem: '../assets/images/products/diamante-negro.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 1,
      estoqueCd: 0,
      sugestao: 9,
      aRepor: 9,
      preco: 6.80,
      precoCusto: 4.10
    },

    // --- MERCEARIA E MATINAIS ---
    {
      id: 108,
      ean: '7891048036012',
      nome: 'Torrada Tradicional Bauducco 142g',
      grupo: 'Mercearia e Matinais',
      categoria: 'Mercearia e Matinais',
      marca: 'Bauducco',
      fornecedor: 'Bauducco / Pandurata',
      foto: '../assets/images/products/torrada-bauducco.jpg',
      imagem: '../assets/images/products/torrada-bauducco.jpg',
      estoqueIdeal: 10,
      minimoCritico: 2,
      estoqueLoja: 1,
      estoqueCd: 24,
      sugestao: 9,
      aRepor: 9,
      preco: 5.20,
      precoCusto: 3.20
    },
    {
      id: 109,
      ean: '7891048052029',
      nome: 'Cookies Original com Gotas de Chocolate Bauducco 96g',
      grupo: 'Mercearia e Matinais',
      categoria: 'Mercearia e Matinais',
      marca: 'Bauducco',
      fornecedor: 'Bauducco / Pandurata',
      foto: '../assets/images/products/cookies-bauducco.jpg',
      imagem: '../assets/images/products/cookies-bauducco.jpg',
      estoqueIdeal: 12,
      minimoCritico: 3,
      estoqueLoja: 3,
      estoqueCd: 30,
      sugestao: 9,
      aRepor: 9,
      preco: 4.80,
      precoCusto: 2.90
    },
    {
      id: 114,
      ean: '7891048041016',
      nome: 'Pão de Mel com Cobertura de Chocolate Bauducco 240g',
      grupo: 'Mercearia e Matinais',
      categoria: 'Mercearia e Matinais',
      marca: 'Bauducco',
      fornecedor: 'Bauducco / Pandurata',
      foto: '../assets/images/products/pao-de-mel-bauducco.jpg',
      imagem: '../assets/images/products/pao-de-mel-bauducco.jpg',
      estoqueIdeal: 8,
      minimoCritico: 2,
      estoqueLoja: 0,
      estoqueCd: 20,
      sugestao: 8,
      aRepor: 8,
      preco: 11.50,
      precoCusto: 7.20
    }
  ];

  // 2. Objeto de Controle Global e Métodos de Acesso
  const GoflashProdutosDatabase = {
    produtos: PRODUTOS_DATABASE,

    getAll() {
      return JSON.parse(JSON.stringify(this.produtos));
    },

    getById(id) {
      if (!id) return null;
      return this.produtos.find(p => String(p.id) === String(id)) || null;
    },

    getByEan(ean) {
      if (!ean) return null;
      const clean = String(ean).trim();
      return this.produtos.find(p => p.ean === clean) || null;
    },

    search(term) {
      if (!term || !term.trim()) return this.getAll();
      const q = term.toLowerCase().trim();
      return this.produtos.filter(p =>
        (p.nome && p.nome.toLowerCase().includes(q)) ||
        (p.ean && p.ean.includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q)) ||
        (p.categoria && p.categoria.toLowerCase().includes(q))
      );
    },

    getByCategory(cat) {
      if (!cat || cat === 'ALL') return this.getAll();
      const q = cat.toLowerCase().trim();
      return this.produtos.filter(p =>
        (p.categoria && p.categoria.toLowerCase().includes(q)) ||
        (p.grupo && p.grupo.toLowerCase().includes(q))
      );
    },

    getGrupos() {
      const grupos = new Set(this.produtos.map(p => p.grupo));
      return Array.from(grupos);
    },

    getCategorias() {
      const categorias = new Set(this.produtos.map(p => p.categoria));
      return Array.from(categorias);
    }
  };

  // 3. Exposição Global
  window.GoflashProdutosDatabase = GoflashProdutosDatabase;
  window.GoflashProdutos = GoflashProdutosDatabase;

  // 4. Sincronização Retrocompatível com Módulos Legados
  // 4.1 ConsultaProdutosBase (IDs 1 a 7 - Base do Plano Piloto)
  window.ConsultaProdutosBase = PRODUTOS_DATABASE.filter(p => p.id >= 1 && p.id <= 7);

  // 4.2 CatalogoExtraProdutos (Demais produtos complementares)
  window.CatalogoExtraProdutos = PRODUTOS_DATABASE.filter(p => p.id > 7);

  // 4.3 CatalogoCompletoProdutos (União consolidada de todos os produtos)
  window.CatalogoCompletoProdutos = PRODUTOS_DATABASE;

  // 4.4 Sincronização com AbastecimentoMock caso já esteja presente ou venha a carregar
  if (window.AbastecimentoMock) {
    window.AbastecimentoMock.produtos = GoflashProdutosDatabase.getAll();
  }

})();
