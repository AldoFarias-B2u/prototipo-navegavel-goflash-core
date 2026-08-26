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

  // FAB e Banners de Modo
  const fabEditOrder = document.getElementById('fabEditOrder');
  const fabEditIcon = document.getElementById('fabEditIcon');
  const modeStatusBanner = document.getElementById('modeStatusBanner');
  const modeBannerIcon = document.getElementById('modeBannerIcon');
  const modeBannerText = document.getElementById('modeBannerText');
  const btnBannerActionToggle = document.getElementById('btnBannerActionToggle');
  const orderModePill = document.getElementById('orderModePill');
  const btnHeaderEditToggle = document.getElementById('btnHeaderEditToggle');
  const btnHeaderSave = document.getElementById('btnHeaderSave');

  // Ações de Produtos
  const btnOpenCatalogModal = document.getElementById('btnOpenCatalogModal');
  const orderOmnibarBox = document.getElementById('orderOmnibarBox');
  const omnibarInput = document.getElementById('omnibarInput');
  const omnibarDropdown = document.getElementById('omnibarDropdown');

  // Tabela e Cards
  const tbody = document.getElementById('orderTableBody');
  const cardsGrid = document.getElementById('orderCardsGrid');
  const emptyState = document.getElementById('orderEmptyState');
  const tableWrapper = document.getElementById('orderTableWrapper');

  // Sticky Footer
  const footerSkusCount = document.getElementById('footerSkusCount');
  const footerUnitsCount = document.getElementById('footerUnitsCount');
  const footerTotalValue = document.getElementById('footerTotalValue');
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
      if (btnHeaderEditToggle) btnHeaderEditToggle.style.display = 'none';
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
        orderModePill.textContent = 'Somente Leitura';
      }

      if (modeStatusBanner) {
        modeStatusBanner.style.display = 'flex';
        modeStatusBanner.className = 'mode-status-banner mode-readonly-locked';
        if (modeBannerIcon) modeBannerIcon.textContent = 'lock';
        if (modeBannerText) {
          modeBannerText.innerHTML = `<strong>Pedido ${statusName}:</strong> Este pedido já foi processado e encontra-se bloqueado para alterações.`;
        }
        if (btnBannerActionToggle) btnBannerActionToggle.style.display = 'none';
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
        fabEditOrder.title = 'Salvar e Concluir Edição';
        if (fabEditIcon) fabEditIcon.textContent = 'check';
      }

      if (btnHeaderEditToggle) {
        btnHeaderEditToggle.title = 'Visualizar Pedido';
        btnHeaderEditToggle.querySelector('.material-icons').textContent = 'visibility';
      }

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
        orderModePill.textContent = 'Modo de Edição';
      }

      if (modeStatusBanner) {
        modeStatusBanner.style.display = 'flex';
        modeStatusBanner.className = 'mode-status-banner mode-edit';
        if (modeBannerIcon) modeBannerIcon.textContent = 'edit_note';
        if (modeBannerText) {
          modeBannerText.innerHTML = `<strong>Modo de Edição Ativo:</strong> Você pode ajustar quantidades, bipar produtos ou adicionar itens pelo catálogo.`;
        }
        if (btnBannerActionToggle) {
          btnBannerActionToggle.style.display = 'inline-flex';
          btnBannerActionToggle.innerHTML = `<span class="material-icons" style="font-size: 16px;">visibility</span> VISUALIZAR`;
        }
      }

      if (btnFooterCancelEdit) btnFooterCancelEdit.style.display = 'inline-flex';
      if (btnFooterDraft) btnFooterDraft.style.display = 'inline-flex';
      if (btnFooterConfirm) {
        btnFooterConfirm.style.display = 'inline-flex';
        if (btnFooterConfirmTxt) btnFooterConfirmTxt.textContent = 'CONFIRMAR PEDIDO';
      }
      if (btnFooterBackToList) btnFooterBackToList.style.display = 'none';

    } else {
      // MODO DE VISUALIZAÇÃO ATIVO (PADRÃO)
      if (fabEditOrder) {
        fabEditOrder.style.display = 'flex';
        fabEditOrder.classList.remove('is-editing');
        fabEditOrder.title = 'Editar Itens do Pedido';
        if (fabEditIcon) fabEditIcon.textContent = 'edit';
      }

      if (btnHeaderEditToggle) {
        btnHeaderEditToggle.title = 'Editar Pedido';
        btnHeaderEditToggle.querySelector('.material-icons').textContent = 'edit';
      }

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
        orderModePill.textContent = 'Visualização';
      }

      if (modeStatusBanner) {
        modeStatusBanner.style.display = 'flex';
        modeStatusBanner.className = 'mode-status-banner mode-view';
        if (modeBannerIcon) modeBannerIcon.textContent = 'visibility';
        if (modeBannerText) {
          modeBannerText.innerHTML = `<strong>Modo de Visualização:</strong> Pedido aberto para conferência. Clique no botão de lápis para editar quantidades ou itens.`;
        }
        if (btnBannerActionToggle) {
          btnBannerActionToggle.style.display = 'inline-flex';
          btnBannerActionToggle.innerHTML = `<span class="material-icons" style="font-size: 16px;">edit</span> EDITAR PEDIDO`;
        }
      }

      if (btnFooterCancelEdit) btnFooterCancelEdit.style.display = 'none';
      if (btnFooterDraft) btnFooterDraft.style.display = 'none';
      if (btnFooterConfirm) {
        btnFooterConfirm.style.display = 'inline-flex';
        if (btnFooterConfirmTxt) btnFooterConfirmTxt.textContent = 'EDITAR PEDIDO';
      }
      if (btnFooterBackToList) btnFooterBackToList.style.display = 'inline-flex';
    }

    renderProducts();
  }

  // 5. Toggle de Edição via FAB, Botão de Banner e Botão do Topbar
  function toggleEditMode() {
    if (isReadOnly) return;
    isEditMode = !isEditMode;
    applyModeUI();

    if (typeof Toast !== 'undefined') {
      if (isEditMode) {
        Toast.info('Modo de edição ativado. Ajuste os itens e confirme as alterações.');
      } else {
        Toast.info('Retornado ao modo de visualização.');
      }
    }
  }

  if (fabEditOrder) fabEditOrder.addEventListener('click', toggleEditMode);
  if (btnBannerActionToggle) btnBannerActionToggle.addEventListener('click', toggleEditMode);
  if (btnHeaderEditToggle) btnHeaderEditToggle.addEventListener('click', toggleEditMode);
  
  if (btnFooterCancelEdit) {
    btnFooterCancelEdit.addEventListener('click', () => {
      isEditMode = false;
      applyModeUI();
      if (typeof Toast !== 'undefined') Toast.info('Edição cancelada.');
    });
  }

  // 6. Navegação entre Abas (PRODUTOS / DETALHES)
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

  // 7. Renderização da Lista de Produtos (Tabela e Cards Mobile)
  function renderProducts() {
    if (heroProductsCount) heroProductsCount.textContent = cartItems.length;

    // Header da coluna de ações
    const colActionsHeader = document.querySelector('.col-actions-header');
    if (colActionsHeader) {
      colActionsHeader.style.display = (isEditMode && !isReadOnly) ? 'table-cell' : 'none';
    }

    if (cartItems.length === 0) {
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (emptyState) emptyState.style.display = 'flex';
      updateTotals();
      return;
    }

    if (tableWrapper) tableWrapper.style.display = 'block';
    if (cardsGrid) cardsGrid.style.display = 'grid';
    if (emptyState) emptyState.style.display = 'none';

    // 7.1 Render Tabela Desktop
    if (tbody) {
      tbody.innerHTML = cartItems.map((item, index) => {
        const itemPreco = Number(item.preco) || 0;
        const itemQtde = Number(item.quantidade) || 0;
        const subtotal = itemPreco * itemQtde;
        const lotesCount = item.lotes ? item.lotes.length : 0;
        const isStockLow = item.estoqueLoja <= 2;

        let lotesBadgeHtml = `
          <button type="button" class="btn-manage-lotes-table ${lotesCount > 0 ? 'has-lotes' : ''}" data-index="${index}" ${(!isEditMode || isReadOnly) ? 'disabled' : ''}>
            <span class="material-icons" style="font-size: 16px;">calendar_today</span>
            ${lotesCount > 0 ? `${lotesCount} Lote(s)` : 'Informar Validade'}
          </button>
        `;

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
            <td style="text-align: center;">
              <button type="button" class="btn-delete-item-row btn-remove-item" data-index="${index}" title="Remover produto do pedido">
                <span class="material-icons" style="font-size: 18px;">delete</span>
              </button>
            </td>
          `;
        }

        return `
          <tr data-index="${index}">
            <td style="text-align: center; color: #757575; font-size: 0.8rem; font-weight: 500;">${index + 1}</td>
            <td style="text-align: center;">
              <img src="${item.foto}" alt="${item.nome}" class="table-prod-thumb" onerror="this.src='../assets/images/logo-homepage.png'">
            </td>
            <td>
              <span class="table-prod-ean">${item.ean}</span>
            </td>
            <td>
              <div class="table-prod-info">
                <span class="table-prod-name">${item.nome}</span>
                <span class="table-prod-meta">${item.categoria || 'Geral'}</span>
              </div>
            </td>
            <td style="text-align: center;">
              <span class="stock-pill-loja ${isStockLow ? 'is-low' : ''}">${item.estoqueLoja} un</span>
            </td>
            <td style="text-align: right; font-weight: 500; color: #495057;">
              R$ ${itemPreco.toFixed(2).replace('.', ',')}
            </td>
            <td style="text-align: center;">
              ${qtyCellHtml}
            </td>
            <td style="text-align: right; font-weight: 700; color: #2e7d32;">
              R$ ${subtotal.toFixed(2).replace('.', ',')}
            </td>
            <td style="text-align: center;">
              ${lotesBadgeHtml}
            </td>
            ${actionCellHtml}
          </tr>
        `;
      }).join('');
    }

    // 7.2 Render Cards Mobile
    if (cardsGrid) {
      cardsGrid.innerHTML = cartItems.map((item, index) => {
        const itemPreco = Number(item.preco) || 0;
        const itemQtde = Number(item.quantidade) || 0;
        const subtotal = itemPreco * itemQtde;
        const lotesCount = item.lotes ? item.lotes.length : 0;

        return `
          <div class="order-mobile-product-card" data-index="${index}">
            <div class="mobile-card-top-row">
              <img src="${item.foto}" alt="${item.nome}" class="mobile-card-thumb" onerror="this.src='../assets/images/logo-homepage.png'">
              <div class="mobile-card-info">
                <h4 class="mobile-card-title">${item.nome}</h4>
                <div class="mobile-card-ean">EAN: ${item.ean}</div>
              </div>
            </div>

            <div class="mobile-card-metrics-row">
              <div class="mobile-metric-item">
                <span class="mobile-metric-label">Estoque Loja</span>
                <span class="mobile-metric-val">${item.estoqueLoja} un</span>
              </div>
              <div class="mobile-metric-item">
                <span class="mobile-metric-label">Preço Un.</span>
                <span class="mobile-metric-val">R$ ${itemPreco.toFixed(2).replace('.', ',')}</span>
              </div>
              <div class="mobile-metric-item">
                <span class="mobile-metric-label">Subtotal</span>
                <span class="mobile-metric-val" style="color: #2e7d32;">R$ ${subtotal.toFixed(2).replace('.', ',')}</span>
              </div>
            </div>

            <div class="mobile-card-bottom-actions">
              <button type="button" class="btn-manage-lotes-table ${lotesCount > 0 ? 'has-lotes' : ''}" data-index="${index}" ${(!isEditMode || isReadOnly) ? 'disabled' : ''}>
                <span class="material-icons" style="font-size: 15px;">calendar_today</span>
                ${lotesCount > 0 ? `${lotesCount} Lote(s)` : 'Validade'}
              </button>

              <div style="display: flex; align-items: center; gap: 8px;">
                ${(isEditMode && !isReadOnly) ? `
                  <div class="order-stepper-wrapper">
                    <button type="button" class="order-stepper-btn btn-minus" data-index="${index}">−</button>
                    <input type="number" class="order-stepper-input input-qty" data-index="${index}" value="${itemQtde}" min="1">
                    <button type="button" class="order-stepper-btn btn-plus" data-index="${index}">+</button>
                  </div>
                  <button type="button" class="btn-delete-item-row btn-remove-item" data-index="${index}">
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
  }

  // 8. Eventos Interativos da Lista de Produtos
  function bindProductRowEvents() {
    // Steppers Menos (-)
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

    // Steppers Mais (+)
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

    // Inputs Diretos de Quantidade
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

    // Botões de Remover Produto
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
  }

  // 9. Cálculo e Atualização dos Totais no Sticky Footer
  function updateTotals() {
    const totalSkus = cartItems.length;
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const totalMonetary = cartItems.reduce((acc, curr) => acc + ((Number(curr.preco) || 0) * (Number(curr.quantidade) || 0)), 0);

    if (footerSkusCount) footerSkusCount.textContent = totalSkus;
    if (footerUnitsCount) footerUnitsCount.textContent = `${totalUnits} un`;
    if (footerTotalValue) footerTotalValue.textContent = `R$ ${totalMonetary.toFixed(2).replace('.', ',')}`;
  }

  // 10. Bipe por Código de Barras (Omnibar)
  if (omnibarInput) {
    omnibarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = omnibarInput.value.trim();
        if (!query) return;

        // 1. Procura se já está no carrinho
        const existing = cartItems.find(p => p.ean === query || p.nome.toLowerCase() === query.toLowerCase());
        if (existing) {
          existing.quantidade += 1;
          if (typeof Toast !== 'undefined') {
            Toast.success(`+1 un: ${existing.nome.substring(0, 26)}...`);
          }
          omnibarInput.value = '';
          renderProducts();
          return;
        }

        // 2. Procura no catálogo mestre
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
    const term = query.toLowerCase();

    const filtered = rawCatalog.filter(p => {
      const matchText = !term || p.nome.toLowerCase().includes(term) || p.ean.includes(term);
      const cat = p.categoria || p.grupo || 'Outros';
      const matchCat = (selectedCategory === 'ALL') || cat.toLowerCase().includes(selectedCategory.toLowerCase());
      return matchText && matchCat;
    });

    if (filtered.length === 0) {
      catalogModalGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #757575;">
          <span class="material-icons" style="font-size: 36px; color: #bdbdbd; display: block; margin-bottom: 8px;">search_off</span>
          Nenhum produto encontrado no catálogo.
        </div>
      `;
      return;
    }

    catalogModalGrid.innerHTML = filtered.map(p => {
      const preco = Number(p.precoVenda || p.preco || 5.00);
      const inCart = cartItems.find(item => item.ean === p.ean);

      return `
        <div class="catalog-product-card" style="border: 1px solid #e9ecef; border-radius: 6px; padding: 10px; display: flex; align-items: center; justify-content: space-between; gap: 10px; background: #ffffff;">
          <div style="display: flex; align-items: center; gap: 10px; min-width: 0;">
            <img src="${p.foto}" alt="${p.nome}" style="width: 44px; height: 44px; border-radius: 4px; object-fit: cover;" onerror="this.src='../assets/images/logo-homepage.png'">
            <div style="min-width: 0;">
              <div style="font-weight: 600; font-size: 0.9rem; color: #212529; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${p.nome}</div>
              <div style="font-size: 0.76rem; color: #6530b5; font-family: monospace;">EAN: ${p.ean}</div>
              <div style="font-size: 0.85rem; font-weight: 700; color: #2e7d32;">R$ ${preco.toFixed(2).replace('.', ',')}</div>
            </div>
          </div>

          <button type="button" class="btn-add-catalog-item" data-ean="${p.ean}" style="background-color: ${inCart ? '#edf7ed' : '#6530b5'}; color: ${inCart ? '#2e7d32' : '#ffffff'}; border: ${inCart ? '1px solid #a5d6a7' : 'none'}; padding: 6px 12px; border-radius: 4px; font-weight: 700; font-size: 0.8rem; cursor: pointer; white-space: nowrap;">
            ${inCart ? 'Adicionado ✓' : '+ Adicionar'}
          </button>
        </div>
      `;
    }).join('');

    // Eventos de adicionar item pelo catálogo
    const addBtns = catalogModalGrid.querySelectorAll('.btn-add-catalog-item');
    addBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const ean = btn.getAttribute('data-ean');
        const prod = rawCatalog.find(p => p.ean === ean);
        if (!prod) return;

        const existing = cartItems.find(item => item.ean === ean);
        if (existing) {
          existing.quantidade += 1;
          if (typeof Toast !== 'undefined') Toast.success(`+1 un: ${prod.nome.substring(0, 24)}...`);
        } else {
          cartItems.unshift({
            id: Date.now(),
            nome: prod.nome,
            ean: prod.ean,
            foto: prod.foto,
            categoria: prod.categoria || prod.grupo || 'Geral',
            estoqueLoja: prod.estoqueLoja !== undefined ? prod.estoqueLoja : 0,
            preco: prod.precoVenda || prod.preco || 5.00,
            quantidade: 1,
            lotes: []
          });
          if (typeof Toast !== 'undefined') Toast.success(`Produto adicionado: ${prod.nome.substring(0, 24)}...`);
        }

        renderProducts();
        renderCatalogGrid(catalogSearchInput ? catalogSearchInput.value : '');
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

  // 12. Modal de Gerenciamento de Lotes e Validades
  function openLotesModal(item) {
    currentEditingItemForLotes = item;
    temporaryLotes = item.lotes ? JSON.parse(JSON.stringify(item.lotes)) : [];

    const lotesModalProdImg = document.getElementById('lotesModalProdImg');
    const lotesModalProdName = document.getElementById('lotesModalProdName');
    const lotesModalProdEan = document.getElementById('lotesModalProdEan');

    if (lotesModalProdImg) lotesModalProdImg.src = item.foto || '../assets/images/logo-homepage.png';
    if (lotesModalProdName) lotesModalProdName.textContent = item.nome;
    if (lotesModalProdEan) lotesModalProdEan.textContent = `EAN: ${item.ean}`;

    if (temporaryLotes.length === 0) {
      temporaryLotes.push({
        codigo: `LOTE-${new Date().getFullYear()}-01`,
        quantidade: item.quantidade,
        fabricacao: '',
        validade: ''
      });
    }

    renderLotesRows();
    if (modalGerenciarLotes) modalGerenciarLotes.classList.add('show', 'active');
  }

  function closeLotesModal() {
    if (modalGerenciarLotes) modalGerenciarLotes.classList.remove('show', 'active');
  }

  function renderLotesRows() {
    if (!lotesTableBody || !currentEditingItemForLotes) return;

    lotesTableBody.innerHTML = temporaryLotes.map((lote, idx) => `
      <tr>
        <td>
          <input type="text" class="input-field input-lote-cod" data-idx="${idx}" value="${lote.codigo || ''}" placeholder="Ex: LOT-102">
        </td>
        <td>
          <input type="number" class="input-field input-lote-qty" data-idx="${idx}" value="${lote.quantidade || 0}" min="1">
        </td>
        <td>
          <input type="date" class="input-field input-lote-fab" data-idx="${idx}" value="${lote.fabricacao || ''}">
        </td>
        <td>
          <input type="date" class="input-field input-lote-val" data-idx="${idx}" value="${lote.validade || ''}">
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-delete-item-row btn-remove-lote-row" data-idx="${idx}" title="Excluir lote">
            <span class="material-icons" style="font-size: 16px;">close</span>
          </button>
        </td>
      </tr>
    `).join('');

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
          temporaryLotes[idx].quantidade = parseInt(inp.value, 10) || 0;
          updateLotesAllocationProgress();
        }
      });
    });

    const valInputs = lotesTableBody.querySelectorAll('.input-lote-val');
    valInputs.forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        if (temporaryLotes[idx]) temporaryLotes[idx].validade = inp.value;
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

    updateLotesAllocationProgress();
  }

  function updateLotesAllocationProgress() {
    if (!currentEditingItemForLotes) return;
    const required = Number(currentEditingItemForLotes.quantidade) || 0;
    const allocated = temporaryLotes.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);

    if (lotesCounterText) lotesCounterText.textContent = `${allocated} / ${required}`;

    const percent = Math.min(100, Math.round((allocated / (required || 1)) * 100));
    if (lotesBarFill) lotesBarFill.style.width = `${percent}%`;

    if (lotesAllocationBadge) {
      if (allocated === required) {
        lotesAllocationBadge.className = 'allocation-badge complete';
        lotesAllocationBadge.textContent = 'Alocado Completo ✓';
      } else if (allocated > required) {
        lotesAllocationBadge.className = 'allocation-badge warning';
        lotesAllocationBadge.textContent = `Excedente (+${allocated - required})`;
      } else {
        lotesAllocationBadge.className = 'allocation-badge pending';
        lotesAllocationBadge.textContent = `Pendente (${required - allocated} un)`;
      }
    }
  }

  function addEmptyLoteRow() {
    temporaryLotes.push({
      codigo: `LOTE-${new Date().getFullYear()}-${String(temporaryLotes.length + 1).padStart(2, '0')}`,
      quantidade: 1,
      fabricacao: '',
      validade: ''
    });
    renderLotesRows();
  }

  if (btnModalAddLote) btnModalAddLote.addEventListener('click', addEmptyLoteRow);
  if (btnTableAddLote) btnTableAddLote.addEventListener('click', addEmptyLoteRow);
  if (btnCloseLotesModal) btnCloseLotesModal.addEventListener('click', closeLotesModal);
  if (btnCancelLotes) btnCancelLotes.addEventListener('click', closeLotesModal);

  if (btnSaveLotes) {
    btnSaveLotes.addEventListener('click', () => {
      if (!currentEditingItemForLotes) return;
      currentEditingItemForLotes.lotes = JSON.parse(JSON.stringify(temporaryLotes));
      closeLotesModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Validades e lotes atualizados para "${currentEditingItemForLotes.nome.substring(0, 24)}...".`);
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
        Toast.success(`Rascunho do pedido ${currentOrderCode} salvo com sucesso!`);
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
