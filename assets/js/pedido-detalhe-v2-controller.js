/**
 * GOFLASH CORE - CONTROLADOR DA TELA DE DETALHES / ITENS DO PEDIDO (V2 REDESIGN)
 * Gerencia a alternância entre Modo de Visualização e Modo de Edição via FAB de lápis,
 * steppers de quantidade, controle estrito de validades/lotes, catálogo e cálculo em tempo real.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Estado da Aplicação
  const rawCatalog = window.CatalogoCompletoProdutos || window.ConsultaProdutosBase || [];
  let cartItems = [];
  let currentEditingItemForLotes = null;
  let temporaryLotes = [];
  let currentSelectedStatus = 'Pendente de Abastecimento';
  
  let isReadOnly = false;      // True para pedidos faturados/cancelados/em trânsito
  let isEditMode = false;      // True quando o usuário clicou para editar um pedido Aberto
  let currentLoadedOrder = null;
  let currentOrderCode = '000042';

  // Novos Estados: Visualização, Colunas Visíveis e Tabela de Preço
  let isCardsView = window.innerWidth <= 768; // Mobile inicia Cards, Desktop inicia Tabela
  let activePriceTable = 'NONE'; // 'NONE' (Sem Preços - Padrão), 'CUSTO', 'VENDA'
  let visibleColumns = {
    estoqueLoja: true,
    estoqueOrigem: false,
    estoqueIdeal: false,
    minimoCritico: false,
    sugestao: false,
    precos: false
  };

  // 2. Elementos Principais do DOM
  const mainContainer = document.getElementById('pedidoContainer');
  const heroDestinoSelect = document.getElementById('heroDestinoSelect');
  const heroOrigemSelect = document.getElementById('heroOrigemSelect');
  const heroOrderCodeTxt = document.getElementById('heroOrderCodeTxt');
  const heroStatusBadge = document.getElementById('heroStatusBadge');
  const heroProductsCount = document.getElementById('heroProductsCount');

  // Abas
  const tabBtnProdutos = document.getElementById('tabBtnProdutos');
  const tabBtnDetalhes = document.getElementById('tabBtnDetalhes');
  const paneProdutos = document.getElementById('paneProdutos');
  const paneDetalhes = document.getElementById('paneDetalhes');

  // FAB e Pílula de Modo
  const fabEditOrder = document.getElementById('fabEditOrder');
  const fabEditIcon = document.getElementById('fabEditIcon');
  const orderModePill = document.getElementById('orderModePill');
  const btnHeaderSave = document.getElementById('btnHeaderSave');

  // Ações de Produtos & Ferramentas de Inserção
  const orderInsertionToolbar = document.getElementById('orderInsertionToolbar');
  const sectionProductsCount = document.getElementById('sectionProductsCount');
  const btnOpenCatalogModal = document.getElementById('btnOpenCatalogModal');
  const orderOmnibarBox = document.getElementById('orderOmnibarBox');
  const omnibarInput = document.getElementById('omnibarInput');
  const omnibarDropdown = document.getElementById('omnibarDropdown');

  // Alternador Segmentado (Tabela vs. Cards) e Mais Ações
  const btnViewTable = document.getElementById('btnViewTable');
  const btnViewCards = document.getElementById('btnViewCards');

  const moreActionsWrapper = document.getElementById('moreActionsWrapper');
  const btnMoreActions = document.getElementById('btnMoreActions');
  const moreActionsDropdown = document.getElementById('moreActionsDropdown');
  const actionBatchQty = document.getElementById('actionBatchQty');
  const actionManageCols = document.getElementById('actionManageCols');
  const actionPriceTable = document.getElementById('actionPriceTable');
  const actionClearAll = document.getElementById('actionClearAll');
  const currentPriceTableLabel = document.getElementById('currentPriceTableLabel');

  // Tabela e Cards
  const tbody = document.getElementById('orderTableBody');
  const cardsGrid = document.getElementById('orderCardsGrid');
  const emptyState = document.getElementById('orderEmptyState');
  const tableWrapper = document.getElementById('orderTableWrapper');

  // Sticky Footer
  const footerSkusCount = document.getElementById('footerSkusCount');
  const footerUnitsCount = document.getElementById('footerUnitsCount');
  const footerTotalValue = document.getElementById('footerTotalValue');
  const footerMetricValorBox = document.getElementById('footerMetricValorBox');
  const footerPriceTableBadge = document.getElementById('footerPriceTableBadge');
  const btnFooterCancelEdit = document.getElementById('btnFooterCancelEdit');
  const btnFooterDraft = document.getElementById('btnFooterDraft');
  const btnFooterConfirm = document.getElementById('btnFooterConfirm');
  const btnFooterConfirmTxt = document.getElementById('btnFooterConfirmTxt');
  const btnFooterBackToList = document.getElementById('btnFooterBackToList');

  // Modais
  const modalCatalog = document.getElementById('modalCatalog');
  const btnCloseCatalogModal = document.getElementById('btnCloseCatalogModal');
  const btnCloseCatalogBtn = document.getElementById('btnCloseCatalogBtn');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catalogModalGrid = document.getElementById('catalogModalGrid');
  const catalogCategoryChips = document.querySelectorAll('.catalog-cat-chip');

  const modalConfirmClearAll = document.getElementById('modalConfirmClearAll');
  const btnCloseClearAllModal = document.getElementById('btnCloseClearAllModal');
  const btnCancelClearAll = document.getElementById('btnCancelClearAll');
  const btnConfirmClearAll = document.getElementById('btnConfirmClearAll');
  const clearAllModalDesc = document.getElementById('clearAllModalDesc');

  // Modal 5: Quantidade em Lote
  const modalBatchQuantity = document.getElementById('modalBatchQuantity');
  const btnCloseBatchQtyModal = document.getElementById('btnCloseBatchQtyModal');
  const btnCancelBatchQty = document.getElementById('btnCancelBatchQty');
  const btnApplyBatchQty = document.getElementById('btnApplyBatchQty');
  const inputBatchQtyValue = document.getElementById('inputBatchQtyValue');
  const quickQtyBtns = document.querySelectorAll('.btn-quick-qty');

  // Modal 6: Colunas Visíveis
  const modalManageColumns = document.getElementById('modalManageColumns');
  const btnCloseManageColsModal = document.getElementById('btnCloseManageColsModal');
  const btnCancelManageCols = document.getElementById('btnCancelManageCols');
  const btnApplyManageCols = document.getElementById('btnApplyManageCols');
  const chkColEstoqueLoja = document.getElementById('chkColEstoqueLoja');
  const chkColEstoqueOrigem = document.getElementById('chkColEstoqueOrigem');
  const chkColEstoqueIdeal = document.getElementById('chkColEstoqueIdeal');
  const chkColMinCritico = document.getElementById('chkColMinCritico');
  const chkColSugestao = document.getElementById('chkColSugestao');
  const chkColPrecos = document.getElementById('chkColPrecos');

  // Modal 7: Tabela de Preços
  const modalPriceTable = document.getElementById('modalPriceTable');
  const btnClosePriceTableModal = document.getElementById('btnClosePriceTableModal');
  const btnCancelPriceTable = document.getElementById('btnCancelPriceTable');
  const btnApplyPriceTable = document.getElementById('btnApplyPriceTable');
  const priceOptionCards = document.querySelectorAll('.price-option-card');

  const modalGerenciarLotes = document.getElementById('modalGerenciarLotes');
  const btnCloseLotesModal = document.getElementById('btnCloseLotesModal');
  const btnCancelLotes = document.getElementById('btnCancelLotes');
  const btnSaveLotes = document.getElementById('btnSaveLotes');
  const btnModalAddLote = document.getElementById('btnModalAddLote');
  const btnTableAddLote = document.getElementById('btnTableAddLote');
  const lotesTableBody = document.getElementById('lotesTableBody');
  const lotesCounterText = document.getElementById('lotesCounterText');
  const lotesAllocationBadge = document.getElementById('lotesAllocationBadge');
  const lotesBarFill = document.getElementById('lotesBarFill');

  const modalConcluirPedido = document.getElementById('modalConcluirPedido');
  const btnCloseConcluirModal = document.getElementById('btnCloseConcluirModal');
  const btnCancelConcluir = document.getElementById('btnCancelConcluir');
  const btnSubmitFinalizarPedido = document.getElementById('btnSubmitFinalizarPedido');
  const modalConcluirCod = document.getElementById('modalConcluirCod');
  const modalConcluirQtde = document.getElementById('modalConcluirQtde');
  const modalConcluirDestino = document.getElementById('modalConcluirDestino');

  // 3. Leitura dos Parâmetros da URL e Inicialização do Estado
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  const paramCodigo = urlParams.get('codigo') || urlParams.get('cod');
  const paramDestino = urlParams.get('destino') || 'Mini Mercado 03 Simples Nacional';
  const paramOrigem = urlParams.get('origem') || '';
  const paramMode = urlParams.get('mode'); // 'edit' ou 'view'

  if (paramId || paramCodigo) {
    if (typeof window.getPedidoByIdOrCode === 'function') {
      currentLoadedOrder = window.getPedidoByIdOrCode(paramId, paramCodigo);
    }
  }

  if (currentLoadedOrder) {
    // Pedido Existente
    currentOrderCode = currentLoadedOrder.codigo || '000042';
    const statusLower = (currentLoadedOrder.status || 'Aberto').toLowerCase();
    
    isReadOnly = (statusLower !== 'aberto');
    
    // Por padrão, se estiver em aberto, inicia em MODO DE VISUALIZAÇÃO a menos que mode=edit
    isEditMode = (!isReadOnly && paramMode === 'edit');

    if (heroDestinoSelect && currentLoadedOrder.filial) {
      setSelectValue(heroDestinoSelect, currentLoadedOrder.filial);
    }
    if (heroOrigemSelect && currentLoadedOrder.filialOrigem) {
      setSelectValue(heroOrigemSelect, currentLoadedOrder.filialOrigem);
    }

    cartItems = currentLoadedOrder.itens ? JSON.parse(JSON.stringify(currentLoadedOrder.itens)) : [];

    // Detalhes
    const inputResp = document.getElementById('inputResponsavel');
    const txtObs = document.getElementById('textareaObservacoes');
    if (inputResp && currentLoadedOrder.responsavel) inputResp.value = currentLoadedOrder.responsavel;
    if (txtObs && currentLoadedOrder.observacoes) txtObs.value = currentLoadedOrder.observacoes;

  } else {
    // Novo Pedido em Elaboração
    isReadOnly = false;
    isEditMode = true; // Novo pedido começa em edição direta

    const existingOrders = window.PedidosAbastecimentoData || [];
    const nextNum = existingOrders.length + 8;
    currentOrderCode = String(nextNum).padStart(6, '0');

    if (heroDestinoSelect && paramDestino) setSelectValue(heroDestinoSelect, paramDestino);
    if (heroOrigemSelect && paramOrigem) setSelectValue(heroOrigemSelect, paramOrigem);

    // Carrega itens de demonstração se for o código 000042 ou se não houver itens
    if (rawCatalog.length > 0) {
      const demoItems = rawCatalog.slice(0, 5).map((p, idx) => ({
        id: p.id || (Date.now() + idx),
        nome: p.nome,
        ean: p.ean,
        foto: p.foto,
        categoria: p.categoria || p.grupo || 'Geral',
        estoqueLoja: p.estoqueLoja !== undefined ? p.estoqueLoja : 6,
        preco: p.precoVenda || p.preco || 6.90,
        quantidade: (idx % 2 === 0) ? 2 : 1,
        lotes: []
      }));
      cartItems = demoItems;
    }
  }

  // Verificação inteligente de colunas iniciais baseada em Origem e Plano
  const hasOrigem = (heroOrigemSelect && heroOrigemSelect.value !== 'DIRETA' && heroOrigemSelect.value !== '');
  if (hasOrigem) {
    visibleColumns.estoqueOrigem = true;
  }
  const inputDetalhesPlano = document.getElementById('inputDetalhesPlano');
  const hasPlano = (inputDetalhesPlano && inputDetalhesPlano.value && inputDetalhesPlano.value.trim() !== '' && inputDetalhesPlano.value !== '--');
  if (hasPlano) {
    visibleColumns.estoqueIdeal = true;
    visibleColumns.minimoCritico = true;
    visibleColumns.sugestao = true;
  }

  // Sincronizar checkboxes do modal de colunas
  if (chkColEstoqueLoja) chkColEstoqueLoja.checked = visibleColumns.estoqueLoja;
  if (chkColEstoqueOrigem) chkColEstoqueOrigem.checked = visibleColumns.estoqueOrigem;
  if (chkColEstoqueIdeal) chkColEstoqueIdeal.checked = visibleColumns.estoqueIdeal;
  if (chkColMinCritico) chkColMinCritico.checked = visibleColumns.minimoCritico;
  if (chkColSugestao) chkColSugestao.checked = visibleColumns.sugestao;
  if (chkColPrecos) chkColPrecos.checked = visibleColumns.precos;

  if (heroOrderCodeTxt) heroOrderCodeTxt.textContent = currentOrderCode;

  function setSelectValue(selectEl, value) {
    if (!selectEl) return;
    let exists = false;
    for (let opt of selectEl.options) {
      if (opt.value === value) {
        opt.selected = true;
        exists = true;
        break;
      }
    }
    if (!exists) {
      const newOpt = new Option(value, value, true, true);
      selectEl.add(newOpt);
    }
  }

  // 4. Aplicação do Modo de Visualização vs. Modo de Edição na UI
  function applyModeUI() {
    const statusName = currentLoadedOrder ? (currentLoadedOrder.status || 'Aberto') : 'Aberto';
    const statusLower = statusName.toLowerCase();

    // 4.1 Badge de Status do Header
    if (heroStatusBadge) {
      let badgeClass = 'status-aberto';
      if (statusLower.includes('cancelado')) badgeClass = 'status-cancelado';
      else if (statusLower.includes('recebido')) badgeClass = 'status-recebido';
      else if (statusLower.includes('pendente') || statusLower.includes('trânsito') || statusLower.includes('transito')) badgeClass = 'status-pendente';

      heroStatusBadge.className = `order-status-badge ${badgeClass}`;
      heroStatusBadge.textContent = statusName;
    }

    // 4.2 Pedido Bloqueado (Read-Only Permanente)
    if (isReadOnly) {
      if (fabEditOrder) fabEditOrder.style.display = 'none';
      if (orderInsertionToolbar) orderInsertionToolbar.style.display = 'none';
      if (btnOpenCatalogModal) btnOpenCatalogModal.style.display = 'none';
      if (orderOmnibarBox) orderOmnibarBox.style.display = 'none';
      
      if (heroDestinoSelect) heroDestinoSelect.disabled = true;
      if (heroOrigemSelect) heroOrigemSelect.disabled = true;

      const inputResp = document.getElementById('inputResponsavel');
      const inputPrev = document.getElementById('inputPrevisao');
      const txtObs = document.getElementById('textareaObservacoes');
      if (inputResp) inputResp.disabled = true;
      if (inputPrev) inputPrev.disabled = true;
      if (txtObs) txtObs.disabled = true;

      if (orderModePill) {
        orderModePill.className = 'order-mode-pill pill-view';
        orderModePill.innerHTML = '<span class="material-icons" style="font-size: 13px;">lock</span> Somente Leitura';
      }

      if (btnFooterCancelEdit) btnFooterCancelEdit.style.display = 'none';
      if (btnFooterDraft) btnFooterDraft.style.display = 'none';
      if (btnFooterConfirm) btnFooterConfirm.style.display = 'none';
      if (btnFooterBackToList) btnFooterBackToList.style.display = 'inline-flex';

      renderProducts();
      return;
    }

    // 4.3 Pedido em Aberto: Alternância Visualização vs. Edição
    if (isEditMode) {
      // MODO DE EDIÇÃO ATIVO
      if (fabEditOrder) {
        fabEditOrder.style.display = 'flex';
        fabEditOrder.classList.add('is-editing');
        fabEditOrder.title = 'Concluir Edição';
        if (fabEditIcon) fabEditIcon.textContent = 'check';
      }

      if (orderInsertionToolbar) orderInsertionToolbar.style.display = 'flex';
      if (btnOpenCatalogModal) btnOpenCatalogModal.style.display = 'inline-flex';
      if (orderOmnibarBox) orderOmnibarBox.style.display = 'flex';
      
      if (heroDestinoSelect) heroDestinoSelect.disabled = false;
      if (heroOrigemSelect) heroOrigemSelect.disabled = false;

      const inputResp = document.getElementById('inputResponsavel');
      const inputPrev = document.getElementById('inputPrevisao');
      const txtObs = document.getElementById('textareaObservacoes');
      if (inputResp) inputResp.disabled = false;
      if (inputPrev) inputPrev.disabled = false;
      if (txtObs) txtObs.disabled = false;

      if (orderModePill) {
        orderModePill.className = 'order-mode-pill pill-edit';
        orderModePill.innerHTML = '<span class="material-icons" style="font-size: 13px;">edit</span> Modo de Edição';
      }

      if (btnFooterCancelEdit) btnFooterCancelEdit.style.display = 'inline-flex';
      if (btnFooterDraft) btnFooterDraft.style.display = 'inline-flex';
      if (btnFooterConfirm) {
        btnFooterConfirm.style.display = 'inline-flex';
        if (btnFooterConfirmTxt) btnFooterConfirmTxt.textContent = 'CONFIRMAR';
      }
      if (btnFooterBackToList) btnFooterBackToList.style.display = 'none';

    } else {
      // MODO DE VISUALIZAÇÃO ATIVO (Pedido Aberto)
      if (fabEditOrder) {
        fabEditOrder.style.display = 'flex';
        fabEditOrder.classList.remove('is-editing');
        fabEditOrder.title = 'Editar Pedido';
        if (fabEditIcon) fabEditIcon.textContent = 'edit';
      }

      if (orderInsertionToolbar) orderInsertionToolbar.style.display = 'none';
      if (btnOpenCatalogModal) btnOpenCatalogModal.style.display = 'none';
      if (orderOmnibarBox) orderOmnibarBox.style.display = 'none';

      if (heroDestinoSelect) heroDestinoSelect.disabled = true;
      if (heroOrigemSelect) heroOrigemSelect.disabled = true;

      const inputResp = document.getElementById('inputResponsavel');
      const inputPrev = document.getElementById('inputPrevisao');
      const txtObs = document.getElementById('textareaObservacoes');
      if (inputResp) inputResp.disabled = true;
      if (inputPrev) inputPrev.disabled = true;
      if (txtObs) txtObs.disabled = true;

      if (orderModePill) {
        orderModePill.className = 'order-mode-pill pill-view';
        orderModePill.innerHTML = '<span class="material-icons" style="font-size: 13px;">visibility</span> Visualização';
      }

      if (btnFooterCancelEdit) btnFooterCancelEdit.style.display = 'none';
      if (btnFooterDraft) btnFooterDraft.style.display = 'none';
      if (btnFooterConfirm) {
        btnFooterConfirm.style.display = 'inline-flex';
        if (btnFooterConfirmTxt) btnFooterConfirmTxt.textContent = 'FINALIZAR PEDIDO';
      }
      if (btnFooterBackToList) btnFooterBackToList.style.display = 'inline-flex';
    }

    renderProducts();
  }

  // 5. FAB de Lápis / Conclusão de Edição
  if (fabEditOrder) {
    fabEditOrder.addEventListener('click', () => {
      if (isReadOnly) return;
      isEditMode = !isEditMode;
      applyModeUI();
      if (typeof Toast !== 'undefined') {
        Toast.info(isEditMode ? 'Modo de Edição ativado.' : 'Modo de Visualização ativado.');
      }
    });
  }

  // 6. Controle de Abas (Produtos vs. Detalhes)
  function switchTab(tabName) {
    if (tabName === 'produtos') {
      if (tabBtnProdutos) tabBtnProdutos.classList.add('active');
      if (tabBtnDetalhes) tabBtnDetalhes.classList.remove('active');
      if (paneProdutos) paneProdutos.style.display = 'block';
      if (paneDetalhes) paneDetalhes.style.display = 'none';
    } else {
      if (tabBtnProdutos) tabBtnProdutos.classList.remove('active');
      if (tabBtnDetalhes) tabBtnDetalhes.classList.add('active');
      if (paneProdutos) paneProdutos.style.display = 'none';
      if (paneDetalhes) paneDetalhes.style.display = 'block';
    }
  }

  if (tabBtnProdutos) tabBtnProdutos.addEventListener('click', () => switchTab('produtos'));
  if (tabBtnDetalhes) tabBtnDetalhes.addEventListener('click', () => switchTab('detalhes'));

  // 7. Sincronização de Visibilidade de Colunas na Tabela
  function syncTableColumnsHeader() {
    const thLoja = document.querySelector('.col-estoque-loja');
    const thOrigem = document.querySelector('.col-estoque-origem');
    const thIdeal = document.querySelector('.col-estoque-ideal');
    const thCritico = document.querySelector('.col-min-critico');
    const thSugestao = document.querySelector('.col-sugestao');
    const thPreco = document.querySelector('.col-preco-un');
    const thSubtotal = document.querySelector('.col-subtotal');
    const thAcoes = document.querySelector('.col-actions-header');

    if (thLoja) thLoja.style.display = visibleColumns.estoqueLoja ? 'table-cell' : 'none';
    if (thOrigem) thOrigem.style.display = visibleColumns.estoqueOrigem ? 'table-cell' : 'none';
    if (thIdeal) thIdeal.style.display = visibleColumns.estoqueIdeal ? 'table-cell' : 'none';
    if (thCritico) thCritico.style.display = visibleColumns.minimoCritico ? 'table-cell' : 'none';
    if (thSugestao) thSugestao.style.display = visibleColumns.sugestao ? 'table-cell' : 'none';
    if (thPreco) thPreco.style.display = visibleColumns.precos ? 'table-cell' : 'none';
    if (thSubtotal) thSubtotal.style.display = visibleColumns.precos ? 'table-cell' : 'none';
    if (thAcoes) thAcoes.style.display = (isEditMode && !isReadOnly) ? 'table-cell' : 'none';
  }

  // 8. Alternador Segmentado de Visualização (Tabela vs. Cards)
  function applyViewMode() {
    if (isCardsView) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (cardsGrid) {
        cardsGrid.style.display = 'grid';
        cardsGrid.classList.add('desktop-grid-mode');
      }
      if (btnViewTable) btnViewTable.classList.remove('active');
      if (btnViewCards) btnViewCards.classList.add('active');
    } else {
      if (tableWrapper) tableWrapper.style.display = 'block';
      if (cardsGrid) {
        cardsGrid.style.display = 'none';
        cardsGrid.classList.remove('desktop-grid-mode');
      }
      if (btnViewTable) btnViewTable.classList.add('active');
      if (btnViewCards) btnViewCards.classList.remove('active');
    }
  }

  if (btnViewTable) {
    btnViewTable.addEventListener('click', () => {
      isCardsView = false;
      applyViewMode();
      if (typeof Toast !== 'undefined') Toast.info('Visualização em Tabela ativada.');
    });
  }

  if (btnViewCards) {
    btnViewCards.addEventListener('click', () => {
      isCardsView = true;
      applyViewMode();
      if (typeof Toast !== 'undefined') Toast.info('Visualização em Cards ativada.');
    });
  }

  // 9. Renderização da Lista de Produtos (Tabela e Cards)
  function renderProducts() {
    if (heroProductsCount) heroProductsCount.textContent = cartItems.length;
    if (sectionProductsCount) sectionProductsCount.textContent = `(${cartItems.length})`;

    syncTableColumnsHeader();

    if (cartItems.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (cardsGrid) cardsGrid.innerHTML = '';
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      if (mainContainer) mainContainer.classList.add('is-empty-cart');
      updateTotals();
      return;
    }

    if (mainContainer) mainContainer.classList.remove('is-empty-cart');
    if (emptyState) emptyState.style.display = 'none';
    
    // Atualiza cabeçalho dinâmico de Ideal / Mínimo
    const thColIdealMin = document.getElementById('thColIdealMin');
    if (thColIdealMin) {
      if (visibleColumns.estoqueIdeal && visibleColumns.minimoCritico) {
        thColIdealMin.style.display = '';
        thColIdealMin.textContent = 'Ideal / Mínimo';
      } else if (visibleColumns.estoqueIdeal) {
        thColIdealMin.style.display = '';
        thColIdealMin.textContent = 'Ideal';
      } else if (visibleColumns.minimoCritico) {
        thColIdealMin.style.display = '';
        thColIdealMin.textContent = 'Mín. Crítico';
      } else {
        thColIdealMin.style.display = 'none';
      }
    }

    applyViewMode();

    // 9.1 Render Tabela Desktop
    if (tbody) {
      tbody.innerHTML = cartItems.map((item, index) => {
        const itemPreco = Number(item.preco) || 0;
        const itemQtde = Number(item.quantidade) || 0;
        const subtotal = itemPreco * itemQtde;
        const lotesCount = item.lotes ? item.lotes.length : 0;
        const totalLotesQty = item.lotes ? item.lotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0) : 0;
        const isStockLow = (item.estoqueLoja !== undefined && item.estoqueLoja <= 2);

        const estoqueIdealVal = item.estoqueIdeal !== undefined ? item.estoqueIdeal : 12;
        const estoqueLojaVal = item.estoqueLoja !== undefined ? item.estoqueLoja : 0;
        const estoqueOrigemVal = item.estoqueOrigem !== undefined ? item.estoqueOrigem : 48;
        const minCriticoVal = item.minimoCritico !== undefined ? item.minimoCritico : 3;
        const sugestaoVal = Math.max(0, estoqueIdealVal - estoqueLojaVal);

        const isIdealVisible = !!visibleColumns.estoqueIdeal;
        const isMinVisible = !!visibleColumns.minimoCritico;
        const showIdealMinCol = isIdealVisible || isMinVisible;

        let idealMinHtml = '';
        if (isIdealVisible && isMinVisible) {
          idealMinHtml = `
            <div class="tbl-ideal-cell">
              <span class="tbl-ideal-val">${estoqueIdealVal} un</span>
              <span class="tbl-min-hint">Mín: ${minCriticoVal} un</span>
            </div>
          `;
        } else if (isIdealVisible) {
          idealMinHtml = `<span class="tbl-ideal-val">${estoqueIdealVal} un</span>`;
        } else if (isMinVisible) {
          idealMinHtml = `<span class="tbl-min-hint">Mín: ${minCriticoVal} un</span>`;
        }

        const stockLojaHtml = isStockLow 
          ? `<span class="tbl-stock-low-badge" title="Estoque baixo (crítico)">${estoqueLojaVal} un</span>`
          : `<span class="tbl-stock-val">${estoqueLojaVal} un</span>`;

        let lotesBadgeHtml = '';
        if (lotesCount === 0) {
          lotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-empty" data-index="${index}" title="Informar validade e lotes">
              <span class="material-icons">event</span>
              Informar Validade
            </button>
          `;
        } else if (totalLotesQty === itemQtde) {
          const loteText = lotesCount === 1 ? '1 lote' : `${lotesCount} lotes`;
          lotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-ok" data-index="${index}" title="Validade OK: ${totalLotesQty}/${itemQtde} un alocadas em ${loteText}">
              <span class="material-icons">verified</span>
              Validade OK (${loteText})
            </button>
          `;
        } else {
          lotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-divergent" data-index="${index}" title="Divergente: ${totalLotesQty} un nos lotes vs ${itemQtde} un no pedido">
              <span class="material-icons">warning_amber</span>
              Divergente (${totalLotesQty}/${itemQtde} un)
            </button>
          `;
        }

        let qtyCellHtml = '';
        if (isEditMode && !isReadOnly) {
          qtyCellHtml = `
            <div class="order-stepper-wrapper">
              <button type="button" class="order-stepper-btn btn-minus" data-index="${index}" aria-label="Diminuir">−</button>
              <input type="number" class="order-stepper-input input-qty" data-index="${index}" value="${itemQtde}" min="1" max="999">
              <button type="button" class="order-stepper-btn btn-plus" data-index="${index}" aria-label="Aumentar">+</button>
            </div>
          `;
        } else {
          qtyCellHtml = `
            <span class="order-qty-static-badge">${itemQtde} un</span>
          `;
        }

        let actionCellHtml = '';
        if (isEditMode && !isReadOnly) {
          actionCellHtml = `
            <td class="col-actions-header" style="text-align: center;">
              <button type="button" class="btn-delete-item-row btn-remove-item" data-index="${index}" title="Remover produto do pedido">
                <span class="material-icons" style="font-size: 18px;">delete</span>
              </button>
            </td>
          `;
        }

        const highlightClass = item._justAdded ? 'item-row-highlight' : '';

        return `
          <tr data-index="${index}" class="${highlightClass}">
            <td style="text-align: center; color: #757575; font-size: 0.8rem; font-weight: 500;">${index + 1}</td>
            
            <td>
              <div class="table-prod-unified-cell">
                <img src="${item.foto || '../assets/images/logo-homepage.png'}" alt="${item.nome}" class="table-prod-thumb" onerror="this.src='../assets/images/logo-homepage.png'">
                <div class="table-prod-unified-info">
                  <div class="table-prod-name" title="${item.nome}">${item.nome}</div>
                  <div class="table-prod-meta-row">
                    <span class="table-prod-ean">EAN: ${item.ean}</span>
                    <span class="table-prod-category">${item.categoria || 'Geral'}</span>
                  </div>
                </div>
              </div>
            </td>

            <td class="col-estoque-loja" style="text-align: center; ${visibleColumns.estoqueLoja ? '' : 'display: none;'}">
              ${stockLojaHtml}
            </td>

            <td class="col-estoque-origem" style="text-align: center; ${visibleColumns.estoqueOrigem ? '' : 'display: none;'}">
              <span class="tbl-stock-origem-val">${estoqueOrigemVal} un</span>
            </td>

            <td class="col-estoque-ideal" style="text-align: center; ${showIdealMinCol ? '' : 'display: none;'}">
              ${idealMinHtml}
            </td>

            <td class="col-sugestao" style="text-align: center; ${visibleColumns.sugestao ? '' : 'display: none;'}">
              <button type="button" class="tbl-sugestao-btn btn-apply-sugestao" data-index="${index}" title="Clique para aplicar sugestão de ${sugestaoVal} un ao pedido">
                ${sugestaoVal} un
              </button>
            </td>

            <td class="col-qtde" style="text-align: center;">
              ${qtyCellHtml}
            </td>

            <td class="col-preco-un" style="text-align: right; ${visibleColumns.precos ? '' : 'display: none;'}">
              <span class="tbl-preco-val">R$ ${itemPreco.toFixed(2).replace('.', ',')}</span>
            </td>

            <td class="col-subtotal" style="text-align: right; ${visibleColumns.precos ? '' : 'display: none;'}">
              <span class="tbl-subtotal-val">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
            </td>

            <td class="col-lotes" style="text-align: center;">
              ${lotesBadgeHtml}
            </td>

            ${actionCellHtml}
          </tr>
        `;
      }).join('');
    }

    // 9.2 Render Cards Mobile / Desktop Grid
    if (cardsGrid) {
      cardsGrid.innerHTML = cartItems.map((item, index) => {
        const itemPreco = Number(item.preco) || 0;
        const itemQtde = Number(item.quantidade) || 0;
        const subtotal = itemPreco * itemQtde;
        const lotesCount = item.lotes ? item.lotes.length : 0;
        const totalLotesQty = item.lotes ? item.lotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0) : 0;

        const estoqueIdealVal = item.estoqueIdeal !== undefined ? item.estoqueIdeal : 12;
        const estoqueLojaVal = item.estoqueLoja !== undefined ? item.estoqueLoja : 0;
        const sugestaoVal = Math.max(0, estoqueIdealVal - estoqueLojaVal);

        let mobileLotesBadgeHtml = '';
        if (lotesCount === 0) {
          mobileLotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-empty" data-index="${index}" title="Informar validade e lotes">
              <span class="material-icons" style="font-size: 15px;">event</span>
              Informar Validade
            </button>
          `;
        } else if (totalLotesQty === itemQtde) {
          const loteText = lotesCount === 1 ? '1 lote' : `${lotesCount} lotes`;
          mobileLotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-ok" data-index="${index}" title="Validade OK: ${totalLotesQty}/${itemQtde} un alocadas em ${loteText}">
              <span class="material-icons" style="font-size: 15px;">verified</span>
              Validade OK (${loteText})
            </button>
          `;
        } else {
          mobileLotesBadgeHtml = `
            <button type="button" class="btn-manage-lotes-table status-divergent" data-index="${index}" title="Divergente: ${totalLotesQty} un nos lotes vs ${itemQtde} un no pedido">
              <span class="material-icons" style="font-size: 15px;">warning_amber</span>
              Divergente (${totalLotesQty}/${itemQtde} un)
            </button>
          `;
        }

        const highlightCardClass = item._justAdded ? 'item-card-highlight' : '';

        const isStockCritical = (estoqueLojaVal <= (item.minimoCritico !== undefined ? item.minimoCritico : 3));

        const activeMetricsCount = (visibleColumns.estoqueLoja ? 1 : 0) +
          (visibleColumns.estoqueOrigem ? 1 : 0) +
          (visibleColumns.estoqueIdeal ? 1 : 0) +
          (visibleColumns.minimoCritico ? 1 : 0) +
          (visibleColumns.sugestao ? 1 : 0);

        let metricsPanelHtml = '';
        if (activeMetricsCount === 1) {
          let singleLabel = '';
          let singleVal = '';
          let isClickableSugestao = false;
          if (visibleColumns.estoqueLoja) {
            singleLabel = 'Estoque na Loja:';
            singleVal = `${estoqueLojaVal} un`;
          } else if (visibleColumns.estoqueOrigem) {
            singleLabel = 'Estoque no CD Origem:';
            singleVal = `${item.estoqueOrigem !== undefined ? item.estoqueOrigem : 48} un`;
          } else if (visibleColumns.estoqueIdeal) {
            singleLabel = 'Estoque Ideal:';
            singleVal = `${estoqueIdealVal} un`;
          } else if (visibleColumns.minimoCritico) {
            singleLabel = 'Mínimo Crítico:';
            singleVal = `${item.minimoCritico !== undefined ? item.minimoCritico : 3} un`;
          } else if (visibleColumns.sugestao) {
            singleLabel = 'Sugestão de Reposição:';
            singleVal = `${sugestaoVal} un`;
            isClickableSugestao = true;
          }

          metricsPanelHtml = `
            <div class="card-metrics-panel is-single-metric ${isClickableSugestao ? 'is-clickable btn-apply-sugestao' : ''}" data-index="${index}" title="${isClickableSugestao ? `Clique para aplicar sugestão de ${sugestaoVal} un ao pedido` : ''}">
              <span class="single-metric-label">${singleLabel}</span>
              <strong class="single-metric-val ${isStockCritical && visibleColumns.estoqueLoja ? 'val-warning' : ''}">${singleVal}</strong>
            </div>
          `;
        } else if (activeMetricsCount > 1) {
          const bothIdealAndMin = visibleColumns.estoqueIdeal && visibleColumns.minimoCritico;

          metricsPanelHtml = `
            <div class="card-metrics-panel">
              ${visibleColumns.estoqueLoja ? `
                <div class="metric-col metric-col-loja">
                  <span class="metric-label">Est. Loja</span>
                  <span class="metric-val ${isStockCritical ? 'val-warning' : ''}">${estoqueLojaVal} un</span>
                </div>
              ` : ''}

              ${visibleColumns.estoqueOrigem ? `
                <div class="metric-col">
                  <span class="metric-label">CD Origem</span>
                  <span class="metric-val">${item.estoqueOrigem !== undefined ? item.estoqueOrigem : 48} un</span>
                </div>
              ` : ''}

              ${bothIdealAndMin ? `
                <div class="metric-col">
                  <span class="metric-label">Ideal</span>
                  <span class="metric-val">${estoqueIdealVal} <small style="font-size: 0.72rem; color: #64748b; font-weight: 500;">(Mín ${item.minimoCritico !== undefined ? item.minimoCritico : 3})</small></span>
                </div>
              ` : `
                ${visibleColumns.estoqueIdeal ? `
                  <div class="metric-col">
                    <span class="metric-label">Ideal</span>
                    <span class="metric-val">${estoqueIdealVal} un</span>
                  </div>
                ` : ''}

                ${visibleColumns.minimoCritico ? `
                  <div class="metric-col">
                    <span class="metric-label">Mín. Crítico</span>
                    <span class="metric-val ${isStockCritical ? 'val-warning' : ''}">${item.minimoCritico !== undefined ? item.minimoCritico : 3} un</span>
                  </div>
                ` : ''}
              `}

              ${visibleColumns.sugestao ? `
                <div class="metric-col metric-col-sugestao metric-col-clickable btn-apply-sugestao" data-index="${index}" title="Clique para aplicar sugestão de ${sugestaoVal} un ao pedido">
                  <span class="metric-label">Sugestão</span>
                  <span class="metric-val metric-val-sugestao">${sugestaoVal} un</span>
                </div>
              ` : ''}
            </div>
          `;
        }

        let financialBarHtml = '';
        if (visibleColumns.precos) {
          financialBarHtml = `
            <div class="card-finance-row">
              <span class="finance-price-item">Preço Un.: <strong>R$ ${itemPreco.toFixed(2).replace('.', ',')}</strong></span>
              <span class="finance-subtotal-item">Subtotal: <strong>R$ ${subtotal.toFixed(2).replace('.', ',')}</strong></span>
            </div>
          `;
        }

        return `
          <div class="order-mobile-product-card ${highlightCardClass}" data-index="${index}">
            <div class="mobile-card-top-row">
              <img src="${item.foto || '../assets/images/logo-homepage.png'}" alt="${item.nome}" class="mobile-card-thumb" onerror="this.src='../assets/images/logo-homepage.png'">
              <div class="mobile-card-info">
                <h4 class="mobile-card-title">${item.nome}</h4>
                <div class="mobile-card-ean">EAN: ${item.ean} • <span class="mobile-card-category">${item.categoria || 'Geral'}</span></div>
              </div>
            </div>

            ${metricsPanelHtml}

            ${financialBarHtml}

            <div class="mobile-card-bottom-actions">
              ${mobileLotesBadgeHtml}

              <div class="mobile-card-stepper-group">
                ${(isEditMode && !isReadOnly) ? `
                  <div class="order-stepper-wrapper">
                    <button type="button" class="order-stepper-btn btn-minus" data-index="${index}">−</button>
                    <input type="number" class="order-stepper-input input-qty" data-index="${index}" value="${itemQtde}" min="1" max="999">
                    <button type="button" class="order-stepper-btn btn-plus" data-index="${index}">+</button>
                  </div>
                  <button type="button" class="btn-delete-item-row btn-remove-item" data-index="${index}" title="Remover item">
                    <span class="material-icons">delete</span>
                  </button>
                ` : `
                  <span class="order-qty-static-badge">${itemQtde} un</span>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    bindProductRowEvents();
    updateTotals();

    setTimeout(() => {
      cartItems.forEach(i => { delete i._justAdded; });
    }, 2000);
  }

  // 10. Eventos Interativos da Lista de Produtos
  function bindProductRowEvents() {
    const minusBtns = document.querySelectorAll('.btn-minus');
    minusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (cartItems[idx] && cartItems[idx].quantidade > 1) {
          cartItems[idx].quantidade -= 1;
          renderProducts();
        }
      });
    });

    const plusBtns = document.querySelectorAll('.btn-plus');
    plusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (cartItems[idx]) {
          cartItems[idx].quantidade += 1;
          renderProducts();
        }
      });
    });

    const qtyInputs = document.querySelectorAll('.input-qty');
    qtyInputs.forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-index'), 10);
        const val = Math.max(1, parseInt(inp.value, 10) || 1);
        if (cartItems[idx]) {
          cartItems[idx].quantidade = val;
          renderProducts();
        }
      });
    });

    const removeBtns = document.querySelectorAll('.btn-remove-item');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (cartItems[idx]) {
          const removedName = cartItems[idx].nome;
          cartItems.splice(idx, 1);
          if (typeof Toast !== 'undefined') {
            Toast.info(`"${removedName.substring(0, 24)}..." removido do pedido.`);
          }
          renderProducts();
        }
      });
    });

    // Botões de Gerenciar Lotes
    const lotesBtns = document.querySelectorAll('.btn-manage-lotes-table');
    lotesBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const idx = parseInt(btn.getAttribute('data-index'), 10);
        if (cartItems[idx]) {
          openLotesModal(cartItems[idx]);
        }
      });
    });

    // Ação Rápida: Aplicar Sugestão de Reposição ao Clicar (Tabela e Cards)
    const applySugestaoBtns = document.querySelectorAll('.btn-apply-sugestao');
    applySugestaoBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!isEditMode || isReadOnly) {
          if (typeof Toast !== 'undefined') {
            Toast.info('Ative o modo de edição para alterar as quantidades do pedido.');
          }
          return;
        }

        const idx = parseInt(btn.getAttribute('data-index'), 10);
        const item = cartItems[idx];
        if (item) {
          const estoqueIdealVal = item.estoqueIdeal !== undefined ? item.estoqueIdeal : 12;
          const estoqueLojaVal = item.estoqueLoja !== undefined ? item.estoqueLoja : 0;
          const sugestaoVal = Math.max(0, estoqueIdealVal - estoqueLojaVal);

          if (sugestaoVal <= 0) {
            if (typeof Toast !== 'undefined') {
              Toast.warning(`O estoque atual (${estoqueLojaVal} un) já atinge ou supera a meta ideal (${estoqueIdealVal} un).`);
            }
            return;
          }

          item.quantidade = sugestaoVal;
          if (typeof Toast !== 'undefined') {
            Toast.success(`Sugestão de ${sugestaoVal} un aplicada para "${item.nome.substring(0, 22)}...".`);
          }
          renderProducts();
        }
      });
    });
  }

  // 11. Cálculo e Atualização dos Totais no Sticky Footer
  function updateTotals() {
    const totalSkus = cartItems.length;
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const totalMonetary = cartItems.reduce((acc, curr) => acc + ((Number(curr.preco) || 0) * (Number(curr.quantidade) || 0)), 0);

    if (footerSkusCount) footerSkusCount.textContent = totalSkus;
    if (footerUnitsCount) footerUnitsCount.textContent = `${totalUnits} un`;

    if (footerMetricValorBox) {
      if (activePriceTable === 'NONE' || !visibleColumns.precos) {
        footerMetricValorBox.style.display = 'none';
      } else {
        footerMetricValorBox.style.display = 'flex';
        if (footerTotalValue) {
          footerTotalValue.textContent = 'R$ ' + totalMonetary.toFixed(2).replace('.', ',');
        }
        if (footerPriceTableBadge) {
          footerPriceTableBadge.textContent = activePriceTable === 'CUSTO' ? '[ Custo ]' : '[ Venda ]';
        }
      }
    }
  }

  // 10. Bipe por Código de Barras (Omnibar)
  if (omnibarInput) {
    omnibarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = omnibarInput.value.trim();
        if (!query) return;

        // 1. Procura se já está no carrinho (move para o topo e incrementa)
        const existingIndex = cartItems.findIndex(p => p.ean === query || p.nome.toLowerCase() === query.toLowerCase());
        if (existingIndex !== -1) {
          const existing = cartItems.splice(existingIndex, 1)[0];
          existing.quantidade += 1;
          existing._justAdded = true;
          cartItems.unshift(existing);
          if (typeof Toast !== 'undefined') {
            Toast.success(`+1 un: ${existing.nome.substring(0, 26)}...`);
          }
          omnibarInput.value = '';
          renderProducts();
          return;
        }

        // 2. Procura no catálogo mestre (insere no topo)
        const foundInCatalog = rawCatalog.find(p => p.ean === query || p.nome.toLowerCase().includes(query.toLowerCase()));
        if (foundInCatalog) {
          const newItem = {
            id: Date.now(),
            nome: foundInCatalog.nome,
            ean: foundInCatalog.ean,
            foto: foundInCatalog.foto,
            categoria: foundInCatalog.categoria || foundInCatalog.grupo || 'Geral',
            estoqueLoja: foundInCatalog.estoqueLoja !== undefined ? foundInCatalog.estoqueLoja : 0,
            preco: foundInCatalog.precoVenda || foundInCatalog.preco || 5.00,
            quantidade: 1,
            _justAdded: true,
            lotes: []
          };
          cartItems.unshift(newItem);
          if (typeof Toast !== 'undefined') {
            Toast.success(`Produto adicionado: ${newItem.nome.substring(0, 26)}...`);
          }
          omnibarInput.value = '';
          renderProducts();
        } else {
          if (typeof Toast !== 'undefined') {
            Toast.warning(`Produto ou código EAN "${query}" não encontrado no catálogo.`);
          }
        }
      }
    });
  }

  // 11. Modal do Catálogo de Produtos
  function openCatalogModal() {
    if (modalCatalog) {
      modalCatalog.classList.add('show', 'active');
      renderCatalogGrid('');
      setTimeout(() => {
        if (catalogSearchInput) {
          catalogSearchInput.focus();
        }
      }, 100);
    }
  }

  function closeCatalogModal() {
    if (modalCatalog) modalCatalog.classList.remove('show', 'active');
  }

  function renderCatalogGrid(query = '', selectedCategory = 'ALL') {
    if (!catalogModalGrid) return;
    const term = query.toLowerCase().trim();

    const filtered = rawCatalog.filter(p => {
      const matchText = !term || 
        (p.nome && p.nome.toLowerCase().includes(term)) || 
        (p.ean && p.ean.includes(term)) ||
        (p.marca && p.marca.toLowerCase().includes(term));
      const cat = p.categoria || p.grupo || 'Outros';
      const matchCat = (selectedCategory === 'ALL') || cat.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchText && matchCat;
    });

    if (filtered.length === 0) {
      catalogModalGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #757575;">
          <span class="material-icons" style="font-size: 36px; color: #bbb; display: block; margin-bottom: 8px;">search_off</span>
          <p style="margin: 0; font-size: 0.9rem;">Nenhum produto encontrado neste filtro.</p>
        </div>
      `;
      return;
    }

    catalogModalGrid.innerHTML = filtered.map(prod => {
      const preco = Number(prod.precoVenda || prod.preco || 6.50);
      const inCart = cartItems.find(i => String(i.id) === String(prod.id) || i.ean === prod.ean);
      const isAdded = !!inCart;

      return `
        <div class="catalog-item-card" data-ean="${prod.ean}">
          <img src="${prod.foto || prod.imagem || '../assets/images/logo-homepage.png'}" alt="${prod.nome}" class="catalog-item-img" onerror="this.src='../assets/images/logo-homepage.png'">
          <div>
            <div class="catalog-item-name" title="${prod.nome}">${prod.nome}</div>
            <div style="font-size: 0.72rem; color: #757575; margin-top: 2px;">EAN: ${prod.ean}</div>
          </div>
          <div class="catalog-item-bottom">
            <span class="catalog-item-price">R$ ${preco.toFixed(2).replace('.', ',')}</span>
            <button type="button" class="btn-catalog-add ${isAdded ? 'added' : ''}" data-ean="${prod.ean}">
              <span class="material-icons" style="font-size: 16px;">${isAdded ? 'check' : 'add'}</span>
              <span>${isAdded ? `No Pedido (${inCart.quantidade})` : 'Adicionar'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Eventos de adicionar item pelo catálogo
    const addBtns = catalogModalGrid.querySelectorAll('.btn-catalog-add');
    addBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ean = btn.getAttribute('data-ean');
        const prod = rawCatalog.find(p => p.ean === ean);
        if (!prod) return;

        const existingIndex = cartItems.findIndex(item => item.ean === ean);
        if (existingIndex !== -1) {
          const existing = cartItems.splice(existingIndex, 1)[0];
          existing.quantidade += 1;
          existing._justAdded = true;
          cartItems.unshift(existing);
          if (typeof Toast !== 'undefined') Toast.success(`+1 un: ${prod.nome.substring(0, 24)}...`);
        } else {
          cartItems.unshift({
            id: Date.now(),
            nome: prod.nome,
            ean: prod.ean,
            foto: prod.foto || prod.imagem || '../assets/images/logo-homepage.png',
            categoria: prod.categoria || prod.grupo || 'Geral',
            estoqueLoja: prod.estoqueLoja !== undefined ? prod.estoqueLoja : 6,
            preco: prod.precoVenda || prod.preco || 6.50,
            quantidade: 1,
            _justAdded: true,
            lotes: []
          });
          if (typeof Toast !== 'undefined') Toast.success(`Produto adicionado: ${prod.nome.substring(0, 24)}...`);
        }

        renderProducts();
        const activeChip = document.querySelector('.catalog-cat-chip.active');
        const cat = activeChip ? activeChip.getAttribute('data-cat') : 'ALL';
        renderCatalogGrid(catalogSearchInput ? catalogSearchInput.value : '', cat);
      });
    });
  }

  if (btnOpenCatalogModal) btnOpenCatalogModal.addEventListener('click', openCatalogModal);
  const btnEmptyAdd = document.getElementById('btnEmptyAdd');
  if (btnEmptyAdd) btnEmptyAdd.addEventListener('click', openCatalogModal);

  if (btnCloseCatalogModal) btnCloseCatalogModal.addEventListener('click', closeCatalogModal);
  if (btnCloseCatalogBtn) btnCloseCatalogBtn.addEventListener('click', closeCatalogModal);

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', () => {
      const activeChip = document.querySelector('.catalog-cat-chip.active');
      const cat = activeChip ? activeChip.getAttribute('data-cat') : 'ALL';
      renderCatalogGrid(catalogSearchInput.value, cat);
    });
  }

  catalogCategoryChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catalogCategoryChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const cat = chip.getAttribute('data-cat') || 'ALL';
      renderCatalogGrid(catalogSearchInput ? catalogSearchInput.value : '', cat);
    });
  });

  // 11. Controle do Menu Suspenso "Mais Ações" e Dropdown de Colunas
  const btnToggleColumns = document.getElementById('btnToggleColumns');
  const columnsVisibilityDropdown = document.getElementById('columnsVisibilityDropdown');
  const columnsVisibilityContainer = document.getElementById('columnsVisibilityContainer');
  const btnResetColumnsDropdown = document.getElementById('btnResetColumnsDropdown');
  const colVisToggleInputs = document.querySelectorAll('.col-vis-toggle-input');

  function syncColumnsDropdownInputs() {
    colVisToggleInputs.forEach(input => {
      const colKey = input.getAttribute('data-col');
      if (colKey && visibleColumns[colKey] !== undefined) {
        input.checked = !!visibleColumns[colKey];
      }
    });
  }

  // Abertura/Fechamento do Menu Mais Ações
  if (btnMoreActions && moreActionsDropdown) {
    btnMoreActions.addEventListener('click', (e) => {
      e.stopPropagation();
      if (columnsVisibilityDropdown) columnsVisibilityDropdown.classList.remove('show');
      moreActionsDropdown.classList.toggle('show');
      btnMoreActions.setAttribute('aria-expanded', moreActionsDropdown.classList.contains('show'));
    });
  }

  // Abertura/Fechamento do Dropdown Direto de Colunas
  if (btnToggleColumns && columnsVisibilityDropdown) {
    btnToggleColumns.addEventListener('click', (e) => {
      e.stopPropagation();
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      syncColumnsDropdownInputs();
      columnsVisibilityDropdown.classList.toggle('show');
      btnToggleColumns.classList.toggle('active', columnsVisibilityDropdown.classList.contains('show'));
      btnToggleColumns.setAttribute('aria-expanded', columnsVisibilityDropdown.classList.contains('show'));
    });

    // Checkboxes de Visibilidade de Colunas (Atualização Imediata em Tempo Real)
    colVisToggleInputs.forEach(input => {
      input.addEventListener('change', () => {
        const colKey = input.getAttribute('data-col');
        if (colKey && visibleColumns[colKey] !== undefined) {
          visibleColumns[colKey] = input.checked;

          if (colKey === 'precos' && !input.checked) {
            activePriceTable = 'NONE';
            if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Sem Preços (Apenas Físico)';
          } else if (colKey === 'precos' && input.checked && activePriceTable === 'NONE') {
            activePriceTable = 'VENDA';
            if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Tabela Padrão de Venda';
          }

          // Sincroniza também com o modal se estiver aberto
          if (chkColEstoqueLoja) chkColEstoqueLoja.checked = visibleColumns.estoqueLoja;
          if (chkColEstoqueOrigem) chkColEstoqueOrigem.checked = visibleColumns.estoqueOrigem;
          if (chkColEstoqueIdeal) chkColEstoqueIdeal.checked = visibleColumns.estoqueIdeal;
          if (chkColMinCritico) chkColMinCritico.checked = visibleColumns.minimoCritico;
          if (chkColSugestao) chkColSugestao.checked = visibleColumns.sugestao;
          if (chkColPrecos) chkColPrecos.checked = visibleColumns.precos;

          renderProducts();
        }
      });
    });

    // Botão Restaurar Padrão no Dropdown
    if (btnResetColumnsDropdown) {
      btnResetColumnsDropdown.addEventListener('click', (e) => {
        e.stopPropagation();
        visibleColumns.estoqueLoja = true;
        visibleColumns.estoqueOrigem = true;
        visibleColumns.estoqueIdeal = true;
        visibleColumns.minimoCritico = true;
        visibleColumns.sugestao = true;
        visibleColumns.precos = false;
        activePriceTable = 'NONE';
        if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Sem Preços (Apenas Físico)';

        syncColumnsDropdownInputs();
        renderProducts();
        if (typeof Toast !== 'undefined') Toast.success('Visualização padrão de colunas restaurada.');
      });
    }
  }

  // Fechamento de Dropdowns ao Clicar Fora ou com ESC
  document.addEventListener('click', (e) => {
    if (moreActionsWrapper && !moreActionsWrapper.contains(e.target)) {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      if (btnMoreActions) btnMoreActions.setAttribute('aria-expanded', 'false');
    }
    if (columnsVisibilityContainer && !columnsVisibilityContainer.contains(e.target)) {
      if (columnsVisibilityDropdown) columnsVisibilityDropdown.classList.remove('show');
      if (btnToggleColumns) {
        btnToggleColumns.classList.remove('active');
        btnToggleColumns.setAttribute('aria-expanded', 'false');
      }
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      if (columnsVisibilityDropdown) {
        columnsVisibilityDropdown.classList.remove('show');
        if (btnToggleColumns) btnToggleColumns.classList.remove('active');
      }
    }
  });

  // Ação 1: Abrir Modal de Quantidade em Lote
  if (actionBatchQty) {
    actionBatchQty.addEventListener('click', () => {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      if (modalBatchQuantity) modalBatchQuantity.classList.add('show', 'active');
    });
  }

  function closeBatchQtyModal() {
    if (modalBatchQuantity) modalBatchQuantity.classList.remove('show', 'active');
  }

  if (btnCloseBatchQtyModal) btnCloseBatchQtyModal.addEventListener('click', closeBatchQtyModal);
  if (btnCancelBatchQty) btnCancelBatchQty.addEventListener('click', closeBatchQtyModal);

  quickQtyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const q = btn.getAttribute('data-qty');
      if (inputBatchQtyValue) inputBatchQtyValue.value = q;
    });
  });

  if (btnApplyBatchQty) {
    btnApplyBatchQty.addEventListener('click', () => {
      const val = parseInt(inputBatchQtyValue.value, 10);
      if (isNaN(val) || val < 1) {
        if (typeof Toast !== 'undefined') Toast.warning('Informe uma quantidade válida (mínimo 1).');
        return;
      }
      cartItems.forEach(item => item.quantidade = val);
      renderProducts();
      closeBatchQtyModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Quantidade de todos os produtos definida para ${val} un.`);
      }
    });
  }

  // Ação 2: Abrir Dropdown/Modal de Colunas e Campos Visíveis
  if (actionManageCols) {
    actionManageCols.addEventListener('click', (e) => {
      e.stopPropagation();
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      if (btnMoreActions) btnMoreActions.setAttribute('aria-expanded', 'false');

      setTimeout(() => {
        if (columnsVisibilityDropdown && btnToggleColumns) {
          syncColumnsDropdownInputs();
          columnsVisibilityDropdown.classList.add('show');
          btnToggleColumns.classList.add('active');
          btnToggleColumns.setAttribute('aria-expanded', 'true');
        } else if (modalManageColumns) {
          if (chkColEstoqueLoja) chkColEstoqueLoja.checked = visibleColumns.estoqueLoja;
          if (chkColEstoqueOrigem) chkColEstoqueOrigem.checked = visibleColumns.estoqueOrigem;
          if (chkColEstoqueIdeal) chkColEstoqueIdeal.checked = visibleColumns.estoqueIdeal;
          if (chkColMinCritico) chkColMinCritico.checked = visibleColumns.minimoCritico;
          if (chkColSugestao) chkColSugestao.checked = visibleColumns.sugestao;
          if (chkColPrecos) chkColPrecos.checked = visibleColumns.precos;
          modalManageColumns.classList.add('show', 'active');
        }
      }, 50);
    });
  }

  function closeManageColsModal() {
    if (modalManageColumns) modalManageColumns.classList.remove('show', 'active');
  }

  if (btnCloseManageColsModal) btnCloseManageColsModal.addEventListener('click', closeManageColsModal);
  if (btnCancelManageCols) btnCancelManageCols.addEventListener('click', closeManageColsModal);

  if (btnApplyManageCols) {
    btnApplyManageCols.addEventListener('click', () => {
      visibleColumns.estoqueLoja = !!(chkColEstoqueLoja && chkColEstoqueLoja.checked);
      visibleColumns.estoqueOrigem = !!(chkColEstoqueOrigem && chkColEstoqueOrigem.checked);
      visibleColumns.estoqueIdeal = !!(chkColEstoqueIdeal && chkColEstoqueIdeal.checked);
      visibleColumns.minimoCritico = !!(chkColMinCritico && chkColMinCritico.checked);
      visibleColumns.sugestao = !!(chkColSugestao && chkColSugestao.checked);
      visibleColumns.precos = !!(chkColPrecos && chkColPrecos.checked);

      if (!visibleColumns.precos) {
        activePriceTable = 'NONE';
        if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Sem Preços (Apenas Físico)';
      }

      renderProducts();
      closeManageColsModal();
      if (typeof Toast !== 'undefined') {
        Toast.success('Configuração de colunas atualizada com sucesso.');
      }
    });
  }

  // Ação 3: Abrir Modal de Tabela de Preços
  if (actionPriceTable) {
    actionPriceTable.addEventListener('click', () => {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      priceOptionCards.forEach(card => {
        const val = card.getAttribute('data-value');
        if (val === activePriceTable) {
          card.classList.add('selected');
          const r = card.querySelector('input[type="radio"]');
          if (r) r.checked = true;
        } else {
          card.classList.remove('selected');
        }
      });
      if (modalPriceTable) modalPriceTable.classList.add('show', 'active');
    });
  }

  priceOptionCards.forEach(card => {
    card.addEventListener('click', () => {
      priceOptionCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      const r = card.querySelector('input[type="radio"]');
      if (r) r.checked = true;
    });
  });

  function closePriceTableModal() {
    if (modalPriceTable) modalPriceTable.classList.remove('show', 'active');
  }

  if (btnClosePriceTableModal) btnClosePriceTableModal.addEventListener('click', closePriceTableModal);
  if (btnCancelPriceTable) btnCancelPriceTable.addEventListener('click', closePriceTableModal);

  if (btnApplyPriceTable) {
    btnApplyPriceTable.addEventListener('click', () => {
      const selectedRadio = document.querySelector('input[name="priceTableRadio"]:checked');
      const chosen = selectedRadio ? selectedRadio.value : 'NONE';
      activePriceTable = chosen;

      if (chosen === 'NONE') {
        visibleColumns.precos = false;
        if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Sem Preços (Apenas Físico)';
        if (typeof Toast !== 'undefined') Toast.info('Tabela de preços desativada. Pedido operando apenas com quantidades.');
      } else if (chosen === 'VENDA') {
        visibleColumns.precos = true;
        if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Tabela Padrão de Venda';
        // Aplica preços de venda originais
        cartItems.forEach(item => {
          const raw = rawCatalog.find(p => p.ean === item.ean);
          if (raw) item.preco = Number(raw.precoVenda || raw.preco || 6.90);
        });
        if (typeof Toast !== 'undefined') Toast.success('Tabela de Venda aplicada ao pedido.');
      } else if (chosen === 'CUSTO') {
        visibleColumns.precos = true;
        if (currentPriceTableLabel) currentPriceTableLabel.textContent = 'Tabela Padrão de Custo';
        // Aplica preços de custo estimados (~60% do valor de venda)
        cartItems.forEach(item => {
          const raw = rawCatalog.find(p => p.ean === item.ean);
          const basePrice = Number(raw ? (raw.precoVenda || raw.preco || 6.90) : (item.preco || 6.90));
          item.preco = Number((basePrice * 0.62).toFixed(2));
        });
        if (typeof Toast !== 'undefined') Toast.success('Tabela de Custo aplicada ao pedido.');
      }

      if (chkColPrecos) chkColPrecos.checked = visibleColumns.precos;
      renderProducts();
      closePriceTableModal();
    });
  }

  // Ação 4: Incluir por Categoria (Modal com Filtros por Grupo, Subgrupo, Fornecedor e Saldo)
  const actionAddByCategory = document.getElementById('actionAddByCategory');
  if (actionAddByCategory) {
    actionAddByCategory.addEventListener('click', () => {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      openAddByCategoryModal();
    });
  }

  // Ação 5: Excluir Todos os Itens (Menu Mais Ações)
  if (actionClearAll) {
    actionClearAll.addEventListener('click', () => {
      if (moreActionsDropdown) moreActionsDropdown.classList.remove('show');
      openClearAllModal();
    });
  }

  // Botão de Lixeira no Cabeçalho da Tabela (Excluir Todos os Itens)
  const btnClearAllHeader = document.getElementById('btnClearAllHeader');
  if (btnClearAllHeader) {
    btnClearAllHeader.addEventListener('click', () => {
      if (isReadOnly || !isEditMode) return;
      if (cartItems.length === 0) {
        if (typeof Toast !== 'undefined') Toast.info('O pedido já está vazio.');
        return;
      }
      openClearAllModal();
    });
  }

  // 12. Modal de Confirmação de Limpeza em Massa (Excluir Todos os Itens)
  function openClearAllModal() {
    if (isReadOnly || !isEditMode || cartItems.length === 0) return;
    if (clearAllModalDesc) {
      clearAllModalDesc.innerHTML = `Tem certeza que deseja remover todos os <strong>${cartItems.length} produtos</strong> deste pedido? Esta ação removerá quantidades e validades informadas.`;
    }
    if (modalConfirmClearAll) modalConfirmClearAll.classList.add('show', 'active');
  }

  function closeClearAllModal() {
    if (modalConfirmClearAll) modalConfirmClearAll.classList.remove('show', 'active');
  }

  function executeClearAll() {
    const count = cartItems.length;
    cartItems = [];
    renderProducts();
    updateTotals();
    closeClearAllModal();
    if (typeof Toast !== 'undefined') {
      Toast.info(`Todos os ${count} itens foram removidos do pedido.`);
    }
  }

  if (btnCloseClearAllModal) btnCloseClearAllModal.addEventListener('click', closeClearAllModal);
  if (btnCancelClearAll) btnCancelClearAll.addEventListener('click', closeClearAllModal);
  if (btnConfirmClearAll) btnConfirmClearAll.addEventListener('click', executeClearAll);

  if (modalConfirmClearAll) {
    modalConfirmClearAll.addEventListener('click', (e) => {
      if (e.target === modalConfirmClearAll) closeClearAllModal();
    });
  }

  // ==========================================================================
  // 12.1 MODAL: ADICIONAR PRODUTOS DO CATÁLOGO (FILTRAGEM POR CATEGORIA / SUBGRUPO)
  // ==========================================================================
  const modalAddByCategory = document.getElementById('modalAddByCategory');
  const btnCloseAddByCategoryModal = document.getElementById('btnCloseAddByCategoryModal');
  const btnDiscardAddByCategory = document.getElementById('btnDiscardAddByCategory');
  const btnConfirmAddByCategory = document.getElementById('btnConfirmAddByCategory');

  const comboboxCategoryGrupo = document.getElementById('comboboxCategoryGrupo');
  const inputCategoryGrupo = document.getElementById('inputCategoryGrupo');
  const btnClearCategoryGrupo = document.getElementById('btnClearCategoryGrupo');
  const btnToggleCategoryGrupo = document.getElementById('btnToggleCategoryGrupo');
  const dropdownCategoryGrupo = document.getElementById('dropdownCategoryGrupo');

  const comboboxCategorySubgrupo = document.getElementById('comboboxCategorySubgrupo');
  const inputCategorySubgrupo = document.getElementById('inputCategorySubgrupo');
  const btnClearCategorySubgrupo = document.getElementById('btnClearCategorySubgrupo');
  const btnToggleCategorySubgrupo = document.getElementById('btnToggleCategorySubgrupo');
  const dropdownCategorySubgrupo = document.getElementById('dropdownCategorySubgrupo');

  const comboboxCategoryFornecedor = document.getElementById('comboboxCategoryFornecedor');
  const inputCategoryFornecedor = document.getElementById('inputCategoryFornecedor');
  const btnClearCategoryFornecedor = document.getElementById('btnClearCategoryFornecedor');
  const btnToggleCategoryFornecedor = document.getElementById('btnToggleCategoryFornecedor');
  const dropdownCategoryFornecedor = document.getElementById('dropdownCategoryFornecedor');

  const inputCategorySearchText = document.getElementById('inputCategorySearchText');
  const btnClearCategorySearchText = document.getElementById('btnClearCategorySearchText');
  const chkCategoryOnlyAvailableCd = document.getElementById('chkCategoryOnlyAvailableCd');
  const badgeCategoryCdOrigemName = document.getElementById('badgeCategoryCdOrigemName');
  const categoryMatchesCount = document.getElementById('categoryMatchesCount');

  // Mapeamento Oficial de Grupos para Subgrupos
  const GROUP_SUBGROUPS_MAP = {
    'Bebidas e Refrigerantes': ['Energéticos', 'Refrigerantes', 'Sucos e Chás', 'Águas e Isotônicos', 'Cervejas e Alcoólicos'],
    'Alimentos e Snacks': ['Salgadinhos e Snacks', 'Biscoitos e Bolachas', 'Sanduíches e Prontos', 'Massas e Molhos'],
    'Doces e Chocolates': ['Chocolates', 'Balas e Gomas', 'Sobremesas', 'Barras de Cereal'],
    'Higiene e Limpeza': ['Higiene Pessoal', 'Limpeza Geral', 'Descartáveis'],
    'Tabacaria': ['Cigarros', 'Palheiros', 'Acessórios']
  };

  function inferSubgroup(prod) {
    if (prod.subgrupo) return prod.subgrupo;
    const name = (prod.nome || '').toLowerCase();
    const cat = prod.categoria || 'Geral';
    if (cat === 'Bebidas e Refrigerantes') {
      if (name.includes('energ') || name.includes('monster') || name.includes('red bull')) return 'Energéticos';
      if (name.includes('suco') || name.includes('chá') || name.includes('cha')) return 'Sucos e Chás';
      if (name.includes('cerveja') || name.includes('heineken') || name.includes('amstel')) return 'Cervejas e Alcoólicos';
      if (name.includes('água') || name.includes('agua') || name.includes('gatorade')) return 'Águas e Isotônicos';
      return 'Refrigerantes';
    }
    if (cat === 'Alimentos e Snacks') {
      if (name.includes('biscoito') || name.includes('bolacha') || name.includes('oreo')) return 'Biscoitos e Bolachas';
      if (name.includes('sandu') || name.includes('pronto')) return 'Sanduíches e Prontos';
      return 'Salgadinhos e Snacks';
    }
    if (cat === 'Doces e Chocolates') {
      if (name.includes('bala') || name.includes('goma') || name.includes('trident')) return 'Balas e Gomas';
      return 'Chocolates';
    }
    if (cat === 'Higiene e Limpeza') {
      if (name.includes('detergente') || name.includes('limpeza')) return 'Limpeza Geral';
      return 'Higiene Pessoal';
    }
    return 'Geral';
  }

  function inferFornecedor(prod) {
    if (prod.fornecedor) return prod.fornecedor;
    const name = (prod.nome || '').toLowerCase();
    if (name.includes('monster')) return 'Monster Energy Brasil';
    if (name.includes('coca') || name.includes('fanta') || name.includes('sprite')) return 'Coca-Cola FEMSA';
    if (name.includes('ambev') || name.includes('pepsi') || name.includes('guaraná')) return 'Ambev Brasil';
    if (name.includes('nestle') || name.includes('nestlé') || name.includes('garoto')) return 'Nestlé Alimentos';
    if (name.includes('doritos') || name.includes('lays') || name.includes('cheetos') || name.includes('fandangos')) return 'PepsiCo do Brasil';
    return 'Distribuidora Central B2U';
  }

  function openAddByCategoryModal() {
    if (!modalAddByCategory) return;

    // Detecta se é Entrada Direta (Sem Origem) ou Abastecimento com CD
    const origSelect = document.getElementById('heroOrigemSelect');
    const origVal = origSelect ? (origSelect.value || '').trim() : '';
    const origText = (origSelect && origSelect.options[origSelect.selectedIndex]) 
      ? origSelect.options[origSelect.selectedIndex].text 
      : '';
    const isEntradaDireta = !origVal || origVal === 'none' || origText.toLowerCase().includes('entrada direta') || origText.toLowerCase().includes('sem origem');

    const containerCd = document.getElementById('containerCategoryStockCd');
    if (containerCd) {
      if (isEntradaDireta) {
        containerCd.style.display = 'none';
        if (chkCategoryOnlyAvailableCd) chkCategoryOnlyAvailableCd.checked = false;
      } else {
        containerCd.style.display = 'block';
        if (chkCategoryOnlyAvailableCd) chkCategoryOnlyAvailableCd.checked = true;
        if (badgeCategoryCdOrigemName) {
          badgeCategoryCdOrigemName.textContent = `CD: ${origText.replace('--', '').trim()}`;
        }
      }
    }

    // Reset filtros
    if (inputCategoryGrupo) inputCategoryGrupo.value = '';
    if (btnClearCategoryGrupo) btnClearCategoryGrupo.style.display = 'none';
    
    if (inputCategorySubgrupo) {
      inputCategorySubgrupo.value = '';
      inputCategorySubgrupo.disabled = false;
      inputCategorySubgrupo.placeholder = 'Digite para pesquisar ou clique para ver todos...';
    }
    if (btnClearCategorySubgrupo) btnClearCategorySubgrupo.style.display = 'none';
    if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.remove('is-disabled');

    if (inputCategoryFornecedor) inputCategoryFornecedor.value = '';
    if (btnClearCategoryFornecedor) btnClearCategoryFornecedor.style.display = 'none';

    if (inputCategorySearchText) inputCategorySearchText.value = '';
    if (btnClearCategorySearchText) btnClearCategorySearchText.style.display = 'none';

    closeAllCategoryComboboxes();
    updateCategoryMatchesCount();

    modalAddByCategory.style.display = 'flex';
    modalAddByCategory.classList.add('show', 'active');
  }

  function closeAddByCategoryModal() {
    if (modalAddByCategory) {
      modalAddByCategory.style.display = 'none';
      modalAddByCategory.classList.remove('show', 'active');
    }
    closeAllCategoryComboboxes();
  }

  function closeAllCategoryComboboxes() {
    if (dropdownCategoryGrupo) dropdownCategoryGrupo.style.display = 'none';
    if (comboboxCategoryGrupo) comboboxCategoryGrupo.classList.remove('open');

    if (dropdownCategorySubgrupo) dropdownCategorySubgrupo.style.display = 'none';
    if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.remove('open');

    if (dropdownCategoryFornecedor) dropdownCategoryFornecedor.style.display = 'none';
    if (comboboxCategoryFornecedor) comboboxCategoryFornecedor.classList.remove('open');
  }

  // 1. População de Grupos (Com opção "Todos os Grupos")
  function populateGruposDropdown(filterText = '') {
    if (!dropdownCategoryGrupo) return;
    const grupos = Object.keys(GROUP_SUBGROUPS_MAP);
    const filtered = filterText ? grupos.filter(g => g.toLowerCase().includes(filterText.toLowerCase())) : grupos;

    let html = '';
    
    // Opção "Todos os Grupos" no topo
    if (!filterText || 'todos os grupos'.includes(filterText.toLowerCase())) {
      const isAllSelected = !inputCategoryGrupo || !inputCategoryGrupo.value || inputCategoryGrupo.value === 'Todos os Grupos';
      html += `
        <div class="combobox-option ${isAllSelected ? 'selected' : ''}" data-val="">
          <span class="combobox-option-text">● Todos os Grupos (Catálogo Completo)</span>
          <span class="combobox-option-count">${rawCatalog.length}</span>
        </div>
      `;
    }

    html += filtered.map(grupo => {
      const count = rawCatalog.filter(p => p.categoria === grupo).length;
      const isSelected = inputCategoryGrupo && inputCategoryGrupo.value === grupo;
      return `
        <div class="combobox-option ${isSelected ? 'selected' : ''}" data-val="${grupo}">
          <span class="combobox-option-text">${grupo}</span>
          <span class="combobox-option-count">${count}</span>
        </div>
      `;
    }).join('');

    if (!html) {
      html = '<div class="combobox-empty-msg">Nenhum grupo encontrado</div>';
    }

    dropdownCategoryGrupo.innerHTML = html;

    dropdownCategoryGrupo.querySelectorAll('.combobox-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        selectGrupo(val);
      });
    });
  }

  function selectGrupo(grupo) {
    if (inputCategoryGrupo) inputCategoryGrupo.value = grupo || 'Todos os Grupos';
    if (btnClearCategoryGrupo) btnClearCategoryGrupo.style.display = grupo ? 'flex' : 'none';
    closeAllCategoryComboboxes();

    // Habilita e reseta o subgrupo
    if (inputCategorySubgrupo) {
      inputCategorySubgrupo.value = '';
      inputCategorySubgrupo.disabled = false;
      inputCategorySubgrupo.placeholder = grupo ? `Subgrupos de ${grupo}...` : 'Digite para pesquisar ou clique para ver todos...';
    }
    if (btnClearCategorySubgrupo) btnClearCategorySubgrupo.style.display = 'none';
    if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.remove('is-disabled');

    updateCategoryMatchesCount();
  }

  // 2. População de Subgrupos (Com opção "Todos os Subgrupos")
  function populateSubgruposDropdown(filterText = '') {
    if (!dropdownCategorySubgrupo) return;
    const selectedGrupo = (inputCategoryGrupo ? inputCategoryGrupo.value : '').trim();
    
    let subgrupos = [];
    if (selectedGrupo && selectedGrupo !== 'Todos os Grupos' && GROUP_SUBGROUPS_MAP[selectedGrupo]) {
      subgrupos = GROUP_SUBGROUPS_MAP[selectedGrupo] || [];
    } else {
      // Se "Todos os Grupos" estiver selecionado, traz todos os subgrupos existentes
      const allSubsSet = new Set();
      Object.values(GROUP_SUBGROUPS_MAP).forEach(list => list.forEach(s => allSubsSet.add(s)));
      subgrupos = Array.from(allSubsSet).sort();
    }

    const filtered = filterText ? subgrupos.filter(s => s.toLowerCase().includes(filterText.toLowerCase())) : subgrupos;

    let html = '';

    // Opção "Todos os Subgrupos" no topo
    if (!filterText || 'todos os subgrupos'.includes(filterText.toLowerCase())) {
      const isAllSelected = !inputCategorySubgrupo || !inputCategorySubgrupo.value || inputCategorySubgrupo.value === 'Todos os Subgrupos';
      const countTotal = (selectedGrupo && selectedGrupo !== 'Todos os Grupos')
        ? rawCatalog.filter(p => p.categoria === selectedGrupo).length
        : rawCatalog.length;

      html += `
        <div class="combobox-option ${isAllSelected ? 'selected' : ''}" data-val="">
          <span class="combobox-option-text">● Todos os Subgrupos</span>
          <span class="combobox-option-count">${countTotal}</span>
        </div>
      `;
    }

    html += filtered.map(sub => {
      const count = rawCatalog.filter(p => {
        if (selectedGrupo && selectedGrupo !== 'Todos os Grupos' && p.categoria !== selectedGrupo) return false;
        return (p.subgrupo || inferSubgroup(p)) === sub;
      }).length;

      const isSelected = inputCategorySubgrupo && inputCategorySubgrupo.value === sub;
      return `
        <div class="combobox-option ${isSelected ? 'selected' : ''}" data-val="${sub}">
          <span class="combobox-option-text">${sub}</span>
          <span class="combobox-option-count">${count}</span>
        </div>
      `;
    }).join('');

    if (!html) {
      html = '<div class="combobox-empty-msg">Nenhum subgrupo encontrado</div>';
    }

    dropdownCategorySubgrupo.innerHTML = html;

    dropdownCategorySubgrupo.querySelectorAll('.combobox-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        selectSubgrupo(val);
      });
    });
  }

  function selectSubgrupo(subgrupo) {
    if (inputCategorySubgrupo) inputCategorySubgrupo.value = subgrupo || 'Todos os Subgrupos';
    if (btnClearCategorySubgrupo) btnClearCategorySubgrupo.style.display = subgrupo ? 'flex' : 'none';
    closeAllCategoryComboboxes();
    updateCategoryMatchesCount();
  }

  // 3. População de Fornecedores (Com opção "Todos os Fornecedores")
  function populateFornecedoresDropdown(filterText = '') {
    if (!dropdownCategoryFornecedor) return;
    const fornecedoresSet = new Set();
    rawCatalog.forEach(p => fornecedoresSet.add(p.fornecedor || inferFornecedor(p)));
    const fornecedores = Array.from(fornecedoresSet).sort();

    const filtered = filterText ? fornecedores.filter(f => f.toLowerCase().includes(filterText.toLowerCase())) : fornecedores;

    let html = '';

    // Opção "Todos os Fornecedores" no topo
    if (!filterText || 'todos os fornecedores'.includes(filterText.toLowerCase())) {
      const isAllSelected = !inputCategoryFornecedor || !inputCategoryFornecedor.value || inputCategoryFornecedor.value === 'Todos os Fornecedores';
      html += `
        <div class="combobox-option ${isAllSelected ? 'selected' : ''}" data-val="">
          <span class="combobox-option-text">● Todos os Fornecedores</span>
          <span class="combobox-option-count">${rawCatalog.length}</span>
        </div>
      `;
    }

    html += filtered.map(forn => {
      const count = rawCatalog.filter(p => (p.fornecedor || inferFornecedor(p)) === forn).length;
      const isSelected = inputCategoryFornecedor && inputCategoryFornecedor.value === forn;
      return `
        <div class="combobox-option ${isSelected ? 'selected' : ''}" data-val="${forn}">
          <span class="combobox-option-text">${forn}</span>
          <span class="combobox-option-count">${count}</span>
        </div>
      `;
    }).join('');

    if (!html) {
      html = '<div class="combobox-empty-msg">Nenhum fornecedor encontrado</div>';
    }

    dropdownCategoryFornecedor.innerHTML = html;

    dropdownCategoryFornecedor.querySelectorAll('.combobox-option').forEach(opt => {
      opt.addEventListener('click', () => {
        const val = opt.getAttribute('data-val');
        selectFornecedor(val);
      });
    });
  }

  function selectFornecedor(forn) {
    if (inputCategoryFornecedor) inputCategoryFornecedor.value = forn || 'Todos os Fornecedores';
    if (btnClearCategoryFornecedor) btnClearCategoryFornecedor.style.display = forn ? 'flex' : 'none';
    closeAllCategoryComboboxes();
    updateCategoryMatchesCount();
  }

  // Listeners Combobox Grupo
  if (btnToggleCategoryGrupo) {
    btnToggleCategoryGrupo.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = comboboxCategoryGrupo && comboboxCategoryGrupo.classList.contains('open');
      closeAllCategoryComboboxes();
      if (!isOpen && dropdownCategoryGrupo) {
        populateGruposDropdown();
        dropdownCategoryGrupo.style.display = 'block';
        if (comboboxCategoryGrupo) comboboxCategoryGrupo.classList.add('open');
      }
    });
  }

  if (inputCategoryGrupo) {
    inputCategoryGrupo.addEventListener('input', () => {
      if (btnClearCategoryGrupo) btnClearCategoryGrupo.style.display = inputCategoryGrupo.value ? 'flex' : 'none';
      populateGruposDropdown(inputCategoryGrupo.value);
      if (dropdownCategoryGrupo) dropdownCategoryGrupo.style.display = 'block';
      if (comboboxCategoryGrupo) comboboxCategoryGrupo.classList.add('open');
      updateCategoryMatchesCount();
    });

    inputCategoryGrupo.addEventListener('focus', () => {
      populateGruposDropdown(inputCategoryGrupo.value);
      if (dropdownCategoryGrupo) dropdownCategoryGrupo.style.display = 'block';
      if (comboboxCategoryGrupo) comboboxCategoryGrupo.classList.add('open');
    });
  }

  if (btnClearCategoryGrupo) {
    btnClearCategoryGrupo.addEventListener('click', () => {
      if (inputCategoryGrupo) inputCategoryGrupo.value = '';
      btnClearCategoryGrupo.style.display = 'none';

      // Reseta também o subgrupo
      if (inputCategorySubgrupo) {
        inputCategorySubgrupo.value = '';
        inputCategorySubgrupo.disabled = false;
        inputCategorySubgrupo.placeholder = 'Digite para pesquisar ou clique para ver todos...';
      }
      if (btnClearCategorySubgrupo) btnClearCategorySubgrupo.style.display = 'none';
      if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.remove('is-disabled');

      updateCategoryMatchesCount();
    });
  }

  // Listeners Combobox Subgrupo
  if (btnToggleCategorySubgrupo) {
    btnToggleCategorySubgrupo.addEventListener('click', (e) => {
      e.stopPropagation();
      if (inputCategorySubgrupo && inputCategorySubgrupo.disabled) return;
      const isOpen = comboboxCategorySubgrupo && comboboxCategorySubgrupo.classList.contains('open');
      closeAllCategoryComboboxes();
      if (!isOpen && dropdownCategorySubgrupo) {
        populateSubgruposDropdown();
        dropdownCategorySubgrupo.style.display = 'block';
        if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.add('open');
      }
    });
  }

  if (inputCategorySubgrupo) {
    inputCategorySubgrupo.addEventListener('input', () => {
      if (btnClearCategorySubgrupo) btnClearCategorySubgrupo.style.display = inputCategorySubgrupo.value ? 'flex' : 'none';
      populateSubgruposDropdown(inputCategorySubgrupo.value);
      if (dropdownCategorySubgrupo) dropdownCategorySubgrupo.style.display = 'block';
      if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.add('open');
      updateCategoryMatchesCount();
    });

    inputCategorySubgrupo.addEventListener('focus', () => {
      if (inputCategorySubgrupo.disabled) return;
      populateSubgruposDropdown(inputCategorySubgrupo.value);
      if (dropdownCategorySubgrupo) dropdownCategorySubgrupo.style.display = 'block';
      if (comboboxCategorySubgrupo) comboboxCategorySubgrupo.classList.add('open');
    });
  }

  if (btnClearCategorySubgrupo) {
    btnClearCategorySubgrupo.addEventListener('click', () => {
      if (inputCategorySubgrupo) inputCategorySubgrupo.value = '';
      btnClearCategorySubgrupo.style.display = 'none';
      updateCategoryMatchesCount();
    });
  }

  // Listeners Combobox Fornecedor
  if (btnToggleCategoryFornecedor) {
    btnToggleCategoryFornecedor.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = comboboxCategoryFornecedor && comboboxCategoryFornecedor.classList.contains('open');
      closeAllCategoryComboboxes();
      if (!isOpen && dropdownCategoryFornecedor) {
        populateFornecedoresDropdown();
        dropdownCategoryFornecedor.style.display = 'block';
        if (comboboxCategoryFornecedor) comboboxCategoryFornecedor.classList.add('open');
      }
    });
  }

  if (inputCategoryFornecedor) {
    inputCategoryFornecedor.addEventListener('input', () => {
      if (btnClearCategoryFornecedor) btnClearCategoryFornecedor.style.display = inputCategoryFornecedor.value ? 'flex' : 'none';
      populateFornecedoresDropdown(inputCategoryFornecedor.value);
      if (dropdownCategoryFornecedor) dropdownCategoryFornecedor.style.display = 'block';
      if (comboboxCategoryFornecedor) comboboxCategoryFornecedor.classList.add('open');
      updateCategoryMatchesCount();
    });

    inputCategoryFornecedor.addEventListener('focus', () => {
      populateFornecedoresDropdown(inputCategoryFornecedor.value);
      if (dropdownCategoryFornecedor) dropdownCategoryFornecedor.style.display = 'block';
      if (comboboxCategoryFornecedor) comboboxCategoryFornecedor.classList.add('open');
    });
  }

  if (btnClearCategoryFornecedor) {
    btnClearCategoryFornecedor.addEventListener('click', () => {
      if (inputCategoryFornecedor) inputCategoryFornecedor.value = '';
      btnClearCategoryFornecedor.style.display = 'none';
      updateCategoryMatchesCount();
    });
  }

  // Busca Textual & Saldo CD
  if (inputCategorySearchText) {
    inputCategorySearchText.addEventListener('input', () => {
      if (btnClearCategorySearchText) btnClearCategorySearchText.style.display = inputCategorySearchText.value ? 'flex' : 'none';
      updateCategoryMatchesCount();
    });
  }

  if (btnClearCategorySearchText) {
    btnClearCategorySearchText.addEventListener('click', () => {
      if (inputCategorySearchText) inputCategorySearchText.value = '';
      btnClearCategorySearchText.style.display = 'none';
      updateCategoryMatchesCount();
    });
  }

  if (chkCategoryOnlyAvailableCd) {
    chkCategoryOnlyAvailableCd.addEventListener('change', updateCategoryMatchesCount);
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.custom-combobox')) {
      closeAllCategoryComboboxes();
    }
  });

  function getFilteredCategoryProducts() {
    const rawGrupo = (inputCategoryGrupo ? inputCategoryGrupo.value : '').trim();
    const selGrupo = (rawGrupo && !rawGrupo.toLowerCase().includes('todos os grupos') && !rawGrupo.startsWith('●')) ? rawGrupo : '';

    const rawSub = (inputCategorySubgrupo ? inputCategorySubgrupo.value : '').trim();
    const selSubgrupo = (rawSub && !rawSub.toLowerCase().includes('todos os subgrupos') && !rawSub.startsWith('●')) ? rawSub : '';

    const rawForn = (inputCategoryFornecedor ? inputCategoryFornecedor.value : '').trim();
    const selFornecedor = (rawForn && !rawForn.toLowerCase().includes('todos os fornecedores') && !rawForn.startsWith('●')) ? rawForn : '';

    const searchTxt = (inputCategorySearchText ? inputCategorySearchText.value : '').trim().toLowerCase();

    const origSelect = document.getElementById('heroOrigemSelect');
    const origVal = origSelect ? (origSelect.value || '').trim() : '';
    const origText = (origSelect && origSelect.options[origSelect.selectedIndex]) 
      ? origSelect.options[origSelect.selectedIndex].text 
      : '';
    const isEntradaDireta = !origVal || origVal === 'none' || origText.toLowerCase().includes('entrada direta') || origText.toLowerCase().includes('sem origem');

    const onlyCd = (!isEntradaDireta && chkCategoryOnlyAvailableCd) ? chkCategoryOnlyAvailableCd.checked : false;

    return rawCatalog.filter(prod => {
      if (selGrupo && prod.categoria !== selGrupo) return false;
      if (selSubgrupo && (prod.subgrupo || inferSubgroup(prod)) !== selSubgrupo) return false;
      if (selFornecedor && (prod.fornecedor || inferFornecedor(prod)) !== selFornecedor) return false;
      if (searchTxt) {
        const matchName = (prod.nome || '').toLowerCase().includes(searchTxt);
        const matchEan = (prod.ean || '').toLowerCase().includes(searchTxt);
        if (!matchName && !matchEan) return false;
      }
      if (onlyCd) {
        const cdStock = prod.estoqueOrigem !== undefined ? prod.estoqueOrigem : 24;
        if (cdStock <= 0) return false;
      }
      return true;
    });
  }

  function updateCategoryMatchesCount() {
    const matches = getFilteredCategoryProducts();
    if (categoryMatchesCount) categoryMatchesCount.textContent = matches.length;
  }

  if (btnCloseAddByCategoryModal) btnCloseAddByCategoryModal.addEventListener('click', closeAddByCategoryModal);
  if (btnDiscardAddByCategory) btnDiscardAddByCategory.addEventListener('click', closeAddByCategoryModal);

  if (btnConfirmAddByCategory) {
    btnConfirmAddByCategory.addEventListener('click', () => {
      const matches = getFilteredCategoryProducts();
      if (matches.length === 0) {
        if (typeof Toast !== 'undefined') Toast.warning('Nenhum produto correspondente encontrado para incluir.');
        return;
      }

      const newItems = [];
      matches.forEach(prod => {
        const existing = cartItems.find(item => item.ean === prod.ean);
        if (!existing) {
          newItems.push({
            id: prod.id || Date.now() + Math.random(),
            nome: prod.nome,
            ean: prod.ean,
            foto: prod.foto,
            categoria: prod.categoria || 'Geral',
            subgrupo: prod.subgrupo || inferSubgroup(prod),
            quantidade: prod.quantidade || 1,
            preco: Number(prod.precoVenda || prod.preco || 6.90),
            estoqueLoja: prod.estoqueLoja !== undefined ? prod.estoqueLoja : 4,
            estoqueOrigem: prod.estoqueOrigem !== undefined ? prod.estoqueOrigem : 36,
            estoqueIdeal: prod.estoqueIdeal !== undefined ? prod.estoqueIdeal : 12,
            minimoCritico: prod.minimoCritico !== undefined ? prod.minimoCritico : 3,
            _justAdded: true,
            lotes: []
          });
        }
      });

      if (newItems.length > 0) {
        // Insere todos os novos itens no topo da lista
        cartItems.unshift(...newItems);
      }

      renderProducts();
      updateTotals();
      closeAddByCategoryModal();

      // Ajusta scroll suave para o topo da tabela
      if (tableWrapper) tableWrapper.scrollTop = 0;

      if (typeof Toast !== 'undefined') {
        Toast.success(`${newItems.length > 0 ? newItems.length : 'Produtos'} produto(s) incluído(s) no topo do pedido!`);
      }
    });
  }

  // 12. Modal de Gerenciamento de Lotes e Validades (Shelf-Life)
  function openLotesModal(item) {
    currentEditingItemForLotes = item;
    const targetQtd = Number(item.quantidade) || 0;
    const isReadOnlyMode = (!isEditMode || isReadOnly);

    if (item.lotes && item.lotes.length > 0) {
      temporaryLotes = JSON.parse(JSON.stringify(item.lotes));
    } else {
      temporaryLotes = isReadOnlyMode ? [] : [
        {
          codigo: '001',
          quantidade: targetQtd,
          fabricacao: '',
          validade: ''
        }
      ];
    }

    const lotesModalProdImg = document.getElementById('lotesModalProdImg');
    const lotesModalProdName = document.getElementById('lotesModalProdName');
    const lotesModalProdEan = document.getElementById('lotesModalProdEan');

    if (lotesModalProdImg) lotesModalProdImg.src = item.foto || '../assets/images/logo-homepage.png';
    if (lotesModalProdName) lotesModalProdName.textContent = item.nome;
    if (lotesModalProdEan) lotesModalProdEan.textContent = `EAN: ${item.ean} | Pedido: ${targetQtd} un`;

    if (isReadOnlyMode) {
      if (btnModalAddLote) btnModalAddLote.style.display = 'none';
      if (btnTableAddLote) btnTableAddLote.style.display = 'none';
      if (btnCancelLotes) btnCancelLotes.style.display = 'none';
      if (btnSaveLotes) {
        btnSaveLotes.textContent = 'FECHAR';
        btnSaveLotes.style.backgroundColor = '#64748b';
      }
    } else {
      if (btnModalAddLote) btnModalAddLote.style.display = 'inline-flex';
      if (btnTableAddLote) btnTableAddLote.style.display = 'inline-flex';
      if (btnCancelLotes) btnCancelLotes.style.display = 'inline-block';
      if (btnSaveLotes) {
        btnSaveLotes.textContent = 'CONFIRMAR LOTES';
        btnSaveLotes.style.backgroundColor = 'var(--primary-color, #6530b5)';
      }
    }

    renderLotesRows();
    if (modalGerenciarLotes) modalGerenciarLotes.classList.add('show', 'active');
  }

  function closeLotesModal() {
    if (modalGerenciarLotes) modalGerenciarLotes.classList.remove('show', 'active');
    currentEditingItemForLotes = null;
    temporaryLotes = [];
  }

  function renderLotesRows() {
    if (!lotesTableBody || !currentEditingItemForLotes) return;
    const isReadOnlyMode = (!isEditMode || isReadOnly);

    if (temporaryLotes.length === 0) {
      lotesTableBody.innerHTML = `
        <tr>
          <td colspan="5" class="lotes-empty-cell">
            <div class="lotes-empty-box">
              <span class="material-icons">inventory_2</span>
              <p>${isReadOnlyMode ? 'Nenhum lote informado para este produto.' : 'Nenhum lote adicionado para este produto.'}</p>
              <small>${isReadOnlyMode ? 'Para cadastrar a validade, ative o Modo de Edição.' : 'Clique no botão <strong>+ NOVO LOTE</strong> ou <strong>+ Adicionar Outro Lote / Validade</strong> para registrar.'}</small>
            </div>
          </td>
        </tr>
      `;
      updateLotesAllocationProgress();
      return;
    }

    lotesTableBody.innerHTML = temporaryLotes.map((lote, idx) => {
      const deleteActionHtml = isReadOnlyMode ? '' : `
        <button type="button" class="btn-del-lote-row btn-remove-lote-row" data-idx="${idx}" title="Excluir lote">
          <span class="material-icons">delete_outline</span>
        </button>
      `;

      return `
        <tr data-idx="${idx}">
          <td>
            <input type="text" class="lote-input input-lote-cod" data-idx="${idx}" value="${lote.codigo || lote.lote || ''}" placeholder="Ex: 001" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="number" class="lote-input input-lote-qty" data-idx="${idx}" value="${lote.quantidade !== undefined ? lote.quantidade : ''}" min="1" placeholder="Qtd" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="date" class="lote-input input-lote-fab" data-idx="${idx}" value="${lote.fabricacao || ''}" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="date" class="lote-input input-lote-val" data-idx="${idx}" value="${lote.validade || ''}" required ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td style="text-align: center;">
            ${deleteActionHtml}
          </td>
        </tr>
      `;
    }).join('');

    if (!isReadOnlyMode) {
      // Eventos dos inputs da tabela de lotes
      const codInputs = lotesTableBody.querySelectorAll('.input-lote-cod');
      codInputs.forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          if (temporaryLotes[idx]) temporaryLotes[idx].codigo = inp.value;
        });
      });

      const qtyInputs = lotesTableBody.querySelectorAll('.input-lote-qty');
      qtyInputs.forEach(inp => {
        inp.addEventListener('input', () => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          if (temporaryLotes[idx]) {
            inp.classList.remove('is-invalid');
            temporaryLotes[idx].quantidade = parseInt(inp.value, 10) || 0;
            updateLotesAllocationProgress();
          }
        });
      });

      const fabInputs = lotesTableBody.querySelectorAll('.input-lote-fab');
      fabInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          if (temporaryLotes[idx]) temporaryLotes[idx].fabricacao = inp.value;
        });
      });

      const valInputs = lotesTableBody.querySelectorAll('.input-lote-val');
      valInputs.forEach(inp => {
        inp.addEventListener('change', () => {
          const idx = parseInt(inp.getAttribute('data-idx'), 10);
          if (temporaryLotes[idx]) {
            inp.classList.remove('is-invalid');
            temporaryLotes[idx].validade = inp.value;
          }
        });
      });

      const removeLoteBtns = lotesTableBody.querySelectorAll('.btn-remove-lote-row');
      removeLoteBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          temporaryLotes.splice(idx, 1);
          renderLotesRows();
        });
      });
    }

    updateLotesAllocationProgress();
  }

  function updateLotesAllocationProgress() {
    if (!currentEditingItemForLotes) return;
    const required = Number(currentEditingItemForLotes.quantidade) || 0;
    const allocated = temporaryLotes.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    if (lotesCounterText) lotesCounterText.textContent = `${allocated} / ${required} un`;

    const percent = required > 0 ? Math.min(100, Math.round((allocated / required) * 100)) : 0;

    if (lotesBarFill) {
      if (allocated === required) {
        lotesBarFill.style.width = '100%';
        lotesBarFill.className = 'allocation-bar-fill complete';
      } else if (allocated > required) {
        lotesBarFill.style.width = '100%';
        lotesBarFill.className = 'allocation-bar-fill exceeded';
      } else {
        lotesBarFill.style.width = `${percent}%`;
        lotesBarFill.className = 'allocation-bar-fill';
      }
    }

    if (lotesAllocationBadge) {
      if (allocated === required) {
        lotesAllocationBadge.className = 'allocation-badge complete';
        lotesAllocationBadge.textContent = 'COMPLETO (100%)';
      } else if (allocated > required) {
        const diff = allocated - required;
        lotesAllocationBadge.className = 'allocation-badge exceeded';
        lotesAllocationBadge.textContent = `EXCEDENTE (+${diff} UN)`;
      } else {
        const diff = required - allocated;
        lotesAllocationBadge.className = 'allocation-badge pending';
        lotesAllocationBadge.textContent = `PENDENTE (${diff} UN)`;
      }
    }
  }

  function addEmptyLoteRow() {
    if (!currentEditingItemForLotes) return;
    const targetQtd = Number(currentEditingItemForLotes.quantidade) || 0;
    const currentAllocated = temporaryLotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
    const remainder = Math.max(1, targetQtd - currentAllocated);
    const nextCode = String(temporaryLotes.length + 1).padStart(3, '0');

    temporaryLotes.push({
      codigo: nextCode,
      quantidade: remainder,
      fabricacao: '',
      validade: ''
    });
    renderLotesRows();
  }

  if (btnModalAddLote) btnModalAddLote.addEventListener('click', addEmptyLoteRow);
  if (btnTableAddLote) btnTableAddLote.addEventListener('click', addEmptyLoteRow);
  if (btnCloseLotesModal) btnCloseLotesModal.addEventListener('click', closeLotesModal);
  if (btnCancelLotes) btnCancelLotes.addEventListener('click', closeLotesModal);

  if (modalGerenciarLotes) {
    modalGerenciarLotes.addEventListener('click', (e) => {
      if (e.target === modalGerenciarLotes) closeLotesModal();
    });
  }

  if (btnSaveLotes) {
    btnSaveLotes.addEventListener('click', () => {
      if (!currentEditingItemForLotes) return;
      const isReadOnlyMode = (!isEditMode || isReadOnly);

      if (isReadOnlyMode) {
        closeLotesModal();
        return;
      }

      if (temporaryLotes.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhum lote adicionado. Adicione ao menos um lote ou clique em Cancelar.');
        }
        return;
      }

      // Validação 1: Quantidade e Validade de cada lote
      for (let i = 0; i < temporaryLotes.length; i++) {
        const lote = temporaryLotes[i];
        const rowEl = lotesTableBody.querySelector(`tr[data-idx="${i}"]`);

        if (!lote.quantidade || lote.quantidade <= 0) {
          if (rowEl) {
            const qtyInp = rowEl.querySelector('.input-lote-qty');
            if (qtyInp) { qtyInp.classList.add('is-invalid'); qtyInp.focus(); }
          }
          if (typeof Toast !== 'undefined') {
            Toast.warning(`Informe uma quantidade válida para o lote ${lote.codigo || i + 1}.`);
          }
          return;
        }

        if (!lote.validade || lote.validade.trim() === '') {
          if (rowEl) {
            const valInp = rowEl.querySelector('.input-lote-val');
            if (valInp) { valInp.classList.add('is-invalid'); valInp.focus(); }
          }
          if (typeof Toast !== 'undefined') {
            Toast.warning(`A data de validade é obrigatória para o lote ${lote.codigo || i + 1}. Preencha ou clique em Cancelar.`);
          }
          return;
        }
      }

      // Validação 2: Total alocado deve bater exatamente com a quantidade do pedido
      const required = Number(currentEditingItemForLotes.quantidade) || 0;
      const allocated = temporaryLotes.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

      if (allocated < required) {
        if (typeof Toast !== 'undefined') {
          Toast.error(`Quantidade total alocada (${allocated} un) é menor que o pedido (${required} un). Aloque as ${required - allocated} un restantes para confirmar.`);
        }
        return;
      }

      if (allocated > required) {
        if (typeof Toast !== 'undefined') {
          Toast.error(`Quantidade total alocada (${allocated} un) excede o pedido (${required} un). Ajuste as quantidades para coincidir com o pedido.`);
        }
        return;
      }

      // Sucesso: Grava os lotes no produto
      currentEditingItemForLotes.lotes = JSON.parse(JSON.stringify(temporaryLotes));
      closeLotesModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Lotes e validades confirmados com sucesso para "${currentEditingItemForLotes.nome.substring(0, 24)}..."!`);
      }
      renderProducts();
    });
  }

  // 13. Conclusão e Gravação do Pedido (Modal 3)
  function openConcluirModal() {
    if (cartItems.length === 0) {
      if (typeof Toast !== 'undefined') {
        Toast.warning('Adicione ao menos 1 produto antes de confirmar o pedido.');
      }
      return;
    }

    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const dest = heroDestinoSelect ? heroDestinoSelect.value : 'Mini Mercado';

    if (modalConcluirCod) modalConcluirCod.textContent = currentOrderCode;
    if (modalConcluirQtde) modalConcluirQtde.textContent = `${totalUnits} iten(s)`;
    if (modalConcluirDestino) modalConcluirDestino.textContent = dest;

    if (modalConcluirPedido) modalConcluirPedido.classList.add('show', 'active');
  }

  function closeConcluirModal() {
    if (modalConcluirPedido) modalConcluirPedido.classList.remove('show', 'active');
  }

  if (btnFooterConfirm) {
    btnFooterConfirm.addEventListener('click', () => {
      if (!isEditMode && !isReadOnly) {
        // Se estiver em modo de visualização, o botão abre o modo de edição
        toggleEditMode();
      } else {
        openConcluirModal();
      }
    });
  }

  if (btnFooterDraft) {
    btnFooterDraft.addEventListener('click', () => {
      saveOrderToStorage('Aberto');
      if (typeof Toast !== 'undefined') {
        Toast.success(`Pedido ${currentOrderCode} salvo com sucesso!`);
      }
      isEditMode = false;
      applyModeUI();
    });
  }

  if (btnFooterBackToList) {
    btnFooterBackToList.addEventListener('click', () => {
      window.location.href = './pedidos-abastecimento.html';
    });
  }

  if (btnCloseConcluirModal) btnCloseConcluirModal.addEventListener('click', closeConcluirModal);
  if (btnCancelConcluir) btnCancelConcluir.addEventListener('click', closeConcluirModal);

  // Seleção de card de status no modal de conclusão
  const finishCards = document.querySelectorAll('.finish-option-card');
  finishCards.forEach(card => {
    card.addEventListener('click', () => {
      finishCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentSelectedStatus = card.getAttribute('data-status') || 'Pendente de Abastecimento';
    });
  });

  if (btnSubmitFinalizarPedido) {
    btnSubmitFinalizarPedido.addEventListener('click', () => {
      saveOrderToStorage(currentSelectedStatus);
      closeConcluirModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Pedido ${currentOrderCode} salvo como "${currentSelectedStatus}" com sucesso! Redirecionando...`);
      }

      setTimeout(() => {
        window.location.href = './pedidos-abastecimento.html';
      }, 750);
    });
  }

  function saveOrderToStorage(status) {
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const dest = heroDestinoSelect ? heroDestinoSelect.value : 'Mini Mercado 03 Simples Nacional';
    const orig = heroOrigemSelect ? heroOrigemSelect.value : '';
    const inputResp = document.getElementById('inputResponsavel');
    const txtObs = document.getElementById('textareaObservacoes');

    const orderObj = {
      id: currentLoadedOrder ? currentLoadedOrder.id : Date.now(),
      codigo: currentOrderCode,
      filial: dest,
      filialOrigem: orig,
      planoBase: currentLoadedOrder ? currentLoadedOrder.planoBase : 'Inserção Manual',
      qtdeItens: totalUnits,
      dataCriacao: currentLoadedOrder ? currentLoadedOrder.dataCriacao : new Date().toLocaleDateString('pt-BR'),
      status: status,
      responsavel: inputResp ? inputResp.value : 'B2U Operações',
      observacoes: txtObs ? txtObs.value : '',
      itens: JSON.parse(JSON.stringify(cartItems))
    };

    if (typeof window.salvarNovoPedidoNoStorage === 'function') {
      window.salvarNovoPedidoNoStorage(orderObj);
    }
  }

  // 14. Inicialização da Interface
  applyModeUI();
});
