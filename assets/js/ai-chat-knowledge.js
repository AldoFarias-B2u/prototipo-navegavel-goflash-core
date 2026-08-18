/**
 * GOFLASH CORE - BASE DE CONHECIMENTO & MOTOR CONVERSACIONAL (GOFLASH AI)
 * Respostas simuladas, sugestões dinâmicas de perguntas e mapeamento de intenções.
 */

window.GoFlashAIKnowledge = {
  // Sugestões Iniciais do Chat
  initialSuggestions: [
    {
      id: 'abastecimento_como_fazer',
      icon: 'local_shipping',
      label: 'Como fazer um Pedido de Abastecimento?',
      category: 'Abastecimento',
      query: 'Como fazer um pedido de abastecimento para uma loja autônoma?'
    },
    {
      id: 'estoque_critico',
      icon: 'warning',
      label: 'Quais produtos estão com estoque crítico?',
      category: 'Estoque',
      query: 'Quais produtos estão com estoque crítico no Mini Mercado 03?'
    },
    {
      id: 'diferenca_estoque',
      icon: 'help_outline',
      label: 'Qual a diferença entre Estoque Ideal e Mínimo?',
      category: 'Conceitos ERP',
      query: 'Qual a diferença entre estoque ideal e estoque crítico?'
    },
    {
      id: 'ir_para_pedidos',
      icon: 'arrow_forward',
      label: 'Me leve para a tela de Pedidos de Abastecimento',
      category: 'Navegação',
      query: 'Abrir tela de pedidos de abastecimento'
    }
  ],

  // Base de Intenções e Respostas Inteligentes
  intents: [
    {
      keywords: ['fazer pedido', 'novo pedido', 'criar pedido', 'abastecer loja', 'como abastecer', 'como fazer um pedido'],
      title: 'Criação de Pedidos de Abastecimento',
      reply: `
        <p>No <strong>Goflash CORE</strong>, você pode criar pedidos de reposição de forma dinâmica e automatizada:</p>
        <ol>
          <li>Acesse o <strong>Módulo de Operação</strong> &rsaquo; <strong>Pedidos de Abastecimento</strong>;</li>
          <li>Clique no botão flutuante <strong>"+" (Novo Pedido)</strong>;</li>
          <li>Escolha <strong>"Fazer Consulta para Abastecer"</strong> (Recomendado);</li>
          <li>Selecione o <strong>CD de Origem</strong>, a <strong>Filial Destino</strong> e o <strong>Plano Base</strong>;</li>
          <li>Ajuste as quantidades usando os botões <strong>+ / &minus;</strong> ou bipe o código de barras, e clique em <strong>"GERAR PEDIDO"</strong>.</li>
        </ol>
      `,
      actions: [
        { label: 'Ir para Pedidos de Abastecimento', url: './pedidos-abastecimento.html', icon: 'assignment' },
        { label: 'Ir para Consulta de Abastecimento', url: './consulta-abastecimento.html?origem=Estoque+central&destino=Mini+Mercado+03+Simples+Nacional&plano=Plano+MiniMercado+03&filtro=completo', icon: 'manage_search' }
      ]
    },
    {
      keywords: ['estoque critico', 'crítico', 'ruptura', 'baixo estoque', 'zerado', 'acabando'],
      title: 'Produtos em Nível Crítico',
      reply: `
        <p>Identifiquei os seguintes produtos em <strong>nível crítico de estoque</strong> na rede:</p>
        <ul>
          <li>🚨 <strong>Refrigerante Zero Açúcar Coca-Cola Garrafa 1l</strong> &bull; Loja: 6 un | Crítico: 2 un</li>
          <li>🚨 <strong>Energético Ultra Watermelon Monster Lata 473ml</strong> &bull; Loja: 5 un | Crítico: 2 un</li>
          <li>🚨 <strong>Energético Ultra Strawberry Monster Lata 473ml</strong> &bull; Loja: 5 un | Crítico: 2 un</li>
        </ul>
        <p>💡 <em>Recomendação: Gere um pedido de reposição pelo Plano da filial para evitar ruptura de vendas no corredor.</em></p>
      `,
      actions: [
        { label: 'Abrir Consulta de Reposição (Mini Mercado 03)', url: './consulta-abastecimento.html?origem=Estoque+central&destino=Mini+Mercado+03+Simples+Nacional&plano=Plano+MiniMercado+03&filtro=saldo_critico', icon: 'manage_search' }
      ]
    },
    {
      keywords: ['estoque ideal', 'minimo critico', 'diferença', 'conceito', 'o que é'],
      title: 'Conceitos de Gestão de Estoque',
      reply: `
        <p>Aqui está o modelo de cálculo adotado no <strong>Goflash CORE</strong>:</p>
        <ul>
          <li><strong>Estoque Ideal (Verde)</strong>: Quantidade máxima recomendada na gôndola/geladeira da loja para atender a demanda entre ciclos de reposição.</li>
          <li><strong>Mínimo Crítico (Laranja/Vermelho)</strong>: Quantidade de segurança abaixo da qual há risco eminente de ruptura da gôndola.</li>
          <li><strong>Sugestão de Reposição</strong>: <code>Sugestão = Estoque Ideal &minus; Estoque Atual da Loja</code>.</li>
        </ul>
      `,
      actions: [
        { label: 'Ver Planos de Abastecimento', url: './planos-abastecimento.html', icon: 'format_list_bulleted' }
      ]
    },
    {
      keywords: ['plano de abastecimento', 'planos', 'plano', 'configurar plano', 'editar plano'],
      title: 'Planos de Abastecimento',
      reply: `
        <p>Os <strong>Planos de Abastecimento</strong> definem a grade padrão de produtos de cada loja autônoma ou franquia, com seus respectivos estoques ideais e mínimos.</p>
        <p>Você pode criar novos planos, duplicar planos existentes ou editar estoques em lote com os <em>Steppers</em>.</p>
      `,
      actions: [
        { label: 'Acessar Planos de Abastecimento', url: './planos-abastecimento.html', icon: 'tune' }
      ]
    },
    {
      keywords: ['operacao', 'modulo operacao', 'operacional'],
      title: 'Módulo de Operação',
      reply: `
        <p>O <strong>Módulo de Operação</strong> centraliza as rotinas operacionais do ERP:</p>
        <ul>
          <li><strong>Operação Loja Autônoma</strong>: Planos e Pedidos de Abastecimento;</li>
          <li><strong>Varejo & Produtos</strong>: Cadastro de itens, tabelas de preços e estoque;</li>
          <li><strong>Relatórios e Integrações</strong>: Vendas em tempo real e conciliação.</li>
        </ul>
      `,
      actions: [
        { label: 'Abrir Módulo de Operação', url: './operacao.html', icon: 'local_shipping' }
      ]
    },
    {
      keywords: ['gerencial', 'financeiro', 'dashboard', 'relatorios'],
      title: 'Módulos Gerencial & Financeiro',
      reply: `
        <p>Os módulos <strong>Gerencial</strong> e <strong>Financeiro</strong> fornecem indicadores estratégicos de faturamento, margem de contribuição, DRE e fluxo de caixa.</p>
        <p>Em breve estes módulos estarão disponíveis para navegação interativa completa no protótipo!</p>
      `,
      actions: [
        { label: 'Voltar para a Home', url: './dashboard.html', icon: 'dashboard' }
      ]
    },
    {
      keywords: ['pedidos de abastecimento', 'tela de pedidos', 'ver pedidos', 'abrir pedidos'],
      title: 'Pedidos de Abastecimento',
      reply: `
        <p>Você pode visualizar todos os pedidos de abastecimento criados, seus status (<em>Aberto</em>, <em>Recebido</em>, <em>Cancelado</em>) e gerar novos pedidos a qualquer momento.</p>
      `,
      actions: [
        { label: 'Ir para Pedidos de Abastecimento', url: './pedidos-abastecimento.html', icon: 'assignment' }
      ]
    }
  ],

  /**
   * Processa a pergunta do usuário e localiza a melhor resposta
   */
  findAnswer: function(query) {
    const cleanQuery = (query || '').toLowerCase().trim();
    if (!cleanQuery) return null;

    // Procura por correspondência de palavras-chave
    for (const intent of this.intents) {
      for (const kw of intent.keywords) {
        if (cleanQuery.includes(kw) || kw.includes(cleanQuery)) {
          return intent;
        }
      }
    }

    // Resposta padrão caso não haja correspondência exata
    return {
      title: 'Assistente GoFlash AI',
      reply: `
        <p>Entendi sua dúvida sobre <em>"${query}"</em>!</p>
        <p>Como assistente inteligente do <strong>GoMarket / Goflash CORE</strong>, posso ajudar você a:</p>
        <ul>
          <li>Gerar e gerenciar <strong>Pedidos de Abastecimento</strong>;</li>
          <li>Consultar <strong>Estoque Crítico</strong> e sugestões de reposição;</li>
          <li>Configurar <strong>Planos de Abastecimento</strong> de lojas autônomas;</li>
          <li>Navegar rapidamente entre os módulos do ERP.</li>
        </ul>
        <p>Experimente clicar em uma das sugestões abaixo ou refine sua pesquisa!</p>
      `,
      actions: [
        { label: 'Pedidos de Abastecimento', url: './pedidos-abastecimento.html', icon: 'assignment' },
        { label: 'Módulo de Operação', url: './operacao.html', icon: 'local_shipping' }
      ]
    };
  }
};
