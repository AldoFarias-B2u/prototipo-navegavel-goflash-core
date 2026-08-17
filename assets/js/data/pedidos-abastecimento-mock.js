/**
 * GOFLASH CORE - MOCK DE DADOS: PEDIDOS E CONSULTA DE ABASTECIMENTO
 * Dados de alta fidelidade ao sistema de referência oficial com persistência local
 */

// 1. Catálogo de Filiais
window.FiliaisAbastecimentoData = [
  { id: '000005', nome: 'Estoque central', tipo: 'origem' },
  { id: '000003', nome: 'Mini Mercado 03 Simples Nacional', tipo: 'destino', planoId: '000003' },
  { id: '000001', nome: 'Mini Mercado 01', tipo: 'destino', planoId: '000001' },
  { id: '000002', nome: 'Mini Mercado 02 Condomínio Jardins', tipo: 'destino', planoId: '000002' },
  { id: '000004', nome: 'Mini Mercado 04 Empresarial Prime', tipo: 'destino', planoId: '000004' }
];

// 2. Planos de Abastecimento Associados
window.PlanosDisponiveisData = [
  { id: '000003', codigo: '000003', nome: 'Plano MiniMercado 03', filialId: '000003' },
  { id: '000001', codigo: '000001', nome: 'Plano MiniMercado 01', filialId: '000001' },
  { id: '000002', codigo: '000002', nome: 'Plano MiniMercado 02', filialId: '000002' },
  { id: '000004', codigo: '000004', nome: 'Plano Semanal Bebidas', filialId: '000004' },
  { id: '000005', codigo: '000005', nome: 'Plano Snacks & Mercearia', filialId: '000003' }
];

// 3. Produtos Padrão da Consulta de Abastecimento (Correspondência Exata à Imagem 2)
window.ConsultaProdutosBase = [
  {
    id: 1,
    ean: '7898938890113',
    nome: 'Energético Ultra Fiesta Mango Zero Açúcar Monster Lata 473ml',
    categoria: 'Bebidas Energéticas',
    marca: 'Monster Energy',
    foto: '../assets/images/products/monster-mango.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 6,
    estoqueCd: 24,
    sugestao: 4,
    aRepor: 4,
    selecionado: true
  },
  {
    id: 2,
    ean: '7898341430123',
    nome: 'Suco Uva Caixa 200ml',
    categoria: 'Sucos e Néctares',
    marca: 'Del Valle',
    foto: '../assets/images/products/suco-uva.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 6,
    estoqueCd: 18,
    sugestao: 4,
    aRepor: 4,
    selecionado: true
  },
  {
    id: 3,
    ean: '7894900701715',
    nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 1l',
    categoria: 'Refrigerantes',
    marca: 'Coca-Cola',
    foto: '../assets/images/products/coca-zero-1l.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 6,
    estoqueCd: 30,
    sugestao: 4,
    aRepor: 4,
    selecionado: true
  },
  {
    id: 4,
    ean: '7898770420011',
    nome: 'Energético Ultra Strawberry Dreams Zero Açúcar Monster Lata 473ml',
    categoria: 'Bebidas Energéticas',
    marca: 'Monster Energy',
    foto: '../assets/images/products/monster-strawberry.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 1,
    estoqueCd: 15,
    sugestao: 5,
    aRepor: 5,
    selecionado: true
  },
  {
    id: 5,
    ean: '1220000250222',
    nome: 'Energético Ultra Watermelon Zero Açúcar Monster Lata 473ml',
    categoria: 'Bebidas Energéticas',
    marca: 'Monster Energy',
    foto: '../assets/images/products/monster-watermelon.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 1,
    estoqueCd: 20,
    sugestao: 5,
    aRepor: 5,
    selecionado: true
  },
  {
    id: 6,
    ean: '7891991008785',
    nome: 'Refrigerante Zero Açúcar Guaraná Antarctica Garrafa 1,5l',
    categoria: 'Refrigerantes',
    marca: 'Ambev',
    foto: '../assets/images/products/guarana-zero.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 5,
    estoqueCd: 25,
    sugestao: 5,
    aRepor: 5,
    selecionado: true
  },
  {
    id: 7,
    ean: '7894900701609',
    nome: 'Refrigerante Zero Açúcar Coca-Cola Garrafa 600ml',
    categoria: 'Refrigerantes',
    marca: 'Coca-Cola',
    foto: '../assets/images/products/coca-zero-600ml.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 1,
    estoqueCd: 40,
    sugestao: 0,
    aRepor: 0,
    selecionado: true
  }
];

// 4. Catálogo Extra para Inserção Multicritério
window.CatalogoExtraProdutos = [
  {
    id: 101,
    ean: '7891000100103',
    nome: 'Salgadinho Doritos Queijo Nacho 140g',
    categoria: 'Snacks e Salgadinhos',
    marca: 'Elma Chips',
    foto: '../assets/images/products/doritos-snack.jpg',
    estoqueIdeal: 12,
    minimoCritico: 3,
    estoqueLoja: 2,
    estoqueCd: 45,
    sugestao: 10,
    aRepor: 10,
    selecionado: true
  },
  {
    id: 102,
    ean: '7891000245601',
    nome: 'Batata Frita Ruffles Original 76g',
    categoria: 'Snacks e Salgadinhos',
    marca: 'Elma Chips',
    foto: '../assets/images/products/ruffles-chips.jpg',
    estoqueIdeal: 10,
    minimoCritico: 2,
    estoqueLoja: 3,
    estoqueCd: 32,
    sugestao: 7,
    aRepor: 7,
    selecionado: true
  },
  {
    id: 103,
    ean: '7622210567890',
    nome: 'Chocolate Bis Wafer Ao Leite Caixa 126g',
    categoria: 'Doces e Chocolates',
    marca: 'Lacta / Mondelēz',
    foto: '../assets/images/products/bis-wafer.jpg',
    estoqueIdeal: 15,
    minimoCritico: 4,
    estoqueLoja: 1,
    estoqueCd: 50,
    sugestao: 14,
    aRepor: 14,
    selecionado: true
  }
];

// 5. Lista Base de Pedidos
const defaultPedidosData = [
  {
    id: 1,
    codigo: '000032',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 10,
    dataCriacao: '16/08/2026',
    status: 'Cancelado'
  },
  {
    id: 2,
    codigo: '000031',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 21,
    dataCriacao: '16/08/2026',
    status: 'Recebido'
  },
  {
    id: 3,
    codigo: '000030',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 1,
    dataCriacao: '15/08/2026',
    status: 'Recebido'
  },
  {
    id: 4,
    codigo: '000029',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 3,
    dataCriacao: '15/08/2026',
    status: 'Recebido'
  },
  {
    id: 5,
    codigo: '000028',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 0,
    dataCriacao: '15/08/2026',
    status: 'Cancelado'
  },
  {
    id: 6,
    codigo: '000027',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 2,
    dataCriacao: '15/08/2026',
    status: 'Cancelado'
  },
  {
    id: 7,
    codigo: '000025',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 5,
    dataCriacao: '15/08/2026',
    status: 'Recebido'
  },
  {
    id: 8,
    codigo: '000026',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 21,
    dataCriacao: '15/08/2026',
    status: 'Aberto'
  },
  {
    id: 9,
    codigo: '000024',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 21,
    dataCriacao: '15/08/2026',
    status: 'Recebido'
  },
  {
    id: 10,
    codigo: '000023',
    filial: 'Mini Mercado 01',
    planoBase: '',
    qtdeItens: 1,
    dataCriacao: '15/08/2026',
    status: 'Recebido'
  },
  {
    id: 11,
    codigo: '000017',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano teste',
    qtdeItens: 4,
    dataCriacao: '13/08/2026',
    status: 'Recebido'
  },
  {
    id: 12,
    codigo: '000016',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano Semanal Bebidas',
    qtdeItens: 18,
    dataCriacao: '12/08/2026',
    status: 'Recebido'
  },
  {
    id: 13,
    codigo: '000015',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 14,
    dataCriacao: '11/08/2026',
    status: 'Recebido'
  },
  {
    id: 14,
    codigo: '000014',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano Snacks & Mercearia',
    qtdeItens: 8,
    dataCriacao: '10/08/2026',
    status: 'Recebido'
  },
  {
    id: 15,
    codigo: '000013',
    filial: 'Mini Mercado 04 Empresarial Prime',
    planoBase: 'Plano Corporativo Express',
    qtdeItens: 25,
    dataCriacao: '09/08/2026',
    status: 'Recebido'
  },
  {
    id: 16,
    codigo: '000012',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano MiniMercado 02',
    qtdeItens: 12,
    dataCriacao: '08/08/2026',
    status: 'Cancelado'
  },
  {
    id: 17,
    codigo: '000011',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 30,
    dataCriacao: '07/08/2026',
    status: 'Recebido'
  },
  {
    id: 18,
    codigo: '000010',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano MiniMercado 01',
    qtdeItens: 6,
    dataCriacao: '06/08/2026',
    status: 'Recebido'
  },
  {
    id: 19,
    codigo: '000009',
    filial: 'Mini Mercado 04 Empresarial Prime',
    planoBase: 'Plano Energéticos & Cafés',
    qtdeItens: 15,
    dataCriacao: '05/08/2026',
    status: 'Recebido'
  },
  {
    id: 20,
    codigo: '000008',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 22,
    dataCriacao: '04/08/2026',
    status: 'Recebido'
  },
  {
    id: 21,
    codigo: '000007',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano MiniMercado 02',
    qtdeItens: 19,
    dataCriacao: '03/08/2026',
    status: 'Recebido'
  },
  {
    id: 22,
    codigo: '000006',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano Sorvetes & Congelados',
    qtdeItens: 11,
    dataCriacao: '02/08/2026',
    status: 'Recebido'
  },
  {
    id: 23,
    codigo: '000005',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 0,
    dataCriacao: '01/08/2026',
    status: 'Cancelado'
  },
  {
    id: 24,
    codigo: '000004',
    filial: 'Mini Mercado 04 Empresarial Prime',
    planoBase: 'Plano Corporativo Express',
    qtdeItens: 16,
    dataCriacao: '30/07/2026',
    status: 'Recebido'
  },
  {
    id: 25,
    codigo: '000003',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano MiniMercado 01',
    qtdeItens: 24,
    dataCriacao: '28/07/2026',
    status: 'Recebido'
  },
  {
    id: 26,
    codigo: '000002',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano MiniMercado 02',
    qtdeItens: 9,
    dataCriacao: '25/07/2026',
    status: 'Recebido'
  },
  {
    id: 27,
    codigo: '000001',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano Inicial Piloto',
    qtdeItens: 35,
    dataCriacao: '20/07/2026',
    status: 'Recebido'
  },
  {
    id: 28,
    codigo: '000033',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano Reposição Urgente',
    qtdeItens: 7,
    dataCriacao: '16/08/2026',
    status: 'Aberto'
  },
  {
    id: 29,
    codigo: '000034',
    filial: 'Mini Mercado 04 Empresarial Prime',
    planoBase: 'Plano MiniMercado 04',
    qtdeItens: 13,
    dataCriacao: '16/08/2026',
    status: 'Aberto'
  },
  {
    id: 30,
    codigo: '000035',
    filial: 'Mini Mercado 01',
    planoBase: 'Plano MiniMercado 01',
    qtdeItens: 18,
    dataCriacao: '16/08/2026',
    status: 'Aberto'
  },
  {
    id: 31,
    codigo: '000036',
    filial: 'Mini Mercado 03 Simples Nacional',
    planoBase: 'Plano MiniMercado 03',
    qtdeItens: 2,
    dataCriacao: '16/08/2026',
    status: 'Aberto'
  },
  {
    id: 32,
    codigo: '000037',
    filial: 'Mini Mercado 02 Condomínio Jardins',
    planoBase: 'Plano MiniMercado 02',
    qtdeItens: 14,
    dataCriacao: '16/08/2026',
    status: 'Aberto'
  }
];

// Carregar pedidos salvos no storage ou usar padrão
function getStoredPedidos() {
  try {
    const raw = localStorage.getItem('goflash_pedidos_list');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Erro ao ler storage de pedidos:', e);
  }
  return defaultPedidosData;
}

window.PedidosAbastecimentoData = getStoredPedidos();

window.salvarNovoPedidoNoStorage = function (novoPedido) {
  const lista = window.PedidosAbastecimentoData || [];
  lista.unshift(novoPedido);
  window.PedidosAbastecimentoData = lista;
  try {
    localStorage.setItem('goflash_pedidos_list', JSON.stringify(lista));
  } catch (e) {
    console.error('Erro ao salvar storage:', e);
  }
  return lista;
};
