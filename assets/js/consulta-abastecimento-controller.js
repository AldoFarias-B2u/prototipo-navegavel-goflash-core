/**
 * GOFLASH CORE - CONTROLADOR AVANÇADO DA TELA DE CONSULTA PARA ABASTECIMENTO
 * Gerencia o estado de produtos, steppers táteis, filtros dinâmicos, bipe e geração de pedidos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Leitura de Parâmetros de URL ou Padrões Oficiais
  const urlParams = new URLSearchParams(window.location.search);
  const paramOrigem = urlParams.get('origem');
  const paramPlano = urlParams.get('plano');

  let currentParams = {
    origem: (paramOrigem && paramOrigem.trim()) ? paramOrigem : 'Não especificada (Entrada direta)',
    destino: urlParams.get('destino') || 'Mini Mercado 03 Simples Nacional',
    plano: (paramPlano && paramPlano.trim()) ? paramPlano : 'Sem plano base (Todos os produtos)',
    filtro: urlParams.get('filtro') || 'completo' // 'completo', 'saldo_ideal', 'saldo_critico'
  };

  // 1.1 Verificação de Presença de Plano de Abastecimento
  function checkHasPlan() {
    return !!(currentParams.plano && 
      !currentParams.plano.toLowerCase().includes('sem plano') && 
      !currentParams.plano.toLowerCase().includes('todos os produtos') &&
      !currentParams.plano.toLowerCase().includes('nenhum'));
  }

  let hasPlan = checkHasPlan();

  // 1.2 Parâmetros Dinâmicos de Catálogo e Estoque
  let lowStockThreshold = 3;
  let catalogSearchText = '';
  let catalogSelectedGrupo = '';
  let catalogSelectedFornecedor = '';
  let catalogStockFilter = 'all'; // 'all', 'zero', 'low', 'cd_available'
  let catalogBatchDefaultQty = 5;
  let catalogItemsState = [];

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
            <button type="button" class="btn-add-extra-products btn-trigger-add-modal" style="height: 42px; font-size: 0.9rem;">
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
          <span class="material-icons">tune</span>
        </div>
        <h3 class="empty-state-title">Consulta de Reposição sem Plano</h3>
        <p class="empty-state-desc">
          Escolha uma ação rápida abaixo para carregar os produtos prioritários ou utilize o catálogo avançado e o leitor de bipe:
        </p>

        <div class="empty-state-quick-cards-grid">
          <!-- Card 1: Ruptura / Zerados -->
          <div class="empty-quick-card">
            <span class="material-icons empty-quick-card-icon" style="color: #c62828;">report_problem</span>
            <div class="empty-quick-card-title">Itens Zerados na Loja</div>
            <div class="empty-quick-card-desc">Carrega diretamente todos os produtos com estoque 0 na loja para reposição urgente.</div>
            <button type="button" class="empty-quick-card-btn btn-card-rupture btn-quick-add-zero">
              <span class="material-icons" style="font-size: 16px;">flash_on</span>
              Carregar Zerados
            </button>
          </div>

          <!-- Card 2: Estoque Baixo Parametrizável -->
          <div class="empty-quick-card">
            <span class="material-icons empty-quick-card-icon" style="color: #f57f17;">warning_amber</span>
            <div class="empty-quick-card-title">Estoque Baixo</div>
            <div class="empty-stock-param-row">
              <span>Estoque abaixo de ≤</span>
              <input type="number" class="param-input-small input-empty-low-threshold" value="${lowStockThreshold}" min="1" max="99">
              <span>un</span>
            </div>
            <button type="button" class="empty-quick-card-btn btn-card-low-stock btn-quick-add-low">
              <span class="material-icons" style="font-size: 16px;">filter_alt</span>
              Carregar (≤ <span class="lbl-empty-low-val">${lowStockThreshold}</span> un)
            </button>
          </div>

          <!-- Card 3: Catálogo Avançado com Filtros -->
          <div class="empty-quick-card">
            <span class="material-icons empty-quick-card-icon" style="color: #6530b5;">manage_search</span>
            <div class="empty-quick-card-title">Catálogo Completo</div>
            <div class="empty-quick-card-desc">Pesquise por Grupo, Fornecedor, Marca ou EAN com filtros avançados e seleção em lote.</div>
            <button type="button" class="empty-quick-card-btn btn-card-catalog btn-trigger-add-modal">
              <span class="material-icons" style="font-size: 16px;">add_circle</span>
              Abrir Catálogo
            </button>
          </div>
        </div>

        <span class="empty-state-scan-badge">
          <span class="material-icons" style="font-size: 16px;">keyboard</span>
          Atalho de bipe ativo: digite o EAN no topo e pressione Enter
        </span>
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
      const reporQty = item.sugestao > 0 ? item.sugestao : Math.max(1, (item.estoqueIdeal || 10) - item.estoqueLoja);
      if (existing) {
        existing.selecionado = true;
        if (existing.aRepor === 0) existing.aRepor = reporQty;
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
  let queryProducts = hasPlan ? JSON.parse(JSON.stringify(window.ConsultaProdutosBase || [])) : [];
  let currentFilterChip = 'all'; // 'all', 'ideal', 'critico', 'selected', 'zero'
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
  const btnViewTable = document.getElementById('btnViewTable');
  const btnViewCards = document.getElementById('btnViewCards');
  
  const summaryItemsCount = document.getElementById('summaryItemsCount');
  const summaryUnitsCount = document.getElementById('summaryUnitsCount');
  const btnGenerateOrder = document.getElementById('btnGenerateOrder');
  const btnCancelQuery = document.getElementById('btnCancelQuery');
  const btnDraftQuery = document.getElementById('btnDraftQuery');
  const selectAllCheckbox = document.getElementById('selectAllCheckbox');

  // Modais
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

    if (destNameDisplay) destNameDisplay.textContent = currentParams.destino || 'Mini Mercado 03 Simples Nacional';
    if (cdNameDisplay) cdNameDisplay.textContent = currentParams.origem || 'Não especificada (Entrada direta)';
    if (planNameDisplay) planNameDisplay.textContent = hasPlan ? currentParams.plano : 'Sem Plano (Inserção Avulsa)';
    
    let descFiltro = 'Plano Completo';
    if (!hasPlan) {
      descFiltro = 'Inserção Manual / Bipagem';
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

    // Atualiza visibilidade dos chips que dependem de plano
    const chipIdeal = document.getElementById('chipFilterIdeal');
    const chipCritico = document.getElementById('chipFilterCritico');
    if (chipIdeal) chipIdeal.style.display = hasPlan ? 'inline-flex' : 'none';
    if (chipCritico) chipCritico.style.display = hasPlan ? 'inline-flex' : 'none';

    if (!hasPlan && (currentFilterChip === 'ideal' || currentFilterChip === 'critico')) {
      currentFilterChip = 'all';
      const filterChips = document.querySelectorAll('.filter-chip');
      filterChips.forEach(c => c.classList.toggle('active', c.getAttribute('data-chip') === 'all'));
    }
  }

  // 5. Filtragem e Obtenção de Produtos Visíveis
  function getFilteredProducts() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    
    return queryProducts.filter(item => {
      // Filtro de Texto (Nome / EAN)
      const matchText = !query || 
        item.nome.toLowerCase().includes(query) || 
        item.ean.includes(query) || 
        (item.marca && item.marca.toLowerCase().includes(query));

      if (!matchText) return false;

      // Filtro de Ocultar Desmarcados
      if (hideUnselected && !item.selecionado) return false;

      // Filtro de Chips
      if (hasPlan && currentFilterChip === 'ideal') {
        return item.estoqueLoja < item.estoqueIdeal;
      }
      if (hasPlan && currentFilterChip === 'critico') {
        return item.estoqueLoja <= item.minimoCritico;
      }
      if (currentFilterChip === 'selected') {
        return item.selecionado;
      }
      if (currentFilterChip === 'zero') {
        return item.estoqueLoja === 0;
      }

      return true;
    });
  }

  // 6. Atualização dos Contadores e Resumo Sticky
  function updateSummary() {
    const selectedItems = queryProducts.filter(p => p.selecionado && p.aRepor > 0);
    const totalUnits = selectedItems.reduce((acc, curr) => acc + (parseInt(curr.aRepor) || 0), 0);

    if (summaryItemsCount) summaryItemsCount.textContent = `${selectedItems.length} item(s)`;
    if (summaryUnitsCount) summaryUnitsCount.textContent = `${totalUnits} un`;

    // Atualiza contadores dos chips
    const countAll = queryProducts.length;
    const countIdeal = hasPlan ? queryProducts.filter(p => p.estoqueLoja < p.estoqueIdeal).length : 0;
    const countCritico = hasPlan ? queryProducts.filter(p => p.estoqueLoja <= p.minimoCritico).length : 0;
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
  }

  // 7. Renderização da Tabela e dos Cards
  function renderAll() {
    updateContextUI();
    const filtered = getFilteredProducts();
    const colCount = hasPlan ? 10 : 7;

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
          const isCritico = hasPlan && item.estoqueLoja <= item.minimoCritico;
          const unselectedClass = !item.selecionado ? 'unselected-row' : '';

          if (hasPlan) {
            return `
              <tr class="${unselectedClass}" data-id="${item.id}">
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
                  <a href="javascript:void(0)" class="product-ean-link">${item.ean}</a>
                  <div class="product-desc-title">${item.nome}</div>
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
                <td style="text-align: center;">
                  <span class="stock-pill stock-pill-cd">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                </td>
                <td class="col-plan-param" style="text-align: center;">
                  <span class="stock-pill stock-pill-sugestao">${item.sugestao !== undefined ? item.sugestao : '-'}</span>
                </td>
                <td style="text-align: center; min-width: 140px;">
                  <div class="repor-stepper-wrapper">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor}" 
                      min="0"
                      max="999"
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
              <tr class="${unselectedClass}" data-id="${item.id}">
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
                  <a href="javascript:void(0)" class="product-ean-link">${item.ean}</a>
                  <div class="product-desc-title">${item.nome}</div>
                </td>
                <td style="text-align: center;">
                  <span class="stock-pill stock-pill-loja ${item.estoqueLoja === 0 ? 'is-critico' : ''}">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
                </td>
                <td style="text-align: center;">
                  <span class="stock-pill stock-pill-cd">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
                </td>
                <td style="text-align: center; min-width: 140px;">
                  <div class="repor-stepper-wrapper">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}" aria-label="Diminuir">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor}" 
                      min="0"
                      max="999"
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
          const isCritico = hasPlan && item.estoqueLoja <= item.minimoCritico;
          const unselectedClass = !item.selecionado ? 'unselected-card' : '';

          const stockGridHtml = hasPlan ? `
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
              <div class="card-stock-item">
                <span class="card-stock-label">Sugestão</span>
                <span class="card-stock-val" style="color: #6530b5;">${item.sugestao !== undefined ? item.sugestao : '-'}</span>
              </div>
            </div>
          ` : `
            <div class="card-stock-grid" style="grid-template-columns: 1fr 1fr;">
              <div class="card-stock-item">
                <span class="card-stock-label">Estoque Loja</span>
                <span class="card-stock-val" style="color: ${item.estoqueLoja === 0 ? '#c62828' : '#1976d2'}; font-weight: 700;">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
              </div>
              <div class="card-stock-item">
                <span class="card-stock-label">Estoque CD</span>
                <span class="card-stock-val" style="color: #388e3c; font-weight: 700;">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
              </div>
            </div>
          `;

          return `
            <div class="product-mobile-card ${unselectedClass}" data-id="${item.id}">
              <div class="card-header-row">
                <input 
                  type="checkbox" 
                  class="table-custom-checkbox product-select-checkbox" 
                  data-id="${item.id}"
                  ${item.selecionado ? 'checked' : ''}
                  style="margin-top: 4px;"
                >
                <div class="card-photo-box">
                  <img src="${item.foto}" alt="${item.nome}" onerror="this.src='../assets/images/logo-homepage.png'">
                </div>
                <div class="card-info-box">
                  <span class="card-ean-tag">${item.ean}</span>
                  <h4 class="card-product-title">${item.nome}</h4>
                </div>
              </div>

              ${stockGridHtml}

              <div class="card-action-row">
                <div class="card-repor-group">
                  <span class="card-repor-label">A Repor:</span>
                  <div class="repor-stepper-wrapper">
                    <button type="button" class="repor-stepper-btn btn-stepper-minus" data-id="${item.id}">−</button>
                    <input 
                      type="number" 
                      class="repor-stepper-input input-a-repor" 
                      data-id="${item.id}" 
                      value="${item.aRepor}" 
                      min="0"
                      max="999"
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

  // 8. Eventos Interativos (Checkboxes, Steppers, Remoção, Gatilhos Empty State)
  function bindInteractiveEvents() {
    // Gatilho de Abrir Catálogo Completo
    const triggerAddBtns = document.querySelectorAll('.btn-trigger-add-modal');
    triggerAddBtns.forEach(btn => {
      btn.addEventListener('click', openAddExtraModal);
    });

    // Ação Rápida Empty State: Zerados
    const btnQuickZero = document.querySelectorAll('.btn-quick-add-zero');
    btnQuickZero.forEach(btn => {
      btn.addEventListener('click', () => addProductsByFilter({ zeroOnly: true }));
    });

    // Ação Rápida Empty State: Estoque Baixo
    const btnQuickLow = document.querySelectorAll('.btn-quick-add-low');
    btnQuickLow.forEach(btn => {
      btn.addEventListener('click', () => addProductsByFilter({ lowStockOnly: true, threshold: lowStockThreshold }));
    });

    // Input de Parâmetro de Estoque Baixo no Empty State
    const inputsEmptyLow = document.querySelectorAll('.input-empty-low-threshold');
    inputsEmptyLow.forEach(inp => {
      inp.addEventListener('input', (e) => {
        const val = Math.max(1, parseInt(e.target.value) || 1);
        lowStockThreshold = val;
        
        // Sincroniza labels e outros inputs
        document.querySelectorAll('.lbl-empty-low-val').forEach(lbl => lbl.textContent = val);
        const catalogParamInput = document.getElementById('catalogStockLowParamInput');
        if (catalogParamInput) catalogParamInput.value = val;
        const chipLabel = document.getElementById('chipStockLowLabel');
        if (chipLabel) chipLabel.textContent = `Estoque abaixo de ≤ ${val} un`;
      });
    });

    // Checkboxes de Seleção
    const checkboxes = document.querySelectorAll('.product-select-checkbox');
    checkboxes.forEach(chk => {
      chk.addEventListener('change', () => {
        const id = chk.getAttribute('data-id');
        const prod = queryProducts.find(p => p.id == id);
        if (prod) {
          prod.selecionado = chk.checked;
          if (prod.selecionado && prod.aRepor === 0) {
            prod.aRepor = (hasPlan && prod.sugestao > 0) ? prod.sugestao : 1;
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

  // 10. Busca por Texto e Bipe de Código de Barras
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
              Toast.success(`Produto adicionado via bipe: ${newProd.nome.substring(0, 28)}...`);
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

  // 11. Botão Ocultar / Mostrar Desmarcados
  if (btnToggleUnselected) {
    btnToggleUnselected.addEventListener('click', () => {
      hideUnselected = !hideUnselected;
      btnToggleUnselected.classList.toggle('active', hideUnselected);
      const icon = hideUnselected ? 'visibility' : 'visibility_off';
      const label = hideUnselected ? 'Mostrar Todos' : 'Ocultar Desmarcados';
      btnToggleUnselected.innerHTML = `<span class="material-icons">${icon}</span> <span class="btn-text-unselected">${label}</span>`;
      renderAll();
    });
  }

  // 11. Selecionar Todos / Desmarcar Todos da Tela Principal
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

  // 12. Chips de Filtro Rápido da Barra de Ferramentas
  const filterChips = document.querySelectorAll('.filter-chip');
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilterChip = chip.getAttribute('data-chip') || 'all';
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
  const hintNoPlanoModal = document.getElementById('hintNoPlanoModal');

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
          containerFiltrosPlanoModal.classList.remove('hidden');
        } else {
          containerFiltrosPlanoModal.classList.add('hidden');
        }
      }

      if (hintNoPlanoModal) {
        hintNoPlanoModal.style.display = isPlano ? 'none' : 'flex';
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
        for (let i = 0; i < selectPlanoModal.options.length; i++) {
          if (selectPlanoModal.options[i].text === currentParams.plano) {
            selectPlanoModal.selectedIndex = i;
            break;
          }
        }
      }

      updateModalParamsSelectHints();

      const radios = modalParams.querySelectorAll('input[name="filterScope"]');
      radios.forEach(r => {
        r.checked = (r.value === currentParams.filtro);
        r.closest('.modal-radio-card')?.classList.toggle('active', r.checked);
      });
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

  const radioCards = document.querySelectorAll('.modal-radio-card');
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const input = card.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });

  if (btnApplyParams) {
    btnApplyParams.addEventListener('click', () => {
      const optOrigem = selectOrigemModal ? selectOrigemModal.options[selectOrigemModal.selectedIndex] : null;
      const optDestino = selectDestinoModal ? selectDestinoModal.options[selectDestinoModal.selectedIndex] : null;
      const optPlano = selectPlanoModal ? selectPlanoModal.options[selectPlanoModal.selectedIndex] : null;
      const selectedRadio = document.querySelector('input[name="filterScope"]:checked');

      const prevHasPlan = hasPlan;

      currentParams.origem = (optOrigem && optOrigem.value) ? optOrigem.text : 'Não especificada (Entrada direta)';
      currentParams.destino = (optDestino && optDestino.value) ? optDestino.text : 'Mini Mercado 03 Simples Nacional';
      currentParams.plano = (optPlano && optPlano.value) ? optPlano.text : 'Sem plano base (Todos os produtos)';
      currentParams.filtro = (optPlano && optPlano.value && selectedRadio) ? selectedRadio.value : 'completo';

      hasPlan = checkHasPlan();

      if (!prevHasPlan && hasPlan && queryProducts.length === 0) {
        queryProducts = JSON.parse(JSON.stringify(window.ConsultaProdutosBase || []));
      }

      updateContextUI();
      closeParamsModal();

      if (typeof Toast !== 'undefined') {
        Toast.success('Filtros atualizados com sucesso!');
      }

      if (hasPlan && currentParams.filtro === 'saldo_ideal') {
        currentFilterChip = 'ideal';
      } else if (hasPlan && currentParams.filtro === 'saldo_critico') {
        currentFilterChip = 'critico';
      } else {
        currentFilterChip = 'all';
      }

      filterChips.forEach(c => {
        c.classList.toggle('active', c.getAttribute('data-chip') === currentFilterChip);
      });

      renderAll();
    });
  }

  // ==========================================================================
  // 14. CATÁLOGO INTELIGENTE DE REPOSIÇÃO (MULTICRITÉRIO COM FILTROS AVANÇADOS)
  // ==========================================================================
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catalogGrupoSelect = document.getElementById('catalogGrupoSelect');
  const catalogFornecedorSelect = document.getElementById('catalogFornecedorSelect');
  const catalogStockChips = document.querySelectorAll('.catalog-stock-chip');
  const catalogStockLowParamInput = document.getElementById('catalogStockLowParamInput');
  const chipStockLowLabel = document.getElementById('chipStockLowLabel');
  const chipStockLowWrapper = document.getElementById('chipStockLowWrapper');
  const catalogSelectAllCheckbox = document.getElementById('catalogSelectAllCheckbox');
  const catalogFilteredCount = document.getElementById('catalogFilteredCount');
  const catalogBatchDefaultQtyInput = document.getElementById('catalogBatchDefaultQtyInput');
  const btnBatchQtyMinus = document.getElementById('btnBatchQtyMinus');
  const btnBatchQtyPlus = document.getElementById('btnBatchQtyPlus');
  const btnApplyBatchQty = document.getElementById('btnApplyBatchQty');
  const catalogSelectionSummary = document.getElementById('catalogSelectionSummary');

  // Inicializa o estado dos itens do catálogo
  function initCatalogItemsState() {
    const master = getMasterCatalog();
    catalogItemsState = master.map(item => {
      const inQuery = queryProducts.find(p => p.ean === item.ean);
      return {
        item: item,
        checked: inQuery ? inQuery.selecionado : (item.estoqueLoja === 0),
        aRepor: inQuery ? inQuery.aRepor : (item.sugestao || Math.max(1, (item.estoqueIdeal || 10) - item.estoqueLoja))
      };
    });
  }

  // Filtra itens do catálogo com base em todos os critérios ativos
  function getFilteredCatalogItems() {
    return catalogItemsState.filter(entry => {
      const p = entry.item;

      // 1. Filtro por Texto / EAN / Marca
      if (catalogSearchText) {
        const query = catalogSearchText.toLowerCase();
        const match = p.nome.toLowerCase().includes(query) ||
          p.ean.includes(query) ||
          (p.marca && p.marca.toLowerCase().includes(query));
        if (!match) return false;
      }

      // 2. Filtro por Grupo (Categoria)
      if (catalogSelectedGrupo) {
        const itemGrupo = p.grupo || p.categoria || '';
        if (itemGrupo.toLowerCase() !== catalogSelectedGrupo.toLowerCase()) return false;
      }

      // 3. Filtro por Fornecedor / Fabricante
      if (catalogSelectedFornecedor) {
        const itemForn = p.fornecedor || '';
        if (!itemForn.toLowerCase().includes(catalogSelectedFornecedor.toLowerCase())) return false;
      }

      // 4. Filtro por Nível de Estoque
      if (catalogStockFilter === 'zero') {
        return p.estoqueLoja === 0;
      } else if (catalogStockFilter === 'low') {
        return p.estoqueLoja <= lowStockThreshold;
      } else if (catalogStockFilter === 'cd_available') {
        return (p.estoqueCd || 0) > 0;
      }

      return true;
    });
  }

  // Renderiza a listagem de produtos dentro do modal de catálogo
  function renderCatalogList() {
    if (!extraProductsList) return;
    const filtered = getFilteredCatalogItems();

    if (catalogFilteredCount) catalogFilteredCount.textContent = filtered.length;

    // Atualiza contagem total de selecionados no catálogo
    const totalSelected = catalogItemsState.filter(e => e.checked);
    const totalUnits = totalSelected.reduce((sum, curr) => sum + (parseInt(curr.aRepor) || 0), 0);
    if (catalogSelectionSummary) {
      catalogSelectionSummary.textContent = `${totalSelected.length} item(s) selecionado(s) • ${totalUnits} un total`;
    }

    // Sincroniza checkbox "Marcar Todos Filtrados"
    if (catalogSelectAllCheckbox) {
      if (filtered.length === 0) {
        catalogSelectAllCheckbox.checked = false;
        catalogSelectAllCheckbox.indeterminate = false;
      } else {
        const allChecked = filtered.every(e => e.checked);
        const someChecked = filtered.some(e => e.checked);
        catalogSelectAllCheckbox.checked = allChecked;
        catalogSelectAllCheckbox.indeterminate = !allChecked && someChecked;
      }
    }

    if (filtered.length === 0) {
      extraProductsList.innerHTML = `
        <div style="text-align: center; padding: 2.5rem; color: #757575;">
          <span class="material-icons" style="font-size: 36px; display: block; margin-bottom: 8px; color: #bdbdbd;">search_off</span>
          Nenhum produto encontrado com os filtros selecionados.
        </div>
      `;
      return;
    }

    extraProductsList.innerHTML = filtered.map(entry => {
      const p = entry.item;
      const isZero = p.estoqueLoja === 0;
      const isLow = !isZero && p.estoqueLoja <= lowStockThreshold;
      const lojaClass = isZero ? 'is-zero' : (isLow ? 'is-low' : 'is-ok');
      const lojaLabel = isZero ? '0 un (Zerado)' : `${p.estoqueLoja} un`;

      return `
        <div class="catalog-product-row" data-ean="${p.ean}">
          <div class="catalog-product-main-col">
            <input 
              type="checkbox" 
              class="table-custom-checkbox extra-prod-chk" 
              data-ean="${p.ean}" 
              ${entry.checked ? 'checked' : ''}
              aria-label="Selecionar ${p.nome}"
            >
            <img src="${p.foto}" alt="${p.nome}" class="catalog-prod-thumb" onerror="this.src='../assets/images/logo-homepage.png'">
            <div class="catalog-prod-details">
              <span class="catalog-prod-ean">${p.ean}</span>
              <div class="catalog-prod-name" title="${p.nome}">${p.nome}</div>
              <div class="catalog-prod-tags-row">
                <span class="catalog-tag-grupo">${p.grupo || p.categoria || 'Geral'}</span>
                <span class="catalog-tag-fornecedor">${p.fornecedor || p.marca || 'Distribuidor'}</span>
              </div>
            </div>
          </div>

          <div class="catalog-product-stock-col">
            <span class="badge-stock-loja ${lojaClass}" title="Estoque atual na loja">Loja: ${lojaLabel}</span>
            <span class="badge-stock-cd" title="Estoque disponível no CD">CD: ${p.estoqueCd !== undefined ? p.estoqueCd : 0} un</span>
            
            <div class="repor-stepper-wrapper" style="width: 105px;">
              <button type="button" class="repor-stepper-btn catalog-item-minus" data-ean="${p.ean}">−</button>
              <input 
                type="number" 
                class="repor-stepper-input extra-prod-qty" 
                data-ean="${p.ean}" 
                value="${entry.aRepor}" 
                min="1" 
                max="999"
              >
              <button type="button" class="repor-stepper-btn catalog-item-plus" data-ean="${p.ean}">+</button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    bindCatalogRowEvents();
  }

  // Eventos das linhas da lista do catálogo
  function bindCatalogRowEvents() {
    const chks = extraProductsList.querySelectorAll('.extra-prod-chk');
    chks.forEach(chk => {
      chk.addEventListener('change', () => {
        const ean = chk.getAttribute('data-ean');
        const entry = catalogItemsState.find(e => e.item.ean === ean);
        if (entry) {
          entry.checked = chk.checked;
          renderCatalogList();
        }
      });
    });

    const minusBtns = extraProductsList.querySelectorAll('.catalog-item-minus');
    minusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ean = btn.getAttribute('data-ean');
        const entry = catalogItemsState.find(e => e.item.ean === ean);
        if (entry && entry.aRepor > 1) {
          entry.aRepor -= 1;
          renderCatalogList();
        }
      });
    });

    const plusBtns = extraProductsList.querySelectorAll('.catalog-item-plus');
    plusBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const ean = btn.getAttribute('data-ean');
        const entry = catalogItemsState.find(e => e.item.ean === ean);
        if (entry) {
          entry.aRepor = (parseInt(entry.aRepor) || 0) + 1;
          entry.checked = true;
          renderCatalogList();
        }
      });
    });

    const qtyInputs = extraProductsList.querySelectorAll('.extra-prod-qty');
    qtyInputs.forEach(inp => {
      inp.addEventListener('change', () => {
        const ean = inp.getAttribute('data-ean');
        const entry = catalogItemsState.find(e => e.item.ean === ean);
        if (entry) {
          const val = Math.max(1, parseInt(inp.value) || 1);
          entry.aRepor = val;
          entry.checked = true;
          renderCatalogList();
        }
      });
    });
  }

  // Controles de Filtros do Modal de Catálogo
  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', (e) => {
      catalogSearchText = e.target.value.trim();
      renderCatalogList();
    });
  }

  if (catalogGrupoSelect) {
    catalogGrupoSelect.addEventListener('change', (e) => {
      catalogSelectedGrupo = e.target.value;
      renderCatalogList();
    });
  }

  if (catalogFornecedorSelect) {
    catalogFornecedorSelect.addEventListener('change', (e) => {
      catalogSelectedFornecedor = e.target.value;
      renderCatalogList();
    });
  }

  catalogStockChips.forEach(chip => {
    chip.addEventListener('click', () => {
      catalogStockChips.forEach(c => c.classList.remove('active'));
      if (chipStockLowWrapper) chipStockLowWrapper.classList.remove('active');

      chip.classList.add('active');
      const filterType = chip.getAttribute('data-stock-filter');
      catalogStockFilter = filterType;

      if (filterType === 'low' && chipStockLowWrapper) {
        chipStockLowWrapper.classList.add('active');
      }

      renderCatalogList();
    });
  });

  if (catalogStockLowParamInput) {
    catalogStockLowParamInput.addEventListener('input', (e) => {
      const val = Math.max(1, parseInt(e.target.value) || 1);
      lowStockThreshold = val;
      if (chipStockLowLabel) chipStockLowLabel.textContent = `Estoque abaixo de ≤ ${val} un`;
      document.querySelectorAll('.lbl-empty-low-val').forEach(lbl => lbl.textContent = val);
      document.querySelectorAll('.input-empty-low-threshold').forEach(inp => inp.value = val);
      if (catalogStockFilter === 'low') {
        renderCatalogList();
      }
    });
  }

  if (catalogSelectAllCheckbox) {
    catalogSelectAllCheckbox.addEventListener('change', () => {
      const isChecked = catalogSelectAllCheckbox.checked;
      const filtered = getFilteredCatalogItems();
      filtered.forEach(entry => entry.checked = isChecked);
      renderCatalogList();
    });
  }

  // Ações de Quantidade em Lote
  if (btnBatchQtyMinus && catalogBatchDefaultQtyInput) {
    btnBatchQtyMinus.addEventListener('click', () => {
      const current = Math.max(1, parseInt(catalogBatchDefaultQtyInput.value) || 1);
      catalogBatchDefaultQtyInput.value = Math.max(1, current - 1);
      catalogBatchDefaultQty = parseInt(catalogBatchDefaultQtyInput.value);
    });
  }

  if (btnBatchQtyPlus && catalogBatchDefaultQtyInput) {
    btnBatchQtyPlus.addEventListener('click', () => {
      const current = parseInt(catalogBatchDefaultQtyInput.value) || 1;
      catalogBatchDefaultQtyInput.value = current + 1;
      catalogBatchDefaultQty = parseInt(catalogBatchDefaultQtyInput.value);
    });
  }

  if (catalogBatchDefaultQtyInput) {
    catalogBatchDefaultQtyInput.addEventListener('change', () => {
      catalogBatchDefaultQty = Math.max(1, parseInt(catalogBatchDefaultQtyInput.value) || 1);
      catalogBatchDefaultQtyInput.value = catalogBatchDefaultQty;
    });
  }

  if (btnApplyBatchQty) {
    btnApplyBatchQty.addEventListener('click', () => {
      const checkedEntries = catalogItemsState.filter(e => e.checked);
      if (checkedEntries.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Selecione produtos na lista antes de aplicar a quantidade.');
        }
        return;
      }
      checkedEntries.forEach(e => e.aRepor = catalogBatchDefaultQty);
      renderCatalogList();
      if (typeof Toast !== 'undefined') {
        Toast.info(`Quantidade de ${catalogBatchDefaultQty} un aplicada a ${checkedEntries.length} produto(s).`);
      }
    });
  }

  // Abertura e Fechamento do Modal de Catálogo
  function openAddExtraModal() {
    if (modalAddExtra) {
      initCatalogItemsState();
      
      // Sincroniza parâmetros na abertura
      if (catalogStockLowParamInput) catalogStockLowParamInput.value = lowStockThreshold;
      if (chipStockLowLabel) chipStockLowLabel.textContent = `Estoque abaixo de ≤ ${lowStockThreshold} un`;
      if (catalogSearchInput) {
        catalogSearchInput.value = '';
        catalogSearchText = '';
      }
      
      renderCatalogList();
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

  // Confirmação de Inclusão dos Produtos Selecionados
  if (btnConfirmAddExtra) {
    btnConfirmAddExtra.addEventListener('click', () => {
      const selectedEntries = catalogItemsState.filter(e => e.checked && e.aRepor > 0);

      if (selectedEntries.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Nenhum produto marcado para inclusão.');
        }
        return;
      }

      let countNew = 0;
      let countUpdated = 0;

      selectedEntries.forEach(entry => {
        const item = entry.item;
        const existing = queryProducts.find(p => p.ean === item.ean);

        if (existing) {
          existing.aRepor = entry.aRepor;
          existing.selecionado = true;
          countUpdated++;
        } else {
          const copy = JSON.parse(JSON.stringify(item));
          copy.id = Date.now() + Math.floor(Math.random() * 100000);
          copy.aRepor = entry.aRepor;
          copy.selecionado = true;
          queryProducts.unshift(copy);
          countNew++;
        }
      });

      closeAddExtraModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`${countNew + countUpdated} produto(s) adicionado(s) à consulta com sucesso!`);
      }
      renderAll();
    });
  }

  // 15. Ações do Sticky Footer (Gerar Pedido, Cancelar, Rascunho)
  if (btnGenerateOrder) {
    btnGenerateOrder.addEventListener('click', () => {
      const itemsToOrder = queryProducts.filter(p => p.selecionado && p.aRepor > 0);
      
      if (itemsToOrder.length === 0) {
        if (typeof Toast !== 'undefined') {
          Toast.warning('Selecione ao menos 1 produto com quantidade a repor maior que zero.');
        }
        return;
      }

      const totalUnidades = itemsToOrder.reduce((acc, curr) => acc + curr.aRepor, 0);
      const totalItens = itemsToOrder.length;

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
