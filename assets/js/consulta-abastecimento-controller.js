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
              <div class="consulta-empty-state">
                <div class="empty-state-icon-box">
                  <span class="material-icons">${hasPlan ? 'inventory_2' : 'qr_code_scanner'}</span>
                </div>
                <h3 class="empty-state-title">${hasPlan ? 'Nenhum produto cadastrado no plano' : 'Nenhum produto adicionado à consulta'}</h3>
                <p class="empty-state-desc">
                  ${hasPlan 
                    ? 'Não foram encontrados produtos para os parâmetros deste plano.' 
                    : 'Utilize o leitor de código de barras no campo superior ou clique no botão abaixo para adicionar produtos do catálogo.'}
                </p>
                <div class="empty-state-actions">
                  <button type="button" class="btn-add-extra-products btn-trigger-add-modal" style="height: 42px; font-size: 0.9rem;">
                    <span class="material-icons">add_circle</span>
                    Adicionar Produtos do Catálogo
                  </button>
                  <span class="empty-state-scan-badge">
                    <span class="material-icons" style="font-size: 16px;">keyboard</span>
                    Atalho de bipe ativo: digite o EAN e pressione Enter
                  </span>
                </div>
              </div>
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
            // MODO SEM PLANO (Apenas colunas relevantes e essenciais)
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
                  <span class="stock-pill stock-pill-loja">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
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
            <div class="consulta-empty-state">
              <div class="empty-state-icon-box">
                <span class="material-icons">${hasPlan ? 'inventory_2' : 'qr_code_scanner'}</span>
              </div>
              <h3 class="empty-state-title">${hasPlan ? 'Nenhum produto no plano' : 'Nenhum produto adicionado'}</h3>
              <p class="empty-state-desc">
                ${hasPlan 
                  ? 'Não foram encontrados produtos para este plano.' 
                  : 'Bipe o código de barras no campo superior ou adicione produtos do catálogo.'}
              </p>
              <div class="empty-state-actions">
                <button type="button" class="btn-add-extra-products btn-trigger-add-modal" style="height: 42px; font-size: 0.9rem;">
                  <span class="material-icons">add_circle</span>
                  Adicionar Produtos
                </button>
              </div>
            </div>
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
                <span class="card-stock-val" style="color: #1976d2;">${item.estoqueLoja !== undefined ? item.estoqueLoja : 0}</span>
              </div>
              <div class="card-stock-item">
                <span class="card-stock-label">Estoque CD</span>
                <span class="card-stock-val" style="color: #388e3c;">${item.estoqueCd !== undefined ? item.estoqueCd : '-'}</span>
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

  // 8. Eventos Interativos (Checkboxes, Steppers, Remoção, Gatilhos)
  function bindInteractiveEvents() {
    // Gatilho do botão Adicionar dentro do Empty State
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
      inp.addEventListener('change', (e) => {
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
          // 2. Procura em todos os catálogos cadastrados
          const extraCatalog = window.CatalogoExtraProdutos || [];
          const baseCatalog = window.ConsultaProdutosBase || [];
          const matched = extraCatalog.find(p => p.ean === code) || baseCatalog.find(p => p.ean === code);

          if (matched) {
            const newProd = JSON.parse(JSON.stringify(matched));
            newProd.id = Date.now();
            newProd.aRepor = 1;
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

  // 11.1 Checkbox do Topo da Tabela: Marcar / Desmarcar Todos
  if (selectAllCheckbox) {
    selectAllCheckbox.addEventListener('change', () => {
      const isChecked = selectAllCheckbox.checked;
      const visible = getFilteredProducts();
      
      visible.forEach(prod => {
        prod.selecionado = isChecked;
        if (isChecked && prod.aRepor === 0 && prod.sugestao > 0) {
          prod.aRepor = prod.sugestao;
        }
      });

      if (typeof Toast !== 'undefined') {
        Toast.info(isChecked ? 'Todos os produtos visíveis foram marcados.' : 'Todos os produtos visíveis foram desmarcados.');
      }

      renderAll();
    });
  }

  // 12. Chips de Filtro Rápido
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
      const hasPlan = !!(opt && opt.value);
      hintPlanoModal.textContent = opt ? (opt.getAttribute('data-code') || (hasPlan ? opt.value : 'Opcional')) : 'Opcional';

      if (containerFiltrosPlanoModal) {
        if (hasPlan) {
          containerFiltrosPlanoModal.classList.remove('hidden');
        } else {
          containerFiltrosPlanoModal.classList.add('hidden');
        }
      }

      if (hintNoPlanoModal) {
        hintNoPlanoModal.style.display = hasPlan ? 'none' : 'flex';
      }
    }
  }

  if (selectOrigemModal) selectOrigemModal.addEventListener('change', updateModalParamsSelectHints);
  if (selectDestinoModal) selectDestinoModal.addEventListener('change', updateModalParamsSelectHints);
  if (selectPlanoModal) selectPlanoModal.addEventListener('change', updateModalParamsSelectHints);

  function openParamsModal() {
    if (modalParams) {
      modalParams.classList.add('show', 'active');
      
      // Sincroniza selects com currentParams
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

      // Selecionar radio atual
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

  // Seleção de radio card no modal de parâmetros
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

      // Re-aplica filtro inicial nos produtos
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

  // 14. Modal de Adicionar Produtos Extras (Multicritério)
  function renderExtraProductsModal() {
    if (!extraProductsList) return;
    const extras = window.CatalogoExtraProdutos || [];

    extraProductsList.innerHTML = extras.map(item => `
      <div class="product-selection-row" style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; border-bottom: 1px solid #f0f0f0;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <input type="checkbox" class="table-custom-checkbox extra-prod-chk" data-id="${item.id}" checked>
          <img src="${item.foto}" alt="${item.nome}" style="width: 44px; height: 44px; object-fit: contain; border-radius: 4px; border: 1px solid #eee; padding: 2px;">
          <div>
            <span style="font-size: 0.75rem; color: #1976d2; font-weight: 500;">${item.ean}</span>
            <div style="font-size: 0.88rem; font-weight: 500; color: #212529;">${item.nome}</div>
            <span style="font-size: 0.75rem; color: #757575;">${item.categoria} • ${item.marca}</span>
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 0.8rem; color: #555;">Repor:</span>
          <input type="number" class="extra-prod-qty" data-id="${item.id}" value="${item.sugestao || 5}" min="1" style="width: 54px; height: 32px; text-align: center; border: 1px solid #ccc; border-radius: 4px; font-weight: 700;">
        </div>
      </div>
    `).join('');
  }

  function openAddExtraModal() {
    if (modalAddExtra) {
      renderExtraProductsModal();
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

  if (btnConfirmAddExtra) {
    btnConfirmAddExtra.addEventListener('click', () => {
      const selectedChecks = extraProductsList.querySelectorAll('.extra-prod-chk:checked');
      let countAdded = 0;

      selectedChecks.forEach(chk => {
        const id = chk.getAttribute('data-id');
        const extraItem = (window.CatalogoExtraProdutos || []).find(p => p.id == id);
        const qtyInput = extraProductsList.querySelector(`.extra-prod-qty[data-id="${id}"]`);
        const qty = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

        if (extraItem) {
          // Verifica se já não existe na consulta
          const existing = queryProducts.find(p => p.ean === extraItem.ean);
          if (existing) {
            existing.aRepor += qty;
            existing.selecionado = true;
          } else {
            const copy = JSON.parse(JSON.stringify(extraItem));
            copy.id = Date.now() + Math.random();
            copy.aRepor = qty;
            copy.selecionado = true;
            queryProducts.unshift(copy);
          }
          countAdded++;
        }
      });

      closeAddExtraModal();
      if (typeof Toast !== 'undefined') {
        Toast.success(`${countAdded} produto(s) adicionado(s) à consulta!`);
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
