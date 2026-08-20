/**
 * GOFLASH CORE - ABASTECIMENTO CONTROLLER
 * Controlador oficial para Listagem, Modal Novo Plano, Detalhes,
 * Modo de Edição Inline/Lote e Modal de Inserção Multicritério.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Visões Principais
  const planListView = document.getElementById('planListView');
  const planDetailView = document.getElementById('planDetailView');
  const pageSearchInput = document.getElementById('pageSearchInput');

  // Elementos da Lista (Imagem 1)
  const plansTableBody = document.getElementById('plansTableBody');
  const breadcrumbCount = document.getElementById('breadcrumbCount');
  const fabRedAdd = document.getElementById('fabRedAdd');

  // Elementos do Modal NOVO PLANO (Imagem 2)
  const newPlanModal = document.getElementById('newPlanModal');
  const btnCloseNewModal = document.getElementById('btnCloseNewModal');
  const btnDiscardNewModal = document.getElementById('btnDiscardNewModal');
  const btnFinalizeNewModal = document.getElementById('btnFinalizeNewModal');
  const inputModalName = document.getElementById('inputModalName');
  const inputModalDesc = document.getElementById('inputModalDesc');
  const selectModalFilial = document.getElementById('selectModalFilial');
  const selectModalCopyPlan = document.getElementById('selectModalCopyPlan');

  // Elementos da Tela de Detalhes (Imagem 3)
  const detailBreadcrumbLink = document.getElementById('detailBreadcrumbLink');
  const detailPlanName = document.getElementById('detailPlanName');
  const detailPlanDesc = document.getElementById('detailPlanDesc');
  const detailPlanCode = document.getElementById('detailPlanCode');
  const detailPlanFilial = document.getElementById('detailPlanFilial');
  const detailPlanAtivo = document.getElementById('detailPlanAtivo');
  const detailProductsTableHead = document.getElementById('detailProductsTableHead');
  const detailProductsTableBody = document.getElementById('detailProductsTableBody');
  const productsTableCard = document.getElementById('productsTableCard');
  const productsCardsGrid = document.getElementById('productsCardsGrid');
  const btnToggleProductsView = document.getElementById('btnToggleProductsView');
  const toggleViewIcon = document.getElementById('toggleViewIcon');
  const toggleViewLabel = document.getElementById('toggleViewLabel');
  const fabEditHero = document.getElementById('fabEditHero');

  // Elementos do MODO DE EDIÇÃO
  const editModeActionsGroup = document.getElementById('editModeActionsGroup');
  const editModeBannerAlert = document.getElementById('editModeBannerAlert');
  const btnSaveEditMode = document.getElementById('btnSaveEditMode');
  const btnCancelEditMode = document.getElementById('btnCancelEditMode');
  const btnOpenAddProducts = document.getElementById('btnOpenAddProducts');

  // Elementos da Barra Flutuante em Lote (Sticky Batch Bar)
  const stickyBatchBar = document.getElementById('stickyBatchBar');
  const batchCountBadge = document.getElementById('batchCountBadge');
  const btnOpenBatchEdit = document.getElementById('btnOpenBatchEdit');
  const btnDeleteBatch = document.getElementById('btnDeleteBatch');
  const btnUncheckBatch = document.getElementById('btnUncheckBatch');

  // Modal de Edição em Lote de Estoque
  const batchEditModal = document.getElementById('batchEditModal');
  const btnCloseBatchEdit = document.getElementById('btnCloseBatchEdit');
  const btnCancelBatchEdit = document.getElementById('btnCancelBatchEdit');
  const btnApplyBatchEdit = document.getElementById('btnApplyBatchEdit');
  const batchIdealInput = document.getElementById('batchIdealInput');
  const batchMinInput = document.getElementById('batchMinInput');

  // Modal Multicritério de Inserção de Produtos
  const addProductsModal = document.getElementById('addProductsModal');
  const btnCloseAddModal = document.getElementById('btnCloseAddModal');
  const btnCancelAddModal = document.getElementById('btnCancelAddModal');
  const btnConfirmAddProducts = document.getElementById('btnConfirmAddProducts');
  const addModalSearch = document.getElementById('addModalSearch');
  const addModalGroup = document.getElementById('addModalGroup');
  const addModalBrand = document.getElementById('addModalBrand');
  const addModalSupplier = document.getElementById('addModalSupplier');
  const addModalDefaultIdeal = document.getElementById('addModalDefaultIdeal');
  const addModalDefaultMin = document.getElementById('addModalDefaultMin');
  const addModalProductsBody = document.getElementById('addModalProductsBody');
  const addModalCountSelected = document.getElementById('addModalCountSelected');
  const btnSelectAllFiltered = document.getElementById('btnSelectAllFiltered');

  // Estado Local
  let planos = AbastecimentoMock.getPlanos();
  let currentActivePlanId = null;
  let isCardViewMode = false;
  let isEditMode = false;
  let tempPlanItems = []; // Itens em edição temporária
  let selectedItemIndices = new Set(); // Índices selecionados para lote
  let modalSelectedProductIds = new Set(); // IDs selecionados no modal de adição

  /**
   * Inicialização e Roteamento de Sub-Visões
   */
  function init() {
    populateModalSelects();
    setupEventListeners();

    // Registra o manipulador de sub-visões no NavigationManager
    if (window.NavigationManager) {
      window.NavigationManager.onViewChange((state) => {
        handleRouteState(state);
      });

      window.NavigationManager.registerSubViewHandler(() => {
        // Se estivermos visualizando os detalhes de um plano, retorna para a lista
        if (currentActivePlanId !== null) {
          showListView(true);
          return true; // Tratado internamente: permanece na tela de planos
        }
        // Se já estiver na listagem, retorna false para o NavigationManager desempilhar para Operação
        return false;
      });
    }

    // Processa a rota inicial no carregamento da página
    handleRouteState(window.history.state);
  }

  /**
   * Processa o estado da rota / URL
   */
  function handleRouteState(state) {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = (state && state.id) || urlParams.get('id');

    if (planId) {
      showDetailView(planId, false);
    } else {
      showListView(false);
    }
  }

  /**
   * Popula os selects dentro do modal novo plano
   */
  function populateModalSelects() {
    if (selectModalFilial) {
      selectModalFilial.innerHTML = '<option value="">Filial</option>';
      AbastecimentoMock.filiais.forEach(f => {
        selectModalFilial.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
      });
    }

    if (selectModalCopyPlan) {
      selectModalCopyPlan.innerHTML = '<option value="">Digite para pesquisar um plano...</option>';
      planos.forEach(p => {
        selectModalCopyPlan.innerHTML += `<option value="${p.id}">${p.codigo} - ${p.nome} (${p.itens.length} itens)</option>`;
      });
    }
  }

  /**
   * Exibe a Tela de Listagem (Imagem 1)
   */
  function showListView(updateHistory = true) {
    currentActivePlanId = null;
    isEditMode = false;
    selectedItemIndices.clear();

    if (planDetailView) planDetailView.classList.remove('show');
    if (planListView) planListView.style.display = 'block';
    if (fabRedAdd) fabRedAdd.style.display = 'flex';
    if (stickyBatchBar) stickyBatchBar.classList.remove('show');

    if (updateHistory && window.NavigationManager) {
      window.NavigationManager.replaceSubView({ view: 'list' }, 'Plano de Abastecimento', 'planos-abastecimento.html');
    }

    renderPlansTable();
  }

  /**
   * Renderiza a Tabela Oficial de Planos (Imagem 1)
   */
  function renderPlansTable() {
    const term = (pageSearchInput?.value || '').toLowerCase().trim();

    const filtered = planos.filter(p => {
      return p.nome.toLowerCase().includes(term) ||
             p.codigo.toLowerCase().includes(term) ||
             p.filialNome.toLowerCase().includes(term);
    });

    if (breadcrumbCount) {
      breadcrumbCount.textContent = `> ${filtered.length} item(s)`;
    }

    if (!plansTableBody) return;

    if (filtered.length === 0) {
      plansTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem; color: #757575;">
            Nenhum plano de abastecimento encontrado.
          </td>
        </tr>
      `;
      return;
    }

    plansTableBody.innerHTML = filtered.map((p, index) => {
      const itemCount = p.itens ? p.itens.length : 0;
      return `
        <tr onclick="window.AbastecimentoController.showDetailView('${p.id}')">
          <td class="col-num-indicator">${index + 1}</td>
          <td>
            <div class="plan-name-flex">
              <span class="material-icons plan-doc-icon">description</span>
              <div>
                <span class="plan-code-bold">${p.codigo}</span>
                <span class="plan-title-text">${p.nome}</span>
              </div>
            </div>
          </td>
          <td>
            <span style="color: #424242;">${p.filialNome}</span>
          </td>
          <td style="color: #424242;">
            ${itemCount}
          </td>
          <td style="color: #616161;">
            ${p.dataCriacao || '-'}
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Alterna entre visualização de Tabela e Cards Atraentes
   */
  function toggleProductsView() {
    isCardViewMode = !isCardViewMode;
    applyProductsViewMode();
    if (typeof Toast !== 'undefined') {
      Toast.info(isCardViewMode ? 'Modo de visualização em Cards ativado.' : 'Modo de visualização em Tabela ativado.');
    }
  }

  function applyProductsViewMode() {
    if (!productsTableCard || !productsCardsGrid) return;

    if (isCardViewMode) {
      productsTableCard.style.display = 'none';
      productsCardsGrid.classList.add('show');
      if (toggleViewIcon) toggleViewIcon.textContent = 'view_list';
      if (toggleViewLabel) toggleViewLabel.textContent = 'Ver em Tabela';
      if (btnToggleProductsView) btnToggleProductsView.classList.add('active');
    } else {
      productsTableCard.style.display = 'block';
      productsCardsGrid.classList.remove('show');
      if (toggleViewIcon) toggleViewIcon.textContent = 'grid_view';
      if (toggleViewLabel) toggleViewLabel.textContent = 'Ver em Cards';
      if (btnToggleProductsView) btnToggleProductsView.classList.remove('active');
    }
  }

  /**
   * Exibe a Tela de Detalhes do Plano (Imagem 3)
   */
  function showDetailView(planId, pushToHistory = true) {
    const plano = planos.find(p => p.id === planId);
    if (!plano) return;

    currentActivePlanId = planId;
    isEditMode = false;
    selectedItemIndices.clear();
    tempPlanItems = JSON.parse(JSON.stringify(plano.itens || []));

    if (planListView) planListView.style.display = 'none';
    if (fabRedAdd) fabRedAdd.style.display = 'none';
    if (planDetailView) planDetailView.classList.add('show');

    // Registra sub-visão no NavigationManager se for navegação explícita
    if (pushToHistory && window.NavigationManager) {
      window.NavigationManager.pushSubView(
        { view: 'detail', id: planId },
        `${plano.codigo} - ${plano.nome}`,
        `?id=${planId}`
      );
    }

    // Estado da Interface de Edição
    if (fabEditHero) fabEditHero.style.display = 'flex';
    if (editModeActionsGroup) editModeActionsGroup.classList.remove('show');
    if (editModeBannerAlert) editModeBannerAlert.classList.remove('show');
    if (stickyBatchBar) stickyBatchBar.classList.remove('show');

    // Preenche dados do Hero Card Roxo
    if (detailPlanName) detailPlanName.textContent = plano.nome;
    if (detailPlanDesc) detailPlanDesc.textContent = plano.descricao || 'Nenhuma descrição informada';
    if (detailPlanCode) detailPlanCode.textContent = plano.codigo;
    if (detailPlanFilial) detailPlanFilial.textContent = plano.filialNome;
    if (detailPlanAtivo) detailPlanAtivo.innerHTML = plano.status === 'ativo' ? '<span class="material-icons">check</span>' : '';

    applyProductsViewMode();
    renderDetailProducts(tempPlanItems);
  }

  /**
   * ATIVA O MODO DE EDIÇÃO
   */
  function enterEditMode(silent = false) {
    isEditMode = true;
    selectedItemIndices.clear();
    const plano = planos.find(p => p.id === currentActivePlanId);
    tempPlanItems = JSON.parse(JSON.stringify(plano ? plano.itens || [] : []));

    if (fabEditHero) fabEditHero.style.display = 'none';
    if (editModeActionsGroup) editModeActionsGroup.classList.add('show');
    if (editModeBannerAlert) editModeBannerAlert.classList.add('show');

    renderDetailProducts(tempPlanItems);
    if (!silent && typeof Toast !== 'undefined') {
      Toast.info('Modo de Edição ativado. Altere as quantidades ou selecione itens em lote.');
    }
  }

  /**
   * CANCELA O MODO DE EDIÇÃO
   */
  function cancelEditMode() {
    isEditMode = false;
    selectedItemIndices.clear();
    const plano = planos.find(p => p.id === currentActivePlanId);
    tempPlanItems = JSON.parse(JSON.stringify(plano ? plano.itens || [] : []));

    if (fabEditHero) fabEditHero.style.display = 'flex';
    if (editModeActionsGroup) editModeActionsGroup.classList.remove('show');
    if (editModeBannerAlert) editModeBannerAlert.classList.remove('show');
    if (stickyBatchBar) stickyBatchBar.classList.remove('show');

    renderDetailProducts(tempPlanItems);
    if (typeof Toast !== 'undefined') Toast.info('Edição cancelada.');
  }

  /**
   * SALVA AS ALTERAÇÕES DO MODO DE EDIÇÃO
   */
  function saveEditMode() {
    const plano = planos.find(p => p.id === currentActivePlanId);
    if (!plano) return;

    plano.itens = JSON.parse(JSON.stringify(tempPlanItems));
    const now = new Date();
    plano.dataAtualizacao = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    AbastecimentoMock.savePlanos(planos);

    isEditMode = false;
    selectedItemIndices.clear();

    if (fabEditHero) fabEditHero.style.display = 'flex';
    if (editModeActionsGroup) editModeActionsGroup.classList.remove('show');
    if (editModeBannerAlert) editModeBannerAlert.classList.remove('show');
    if (stickyBatchBar) stickyBatchBar.classList.remove('show');

    renderDetailProducts(plano.itens);
    if (typeof Toast !== 'undefined') {
      Toast.success('Plano de abastecimento atualizado com sucesso!');
    }
  }

  /**
   * Renderiza a Tabela e os Cards de Produtos
   */
  function renderDetailProducts(itens) {
    // 0. Renderiza Cabeçalho Dinâmico
    if (detailProductsTableHead) {
      if (isEditMode) {
        detailProductsTableHead.innerHTML = `
          <tr>
            <th style="width: 44px; text-align: center;">
              <input type="checkbox" id="selectAllPlanItems" class="table-custom-checkbox" title="Marcar / Desmarcar Todos" onchange="window.AbastecimentoController.toggleSelectAllItems(this.checked)">
            </th>
            <th style="width: 18%;">Código</th>
            <th style="width: 36%;">Produto</th>
            <th style="width: 12%;">Grupo</th>
            <th style="width: 130px; text-align: center;">Estoque Ideal</th>
            <th style="width: 130px; text-align: center;">Minimo Crítico</th>
            <th style="width: 50px; text-align: center;">Ações</th>
          </tr>
        `;
      } else {
        detailProductsTableHead.innerHTML = `
          <tr>
            <th style="width: 22%;">Código</th>
            <th style="width: 44%;">Produto</th>
            <th style="width: 14%;">Grupo</th>
            <th style="width: 10%; text-align: center;">Estoque Ideal</th>
            <th style="width: 10%; text-align: center;">Minimo Crítico</th>
          </tr>
        `;
      }
    }

    // 1. Tabela
    if (detailProductsTableBody) {
      if (itens.length === 0) {
        detailProductsTableBody.innerHTML = `
          <tr>
            <td colspan="${isEditMode ? 7 : 5}" style="text-align: center; padding: 3rem; color: #757575;">
              <span class="material-icons" style="font-size: 40px; color: #b0bec5; display: block; margin-bottom: 6px;">inventory_2</span>
              Nenhum produto no plano. Clique em "+ Adicionar Produtos" no topo para incluir itens.
            </td>
          </tr>
        `;
      } else {
        detailProductsTableBody.innerHTML = itens.map((item, idx) => {
          const prod = AbastecimentoMock.getProdutoById(item.produtoId);
          if (!prod) return '';
          const isChecked = selectedItemIndices.has(idx);

          return `
            <tr>
              ${isEditMode ? `
                <td style="width: 44px; text-align: center;">
                  <input type="checkbox" class="item-select-checkbox table-custom-checkbox" ${isChecked ? 'checked' : ''} onchange="window.AbastecimentoController.toggleItemSelection(${idx})">
                </td>
              ` : ''}
              <td>
                <div class="product-code-cell">
                  <div class="product-thumb-box">
                    <img src="${prod.imagem || '../assets/images/products/monster-mango.jpg'}" alt="${prod.nome}" class="product-thumb-img" onerror="this.style.display='none';">
                  </div>
                  <a href="#" class="product-ean-link" onclick="event.preventDefault();">${prod.ean}</a>
                </div>
              </td>
              <td>
                <span class="product-name-bold">${prod.nome}</span>
              </td>
              <td>
                <span class="product-group-tag">${prod.grupo}</span>
              </td>
              <td style="text-align: center;">
                ${isEditMode ? `
                  <div class="inline-stepper-control">
                    <button type="button" class="btn-stepper-touch" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', -1)">&minus;</button>
                    <input type="number" class="input-stepper-number" value="${item.estoqueIdeal}" min="1" onchange="window.AbastecimentoController.setItemQty(${idx}, 'ideal', this.value)">
                    <button type="button" class="btn-stepper-touch" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', 1)">+</button>
                  </div>
                ` : `
                  <span class="pill-ideal">${item.estoqueIdeal}</span>
                `}
              </td>
              <td style="text-align: center;">
                ${isEditMode ? `
                  <div class="inline-stepper-control">
                    <button type="button" class="btn-stepper-touch" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', -1)">&minus;</button>
                    <input type="number" class="input-stepper-number" value="${item.estoqueMinimo}" min="0" onchange="window.AbastecimentoController.setItemQty(${idx}, 'min', this.value)">
                    <button type="button" class="btn-stepper-touch" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', 1)">+</button>
                  </div>
                ` : `
                  <span class="pill-minimo">${item.estoqueMinimo}</span>
                `}
              </td>
              ${isEditMode ? `
                <td style="width: 50px; text-align: center;">
                  <button type="button" class="btn-remove-item-row" title="Remover item" onclick="window.AbastecimentoController.removeSingleItem(${idx})">
                    <span class="material-icons">delete_outline</span>
                  </button>
                </td>
              ` : ''}
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Cards Atraentes
    if (productsCardsGrid) {
      if (itens.length === 0) {
        productsCardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; background: #fff; border-radius: 6px; color: #757575;">
            <span class="material-icons" style="font-size: 40px; color: #b0bec5; display: block; margin-bottom: 6px;">inventory_2</span>
            Nenhum produto cadastrado no plano.
          </div>
        `;
      } else {
        productsCardsGrid.innerHTML = itens.map((item, idx) => {
          const prod = AbastecimentoMock.getProdutoById(item.produtoId);
          if (!prod) return '';
          const isChecked = selectedItemIndices.has(idx);

          return `
            <article class="product-card-item">
              <div class="product-card-image-wrap">
                <span class="product-card-category-badge">${prod.grupo}</span>
                ${isEditMode ? `
                  <div class="product-card-checkbox-wrap">
                    <input type="checkbox" class="item-select-checkbox" ${isChecked ? 'checked' : ''} onchange="window.AbastecimentoController.toggleItemSelection(${idx})">
                  </div>
                ` : ''}
                <img src="${prod.imagem || '../assets/images/products/monster-mango.jpg'}" alt="${prod.nome}" class="product-card-img">
              </div>
              
              <div class="product-card-body">
                <div class="product-card-info-top">
                  <a href="#" class="product-card-ean" onclick="event.preventDefault();">
                    <span class="material-icons" style="font-size: 14px;">qr_code_2</span>
                    ${prod.ean}
                  </a>
                  <h3 class="product-card-name" title="${prod.nome}">${prod.nome}</h3>
                </div>

                <div class="product-card-metrics">
                  <div class="product-card-metric-box metric-ideal">
                    <span class="metric-label-title">Estoque Ideal</span>
                    ${isEditMode ? `
                      <div class="inline-stepper-control" style="background:#fff; margin-top:2px;">
                        <button type="button" class="btn-stepper-touch" style="width:26px; height:26px;" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', -1)">&minus;</button>
                        <input type="number" class="input-stepper-number" style="width:36px; height:24px; font-size:0.85rem;" value="${item.estoqueIdeal}" min="1" onchange="window.AbastecimentoController.setItemQty(${idx}, 'ideal', this.value)">
                        <button type="button" class="btn-stepper-touch" style="width:26px; height:26px;" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', 1)">+</button>
                      </div>
                    ` : `
                      <span class="metric-value-num">${item.estoqueIdeal}</span>
                    `}
                  </div>

                  <div class="product-card-metric-box metric-minimo">
                    <span class="metric-label-title">Mín. Crítico</span>
                    ${isEditMode ? `
                      <div class="inline-stepper-control" style="background:#fff; margin-top:2px;">
                        <button type="button" class="btn-stepper-touch" style="width:26px; height:26px;" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', -1)">&minus;</button>
                        <input type="number" class="input-stepper-number" style="width:36px; height:24px; font-size:0.85rem;" value="${item.estoqueMinimo}" min="0" onchange="window.AbastecimentoController.setItemQty(${idx}, 'min', this.value)">
                        <button type="button" class="btn-stepper-touch" style="width:26px; height:26px;" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', 1)">+</button>
                      </div>
                    ` : `
                      <span class="metric-value-num">${item.estoqueMinimo}</span>
                    `}
                  </div>
                </div>

                ${isEditMode ? `
                  <button type="button" style="width:100%; height:32px; background:#ffebee; color:#d32f2f; border-radius:4px; font-size:0.78rem; font-weight:600; cursor:pointer; display:flex; align-items:center; justify-content:center; gap:4px;" onclick="window.AbastecimentoController.removeSingleItem(${idx})">
                    <span class="material-icons" style="font-size:16px;">delete_outline</span> Remover Item
                  </button>
                ` : ''}
              </div>
            </article>
          `;
        }).join('');
      }
    }
  }

  /**
   * Atualiza a Barra Flutuante de Ações em Lote (Sticky Batch Bar)
   */
  function updateBatchBar() {
    const count = selectedItemIndices.size;
    const total = tempPlanItems.length;

    // Sincroniza checkbox mestre do cabeçalho
    const selectAllChk = document.getElementById('selectAllPlanItems');
    if (selectAllChk) {
      if (total === 0 || count === 0) {
        selectAllChk.checked = false;
        selectAllChk.indeterminate = false;
      } else if (count === total) {
        selectAllChk.checked = true;
        selectAllChk.indeterminate = false;
      } else {
        selectAllChk.checked = false;
        selectAllChk.indeterminate = true;
      }
    }

    if (!stickyBatchBar) return;

    if (count > 0 && isEditMode) {
      batchCountBadge.textContent = `${count} selecionado${count > 1 ? 's' : ''}`;
      stickyBatchBar.classList.add('show');
    } else {
      stickyBatchBar.classList.remove('show');
    }
  }

  /**
   * AÇÕES EM LOTE: Edição de Estoque em Lote
   */
  function openBatchEditModal() {
    if (selectedItemIndices.size === 0) return;
    batchIdealInput.value = '12';
    batchMinInput.value = '3';
    batchEditModal.classList.add('show');
    batchIdealInput.focus();
  }

  function closeBatchEditModal() {
    batchEditModal.classList.remove('show');
  }

  function applyBatchEdit() {
    const newIdeal = parseInt(batchIdealInput.value, 10) || 12;
    const newMin = parseInt(batchMinInput.value, 10) || 3;

    selectedItemIndices.forEach(idx => {
      if (tempPlanItems[idx]) {
        tempPlanItems[idx].estoqueIdeal = Math.max(1, newIdeal);
        tempPlanItems[idx].estoqueMinimo = Math.max(0, newMin);
      }
    });

    closeBatchEditModal();
    renderDetailProducts(tempPlanItems);
    if (typeof Toast !== 'undefined') {
      Toast.success(`Estoque atualizado em lote para ${selectedItemIndices.size} itens!`);
    }
  }

  function deleteBatchSelected() {
    if (selectedItemIndices.size === 0) return;

    if (confirm(`Deseja remover os ${selectedItemIndices.size} produtos selecionados do plano?`)) {
      tempPlanItems = tempPlanItems.filter((_, idx) => !selectedItemIndices.has(idx));
      selectedItemIndices.clear();
      updateBatchBar();
      renderDetailProducts(tempPlanItems);
      if (typeof Toast !== 'undefined') {
        Toast.warning('Produtos removidos do plano.');
      }
    }
  }

  function uncheckAllBatch() {
    selectedItemIndices.clear();
    updateBatchBar();
    renderDetailProducts(tempPlanItems);
  }

  /**
   * MODAL MULTICRITÉRIO DE INSERÇÃO DE PRODUTOS
   */
  function openAddProductsModal() {
    modalSelectedProductIds.clear();
    addModalDefaultIdeal.value = '12';
    addModalDefaultMin.value = '3';
    addModalSearch.value = '';

    // Popula Filtros de Grupos, Marcas e Fornecedores
    if (addModalGroup) {
      addModalGroup.innerHTML = '<option value="">Todos os Grupos</option>';
      AbastecimentoMock.categorias.forEach(c => {
        addModalGroup.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
      });
    }

    if (addModalBrand) {
      addModalBrand.innerHTML = '<option value="">Todas as Marcas</option>';
      AbastecimentoMock.marcas.forEach(m => {
        addModalBrand.innerHTML += `<option value="${m.nome}">${m.nome}</option>`;
      });
    }

    if (addModalSupplier) {
      addModalSupplier.innerHTML = '<option value="">Todos os Fornecedores</option>';
      AbastecimentoMock.fornecedores.forEach(f => {
        addModalSupplier.innerHTML += `<option value="${f.nome}">${f.nome}</option>`;
      });
    }

    renderModalProductsList();
    addProductsModal.classList.add('show');
  }

  function closeAddProductsModal() {
    addProductsModal.classList.remove('show');
  }

  function renderModalProductsList() {
    if (!addModalProductsBody) return;

    const term = (addModalSearch?.value || '').toLowerCase().trim();
    const group = addModalGroup?.value || '';
    const brand = addModalBrand?.value || '';
    const supplier = addModalSupplier?.value || '';

    // Filtra catálogo completo
    const filtered = AbastecimentoMock.produtos.filter(p => {
      const matchText = p.nome.toLowerCase().includes(term) || p.ean.includes(term);
      const matchGroup = !group || p.grupo === group;
      const matchBrand = !brand || p.marca === brand;
      const matchSupplier = !supplier || p.fornecedor === supplier;
      return matchText && matchGroup && matchBrand && matchSupplier;
    });

    if (addModalCountSelected) {
      addModalCountSelected.textContent = `${modalSelectedProductIds.size} produto(s) selecionado(s)`;
    }

    if (filtered.length === 0) {
      addModalProductsBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #757575;">
            Nenhum produto encontrado com os filtros selecionados.
          </td>
        </tr>
      `;
      return;
    }

    // IDs já presentes no plano atual
    const existingIds = new Set(tempPlanItems.map(i => i.produtoId));

    addModalProductsBody.innerHTML = filtered.map(p => {
      const isAlreadyInPlan = existingIds.has(p.id);
      const isChecked = modalSelectedProductIds.has(p.id);

      return `
        <tr style="${isAlreadyInPlan ? 'background: #f9f9fb; opacity: 0.85;' : ''}">
          <td style="width: 40px; text-align: center;">
            <input type="checkbox" class="item-select-checkbox" ${isChecked ? 'checked' : ''} onchange="window.AbastecimentoController.toggleModalProductSelect('${p.id}')">
          </td>
          <td>
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${p.imagem}" alt="${p.nome}" style="width: 34px; height: 34px; object-fit: contain; border: 1px solid #eee; border-radius: 4px;">
              <div>
                <span style="font-weight: 600; color: #212121;">${p.nome}</span>
                ${isAlreadyInPlan ? '<span class="already-added-tag">Já no Plano</span>' : ''}
              </div>
            </div>
          </td>
          <td><span style="font-size: 0.8rem; font-weight: 600; color: #424242;">${p.grupo}</span></td>
          <td><span style="font-size: 0.8rem; color: #616161;">${p.marca}</span></td>
          <td><span style="font-size: 0.8rem; color: #757575;">${p.fornecedor}</span></td>
        </tr>
      `;
    }).join('');
  }

  function toggleModalProductSelect(productId) {
    if (modalSelectedProductIds.has(productId)) {
      modalSelectedProductIds.delete(productId);
    } else {
      modalSelectedProductIds.add(productId);
    }
    renderModalProductsList();
  }

  function selectAllFilteredProducts() {
    const term = (addModalSearch?.value || '').toLowerCase().trim();
    const group = addModalGroup?.value || '';
    const brand = addModalBrand?.value || '';
    const supplier = addModalSupplier?.value || '';

    const filtered = AbastecimentoMock.produtos.filter(p => {
      const matchText = p.nome.toLowerCase().includes(term) || p.ean.includes(term);
      const matchGroup = !group || p.grupo === group;
      const matchBrand = !brand || p.marca === brand;
      const matchSupplier = !supplier || p.fornecedor === supplier;
      return matchText && matchGroup && matchBrand && matchSupplier;
    });

    filtered.forEach(p => modalSelectedProductIds.add(p.id));
    renderModalProductsList();
    if (typeof Toast !== 'undefined') {
      Toast.info(`${modalSelectedProductIds.size} produtos selecionados.`);
    }
  }

  function insertSelectedProductsToPlan() {
    if (modalSelectedProductIds.size === 0) {
      if (typeof Toast !== 'undefined') Toast.warning('Selecione ao menos um produto para adicionar.');
      return;
    }

    const defaultIdeal = parseInt(addModalDefaultIdeal.value, 10) || 12;
    const defaultMin = parseInt(addModalDefaultMin.value, 10) || 3;
    let addedCount = 0;

    modalSelectedProductIds.forEach(prodId => {
      const exists = tempPlanItems.find(i => i.produtoId === prodId);
      if (!exists) {
        tempPlanItems.push({
          produtoId: prodId,
          estoqueIdeal: defaultIdeal,
          estoqueMinimo: defaultMin
        });
        addedCount++;
      }
    });

    closeAddProductsModal();
    renderDetailProducts(tempPlanItems);

    if (typeof Toast !== 'undefined') {
      Toast.success(`${addedCount} novos produtos inseridos no plano com Estoque Ideal ${defaultIdeal} e Mínimo ${defaultMin}!`);
    }
  }

  /**
   * Modal NOVO PLANO (Imagem 2)
   */
  function openNewPlanModal() {
    inputModalName.value = '';
    inputModalDesc.value = '';
    selectModalFilial.value = '';
    selectModalCopyPlan.value = '';
    populateModalSelects();
    newPlanModal.classList.add('show');
    inputModalName.focus();
  }

  function closeNewPlanModal() {
    newPlanModal.classList.remove('show');
  }

  function finalizeNewPlan() {
    const nome = inputModalName.value.trim();
    const filialId = selectModalFilial.value;

    if (!nome) {
      if (typeof Toast !== 'undefined') Toast.error('Informe o nome do plano.');
      inputModalName.focus();
      return;
    }

    if (!filialId) {
      if (typeof Toast !== 'undefined') Toast.error('Selecione a filial.');
      selectModalFilial.focus();
      return;
    }

    const filialObj = AbastecimentoMock.getFilialById(filialId);
    const copyFromId = selectModalCopyPlan.value;
    let copiedItems = [];

    if (copyFromId) {
      const sourcePlan = planos.find(p => p.id === copyFromId);
      if (sourcePlan && sourcePlan.itens) {
        copiedItems = JSON.parse(JSON.stringify(sourcePlan.itens));
      }
    }

    const nextNum = planos.length + 1;
    const codigoFormatado = String(nextNum).padStart(6, '0');
    const newId = `pln-${codigoFormatado}`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const newPlan = {
      id: newId,
      codigo: codigoFormatado,
      nome: nome,
      descricao: inputModalDesc.value.trim() || 'Nenhuma descrição informada',
      filialId: filialId,
      filialNome: filialObj ? filialObj.nome : 'Filial',
      status: 'ativo',
      dataCriacao: formattedDate,
      itens: copiedItems
    };

    planos.unshift(newPlan);
    AbastecimentoMock.savePlanos(planos);

    closeNewPlanModal();
    if (typeof Toast !== 'undefined') {
      Toast.success(`Plano ${codigoFormatado} - ${nome} criado! Ajuste os produtos e salve o plano.`);
    }

    showDetailView(newPlan.id);
    enterEditMode(true);
  }

  /**
   * Listeners de Eventos
   */
  function setupEventListeners() {
    // Busca do Header
    if (pageSearchInput) {
      pageSearchInput.addEventListener('input', () => {
        if (currentActivePlanId) {
          const plano = planos.find(p => p.id === currentActivePlanId);
          if (plano) {
            const term = pageSearchInput.value.toLowerCase().trim();
            const sourceList = isEditMode ? tempPlanItems : plano.itens;
            const filtered = sourceList.filter(item => {
              const prod = AbastecimentoMock.getProdutoById(item.produtoId);
              return prod && (prod.nome.toLowerCase().includes(term) || prod.ean.includes(term));
            });
            renderDetailProducts(filtered);
          }
        } else {
          renderPlansTable();
        }
      });
    }

    // Modal Novo Plano
    if (fabRedAdd) fabRedAdd.addEventListener('click', openNewPlanModal);
    if (btnCloseNewModal) btnCloseNewModal.addEventListener('click', closeNewPlanModal);
    if (btnDiscardNewModal) btnDiscardNewModal.addEventListener('click', closeNewPlanModal);
    if (btnFinalizeNewModal) btnFinalizeNewModal.addEventListener('click', finalizeNewPlan);

    // Alternar Visualização Tabela / Cards
    if (btnToggleProductsView) btnToggleProductsView.addEventListener('click', toggleProductsView);

    // Modo de Edição
    if (fabEditHero) fabEditHero.addEventListener('click', enterEditMode);
    if (btnSaveEditMode) btnSaveEditMode.addEventListener('click', saveEditMode);
    if (btnCancelEditMode) btnCancelEditMode.addEventListener('click', cancelEditMode);
    if (btnOpenAddProducts) btnOpenAddProducts.addEventListener('click', openAddProductsModal);

    // Ações em Lote
    if (btnOpenBatchEdit) btnOpenBatchEdit.addEventListener('click', openBatchEditModal);
    if (btnCloseBatchEdit) btnCloseBatchEdit.addEventListener('click', closeBatchEditModal);
    if (btnCancelBatchEdit) btnCancelBatchEdit.addEventListener('click', closeBatchEditModal);
    if (btnApplyBatchEdit) btnApplyBatchEdit.addEventListener('click', applyBatchEdit);
    if (btnDeleteBatch) btnDeleteBatch.addEventListener('click', deleteBatchSelected);
    if (btnUncheckBatch) btnUncheckBatch.addEventListener('click', uncheckAllBatch);

    // Modal Multicritério de Inserção
    if (btnCloseAddModal) btnCloseAddModal.addEventListener('click', closeAddProductsModal);
    if (btnCancelAddModal) btnCancelAddModal.addEventListener('click', closeAddProductsModal);
    if (btnConfirmAddProducts) btnConfirmAddProducts.addEventListener('click', insertSelectedProductsToPlan);
    if (btnSelectAllFiltered) btnSelectAllFiltered.addEventListener('click', selectAllFilteredProducts);

    if (addModalSearch) addModalSearch.addEventListener('input', renderModalProductsList);
    if (addModalGroup) addModalGroup.addEventListener('change', renderModalProductsList);
    if (addModalBrand) addModalBrand.addEventListener('change', renderModalProductsList);
    if (addModalSupplier) addModalSupplier.addEventListener('change', renderModalProductsList);

    // Fechar modais ao clicar fora ou na tecla Escape
    [newPlanModal, batchEditModal, addProductsModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) modal.classList.remove('show');
        });
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (newPlanModal?.classList.contains('show')) closeNewPlanModal();
        if (batchEditModal?.classList.contains('show')) closeBatchEditModal();
        if (addProductsModal?.classList.contains('show')) closeAddProductsModal();
      }
    });

    // Retorno para a lista pelo breadcrumb
    if (detailBreadcrumbLink) {
      detailBreadcrumbLink.addEventListener('click', (e) => {
        e.preventDefault();
        showListView();
      });
    }
  }

  // Exposição Global para Callbacks HTML
  window.AbastecimentoController = {
    showDetailView,
    showListView,
    openNewPlanModal,
    toggleProductsView,
    enterEditMode,
    toggleSelectAllItems(isChecked) {
      selectedItemIndices.clear();
      if (isChecked) {
        tempPlanItems.forEach((_, idx) => selectedItemIndices.add(idx));
      }
      updateBatchBar();
      renderDetailProducts(tempPlanItems);
      if (typeof Toast !== 'undefined') {
        Toast.info(isChecked ? 'Todos os produtos foram selecionados.' : 'Todos os produtos foram desmarcados.');
      }
    },
    toggleItemSelection(index) {
      if (selectedItemIndices.has(index)) {
        selectedItemIndices.delete(index);
      } else {
        selectedItemIndices.add(index);
      }
      updateBatchBar();
    },
    updateItemQty(index, field, delta) {
      if (field === 'ideal') {
        tempPlanItems[index].estoqueIdeal = Math.max(1, (tempPlanItems[index].estoqueIdeal || 1) + delta);
      } else {
        tempPlanItems[index].estoqueMinimo = Math.max(0, (tempPlanItems[index].estoqueMinimo || 0) + delta);
      }
      renderDetailProducts(tempPlanItems);
    },
    setItemQty(index, field, val) {
      const parsed = parseInt(val, 10);
      if (field === 'ideal') {
        tempPlanItems[index].estoqueIdeal = Math.max(1, isNaN(parsed) ? 1 : parsed);
      } else {
        tempPlanItems[index].estoqueMinimo = Math.max(0, isNaN(parsed) ? 0 : parsed);
      }
      renderDetailProducts(tempPlanItems);
    },
    removeSingleItem(index) {
      const prod = AbastecimentoMock.getProdutoById(tempPlanItems[index].produtoId);
      tempPlanItems.splice(index, 1);
      selectedItemIndices.delete(index);
      updateBatchBar();
      renderDetailProducts(tempPlanItems);
      if (typeof Toast !== 'undefined') {
        Toast.warning(`"${prod ? prod.nome : 'Produto'}" removido da edição.`);
      }
    },
    toggleModalProductSelect
  };

  init();
});
