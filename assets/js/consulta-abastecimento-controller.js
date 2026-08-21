/**
 * GOFLASH CORE - CONTROLADOR AVANÇADO DA TELA DE CONSULTA PARA ABASTECIMENTO
 * Gerencia o estado de produtos, steppers táteis, filtros dinâmicos, bipe e geração de pedidos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Leitura de Parâmetros de URL ou Padrões Oficiais
  const urlParams = new URLSearchParams(window.location.search);
  const paramOrigem = urlParams.get('origem');
  const paramPlano = urlParams.get('plano');
  const paramFiltro = urlParams.get('filtro');

  let currentParams = {
    origem: (paramOrigem && paramOrigem.trim()) ? paramOrigem : 'Não especificada (Entrada direta)',
    destino: urlParams.get('destino') || 'Mini Mercado 03 Simples Nacional',
    plano: (paramPlano && paramPlano.trim()) ? paramPlano : 'Sem plano base (Todos os produtos)',
    filtro: (paramFiltro && paramFiltro.trim()) ? paramFiltro : 'completo' // 'completo', 'saldo_ideal', 'saldo_critico'
  };

  // 1.1 Verificação de Presença de Plano de Abastecimento
  function checkHasPlan() {
    return !(!currentParams.plano || 
      currentParams.plano.toLowerCase().includes('sem plano') || 
      currentParams.plano.toLowerCase().includes('todos os produtos') ||
      currentParams.plano.toLowerCase().includes('nenhum'));
  }

  // 1.2 Verificação de Filial de Origem Especificada
  function hasOriginBranch() {
    return !(!currentParams.origem || 
      currentParams.origem.toLowerCase().includes('não especificada') || 
      currentParams.origem.toLowerCase().includes('nenhuma') ||
      currentParams.origem.toLowerCase().includes('entrada direta'));
  }

  let hasPlan = checkHasPlan();

  // Inicializa o chip de filtro ativo com base no filtro da URL
  let initialChip = 'all';
  if (currentParams.filtro === 'saldo_ideal') initialChip = 'ideal';
  else if (currentParams.filtro === 'saldo_critico') initialChip = 'critico';
  let currentFilterChip = initialChip;

  // 1.3 Parâmetros Dinâmicos de Catálogo e Estoque
  let lowStockThreshold = 3;
  let catalogSearchText = '';
  let catalogSelectedGrupo = '';
  let catalogSelectedFornecedor = '';
  let catalogStockFilter = 'all'; // 'all', 'zero', 'low', 'cd_available'
  let catalogBatchDefaultQty = 5;
  let catalogItemsState = [];

  // Helper: Obter Status Inteligente de Estoque do Produto (sem ícones)
  function getProductStockStatus(item) {
    const ideal = item.estoqueIdeal !== undefined ? item.estoqueIdeal : 10;
    const critico = item.minimoCritico !== undefined ? item.minimoCritico : 2;
    const loja = item.estoqueLoja !== undefined ? item.estoqueLoja : 0;

    if (loja === 0) {
      return {
        type: 'zerado',
        label: 'Estoque Zerado',
        badgeClass: 'status-zerado'
      };
    }
    if (loja <= critico) {
      return {
        type: 'critico',
        label: 'Nível Crítico',
        badgeClass: 'status-critico'
      };
    }
    if (loja < ideal) {
      return {
        type: 'ideal',
        label: 'Abaixo do Ideal',
        badgeClass: 'status-ideal'
      };
    }
    return {
      type: 'ok',
      label: 'Estoque OK',
      badgeClass: 'status-ok'
    };
  }

  // Helper: Catálogo Mestre Consolidado Único por EAN
  function getMasterCatalog() {
    const listA = window.ConsultaProdutosBase || [];
    const listB = window.CatalogoExtraProdutos || [];
    const map = new Map();
    [...listA, ...listB].forEach(item => {
      if (!map.has(item.ean)) {
        map.set(item.ean, JSON.parse(JSON.stringify(item)));
      }
    });
    return Array.from(map.values());
  }

  // Helper: Construtor do Empty State Inteligente
  function buildEmptyStateHtml() {
    if (hasPlan) {
      return `
        <div class="consulta-empty-state">
          <div class="empty-state-icon-box">
            <span class="material-icons">inventory_2</span>
          </div>
          <h3 class="empty-state-title">Nenhum produto cadastrado no plano</h3>
          <p class="empty-state-desc">
            Não foram encontrados produtos para os parâmetros configurados neste plano.
          </p>
          <div class="empty-state-actions">
            <button type="button" class="btn-add-extra-products btn-trigger-add-modal" style="height: 44px; font-size: 0.92rem;">
              <span class="material-icons">add_circle</span>
              Adicionar Produtos do Catálogo
            </button>
          </div>
        </div>
      `;
    }

    return `
      <div class="consulta-empty-state">
        <div class="empty-state-icon-box">
          <span class="material-icons">inventory_2</span>
        </div>
        <h3 class="empty-state-title">Consulta de Reposição</h3>
        <p class="empty-state-desc">
          Nenhum produto adicionado à lista. Escaneie o código de barras no campo superior ou clique no botão abaixo para selecionar produtos pelo catálogo.
        </p>
        <div class="empty-state-actions">
          <button type="button" class="btn-add-extra-products btn-trigger-add-modal" style="height: 44px; font-size: 0.92rem;">
            <span class="material-icons">add_circle</span>
            Adicionar Produtos do Catálogo
          </button>
          <span class="empty-state-scan-badge">
            <span class="material-icons" style="font-size: 16px;">qr_code_scanner</span>
            Leitor ativo: escaneie o código de barras ou digite o EAN e pressione Enter
          </span>
        </div>
      </div>
    `;
  }

  // Helper: Adição Rápida por Critério de Estoque no Empty State
  function addProductsByFilter(options = {}) {
    const master = getMasterCatalog();
    let filtered = [];

    if (options.zeroOnly) {
      filtered = master.filter(p => p.estoqueLoja === 0);
    } else if (options.lowStockOnly) {
      const threshold = options.threshold !== undefined ? options.threshold : lowStockThreshold;
      filtered = master.filter(p => p.estoqueLoja <= threshold);
    } else {
      filtered = master;
    }

    if (filtered.length === 0) {
      if (typeof Toast !== 'undefined') {
        Toast.info('Nenhum produto encontrado com este critério de estoque.');
      }
      return;
    }

    filtered.forEach(item => {
      const existing = queryProducts.find(p => p.ean === item.ean);
      const reporQty = hasPlan ? (item.sugestao > 0 ? item.sugestao : Math.max(1, (item.estoqueIdeal || 10) - item.estoqueLoja)) : 0;
      if (existing) {
        existing.selecionado = true;
        if (hasPlan && existing.aRepor === 0) existing.aRepor = reporQty;
      } else {
        const copy = JSON.parse(JSON.stringify(item));
        copy.id = Date.now() + Math.floor(Math.random() * 100000);
        copy.aRepor = reporQty;
        copy.selecionado = true;
        queryProducts.push(copy);
      }
    });

    if (typeof Toast !== 'undefined') {
      Toast.success(`${filtered.length} produto(s) carregado(s) para reposição!`);
    }
    renderAll();
  }

  // 2. Estado de Produtos da Consulta (Se sem plano, inicia vazio para inserção dinâmica)
  let queryProducts = hasPlan ? JSON.parse(JSON.stringify(window.ConsultaProdutosBase || [])).map(p => ({ ...p, selecionado: false })) : [];
  let currentSort = { column: null, direction: 'none' }; // 'none', 'asc', 'desc'
  let hideUnselected = false;
  let currentViewMode = window.innerWidth <= 768 ? 'cards' : 'table';

  // 3. Elementos do DOM
  const tableBody = document.getElementById('consultaTableBody');
  const cardsGrid = document.getElementById('consultaCardsGrid');
  const tableCard = document.getElementById('consultaTableCard');
  
  const destNameDisplay = document.getElementById('contextDestName');
  const cdNameDisplay = document.getElementById('contextCdName');
  const planNameDisplay = document.getElementById('contextPlanName');
  const filterDescDisplay = document.getElementById('contextFilterDesc');

  const searchInput = document.getElementById('productSearchInput');
  const barcodeInput = document.getElementById('barcodeScanInput');
  const btnToggleUnselected = document.getElementById('btnToggleUnselected');
  const btnMoreActions = document.getElementById('btnMoreActions');
  const moreActionsDropdown = document.getElementById('moreActionsDropdown');
  const moreActionsContainer = document.getElementById('moreActionsContainer');
  const btnViewTable = document.getElementById('btnViewTable');
  const btnViewCards = document.getElementById('btnViewCards');
  
  const summaryItemsCount = document.getElementById('summaryItemsCount');
  const summaryUnitsCount = document.getElementById('summaryUnitsCount');
  const toolbarChipsRow = document.getElementById('toolbarChipsRow');
  const btnBatchEditQty = document.getElementById('btnBatchEditQty');
  const btnBatchBadge = document.getElementById('btnBatchBadge');
  const btnGenerateOrder = document.getElementById('btnGenerateOrder');
  const btnCancelQuery = document.getElementById('btnCancelQuery');
  const btnDraftQuery = document.getElementById('btnDraftQuery');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');
  const btnClearAllProducts = document.getElementById('btnClearAllProducts');
  const btnThClearAll = document.getElementById('btnThClearAll');

  // Modais
  const modalBatchEditQty = document.getElementById('modalBatchEditQty');
  const btnCloseBatchModal = document.getElementById('btnCloseBatchModal');
  const btnCancelBatchModal = document.getElementById('btnCancelBatchModal');
  const btnApplyBatchQty = document.getElementById('btnApplyBatchQty');
  const batchModalItemCount = document.getElementById('batchModalItemCount');
  const batchQtyInput = document.getElementById('batchQtyInput');
  const btnBatchQtyMinus = document.getElementById('btnBatchQtyMinus');
  const btnBatchQtyPlus = document.getElementById('btnBatchQtyPlus');
  const batchPlanRestoreWrapper = document.getElementById('batchPlanRestoreWrapper');
  const btnBatchRestoreSugestao = document.getElementById('btnBatchRestoreSugestao');

  const modalConfirmClearAll = document.getElementById('modalConfirmClearAll');
  const btnCloseConfirmClearModal = document.getElementById('btnCloseConfirmClearModal');
  const btnCancelClearAll = document.getElementById('btnCancelClearAll');
  const btnExecuteClearAll = document.getElementById('btnExecuteClearAll');
  const clearAllItemsCount = document.getElementById('clearAllItemsCount');

  const modalParams = document.getElementById('modalParamsConsulta');
  const btnEditParams = document.getElementById('btnEditContextParams');
  const btnCloseParams = document.getElementById('btnCloseParamsModal');
  const btnDiscardParams = document.getElementById('btnDiscardParams');
  const btnApplyParams = document.getElementById('btnApplyParams');

  const modalAddExtra = document.getElementById('modalAddExtraProducts');
  const btnOpenAddExtra = document.getElementById('btnAddExtraProducts');
  const btnCloseAddExtra = document.getElementById('btnCloseAddExtraModal');
  const btnDiscardAddExtra = document.getElementById('btnDiscardAddExtra');
  const btnConfirmAddExtra = document.getElementById('btnConfirmAddExtra');
  const extraProductsList = document.getElementById('extraProductsList');

  // 4. Atualizar Contexto no Topo & Visibilidade de Colunas/Chips
  function updateContextUI() {
    hasPlan = checkHasPlan();
    const hasOrigin = hasOriginBranch();

    if (destNameDisplay) destNameDisplay.textContent = currentParams.destino || 'Mini Mercado 03 Simples Nacional';
    if (cdNameDisplay) cdNameDisplay.textContent = currentParams.origem || 'Não especificada (Entrada direta)';
    if (planNameDisplay) planNameDisplay.textContent = hasPlan ? currentParams.plano : 'Sem Plano (Inserção Avulsa)';
    
    let descFiltro = 'Plano Completo';
    if (!hasPlan) {
      descFiltro = 'Inserção Manual / Escaneamento';
    } else if (currentParams.filtro === 'saldo_ideal') {
      descFiltro = 'Saldo < Ideal';
    } else if (currentParams.filtro === 'saldo_critico') {
      descFiltro = 'Saldo <= Crítico';
    }
    if (filterDescDisplay) filterDescDisplay.textContent = descFiltro;

    // Atualiza visibilidade das colunas de plano no thead
    const planCols = document.querySelectorAll('.col-plan-param');
    planCols.forEach(col => {
      col.classList.toggle('hidden-col', !hasPlan);
    });

    // Atualiza visibilidade das colunas e chips de Estoque CD
    const cdCols = document.querySelectorAll('.col-cd-origem');
    cdCols.forEach(col => {
      col.classList.toggle('hidden-col', !hasOrigin);
    });
  }

  // 5. Filtragem e Obtenção de Produtos Visíveis
  function getFilteredProducts() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    const hasOrigin = hasOriginBranch();
    
    let filtered = queryProducts.filter(item => {
      // Filtro de Texto (Nome / EAN / Marca)
      const matchText = !query || 
        item.nome.toLowerCase().includes(query) || 
        item.ean.includes(query) || 
        (item.marca && item.marca.toLowerCase().includes(query));

      if (!matchText) return false;

      // Filtro de Ocultar Desmarcados
      if (hideUnselected && !item.selecionado) return false;

      // Filtro de Chips
      if (currentFilterChip === 'ideal') {
        return item.estoqueLoja < (item.estoqueIdeal !== undefined ? item.estoqueIdeal : 10);
      }
      if (currentFilterChip === 'critico') {
        return item.estoqueLoja <= (item.minimoCritico !== undefined ? item.minimoCritico : 2);
      }
      if (currentFilterChip === 'selected') {
        return item.selecionado;
      }
      if (currentFilterChip === 'zero') {
        return item.estoqueLoja === 0;
      }

      return true;
    });

    // Aplicação da Ordenação Dinâmica nas Colunas
    if (currentSort.column && currentSort.direction !== 'none') {
      const col = currentSort.column;
      const dir = currentSort.direction === 'asc' ? 1 : -1;

      filtered = [...filtered].sort((a, b) => {
        let valA = a[col] !== undefined ? Number(a[col]) : 0;
        let valB = b[col] !== undefined ? Number(b[col]) : 0;
        if (isNaN(valA)) valA = 0;
        if (isNaN(valB)) valB = 0;
        return (valA - valB) * dir;
      });
    }

    return filtered;
  }

  // 6. Atualização dos Contadores e Resumo Sticky
  function updateSummary() {
    const hasOrigin = hasOriginBranch();
    const selectedItems = queryProducts.filter(p => p.selecionado && p.aRepor > 0);
    const totalUnits = selectedItems.reduce((acc, curr) => acc + (parseInt(curr.aRepor) || 0), 0);

    if (summaryItemsCount) summaryItemsCount.textContent = `${selectedItems.length} item(s)`;
    if (summaryUnitsCount) summaryUnitsCount.textContent = `${totalUnits} un`;

    // Atualiza contadores dos chips
    const countAll = queryProducts.length;
    const countIdeal = queryProducts.filter(p => p.estoqueLoja < (p.estoqueIdeal !== undefined ? p.estoqueIdeal : 10)).length;
    const countCritico = queryProducts.filter(p => p.estoqueLoja <= (p.minimoCritico !== undefined ? p.minimoCritico : 2)).length;
    const countSelected = queryProducts.filter(p => p.selecionado).length;
    const countZero = queryProducts.filter(p => p.estoqueLoja === 0).length;

    const elCountAll = document.getElementById('chipCountAll');
    const elCountIdeal = document.getElementById('chipCountIdeal');
    const elCountCritico = document.getElementById('chipCountCritico');
    const elCountSelected = document.getElementById('chipCountSelected');
    const elCountZero = document.getElementById('chipCountZero');

    if (elCountAll) elCountAll.textContent = countAll;
    if (elCountIdeal) elCountIdeal.textContent = countIdeal;
    if (elCountCritico) elCountCritico.textContent = countCritico;
    if (elCountSelected) elCountSelected.textContent = countSelected;
    if (elCountZero) elCountZero.textContent = countZero;

    // Sincroniza classes active dos chips
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-chip') === currentFilterChip);
    });

    // Sincroniza o estado do checkbox do topo (Marcar/Desmarcar Todos)
    if (selectAllCheckbox) {
      const visible = getFilteredProducts();
      if (visible.length === 0) {
        selectAllCheckbox.checked = false;
        selectAllCheckbox.indeterminate = false;
      } else {
        const selectedVisible = visible.filter(p => p.selecionado).length;
        if (selectedVisible === visible.length) {
          selectAllCheckbox.checked = true;
          selectAllCheckbox.indeterminate = false;
        } else if (selectedVisible > 0) {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = true;
        } else {
          selectAllCheckbox.checked = false;
          selectAllCheckbox.indeterminate = false;
        }
      }
    }

    // Sincroniza o estado dos botões de exclusão total
    if (btnClearAllProducts) {
      btnClearAllProducts.disabled = (queryProducts.length === 0);
    }
    if (btnThClearAll) {
      btnThClearAll.disabled = (queryProducts.length === 0);
    }

    // Sincroniza o estado do botão de edição em lote
    const totalSelected = queryProducts.filter(p => p.selecionado).length;
    if (btnBatchEditQty) {
      btnBatchEditQty.disabled = (totalSelected === 0);
    }
    if (btnBatchBadge) {
      btnBatchBadge.textContent = totalSelected;
      btnBatchBadge.style.display = (totalSelected > 0) ? 'inline-block' : 'none';
    }

    // Controla a visibilidade da barra de chips (Oculta se lista vazia)
    if (toolbarChipsRow) {
      toolbarChipsRow.style.display = (queryProducts.length > 0) ? 'flex' : 'none';
    }
  }

  // 7. Renderização da Tabela e dos Cards
  function renderAll() {
    updateContextUI();
    updateSortHeadersUI();
    const hasOrigin = hasOriginBranch();
    const filtered = getFilteredProducts();
    
    let colCount = 10;
    if (hasPlan && hasOrigin) colCount = 10;
    else if (hasPlan && !hasOrigin) colCount = 9;
    else if (!hasPlan && hasOrigin) colCount = 7;
    else if (!hasPlan && !hasOrigin) colCount = 6;

    // Render Tabela
    if (tableBody) {
      if (queryProducts.length === 0) {
        tableBody.innerHTML = `
          <tr class="empty-state-row">
            <td colspan="${colCount}" style="padding: 0; border: none;">
              ${buildEmptyStateHtml()}
            </td>
          </tr>
        `;
      } else if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="${colCount}" style="text-align: center; padding: 2.5rem; color: #757575;">
              <span class="material-icons" style="font-size: 36px; display: block; margin-bottom: 8px; color: #bdbdbd;">search_off</span>
              Nenhum produto encontrado com os filtros atuais.
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filtered.map(item => {
          const isCritico = item.estoqueLoja <= (item.minimoCritico !== undefined ? item.minimoCritico : 2);
          const selectedClass = item.selecionado ? 'selected-row' : '';
          const isPendingQty = item.selecionado && (!item.aRepor || item.aRepor === 0);
          const pendingClass = isPendingQty ? 'repor-pending' : '';
          const status = getProductStockStatus(item);

          if (hasPlan) {
            return `
              <tr class="${selectedClass}" data-id="${item.id}">
                <td class="table-checkbox-cell">
                  <input 
                    type="checkbox" 
                    class="table-custom-checkbox product-select-checkbox" 
                    data-id="${item.id}"
                    ${item.selecionado ? 'checked' : ''}
                    aria-label="Selecionar ${item.nome}"
                  >
                </td>
                <td class="table-thumb-cell">
                  <img src="${item.foto}" alt="${item.nome}" class="product-thumb-img" onerror="this.src='../assets/images/logo-homepage.png'">
                </td>
                <td class="product-info-cell">
                  <div class="product-desc-title">${item.nome}</div>
                  <div class="product-meta-row">
                    <span class="product-ean-label">EAN: <span class="product-ean-val">${item.ean}</span></span>
                    <span class="product-status-tag ${status.badgeClass}">${status.label}</span>
                  </div>
                </td>
                <td class="col-plan-param" style="text-align: center;">
                  <span class="stock-pill stock-pill-ideal">${item.estoqueIdeal !== undefined ? item.estoqueIdeal : '-'}</span>
                </td>
                <td class="col-plan-param" style="text-align: center;">
                  <span class="stock-pill stock-pill-critico">${item.minimoCritico !== undefined ? item.minimoCritico : '-'}</span>
                </td>
                <td style="text-align: center;">
                  <span class="stock-pill stock-pill-loja ${isCritico ? 'is-critico' : ''}">${item.estoqueLoja}</span>
                </td>
                <td class="col-cd-origem ${!hasOrigin ? 'hidden-col' : ''}" style="text-align: center;">
                  <span class="stock-pill stock-pill-cd">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                </td>
                <td class="col-plan-param" style="text-align: center;">
                  <span class="stock-pill stock-pill-sugestao">${item.sugestao !== undefined ? item.sugestao : '-'}</span>
                </td>
                <td style="text-align: center; min-width: 140px;">
                  <div class="repor-stepper-wrapper ${pendingClass}">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor !== undefined ? item.aRepor : 0}" 
                      min="0" 
                      max="999"
                      placeholder="0"
                    >
                    <button type="button" class="repor-stepper-btn btn-stepper-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
                  </div>
                </td>
                <td style="text-align: center; width: 50px;">
                  <button type="button" class="btn-delete-row btn-remove-item" data-id="${item.id}" title="Remover da consulta" aria-label="Remover">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            `;
          } else {
            return `
              <tr class="${selectedClass}" data-id="${item.id}">
                <td class="table-checkbox-cell">
                  <input 
                    type="checkbox" 
                    class="table-custom-checkbox product-select-checkbox" 
                    data-id="${item.id}"
                    ${item.selecionado ? 'checked' : ''}
                    aria-label="Selecionar ${item.nome}"
                  >
                </td>
                <td class="table-thumb-cell">
                  <img src="${item.foto}" alt="${item.nome}" class="product-thumb-img" onerror="this.src='../assets/images/logo-homepage.png'">
                </td>
                <td class="product-info-cell">
                  <div class="product-desc-title">${item.nome}</div>
                  <div class="product-meta-row">
                    <span class="product-ean-label">EAN: <span class="product-ean-val">${item.ean}</span></span>
                    <span class="product-status-tag ${status.badgeClass}">${status.label}</span>
                  </div>
                </td>
                <td style="text-align: center;">
                  <span class="stock-pill stock-pill-loja ${item.estoqueLoja === 0 ? 'is-critico' : ''}">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
                </td>
                <td class="col-cd-origem ${!hasOrigin ? 'hidden-col' : ''}" style="text-align: center;">
                  <span class="stock-pill stock-pill-cd">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                </td>
                <td style="text-align: center; min-width: 140px;">
                  <div class="repor-stepper-wrapper ${pendingClass}">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor !== undefined ? item.aRepor : 0}" 
                      min="0" 
                      max="999"
                      placeholder="0"
                    >
                    <button type="button" class="repor-stepper-btn btn-stepper-plus" data-id="${item.id}" aria-label="Aumentar">+</button>
                  </div>
                </td>
                <td style="text-align: center; width: 50px;">
                  <button type="button" class="btn-delete-row btn-remove-item" data-id="${item.id}" title="Remover da consulta" aria-label="Remover">
                    <span class="material-icons">delete</span>
                  </button>
                </td>
              </tr>
            `;
          }
        }).join('');
      }
    }

    // Render Cards (Mobile / Grid)
    if (cardsGrid) {
      if (queryProducts.length === 0) {
        cardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1;">
            ${buildEmptyStateHtml()}
          </div>
        `;
      } else if (filtered.length === 0) {
        cardsGrid.innerHTML = `
          <div style="grid-column: 1 / -1; text-align: center; padding: 2.5rem; background: #fff; border-radius: 8px;">
            <span class="material-icons" style="font-size: 36px; display: block; margin-bottom: 8px; color: #bdbdbd;">search_off</span>
            Nenhum produto encontrado com os filtros atuais.
          </div>
        `;
      } else {
        cardsGrid.innerHTML = filtered.map(item => {
          const isCritico = item.estoqueLoja <= (item.minimoCritico !== undefined ? item.minimoCritico : 2);
          const selectedClass = item.selecionado ? 'selected-card' : '';
          const isPendingQty = item.selecionado && (!item.aRepor || item.aRepor === 0);
          const pendingClass = isPendingQty ? 'repor-pending' : '';
          const status = getProductStockStatus(item);

          let stockGridHtml = '';
          if (hasPlan) {
            stockGridHtml = `
              <div class="card-stock-grid">
                <div class="card-stock-item">
                  <span class="card-stock-label">Ideal</span>
                  <span class="card-stock-val" style="color: #2e7d32;">${item.estoqueIdeal !== undefined ? item.estoqueIdeal : '-'}</span>
                </div>
                <div class="card-stock-item">
                  <span class="card-stock-label">Crítico</span>
                  <span class="card-stock-val" style="color: #e65100;">${item.minimoCritico !== undefined ? item.minimoCritico : '-'}</span>
                </div>
                <div class="card-stock-item">
                  <span class="card-stock-label">Loja</span>
                  <span class="card-stock-val" style="color: ${isCritico ? '#c62828' : '#f57f17'};">${item.estoqueLoja}</span>
                </div>
                ${hasOrigin ? `
                  <div class="card-stock-item">
                    <span class="card-stock-label">CD</span>
                    <span class="card-stock-val" style="color: #388e3c; font-weight: 700;">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                  </div>
                ` : ''}
                <div class="card-stock-item">
                  <span class="card-stock-label">Sugestão</span>
                  <span class="card-stock-val" style="color: #6530b5;">${item.sugestao !== undefined ? item.sugestao : '-'}</span>
                </div>
              </div>
            `;
          } else {
            stockGridHtml = `
              <div class="card-stock-grid" style="${hasOrigin ? 'grid-template-columns: 1fr 1fr;' : 'grid-template-columns: 1fr;'}">
                <div class="card-stock-item">
                  <span class="card-stock-label">Estoque Loja</span>
                  <span class="card-stock-val" style="color: ${item.estoqueLoja === 0 ? '#c62828' : '#1976d2'}; font-weight: 700;">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
                </div>
                ${hasOrigin ? `
                  <div class="card-stock-item">
                    <span class="card-stock-label">Estoque CD</span>
                    <span class="card-stock-val" style="color: #388e3c; font-weight: 700;">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                  </div>
                ` : ''}
              </div>
            `;
          }

          return `
            <div class="product-mobile-card ${selectedClass}" data-id="${item.id}">
              <div class="card-header-row">
                <input 
                  type="checkbox" 
                  class="table-custom-checkbox product-select-checkbox" 
                  data-id="${item.id}"
                  ${item.selecionado ? 'checked' : ''}
                  style="margin-top: 4px;"
                  aria-label="Selecionar ${item.nome}"
                >
                <div class="card-photo-box">
                  <img src="${item.foto}" alt="${item.nome}" onerror="this.src='../assets/images/logo-homepage.png'">
                </div>
                <div class="card-info-box">
                  <h4 class="card-product-title">${item.nome}</h4>
                  <div class="card-meta-row">
                    <span class="card-ean-tag">EAN: <strong>${item.ean}</strong></span>
                    <span class="product-status-tag ${status.badgeClass}">${status.label}</span>
                  </div>
                </div>
              </div>

              ${stockGridHtml}

              <div class="card-action-row">
                <div class="card-repor-group">
                  <span class="card-repor-label">A Repor:</span>
                  <div class="repor-stepper-wrapper ${pendingClass}">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor !== undefined ? item.aRepor : 0}" 
                      min="0"
                      max="999"
                      placeholder="0"
                    >
                    <button type="button" class="repor-stepper-btn btn-stepper-plus" data-id="${item.id}">+</button>
                  </div>
                </div>

                <button type="button" class="btn-delete-row btn-remove-item" data-id="${item.id}" title="Remover da consulta">
                  <span class="material-icons">delete</span>
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    bindInteractiveEvents();
    updateSummary();
  }

  // 8. Eventos Interativos (Checkboxes, Steppers, Remoção, Gatilhos)
  function bindInteractiveEvents() {
    // Gatilho de Abrir Catálogo Completo
    const triggerAddBtns = document.querySelectorAll('.btn-trigger-add-modal');
    triggerAddBtns.forEach(btn => {
      btn.addEventListener('click', openAddExtraModal);
    });

    // Checkboxes de Seleção
    const checkboxes = document.querySelectorAll('.product-select-checkbox');
    checkboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        const prod = queryProducts.find(p => p.id == id);
        if (prod) {
          prod.selecionado = chk.checked;
          if (prod.selecionado && prod.aRepor === 0 && hasPlan) {
            prod.aRepor = prod.sugestao > 0 ? prod.sugestao : 1;
          }
          renderAll();
        }
      });
    });

    // Steppers Menos (-)
    const minusBtns = document.querySelectorAll('.btn-stepper-minus');
    minusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const prod = queryProducts.find(p => p.id == id);
        if (prod && prod.aRepor > 0) {
          prod.aRepor = Math.max(0, prod.aRepor - 1);
          if (prod.aRepor === 0) prod.selecionado = false;
          renderAll();
        }
      });
    });

    // Steppers Mais (+)
    const plusBtns = document.querySelectorAll('.btn-stepper-plus');
    plusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const prod = queryProducts.find(p => p.id == id);
        if (prod) {
          prod.aRepor = (parseInt(prod.aRepor) || 0) + 1;
          prod.selecionado = true;
          renderAll();
        }
      });
    });

    // Inputs Diretos de "A Repor"
    const reporInputs = document.querySelectorAll('.input-a-repor');
    reporInputs.forEach(inp => {
      inp.addEventListener('input', () => {
        const row = inp.closest('tr');
        if (row) row.classList.remove('row-repor-error');
        const card = inp.closest('.product-mobile-card');
        if (card) card.classList.remove('card-repor-error');
        inp.classList.remove('input-repor-error');
      });

      inp.addEventListener('change', () => {
        const id = inp.getAttribute('data-id');
        const prod = queryProducts.find(p => p.id == id);
        if (prod) {
          const val = Math.max(0, parseInt(inp.value) || 0);
          prod.aRepor = val;
          prod.selecionado = val > 0;
          renderAll();
        }
      });
    });

    // Botões de Remover Produto da Consulta
    const removeBtns = document.querySelectorAll('.btn-remove-item');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const prodIndex = queryProducts.findIndex(p => p.id == id);
        if (prodIndex > -1) {
          const removedName = queryProducts[prodIndex].nome;
          queryProducts.splice(prodIndex, 1);
          if (typeof Toast !== 'undefined') {
            Toast.info(`"${removedName.substring(0, 24)}..." removido da consulta.`);
          }
          renderAll();
        }
      });
    });
  }

  // 9. Alternância de Modo de Exibição (Tabela / Cards)
  function setViewMode(mode) {
    currentViewMode = mode;
    if (mode === 'table') {
      if (tableCard) tableCard.style.display = 'block';
      if (cardsGrid) cardsGrid.style.display = 'none';
      if (btnViewTable) btnViewTable.classList.add('active');
      if (btnViewCards) btnViewCards.classList.remove('active');
    } else {
      if (tableCard) tableCard.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'grid';
      if (btnViewTable) btnViewTable.classList.remove('active');
      if (btnViewCards) btnViewCards.classList.add('active');
    }
  }

  if (btnViewTable) btnViewTable.addEventListener('click', () => setViewMode('table'));
  if (btnViewCards) btnViewCards.addEventListener('click', () => setViewMode('cards'));

  // 10. Busca por Texto e Escaneamento de Código de Barras
  if (searchInput) {
    searchInput.addEventListener('input', () => renderAll());
  }

  if (barcodeInput) {
    barcodeInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const code = barcodeInput.value.trim();
        if (!code) return;

        // 1. Procura nos produtos atuais
        let found = queryProducts.find(p => p.ean === code);
        if (found) {
          found.aRepor += 1;
          found.selecionado = true;
          if (typeof Toast !== 'undefined') {
            Toast.success(`+1 un: ${found.nome.substring(0, 28)}...`);
          }
          barcodeInput.value = '';
          renderAll();
        } else {
          // 2. Procura no catálogo mestre
          const master = getMasterCatalog();
          const matched = master.find(p => p.ean === code);

          if (matched) {
            const newProd = JSON.parse(JSON.stringify(matched));
            newProd.id = Date.now();
            newProd.aRepor = matched.sugestao || 1;
            newProd.selecionado = true;
            queryProducts.unshift(newProd);
            if (typeof Toast !== 'undefined') {
              Toast.success(`Produto adicionado via leitor: ${newProd.nome.substring(0, 28)}...`);
            }
            barcodeInput.value = '';
            renderAll();
          } else {
            if (typeof Toast !== 'undefined') {
              Toast.warning(`Código EAN "${code}" não cadastrado no catálogo.`);
            }
          }
        }
      }
    });
  }

  // 11. Dropdown Mais Ações da Toolbar
  function toggleMoreActionsDropdown(show) {
    if (!moreActionsDropdown || !btnMoreActions) return;
    const isCurrentlyShown = moreActionsDropdown.classList.contains('show');
    const willShow = (show !== undefined) ? show : !isCurrentlyShown;
    
    moreActionsDropdown.classList.toggle('show', willShow);
    btnMoreActions.classList.toggle('active', willShow);
    btnMoreActions.setAttribute('aria-expanded', willShow ? 'true' : 'false');
  }

  if (btnMoreActions) {
    btnMoreActions.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMoreActionsDropdown();
    });
  }

  // Fechar dropdown ao clicar fora
  document.addEventListener('click', (e) => {
    if (moreActionsContainer && !moreActionsContainer.contains(e.target)) {
      toggleMoreActionsDropdown(false);
    }
  });

  // Fechar dropdown ao pressionar ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && moreActionsDropdown && moreActionsDropdown.classList.contains('show')) {
      toggleMoreActionsDropdown(false);
    }
  });

  // 11.1 Botão Ocultar / Mostrar Desmarcados
  if (btnToggleUnselected) {
    btnToggleUnselected.addEventListener('click', () => {
      toggleMoreActionsDropdown(false);
      hideUnselected = !hideUnselected;
      btnToggleUnselected.classList.toggle('active', hideUnselected);
      const icon = hideUnselected ? 'visibility' : 'visibility_off';
      const label = hideUnselected ? 'Mostrar Todos' : 'Ocultar Desmarcados';
      btnToggleUnselected.innerHTML = `<span class="material-icons">${icon}</span> <span class="btn-text-unselected">${label}</span>`;
      renderAll();
    });
  }

  // 11.2 Selecionar Todos / Desmarcar Todos da Tela Principal
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      const isChecked = selectAllCheckbox.checked;
      const visible = getFilteredProducts();
      
      visible.forEach(prod => {
        prod.selecionado = isChecked;
        if (isChecked && prod.aRepor === 0) {
          prod.aRepor = (hasPlan && prod.sugestao > 0) ? prod.sugestao : 1;
        }
      });

      if (typeof Toast !== 'undefined') {
        Toast.info(isChecked ? 'Todos os produtos visíveis foram marcados.' : 'Todos os produtos visíveis foram desmarcados.');
      }

      renderAll();
    });
  }

  // 11.3 Exclusão Total de Produtos da Consulta (Tabela e Cards)
  function openConfirmClearAllModal() {
    toggleMoreActionsDropdown(false);
    if (queryProducts.length === 0) {
      if (typeof Toast !== 'undefined') Toast.info('A lista de produtos já está vazia.');
      return;
    }
    if (clearAllItemsCount) {
      clearAllItemsCount.textContent = queryProducts.length;
    }
    if (modalConfirmClearAll) {
      modalConfirmClearAll.classList.add('show', 'active');
    }
  }

  function closeConfirmClearAllModal() {
    if (modalConfirmClearAll) {
      modalConfirmClearAll.classList.remove('show', 'active');
    }
  }

  if (btnClearAllProducts) btnClearAllProducts.addEventListener('click', openConfirmClearAllModal);
  if (btnThClearAll) btnThClearAll.addEventListener('click', openConfirmClearAllModal);
  if (btnCloseConfirmClearModal) btnCloseConfirmClearModal.addEventListener('click', closeConfirmClearAllModal);
  if (btnCancelClearAll) btnCancelClearAll.addEventListener('click', closeConfirmClearAllModal);

  if (modalConfirmClearAll) {
    modalConfirmClearAll.addEventListener('click', (e) => {
      if (e.target === modalConfirmClearAll) closeConfirmClearAllModal();
    });
  }

  if (btnExecuteClearAll) {
    btnExecuteClearAll.addEventListener('click', () => {
      const count = queryProducts.length;
      queryProducts = [];
      closeConfirmClearAllModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Todos os ${count} produto(s) foram removidos da consulta.`);
      }
      renderAll();
    });
  }

  // 11.5 Modal de Edição de Quantidade a Repor em Lote
  function openBatchEditModal() {
    toggleMoreActionsDropdown(false);
    const selectedCount = queryProducts.filter(p => p.selecionado).length;
    if (selectedCount === 0) {
      if (typeof Toast !== 'undefined') {
        Toast.warning('Selecione ao menos 1 produto para editar a quantidade em lote.');
      }
      return;
    }

    if (batchModalItemCount) {
      batchModalItemCount.textContent = selectedCount;
    }

    if (batchQtyInput) {
      batchQtyInput.value = 1;
    }

    if (batchPlanRestoreWrapper) {
      batchPlanRestoreWrapper.style.display = hasPlan ? 'block' : 'none';
    }

    if (modalBatchEditQty) {
      modalBatchEditQty.classList.add('show', 'active');
      setTimeout(() => {
        if (batchQtyInput) {
          batchQtyInput.focus();
          batchQtyInput.select();
        }
      }, 100);
    }
  }

  function closeBatchEditModal() {
    if (modalBatchEditQty) {
      modalBatchEditQty.classList.remove('show', 'active');
    }
  }

  if (btnBatchEditQty) btnBatchEditQty.addEventListener('click', openBatchEditModal);
  if (btnCloseBatchModal) btnCloseBatchModal.addEventListener('click', closeBatchEditModal);
  if (btnCancelBatchModal) btnCancelBatchModal.addEventListener('click', closeBatchEditModal);

  if (modalBatchEditQty) {
    modalBatchEditQty.addEventListener('click', (e) => {
      if (e.target === modalBatchEditQty) closeBatchEditModal();
    });
  }

  if (btnBatchQtyMinus) {
    btnBatchQtyMinus.addEventListener('click', () => {
      if (batchQtyInput) {
        const val = Math.max(0, (parseInt(batchQtyInput.value) || 0) - 1);
        batchQtyInput.value = val;
      }
    });
  }

  if (btnBatchQtyPlus) {
    btnBatchQtyPlus.addEventListener('click', () => {
      if (batchQtyInput) {
        const val = Math.min(999, (parseInt(batchQtyInput.value) || 0) + 1);
        batchQtyInput.value = val;
      }
    });
  }

  // Chips Rápidos de Quantidade no Modal
  const quickQtyChips = document.querySelectorAll('.btn-quick-qty-chip');
  quickQtyChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const qty = parseInt(chip.getAttribute('data-qty')) || 1;
      if (batchQtyInput) {
        batchQtyInput.value = qty;
      }
    });
  });

  // Restaurar Quantidade Sugerida pelo Plano para os Itens Selecionados
  if (btnBatchRestoreSugestao) {
    btnBatchRestoreSugestao.addEventListener('click', () => {
      const selected = queryProducts.filter(p => p.selecionado);
      if (selected.length === 0) return;

      selected.forEach(p => {
        const reporQty = p.sugestao > 0 ? p.sugestao : Math.max(1, (p.estoqueIdeal || 10) - p.estoqueLoja);
        p.aRepor = reporQty;
      });

      closeBatchEditModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Sugestão do plano restaurada para ${selected.length} produto(s) com sucesso!`);
      }
      renderAll();
    });
  }

  // Confirmar Aplicação da Quantidade em Lote
  if (btnApplyBatchQty) {
    btnApplyBatchQty.addEventListener('click', () => {
      const selected = queryProducts.filter(p => p.selecionado);
      if (selected.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhum produto selecionado.');
        }
        closeBatchEditModal();
        return;
      }

      const newQty = Math.max(0, parseInt(batchQtyInput ? batchQtyInput.value : 0) || 0);

      selected.forEach(p => {
        p.aRepor = newQty;
      });

      closeBatchEditModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`Quantidade de ${newQty} un aplicada a ${selected.length} produto(s) selecionado(s)!`);
      }
      renderAll();
    });
  }

  // 12. Chips de Filtro Rápido da Barra de Ferramentas
  function setChipActive(chipName) {
    currentFilterChip = chipName;
    const chips = document.querySelectorAll('.filter-chip');
    chips.forEach(c => {
      c.classList.toggle('active', c.getAttribute('data-chip') === chipName);
    });
    renderAll();
  }

  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const chipKey = chip.getAttribute('data-chip') || 'all';
      setChipActive(chipKey);
    });
  });

  // 12.1 Ordenação Interativa de Colunas na Tabela
  function updateSortHeadersUI() {
    const sortHeaders = document.querySelectorAll('.th-sortable');
    sortHeaders.forEach(th => {
      const colKey = th.getAttribute('data-sort');
      const icon = th.querySelector('.th-sort-icon');
      
      th.classList.remove('sort-asc', 'sort-desc');

      if (colKey === currentSort.column && currentSort.direction !== 'none') {
        if (currentSort.direction === 'asc') {
          th.classList.add('sort-asc');
          if (icon) icon.textContent = 'arrow_upward';
          th.title = `Ordenado: Menor para Maior (Clique para inverter)`;
        } else if (currentSort.direction === 'desc') {
          th.classList.add('sort-desc');
          if (icon) icon.textContent = 'arrow_downward';
          th.title = `Ordenado: Maior para Menor (Clique para ordem original)`;
        }
      } else {
        if (icon) icon.textContent = 'unfold_more';
        th.title = `Clique para ordenar`;
      }
    });
  }

  const sortHeaders = document.querySelectorAll('.th-sortable');
  sortHeaders.forEach(th => {
    th.addEventListener('click', () => {
      const colKey = th.getAttribute('data-sort');
      if (!colKey) return;

      if (currentSort.column === colKey) {
        if (currentSort.direction === 'none') {
          currentSort.direction = 'asc';
        } else if (currentSort.direction === 'asc') {
          currentSort.direction = 'desc';
        } else {
          currentSort = { column: null, direction: 'none' };
        }
      } else {
        currentSort = { column: colKey, direction: 'asc' };
      }

      updateSortHeadersUI();
      renderAll();
    });
  });

  // 13. Modal de Parâmetros da Consulta (Editar Filtros)
  const selectOrigemModal = document.getElementById('selectOrigemModal');
  const selectDestinoModal = document.getElementById('selectDestinoModal');
  const selectPlanoModal = document.getElementById('selectPlanoModal');
  const hintOrigemModal = document.getElementById('hintOrigemModal');
  const hintDestinoModal = document.getElementById('hintDestinoModal');
  const hintPlanoModal = document.getElementById('hintPlanoModal');
  const containerFiltrosPlanoModal = document.getElementById('containerFiltrosPlanoModal');
  const hintPlanoParamsHelper = document.getElementById('hintPlanoParamsHelper');

  function updateModalParamsSelectHints() {
    if (selectOrigemModal && hintOrigemModal) {
      const opt = selectOrigemModal.options[selectOrigemModal.selectedIndex];
      hintOrigemModal.textContent = opt ? (opt.getAttribute('data-code') || (opt.value ? opt.value : 'Opcional')) : 'Opcional';
    }
    if (selectDestinoModal && hintDestinoModal) {
      const opt = selectDestinoModal.options[selectDestinoModal.selectedIndex];
      hintDestinoModal.textContent = opt ? (opt.getAttribute('data-code') || opt.value) : '';
    }
    if (selectPlanoModal && hintPlanoModal) {
      const opt = selectPlanoModal.options[selectPlanoModal.selectedIndex];
      const isPlano = !!(opt && opt.value);
      hintPlanoModal.textContent = opt ? (opt.getAttribute('data-code') || (opt.value ? opt.value : 'Opcional')) : 'Opcional';

      if (containerFiltrosPlanoModal) {
        if (isPlano) {
          containerFiltrosPlanoModal.style.display = 'block';
          containerFiltrosPlanoModal.classList.remove('hidden');
        } else {
          containerFiltrosPlanoModal.style.display = 'none';
          containerFiltrosPlanoModal.classList.add('hidden');
        }
      }

      if (hintPlanoParamsHelper) {
        hintPlanoParamsHelper.style.display = isPlano ? 'none' : 'flex';
      }
    }
  }

  if (selectOrigemModal) selectOrigemModal.addEventListener('change', updateModalParamsSelectHints);
  if (selectDestinoModal) selectDestinoModal.addEventListener('change', updateModalParamsSelectHints);
  if (selectPlanoModal) selectPlanoModal.addEventListener('change', updateModalParamsSelectHints);

  function openParamsModal() {
    if (modalParams) {
      modalParams.classList.add('show', 'active');
      
      if (selectOrigemModal) {
        for (let i = 0; i < selectOrigemModal.options.length; i++) {
          if (selectOrigemModal.options[i].text === currentParams.origem) {
            selectOrigemModal.selectedIndex = i;
            break;
          }
        }
      }
      if (selectDestinoModal) {
        for (let i = 0; i < selectDestinoModal.options.length; i++) {
          if (selectDestinoModal.options[i].text === currentParams.destino) {
            selectDestinoModal.selectedIndex = i;
            break;
          }
        }
      }
      if (selectPlanoModal) {
        let foundPlano = false;
        for (let i = 0; i < selectPlanoModal.options.length; i++) {
          if (selectPlanoModal.options[i].text === currentParams.plano) {
            selectPlanoModal.selectedIndex = i;
            foundPlano = true;
            break;
          }
        }
        if (!foundPlano) selectPlanoModal.selectedIndex = 0;
      }

      const radioFiltro = modalParams.querySelector(`input[name="filtroEstoque"][value="${currentParams.filtro}"]`);
      if (radioFiltro) radioFiltro.checked = true;

      updateModalParamsSelectHints();
    }
  }

  function closeParamsModal() {
    if (modalParams) modalParams.classList.remove('show', 'active');
  }

  if (btnEditParams) btnEditParams.addEventListener('click', openParamsModal);
  if (btnCloseParams) btnCloseParams.addEventListener('click', closeParamsModal);
  if (btnDiscardParams) btnDiscardParams.addEventListener('click', closeParamsModal);

  if (modalParams) {
    modalParams.addEventListener('click', (e) => {
      if (e.target === modalParams) closeParamsModal();
    });
  }

  if (btnApplyParams) {
    btnApplyParams.addEventListener('click', () => {
      const optDestino = selectDestinoModal ? selectDestinoModal.options[selectDestinoModal.selectedIndex] : null;
      if (!optDestino || !optDestino.value) {
        if (selectDestinoModal) {
          selectDestinoModal.focus();
          const grp = selectDestinoModal.closest('.modal-underline-group');
          if (grp) {
            grp.classList.add('has-error');
            setTimeout(() => grp.classList.remove('has-error'), 3000);
          }
        }
        if (typeof Toast !== 'undefined') {
          Toast.warning('Por favor, selecione a Filial para Repor.');
        }
        return;
      }

      const optOrigem = selectOrigemModal ? selectOrigemModal.options[selectOrigemModal.selectedIndex] : null;
      const novaOrigem = (optOrigem && optOrigem.value) ? optOrigem.text : '';
      const novoDestino = optDestino.text;
      const optPlano = selectPlanoModal ? selectPlanoModal.options[selectPlanoModal.selectedIndex] : null;
      const novoPlano = (optPlano && optPlano.value) ? optPlano.text : '';
      
      const radioSelected = modalParams.querySelector('input[name="filterScope"]:checked') || modalParams.querySelector('input[name="filtroEstoque"]:checked');
      const novoFiltro = radioSelected ? radioSelected.value : 'completo';

      currentParams = {
        origem: novaOrigem,
        destino: novoDestino,
        plano: novoPlano,
        filtro: novoFiltro
      };

      hasPlan = checkHasPlan();

      if (hasPlan && queryProducts.length === 0) {
        queryProducts = JSON.parse(JSON.stringify(window.ConsultaProdutosBase || [])).map(p => ({ ...p, selecionado: false }));
      }

      closeParamsModal();
      if (typeof Toast !== 'undefined') {
        Toast.success('Parâmetros da consulta atualizados com sucesso!');
      }
      renderAll();
    });
  }

  // 14. MODAL INTELIGENTE DE CATÁLOGO (Comboboxes e Filtro CD)
  // 14.1 Componente Searchable Combobox Vanilla
  class SearchableCombobox {
    constructor(config) {
      this.container = document.getElementById(config.containerId);
      this.input = document.getElementById(config.inputId);
      this.clearBtn = document.getElementById(config.clearBtnId);
      this.toggleBtn = document.getElementById(config.toggleBtnId);
      this.dropdown = document.getElementById(config.dropdownId);
      this.getOptions = config.getOptions; // Função que retorna array de { value, label, count }
      this.onSelect = config.onSelect || (() => {});
      this.selectedValue = '';
      this.selectedLabel = '';

      this.init();
    }

    init() {
      if (!this.container || !this.input || !this.dropdown) return;

      // Digitação no input: filtra opções e notifica seleção em tempo real
      this.input.addEventListener('input', () => {
        const val = this.input.value.trim();
        this.selectedValue = val;
        this.selectedLabel = val;
        if (this.clearBtn) this.clearBtn.style.display = val ? 'flex' : 'none';
        this.renderDropdown(val);
        this.open();
        this.onSelect(this.selectedValue, this.selectedLabel);
      });

      // Foco ou clique no input abre o dropdown com as opções
      this.input.addEventListener('focus', () => {
        this.renderDropdown(this.input.value.trim());
        this.open();
      });

      this.input.addEventListener('click', () => {
        this.renderDropdown(this.input.value.trim());
        this.open();
      });

      // Botão de alternar dropdown (seta)
      if (this.toggleBtn) {
        this.toggleBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (this.isOpen()) {
            this.close();
          } else {
            this.renderDropdown('');
            this.open();
            this.input.focus();
          }
        });
      }

      // Botão de limpar
      if (this.clearBtn) {
        this.clearBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          this.setValue('', '');
          this.close();
          this.onSelect('', '');
          this.input.focus();
        });
      }

      // Fechar ao clicar fora
      document.addEventListener('click', (e) => {
        if (!this.container.contains(e.target)) {
          this.close();
        }
      });
    }

    open() {
      if (!this.dropdown) return;
      this.dropdown.style.display = 'block';
      this.dropdown.classList.add('show');
      if (this.container) this.container.classList.add('open');
      if (this.toggleBtn) this.toggleBtn.classList.add('open');
    }

    close() {
      if (!this.dropdown) return;
      this.dropdown.style.display = 'none';
      this.dropdown.classList.remove('show');
      if (this.container) this.container.classList.remove('open');
      if (this.toggleBtn) this.toggleBtn.classList.remove('open');
    }

    isOpen() {
      if (!this.dropdown) return false;
      return this.dropdown.style.display === 'block' || this.dropdown.classList.contains('show');
    }

    setValue(value, label) {
      this.selectedValue = value || '';
      this.selectedLabel = label !== undefined ? label : (value || '');
      this.input.value = this.selectedLabel;
      if (this.clearBtn) {
        this.clearBtn.style.display = this.selectedLabel ? 'flex' : 'none';
      }
    }

    getValue() {
      return this.selectedValue || this.input.value.trim();
    }

    renderDropdown(searchTerm = '') {
      const options = this.getOptions();
      const term = searchTerm.toLowerCase();

      const filtered = options.filter(opt => 
        !term || opt.label.toLowerCase().includes(term) || (opt.value && opt.value.toLowerCase().includes(term))
      );

      if (filtered.length === 0) {
        this.dropdown.innerHTML = `
          <div class="combobox-empty">Nenhum resultado encontrado</div>
        `;
        return;
      }

      this.dropdown.innerHTML = filtered.map(opt => {
        const isSelected = (opt.value && opt.value.toLowerCase() === this.selectedValue.toLowerCase()) ||
          (!opt.value && !this.selectedValue);
        const countBadge = opt.count !== undefined ? `<span class="combobox-count">${opt.count}</span>` : '';
        
        let labelHtml = opt.label;
        if (term && opt.label && opt.value) {
          const idx = opt.label.toLowerCase().indexOf(term);
          if (idx > -1) {
            labelHtml = opt.label.substring(0, idx) +
              `<strong>${opt.label.substring(idx, idx + term.length)}</strong>` +
              opt.label.substring(idx + term.length);
          }
        }

        return `
          <div class="combobox-option ${isSelected ? 'selected' : ''}" data-value="${opt.value}" data-label="${opt.label}">
            <span class="combobox-label">${labelHtml}</span>
            ${countBadge}
          </div>
        `;
      }).join('');

      // Eventos de clique nas opções
      const optionEls = this.dropdown.querySelectorAll('.combobox-option');
      optionEls.forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          const val = el.getAttribute('data-value');
          const lbl = el.getAttribute('data-label');
          this.setValue(val, lbl);
          this.close();
          this.onSelect(val, lbl);
        });
      });
    }
  }

  // 14.3 Elementos do DOM do Modal
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const btnClearCatalogSearch = document.getElementById('btnClearCatalogSearch');
  const containerStockCdCondition = document.getElementById('containerStockCdCondition');
  const chkOnlyAvailableCd = document.getElementById('chkOnlyAvailableCd');
  const badgeCdOrigemName = document.getElementById('badgeCdOrigemName');
  const catalogMatchesCount = document.getElementById('catalogMatchesCount');

  // Inicializa Combobox de Grupos
  const comboboxGrupo = new SearchableCombobox({
    containerId: 'comboboxGrupo',
    inputId: 'inputComboboxGrupo',
    clearBtnId: 'btnClearGrupo',
    toggleBtnId: 'btnToggleGrupo',
    dropdownId: 'dropdownGrupo',
    getOptions: () => {
      const master = getMasterCatalog();
      const grupoMap = new Map();
      master.forEach(p => {
        const g = p.grupo || p.categoria || 'Outros';
        grupoMap.set(g, (grupoMap.get(g) || 0) + 1);
      });

      const list = Array.from(grupoMap.entries()).map(([name, count]) => ({
        value: name,
        label: name,
        count: count
      }));

      return [
        { value: '', label: 'Todos os Grupos', count: master.length },
        ...list.sort((a, b) => a.label.localeCompare(b.label))
      ];
    },
    onSelect: () => updateCatalogMatchesSummary()
  });

  // Inicializa Combobox de Fornecedores
  const comboboxFornecedor = new SearchableCombobox({
    containerId: 'comboboxFornecedor',
    inputId: 'inputComboboxFornecedor',
    clearBtnId: 'btnClearFornecedor',
    toggleBtnId: 'btnToggleFornecedor',
    dropdownId: 'dropdownFornecedor',
    getOptions: () => {
      const master = getMasterCatalog();
      const fornMap = new Map();
      master.forEach(p => {
        const f = p.fornecedor || 'Diversos';
        fornMap.set(f, (fornMap.get(f) || 0) + 1);
      });

      const list = Array.from(fornMap.entries()).map(([name, count]) => ({
        value: name,
        label: name,
        count: count
      }));

      return [
        { value: '', label: 'Todos os Fornecedores', count: master.length },
        ...list.sort((a, b) => a.label.localeCompare(b.label))
      ];
    },
    onSelect: () => updateCatalogMatchesSummary()
  });

  // 14.4 Cálculo dos Produtos Correspondentes
  function getCatalogMatches() {
    const master = getMasterCatalog();
    const query = (catalogSearchInput ? catalogSearchInput.value : '').trim().toLowerCase();
    const selGrupo = (comboboxGrupo.getValue() || '').toLowerCase();
    const selFornecedor = (comboboxFornecedor.getValue() || '').toLowerCase();
    const onlyCd = (chkOnlyAvailableCd && chkOnlyAvailableCd.checked && hasOriginBranch());

    return master.filter(p => {
      // 1. Busca Geral (EAN, Nome, Marca)
      if (query) {
        const matchText = p.nome.toLowerCase().includes(query) || 
          p.ean.includes(query) || 
          (p.marca && p.marca.toLowerCase().includes(query));
        if (!matchText) return false;
      }

      // 2. Grupo (Categoria)
      if (selGrupo && !selGrupo.includes('todos os grupos')) {
        const itemGrupo = (p.grupo || p.categoria || '').toLowerCase();
        if (!itemGrupo.includes(selGrupo) && !selGrupo.includes(itemGrupo)) return false;
      }

      // 3. Fornecedor / Fabricante
      if (selFornecedor && !selFornecedor.includes('todos os fornecedores')) {
        const itemForn = (p.fornecedor || '').toLowerCase();
        if (!itemForn.includes(selFornecedor) && !selFornecedor.includes(itemForn)) return false;
      }

      // 4. Saldo no CD de Origem (Condicional)
      if (onlyCd) {
        if (!p.estoqueCd || p.estoqueCd <= 0) return false;
      }

      return true;
    });
  }

  function updateCatalogMatchesSummary() {
    const matches = getCatalogMatches();
    if (catalogMatchesCount) {
      catalogMatchesCount.textContent = matches.length;
    }
  }

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', () => {
      if (btnClearCatalogSearch) {
        btnClearCatalogSearch.style.display = catalogSearchInput.value.trim() ? 'block' : 'none';
      }
      updateCatalogMatchesSummary();
    });
  }

  if (btnClearCatalogSearch) {
    btnClearCatalogSearch.addEventListener('click', () => {
      if (catalogSearchInput) {
        catalogSearchInput.value = '';
        btnClearCatalogSearch.style.display = 'none';
        catalogSearchInput.focus();
      }
      updateCatalogMatchesSummary();
    });
  }

  if (chkOnlyAvailableCd) {
    chkOnlyAvailableCd.addEventListener('change', updateCatalogMatchesSummary);
  }

  // 14.5 Abertura e Fechamento do Modal de Catálogo
  function openAddExtraModal() {
    if (modalAddExtra) {
      const hasCd = hasOriginBranch();
      
      // Exibe/Oculta condição de estoque no CD
      if (containerStockCdCondition) {
        containerStockCdCondition.style.display = hasCd ? 'block' : 'none';
      }
      if (badgeCdOrigemName && hasCd) {
        badgeCdOrigemName.textContent = `CD: ${currentParams.origem}`;
      }

      // Reseta campos
      if (catalogSearchInput) catalogSearchInput.value = '';
      if (btnClearCatalogSearch) btnClearCatalogSearch.style.display = 'none';
      comboboxGrupo.setValue('', '');
      comboboxFornecedor.setValue('', '');
      if (chkOnlyAvailableCd) chkOnlyAvailableCd.checked = true;

      updateCatalogMatchesSummary();
      modalAddExtra.classList.add('show', 'active');
    }
  }

  function closeAddExtraModal() {
    if (modalAddExtra) modalAddExtra.classList.remove('show', 'active');
  }

  if (btnOpenAddExtra) btnOpenAddExtra.addEventListener('click', openAddExtraModal);
  if (btnCloseAddExtra) btnCloseAddExtra.addEventListener('click', closeAddExtraModal);
  if (btnDiscardAddExtra) btnDiscardAddExtra.addEventListener('click', closeAddExtraModal);

  if (modalAddExtra) {
    modalAddExtra.addEventListener('click', (e) => {
      if (e.target === modalAddExtra) closeAddExtraModal();
    });
  }

  // 14.6 Confirmação de Inclusão dos Produtos Filtrados na Consulta
  if (btnConfirmAddExtra) {
    btnConfirmAddExtra.addEventListener('click', () => {
      const matches = getCatalogMatches();

      if (matches.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhum produto encontrado com os filtros selecionados.');
        }
        return;
      }

      let countNew = 0;
      let countUpdated = 0;

      matches.forEach(item => {
        const existing = queryProducts.find(p => p.ean === item.ean);
        const reporQty = hasPlan ? (item.sugestao > 0 ? item.sugestao : Math.max(1, (item.estoqueIdeal || 10) - item.estoqueLoja)) : 0;

        if (existing) {
          existing.selecionado = true;
          if (hasPlan && existing.aRepor === 0) existing.aRepor = reporQty;
          countUpdated++;
        } else {
          const copy = JSON.parse(JSON.stringify(item));
          copy.id = Date.now() + Math.floor(Math.random() * 100000);
          copy.aRepor = reporQty;
          copy.selecionado = true;
          queryProducts.unshift(copy);
          countNew++;
        }
      });

      closeAddExtraModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`${matches.length} produto(s) adicionado(s) à consulta com sucesso!`);
      }
      renderAll();
    });
  }

  // 15. Ações do Sticky Footer (Gerar Pedido, Cancelar, Rascunho)
  if (btnGenerateOrder) {
    btnGenerateOrder.addEventListener('click', () => {
      const selectedItems = queryProducts.filter(p => p.selecionado);
      
      if (selectedItems.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Selecione ao menos 1 produto para gerar o pedido.');
        }
        return;
      }

      // Validação: Não permitir produtos selecionados com quantidade a repor <= 0 ou vazia
      const pendingItems = selectedItems.filter(p => !p.aRepor || p.aRepor <= 0);

      if (pendingItems.length > 0) {
        if (typeof Toast !== 'undefined') {
          Toast.error(`Atenção: Existem ${pendingItems.length} produto(s) selecionado(s) sem quantidade a repor definida. Preencha a quantidade antes de gerar o pedido.`);
        }

        // Destaca as linhas/cards e inputs com erro
        pendingItems.forEach(item => {
          const row = document.querySelector(`tr[data-id="${item.id}"]`);
          if (row) {
            row.classList.add('row-repor-error');
            const input = row.querySelector('.input-a-repor');
            if (input) input.classList.add('input-repor-error');
          }
          const card = document.querySelector(`.product-mobile-card[data-id="${item.id}"]`);
          if (card) {
            card.classList.add('card-repor-error');
            const input = card.querySelector('.input-a-repor');
            if (input) input.classList.add('input-repor-error');
          }
        });

        // Rola até o primeiro item com erro e aplica foco
        const firstPending = pendingItems[0];
        const firstRow = document.querySelector(`tr[data-id="${firstPending.id}"]`) || document.querySelector(`.product-mobile-card[data-id="${firstPending.id}"]`);
        if (firstRow) {
          firstRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
          const firstInput = firstRow.querySelector('.input-a-repor');
          if (firstInput) {
            setTimeout(() => firstInput.focus(), 350);
          }
        }

        return;
      }

      const totalUnidades = selectedItems.reduce((acc, curr) => acc + curr.aRepor, 0);
      const totalItens = selectedItems.length;

      // Gera novo código baseado no tamanho da lista
      const currentList = window.PedidosAbastecimentoData || [];
      const nextNum = currentList.length + 6;
      const nextCodigo = String(nextNum).padStart(6, '0');
      
      const hoje = new Date();
      const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

      const novoPedido = {
        id: Date.now(),
        codigo: nextCodigo,
        filial: currentParams.destino,
        planoBase: currentParams.plano,
        qtdeItens: totalUnidades,
        dataCriacao: dataFormatada,
        status: 'Aberto'
      };

      if (typeof window.salvarNovoPedidoNoStorage === 'function') {
        window.salvarNovoPedidoNoStorage(novoPedido);
      }

      if (typeof Toast !== 'undefined') {
        Toast.success(`Pedido ${nextCodigo} gerado com sucesso (${totalItens} produtos, ${totalUnidades} un)! Redirecionando...`);
      }

      btnGenerateOrder.disabled = true;
      btnGenerateOrder.textContent = 'GERANDO PEDIDO...';

      setTimeout(() => {
        window.location.href = './pedidos-abastecimento.html';
      }, 700);
    });
  }

  if (btnCancelQuery) {
    btnCancelQuery.addEventListener('click', () => {
      window.location.href = './pedidos-abastecimento.html';
    });
  }

  if (btnDraftQuery) {
    btnDraftQuery.addEventListener('click', () => {
      if (typeof Toast !== 'undefined') {
        Toast.info('Rascunho da consulta salvo temporariamente.');
      }
    });
  }

  // 16. Inicialização Completa
  updateContextUI();
  setViewMode(currentViewMode);
  renderAll();
});
