/**
 * GOFLASH CORE - CONTROLADOR DE PEDIDO DE ABASTECIMENTO MANUAL & VISUALIZAÇÃO DE DETALHES
 * Gerencia a adição manual de produtos, steppers de quantidade, controle estrito de validades e lotes,
 * cálculo financeiro em tempo real, controle de permissões por status (Aberto = edição, Pendente/Recebido = read-only)
 * e persistência no localStorage.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Estado da Aplicação
  const rawCatalog = window.CatalogoCompletoProdutos || window.ConsultaProdutosBase || [];
  let cartItems = [];
  let currentEditingItemForLotes = null;
  let temporaryLotes = [];
  let currentSelectedStatus = 'Pendente de Abastecimento';
  let isReadOnlyMode = false;
  let currentLoadedOrder = null;
  let currentOrderCode = '000038';

  // 2. Elementos Principais do DOM
  const container = document.querySelector('.pedido-manual-container');
  const selectHeroDestino = document.getElementById('selectHeroDestino');
  const selectHeroOrigem = document.getElementById('selectHeroOrigem');
  const txtHeroCode = document.getElementById('txtHeroCode');
  const heroStatusBadge = document.getElementById('heroStatusBadge');
  const sectionModeBadge = document.getElementById('sectionModeBadge');

  const readonlyBanner = document.getElementById('readonlyBannerAlert');
  const readonlyBannerIcon = document.getElementById('readonlyBannerIcon');
  const readonlyBannerTitle = document.getElementById('readonlyBannerTitle');
  const readonlyBannerDesc = document.getElementById('readonlyBannerDesc');

  const btnFooterBackToOrders = document.getElementById('btnFooterBackToOrders');
  const btnFooterConfirm = document.getElementById('btnFooterConfirm');
  const btnHeaderSave = document.getElementById('btnHeaderSave');
  const btnFooterDraft = document.getElementById('btnFooterDraft');
  const btnFooterDiscard = document.getElementById('btnFooterDiscard');

  const tbody = document.getElementById('pedidoTableBody');
  const cardsGrid = document.getElementById('pedidoCardsGrid');
  const emptyState = document.getElementById('pedidoEmptyState');
  const tableWrapper = document.getElementById('pedidoTableWrapper');

  const footerSkusCount = document.getElementById('footerSkusCount');
  const footerUnitsCount = document.getElementById('footerUnitsCount');
  const footerTotalValue = document.getElementById('footerTotalValue');
  const tabCountProdutos = document.getElementById('tabCountProdutos');

  // 3. Leitura dos Parâmetros da URL e Carregamento do Pedido
  const urlParams = new URLSearchParams(window.location.search);
  const paramId = urlParams.get('id');
  const paramCodigo = urlParams.get('codigo');
  const paramDestino = urlParams.get('destino') || 'Mini Mercado 03 Simples Nacional';
  const paramOrigem = urlParams.get('origem') || '';

  if (paramId || paramCodigo) {
    // Modo Visualização / Edição de Pedido Existente
    if (typeof window.getPedidoByIdOrCode === 'function') {
      currentLoadedOrder = window.getPedidoByIdOrCode(paramId, paramCodigo);
    }
  }

  if (currentLoadedOrder) {
    // Pedido Existente Carregado
    currentOrderCode = currentLoadedOrder.codigo || '000000';
    if (txtHeroCode) txtHeroCode.textContent = currentOrderCode;

    const orderStatus = (currentLoadedOrder.status || 'Aberto');
    isReadOnlyMode = (orderStatus.toLowerCase() !== 'aberto');

    // Filiais
    if (selectHeroDestino && currentLoadedOrder.filial) {
      setSelectOption(selectHeroDestino, currentLoadedOrder.filial);
    }
    if (selectHeroOrigem && currentLoadedOrder.filialOrigem) {
      setSelectOption(selectHeroOrigem, currentLoadedOrder.filialOrigem);
    }

    // Itens
    cartItems = currentLoadedOrder.itens ? JSON.parse(JSON.stringify(currentLoadedOrder.itens)) : [];

    // Detalhes
    const inputResp = document.getElementById('inputResponsavel');
    const txtObs = document.getElementById('textareaObservacoes');
    if (inputResp && currentLoadedOrder.responsavel) inputResp.value = currentLoadedOrder.responsavel;
    if (txtObs && currentLoadedOrder.observacoes) txtObs.value = currentLoadedOrder.observacoes;

    applyStatusAndModeUI(orderStatus, isReadOnlyMode);
  } else {
    // Novo Pedido em Elaboração
    isReadOnlyMode = false;
    const existingOrders = window.PedidosAbastecimentoData || [];
    const nextNum = existingOrders.length + 8;
    currentOrderCode = String(nextNum).padStart(6, '0');
    if (txtHeroCode) txtHeroCode.textContent = currentOrderCode;

    if (selectHeroDestino && paramDestino) setSelectOption(selectHeroDestino, paramDestino);
    if (selectHeroOrigem && paramOrigem) setSelectOption(selectHeroOrigem, paramOrigem);

    applyStatusAndModeUI('Aberto', false);
  }

  function setSelectOption(selectEl, valueToSet) {
    if (!selectEl) return;
    let found = false;
    for (let opt of selectEl.options) {
      if (opt.value === valueToSet) {
        opt.selected = true;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOpt = new Option(valueToSet, valueToSet, true, true);
      selectEl.add(newOpt);
    }
  }

  function applyStatusAndModeUI(statusName, readOnly) {
    const statusLower = (statusName || '').toLowerCase();
    let badgeClass = 'badge-status-aberto';

    if (statusLower.includes('cancelado')) {
      badgeClass = 'badge-status-cancelado';
    } else if (statusLower.includes('recebido')) {
      badgeClass = 'badge-status-recebido';
    } else if (statusLower.includes('pendente') || statusLower.includes('trânsito') || statusLower.includes('transito')) {
      badgeClass = 'badge-status-pendente-abastecimento';
    }

    if (heroStatusBadge) {
      heroStatusBadge.className = `badge-status-pedido ${badgeClass}`;
      heroStatusBadge.textContent = statusName;
    }

    if (sectionModeBadge) {
      sectionModeBadge.className = `badge-status-pedido ${badgeClass}`;
      sectionModeBadge.textContent = readOnly ? 'Modo Somente Leitura' : 'Modo de Edição';
    }

    if (readOnly) {
      if (container) container.classList.add('readonly-mode');
      if (readonlyBanner) {
        readonlyBanner.style.display = 'flex';
        readonlyBanner.className = 'readonly-banner-alert';

        if (statusLower.includes('pendente') || statusLower.includes('trânsito') || statusLower.includes('transito')) {
          readonlyBanner.classList.add('status-pendente');
          if (readonlyBannerIcon) readonlyBannerIcon.textContent = 'local_shipping';
          if (readonlyBannerTitle) readonlyBannerTitle.textContent = '🚚 Pedido em Trânsito (Pendente de Abastecimento)';
          if (readonlyBannerDesc) readonlyBannerDesc.textContent = 'Este pedido foi despachado para a filial de destino. Alterações de itens e quantidades estão bloqueadas.';
        } else if (statusLower.includes('recebido')) {
          readonlyBanner.classList.add('status-recebido');
          if (readonlyBannerIcon) readonlyBannerIcon.textContent = 'task_alt';
          if (readonlyBannerTitle) readonlyBannerTitle.textContent = '📦 Pedido Recebido';
          if (readonlyBannerDesc) readonlyBannerDesc.textContent = 'Abastecimento e movimentação de estoque concluídos na filial. Pedido finalizado em modo de consulta.';
        } else if (statusLower.includes('cancelado')) {
          readonlyBanner.classList.add('status-cancelado');
          if (readonlyBannerIcon) readonlyBannerIcon.textContent = 'block';
          if (readonlyBannerTitle) readonlyBannerTitle.textContent = '🚫 Pedido Cancelado';
          if (readonlyBannerDesc) readonlyBannerDesc.textContent = 'Este pedido foi cancelado e está arquivado para histórico operacional.';
        }
      }

      // Ajuste dos botões do footer
      if (btnFooterDiscard) btnFooterDiscard.style.display = 'none';
      if (btnFooterDraft) btnFooterDraft.style.display = 'none';
      if (btnFooterConfirm) btnFooterConfirm.style.display = 'none';
      if (btnFooterBackToOrders) btnFooterBackToOrders.style.display = 'inline-flex';

      // Desabilita campos de texto na aba detalhes
      const inputResp = document.getElementById('inputResponsavel');
      const inputPrev = document.getElementById('inputPrevisao');
      const txtObs = document.getElementById('textareaObservacoes');
      if (inputResp) inputResp.disabled = true;
      if (inputPrev) inputPrev.disabled = true;
      if (txtObs) txtObs.disabled = true;
    } else {
      if (container) container.classList.remove('readonly-mode');
      if (readonlyBanner) readonlyBanner.style.display = 'none';

      if (btnFooterDiscard) btnFooterDiscard.style.display = 'inline-block';
      if (btnFooterDraft) btnFooterDraft.style.display = 'inline-block';
      if (btnFooterConfirm) btnFooterConfirm.style.display = 'inline-flex';
      if (btnFooterBackToOrders) btnFooterBackToOrders.style.display = 'none';
    }
  }

  // 4. Controle das Abas (PRODUTOS / DETALHES)
  const tabBtnProdutos = document.getElementById('tabBtnProdutos');
  const tabBtnDetalhes = document.getElementById('tabBtnDetalhes');
  const paneProdutos = document.getElementById('paneProdutos');
  const paneDetalhes = document.getElementById('paneDetalhes');

  function switchTab(tabName) {
    if (tabName === 'produtos') {
      tabBtnProdutos.classList.add('active');
      tabBtnDetalhes.classList.remove('active');
      paneProdutos.style.display = 'block';
      paneDetalhes.style.display = 'none';
    } else {
      tabBtnProdutos.classList.remove('active');
      tabBtnDetalhes.classList.add('active');
      paneProdutos.style.display = 'none';
      paneDetalhes.style.display = 'block';
    }
  }

  if (tabBtnProdutos) tabBtnProdutos.addEventListener('click', () => switchTab('produtos'));
  if (tabBtnDetalhes) tabBtnDetalhes.addEventListener('click', () => switchTab('detalhes'));

  // 5. Formatação de Moeda
  function formatMoney(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // 6. Atualização de Totais e Métricas
  function updateTotals() {
    const totalSkus = cartItems.length;
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const totalValue = cartItems.reduce((acc, curr) => acc + ((Number(curr.quantidade) || 0) * (Number(curr.preco) || 0)), 0);

    if (tabCountProdutos) tabCountProdutos.textContent = totalSkus;
    if (footerSkusCount) footerSkusCount.textContent = totalSkus;
    if (footerUnitsCount) footerUnitsCount.textContent = `${totalUnits} un`;
    if (footerTotalValue) footerTotalValue.textContent = formatMoney(totalValue);
  }

  function getValidityStatus(item) {
    if (!item.lotes || item.lotes.length === 0) {
      return {
        status: 'empty',
        label: isReadOnlyMode ? 'Sem Lotes' : 'Informar Validade',
        icon: 'event',
        className: ''
      };
    }

    const lotesSum = item.lotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
    if (lotesSum === Number(item.quantidade)) {
      return {
        status: 'ok',
        label: `Validade OK (${item.lotes.length} ${item.lotes.length === 1 ? 'lote' : 'lotes'})`,
        icon: 'verified',
        className: 'validity-ok'
      };
    } else {
      return {
        status: 'pending',
        label: `Validade Divergente (${lotesSum}/${item.quantidade} un)`,
        icon: 'warning_amber',
        className: 'validity-pending'
      };
    }
  }

  // 7. Renderização da Tabela e Cards
  function renderCart() {
    if (cartItems.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (tableWrapper) tableWrapper.style.display = 'none';
      if (cardsGrid) cardsGrid.style.display = 'none';
      updateTotals();
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (tableWrapper && window.innerWidth > 768) tableWrapper.style.display = 'block';
    if (cardsGrid && window.innerWidth <= 768) cardsGrid.style.display = 'grid';

    // Render Table (Desktop)
    if (tbody) {
      tbody.innerHTML = cartItems.map((item, index) => {
        const valStatus = getValidityStatus(item);
        const subtotal = (Number(item.quantidade) || 0) * (Number(item.preco) || 0);

        const qtyControlHtml = isReadOnlyMode
          ? `<strong style="font-size: 0.95rem; color: #212529;">${item.quantidade} un</strong>`
          : `
            <div class="quantity-stepper-box">
              <button type="button" class="stepper-btn btn-stepper-dec" data-id="${item.id}" title="Diminuir quantidade">&minus;</button>
              <input type="number" class="stepper-input input-item-qty" data-id="${item.id}" value="${item.quantidade}" min="1" max="9999">
              <button type="button" class="stepper-btn btn-stepper-inc" data-id="${item.id}" title="Aumentar quantidade">&plus;</button>
            </div>
          `;

        const actionDeleteHtml = isReadOnlyMode
          ? `<span style="color: #bbb; font-size: 0.8rem;">-</span>`
          : `
            <button type="button" class="btn-delete-item" data-id="${item.id}" title="Remover item do pedido">
              <span class="material-icons">delete_outline</span>
            </button>
          `;

        return `
          <tr data-id="${item.id}" class="cart-item-row">
            <td style="text-align: center; color: #757575; font-size: 0.8rem;">${index + 1}</td>
            <td class="item-thumb-cell">
              <img src="${item.foto}" alt="${item.nome}" class="item-thumb-img" onerror="this.src='../assets/images/products/suco-uva.jpg'">
            </td>
            <td>
              <span class="item-code-link" title="Código EAN">${item.ean}</span>
            </td>
            <td>
              <span class="item-title-text">${item.nome}</span>
              <span class="item-brand-tag">${item.marca || 'Marca'} &bull; ${item.categoria || 'Geral'}</span>
            </td>
            <td style="text-align: center;">
              <span class="stock-pill-subtle ${item.estoqueLoja > 0 ? 'has-stock' : 'low-stock'}">
                ${item.estoqueLoja || 0} un
              </span>
            </td>
            <td style="text-align: right; font-weight: 500;">${formatMoney(item.preco)}</td>
            <td style="text-align: center;">
              ${qtyControlHtml}
            </td>
            <td style="text-align: right; font-weight: 700; color: var(--primary-color);">
              ${formatMoney(subtotal)}
            </td>
            <td style="text-align: center;">
              <button type="button" class="validity-status-btn ${valStatus.className} btn-open-validity" data-id="${item.id}" title="Ver Lotes e Validades">
                <span class="material-icons">${valStatus.icon}</span>
                <span>${valStatus.label}</span>
              </button>
            </td>
            <td style="text-align: center;">
              ${actionDeleteHtml}
            </td>
          </tr>
        `;
      }).join('');
    }

    // Render Cards (Mobile)
    if (cardsGrid) {
      cardsGrid.innerHTML = cartItems.map((item) => {
        const valStatus = getValidityStatus(item);
        const subtotal = (Number(item.quantidade) || 0) * (Number(item.preco) || 0);

        const qtyMobileHtml = isReadOnlyMode
          ? `<strong style="font-size: 0.95rem; color: #212529;">${item.quantidade} un</strong>`
          : `
            <div class="quantity-stepper-box">
              <button type="button" class="stepper-btn btn-stepper-dec" data-id="${item.id}">&minus;</button>
              <input type="number" class="stepper-input input-item-qty" data-id="${item.id}" value="${item.quantidade}" min="1" max="9999">
              <button type="button" class="stepper-btn btn-stepper-inc" data-id="${item.id}">&plus;</button>
            </div>
          `;

        const deleteMobileHtml = isReadOnlyMode
          ? ''
          : `
            <button type="button" class="btn-delete-item" data-id="${item.id}" title="Remover">
              <span class="material-icons">delete_outline</span>
            </button>
          `;

        return `
          <div class="pedido-item-card" data-id="${item.id}">
            <div class="item-card-header">
              <img src="${item.foto}" alt="${item.nome}" class="item-card-img" onerror="this.src='../assets/images/products/suco-uva.jpg'">
              <div class="item-card-details">
                <div class="item-card-title">${item.nome}</div>
                <div class="item-card-meta">
                  <span class="item-code-link">${item.ean}</span>
                  <span>&bull;</span>
                  <span>Estoque Loja: <strong>${item.estoqueLoja || 0} un</strong></span>
                </div>
              </div>
              ${deleteMobileHtml}
            </div>

            <div class="item-card-footer">
              <div>
                <span style="font-size: 0.75rem; color: #757575;">Preço:</span>
                <strong>${formatMoney(item.preco)}</strong>
                <span style="margin: 0 4px; color: #ccc;">|</span>
                <span style="font-size: 0.75rem; color: #757575;">Subtotal:</span>
                <strong style="color: var(--primary-color);">${formatMoney(subtotal)}</strong>
              </div>

              ${qtyMobileHtml}
            </div>

            <div style="margin-top: 4px;">
              <button type="button" class="validity-status-btn ${valStatus.className} btn-open-validity" data-id="${item.id}" style="width: 100%; justify-content: center;">
                <span class="material-icons">${valStatus.icon}</span>
                <span>${valStatus.label}</span>
              </button>
            </div>
          </div>
        `;
      }).join('');
    }

    bindCartEvents();
    updateTotals();
  }

  // 8. Eventos de Manipulação do Carrinho
  function bindCartEvents() {
    if (isReadOnlyMode) {
      // No modo somente leitura, apenas o clique de validade é mantido
      document.querySelectorAll('.btn-open-validity').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = btn.getAttribute('data-id');
          const item = cartItems.find(i => String(i.id) === String(id));
          if (item) openLotesModal(item);
        });
      });
      return;
    }

    // Stepper Decrement
    document.querySelectorAll('.btn-stepper-dec').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cartItems.find(i => String(i.id) === String(id));
        if (!item) return;

        if (item.quantidade > 1) {
          item.quantidade--;
          renderCart();
        } else {
          removeItemFromCart(id);
        }
      });
    });

    // Stepper Increment
    document.querySelectorAll('.btn-stepper-inc').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cartItems.find(i => String(i.id) === String(id));
        if (!item) return;

        item.quantidade++;
        renderCart();
      });
    });

    // Direct input
    document.querySelectorAll('.input-item-qty').forEach(input => {
      input.addEventListener('change', () => {
        const id = input.getAttribute('data-id');
        const item = cartItems.find(i => String(i.id) === String(id));
        if (!item) return;

        const val = parseInt(input.value, 10);
        item.quantidade = (isNaN(val) || val <= 0) ? 1 : val;
        renderCart();
      });
    });

    // Delete item
    document.querySelectorAll('.btn-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        removeItemFromCart(id);
      });
    });

    // Open Validity Modal
    document.querySelectorAll('.btn-open-validity').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const item = cartItems.find(i => String(i.id) === String(id));
        if (item) openLotesModal(item);
      });
    });
  }

  function removeItemFromCart(id) {
    if (isReadOnlyMode) return;
    const item = cartItems.find(i => String(i.id) === String(id));
    cartItems = cartItems.filter(i => String(i.id) !== String(id));
    renderCart();
    if (typeof Toast !== 'undefined' && item) {
      Toast.info(`"${item.nome}" removido do pedido.`);
    }
  }

  function addProductToCart(product, qtyToAdd = 1) {
    if (isReadOnlyMode) return;
    const existing = cartItems.find(i => String(i.id) === String(product.id) || i.ean === product.ean);
    if (existing) {
      existing.quantidade += qtyToAdd;
      if (typeof Toast !== 'undefined') {
        Toast.success(`+${qtyToAdd} un adicionada a "${product.nome}" (Total: ${existing.quantidade} un).`);
      }
    } else {
      cartItems.push({
        id: product.id || Date.now(),
        ean: product.ean,
        nome: product.nome,
        marca: product.marca || 'Marca Padrão',
        categoria: product.categoria || 'Geral',
        foto: product.foto || product.imagem || '../assets/images/products/suco-uva.jpg',
        preco: Number(product.preco) || 6.50,
        estoqueLoja: product.estoqueLoja || 0,
        estoqueCd: product.estoqueCd || 20,
        estoqueIdeal: product.estoqueIdeal || 10,
        minimoCritico: product.minimoCritico || 2,
        quantidade: qtyToAdd,
        lotes: []
      });
      if (typeof Toast !== 'undefined') {
        Toast.success(`"${product.nome}" adicionado ao pedido!`);
      }
    }
    renderCart();
  }

  // 9. Omnibar de Busca e Bipe
  const omnibarInput = document.getElementById('omnibarInput');
  const omnibarDropdown = document.getElementById('omnibarDropdown');

  function renderOmnibarDropdown(matches) {
    if (!omnibarDropdown) return;
    if (matches.length === 0) {
      omnibarDropdown.innerHTML = `
        <div style="padding: 12px; font-size: 0.85rem; color: #757575; text-align: center;">
          Nenhum produto encontrado com este código ou nome.
        </div>
      `;
      omnibarDropdown.classList.add('show');
      return;
    }

    omnibarDropdown.innerHTML = matches.slice(0, 6).map(prod => `
      <div class="autocomplete-item" data-id="${prod.id}">
        <img src="${prod.foto || prod.imagem || '../assets/images/products/suco-uva.jpg'}" alt="${prod.nome}" class="autocomplete-item-img" onerror="this.src='../assets/images/products/suco-uva.jpg'">
        <div class="autocomplete-item-info">
          <div class="autocomplete-item-title">${prod.nome}</div>
          <div class="autocomplete-item-sub">EAN: <code>${prod.ean}</code> &bull; Estoque Loja: ${prod.estoqueLoja || 0} un</div>
        </div>
        <div class="autocomplete-item-price">${formatMoney(prod.preco || 6.50)}</div>
      </div>
    `).join('');

    omnibarDropdown.classList.add('show');

    omnibarDropdown.querySelectorAll('.autocomplete-item').forEach(itemEl => {
      itemEl.addEventListener('click', () => {
        const id = itemEl.getAttribute('data-id');
        const prod = rawCatalog.find(p => String(p.id) === String(id));
        if (prod) {
          addProductToCart(prod, 1);
          if (omnibarInput) omnibarInput.value = '';
          omnibarDropdown.classList.remove('show');
          omnibarInput.focus();
        }
      });
    });
  }

  if (omnibarInput && !isReadOnlyMode) {
    omnibarInput.addEventListener('input', () => {
      const q = omnibarInput.value.trim().toLowerCase();
      if (!q) {
        omnibarDropdown.classList.remove('show');
        return;
      }
      const matches = rawCatalog.filter(p => 
        (p.ean && p.ean.includes(q)) || 
        (p.nome && p.nome.toLowerCase().includes(q)) ||
        (p.marca && p.marca.toLowerCase().includes(q))
      );
      renderOmnibarDropdown(matches);
    });

    omnibarInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const q = omnibarInput.value.trim().toLowerCase();
        if (!q) return;

        const exactEan = rawCatalog.find(p => p.ean === q);
        const match = exactEan || rawCatalog.find(p => 
          (p.nome && p.nome.toLowerCase().includes(q)) || (p.ean && p.ean.includes(q))
        );

        if (match) {
          addProductToCart(match, 1);
          omnibarInput.value = '';
          omnibarDropdown.classList.remove('show');
        } else {
          if (typeof Toast !== 'undefined') {
            Toast.warning(`Nenhum produto cadastrado com código/nome "${q}".`);
          }
        }
      } else if (e.key === 'Escape') {
        omnibarDropdown.classList.remove('show');
      }
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#omnibarBox')) {
        if (omnibarDropdown) omnibarDropdown.classList.remove('show');
      }
    });
  }

  // 10. Modal do Catálogo de Produtos
  const modalCatalog = document.getElementById('modalCatalog');
  const btnOpenCatalogModal = document.getElementById('btnOpenCatalogModal');
  const btnEmptyStateAdd = document.getElementById('btnEmptyStateAdd');
  const btnCloseCatalogModal = document.getElementById('btnCloseCatalogModal');
  const btnCloseCatalogBtn = document.getElementById('btnCloseCatalogBtn');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catalogModalGrid = document.getElementById('catalogModalGrid');
  let currentCatalogCategory = 'ALL';

  function openCatalog() {
    if (isReadOnlyMode) return;
    if (modalCatalog) modalCatalog.classList.add('show', 'active');
    renderCatalogGrid();
  }

  function closeCatalog() {
    if (modalCatalog) modalCatalog.classList.remove('show', 'active');
  }

  if (btnOpenCatalogModal) btnOpenCatalogModal.addEventListener('click', openCatalog);
  if (btnEmptyStateAdd) btnEmptyStateAdd.addEventListener('click', openCatalog);
  if (btnCloseCatalogModal) btnCloseCatalogModal.addEventListener('click', closeCatalog);
  if (btnCloseCatalogBtn) btnCloseCatalogBtn.addEventListener('click', closeCatalog);

  if (modalCatalog) {
    modalCatalog.addEventListener('click', (e) => {
      if (e.target === modalCatalog) closeCatalog();
    });
  }

  function renderCatalogGrid() {
    if (!catalogModalGrid) return;
    const searchVal = (catalogSearchInput ? catalogSearchInput.value : '').trim().toLowerCase();

    const filtered = rawCatalog.filter(prod => {
      const matchCat = (currentCatalogCategory === 'ALL') || 
        (prod.categoria && prod.categoria.toLowerCase().includes(currentCatalogCategory.toLowerCase()));
      const matchSearch = !searchVal || 
        (prod.nome && prod.nome.toLowerCase().includes(searchVal)) ||
        (prod.ean && prod.ean.includes(searchVal)) ||
        (prod.marca && prod.marca.toLowerCase().includes(searchVal));
      return matchCat && matchSearch;
    });

    if (filtered.length === 0) {
      catalogModalGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: #757575;">
          <span class="material-icons" style="font-size: 36px; color: #bbb;">search_off</span>
          <p style="margin-top: 6px;">Nenhum produto encontrado neste filtro.</p>
        </div>
      `;
      return;
    }

    catalogModalGrid.innerHTML = filtered.map(prod => {
      const inCart = cartItems.find(i => String(i.id) === String(prod.id) || i.ean === prod.ean);
      const isAdded = !!inCart;

      return `
        <div class="catalog-item-card" data-id="${prod.id}">
          <img src="${prod.foto || prod.imagem || '../assets/images/products/suco-uva.jpg'}" alt="${prod.nome}" class="catalog-item-img" onerror="this.src='../assets/images/products/suco-uva.jpg'">
          <div>
            <div class="catalog-item-name" title="${prod.nome}">${prod.nome}</div>
            <div style="font-size: 0.72rem; color: #757575; margin-top: 2px;">EAN: ${prod.ean}</div>
          </div>
          <div class="catalog-item-bottom">
            <span class="catalog-item-price">${formatMoney(prod.preco || 6.50)}</span>
            <button type="button" class="btn-catalog-add ${isAdded ? 'added' : ''}" data-id="${prod.id}">
              <span class="material-icons" style="font-size: 16px;">${isAdded ? 'check' : 'add'}</span>
              <span>${isAdded ? `No Pedido (${inCart.quantidade})` : 'Adicionar'}</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    catalogModalGrid.querySelectorAll('.btn-catalog-add').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const prod = rawCatalog.find(p => String(p.id) === String(id));
        if (prod) {
          addProductToCart(prod, 1);
          renderCatalogGrid();
        }
      });
    });
  }

  if (catalogSearchInput) {
    catalogSearchInput.addEventListener('input', renderCatalogGrid);
  }

  document.querySelectorAll('.catalog-cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.catalog-cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentCatalogCategory = chip.getAttribute('data-cat') || 'ALL';
      renderCatalogGrid();
    });
  });

  // 11. Modal de Gerenciamento de Lotes e Validades (Shelf-Life)
  const modalGerenciarLotes = document.getElementById('modalGerenciarLotes');
  const btnCloseLotesModal = document.getElementById('btnCloseLotesModal');
  const btnCancelLotes = document.getElementById('btnCancelLotes');
  const btnSaveLotes = document.getElementById('btnSaveLotes');
  const btnModalAddLote = document.getElementById('btnModalAddLote');
  const btnTableAddLote = document.getElementById('btnTableAddLote');

  const lotesModalProdImg = document.getElementById('lotesModalProdImg');
  const lotesModalProdName = document.getElementById('lotesModalProdName');
  const lotesModalProdEan = document.getElementById('lotesModalProdEan');
  const lotesCounterText = document.getElementById('lotesCounterText');
  const lotesAllocationBadge = document.getElementById('lotesAllocationBadge');
  const lotesBarFill = document.getElementById('lotesBarFill');
  const lotesTableBody = document.getElementById('lotesTableBody');

  function openLotesModal(item) {
    currentEditingItemForLotes = item;
    if (item.lotes && item.lotes.length > 0) {
      temporaryLotes = JSON.parse(JSON.stringify(item.lotes));
    } else {
      temporaryLotes = isReadOnlyMode ? [] : [
        {
          id: Date.now(),
          lote: '001',
          quantidade: item.quantidade,
          fabricacao: '',
          validade: ''
        }
      ];
    }

    if (lotesModalProdImg) lotesModalProdImg.src = item.foto;
    if (lotesModalProdName) lotesModalProdName.textContent = item.nome;
    if (lotesModalProdEan) lotesModalProdEan.textContent = `EAN: ${item.ean} | Pedido: ${item.quantidade} un`;

    if (isReadOnlyMode) {
      if (btnModalAddLote) btnModalAddLote.style.display = 'none';
      if (btnTableAddLote) btnTableAddLote.style.display = 'none';
      if (btnCancelLotes) btnCancelLotes.style.display = 'none';
      if (btnSaveLotes) {
        btnSaveLotes.textContent = 'FECHAR';
        btnSaveLotes.style.backgroundColor = '#616161';
      }
    } else {
      if (btnModalAddLote) btnModalAddLote.style.display = 'inline-flex';
      if (btnTableAddLote) btnTableAddLote.style.display = 'inline-flex';
      if (btnCancelLotes) btnCancelLotes.style.display = 'inline-block';
      if (btnSaveLotes) {
        btnSaveLotes.textContent = 'CONFIRMAR LOTES';
        btnSaveLotes.style.backgroundColor = 'var(--primary-color)';
      }
    }

    renderLotesModal();
    if (modalGerenciarLotes) modalGerenciarLotes.classList.add('show', 'active');
  }

  function closeLotesModal() {
    if (modalGerenciarLotes) modalGerenciarLotes.classList.remove('show', 'active');
    currentEditingItemForLotes = null;
    temporaryLotes = [];
  }

  function updateLotesAllocationUI() {
    if (!currentEditingItemForLotes) return;
    const targetQtd = Number(currentEditingItemForLotes.quantidade) || 0;
    const currentSum = temporaryLotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);

    if (lotesCounterText) lotesCounterText.textContent = `${currentSum} / ${targetQtd} un`;

    const pct = targetQtd > 0 ? Math.min(100, Math.round((currentSum / targetQtd) * 100)) : 0;
    if (lotesBarFill) {
      lotesBarFill.style.width = `${pct}%`;
      lotesBarFill.className = 'allocation-bar-fill';
      if (currentSum === targetQtd) {
        lotesBarFill.classList.add('complete');
      } else if (currentSum > targetQtd) {
        lotesBarFill.classList.add('exceeded');
      }
    }

    if (lotesAllocationBadge) {
      if (currentSum === targetQtd) {
        lotesAllocationBadge.textContent = 'Completo (100%)';
        lotesAllocationBadge.className = 'allocation-badge complete';
      } else if (currentSum < targetQtd) {
        const diff = targetQtd - currentSum;
        lotesAllocationBadge.textContent = `Faltam ${diff} un`;
        lotesAllocationBadge.className = 'allocation-badge pending';
      } else {
        const diff = currentSum - targetQtd;
        lotesAllocationBadge.textContent = `Excede em ${diff} un`;
        lotesAllocationBadge.className = 'allocation-badge exceeded';
      }
    }
  }

  function renderLotesModal() {
    if (!lotesTableBody) return;

    if (temporaryLotes.length === 0) {
      lotesTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 1.5rem; color: #757575;">
            ${isReadOnlyMode ? 'Nenhum lote informado para este item.' : 'Nenhum lote adicionado. Clique no botão abaixo para adicionar.'}
          </td>
        </tr>
      `;
      updateLotesAllocationUI();
      return;
    }

    lotesTableBody.innerHTML = temporaryLotes.map((lote, index) => {
      const deleteActionHtml = isReadOnlyMode ? '' : `
        <button type="button" class="btn-delete-item btn-del-lote-row" data-index="${index}" title="Remover lote">
          <span class="material-icons">delete_outline</span>
        </button>
      `;

      return `
        <tr data-index="${index}">
          <td>
            <input type="text" class="lote-input input-lote-code" value="${lote.lote || ''}" placeholder="Ex: L001" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="number" class="lote-input input-lote-qty" value="${lote.quantidade || ''}" min="1" placeholder="Qtd" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="date" class="lote-input input-lote-fab" value="${lote.fabricacao || ''}" ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td>
            <input type="date" class="lote-input input-lote-val" value="${lote.validade || ''}" required ${isReadOnlyMode ? 'disabled' : ''}>
          </td>
          <td style="text-align: center;">
            ${deleteActionHtml}
          </td>
        </tr>
      `;
    }).join('');

    if (!isReadOnlyMode) {
      lotesTableBody.querySelectorAll('tr').forEach(tr => {
        const idx = parseInt(tr.getAttribute('data-index'), 10);
        const inputCode = tr.querySelector('.input-lote-code');
        const inputQty = tr.querySelector('.input-lote-qty');
        const inputFab = tr.querySelector('.input-lote-fab');
        const inputVal = tr.querySelector('.input-lote-val');
        const btnDel = tr.querySelector('.btn-del-lote-row');

        if (inputCode) inputCode.addEventListener('input', () => { temporaryLotes[idx].lote = inputCode.value; });
        if (inputQty) inputQty.addEventListener('input', () => {
          temporaryLotes[idx].quantidade = parseInt(inputQty.value, 10) || 0;
          updateLotesAllocationUI();
        });
        if (inputFab) inputFab.addEventListener('change', () => { temporaryLotes[idx].fabricacao = inputFab.value; });
        if (inputVal) inputVal.addEventListener('change', () => { temporaryLotes[idx].validade = inputVal.value; });

        if (btnDel) btnDel.addEventListener('click', () => {
          temporaryLotes.splice(idx, 1);
          renderLotesModal();
        });
      });
    }

    updateLotesAllocationUI();
  }

  function addNewLoteRow() {
    if (isReadOnlyMode || !currentEditingItemForLotes) return;
    const targetQtd = Number(currentEditingItemForLotes.quantidade) || 0;
    const currentSum = temporaryLotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
    const remainder = Math.max(1, targetQtd - currentSum);

    const nextLoteNum = String(temporaryLotes.length + 1).padStart(3, '0');
    temporaryLotes.push({
      id: Date.now() + Math.random(),
      lote: nextLoteNum,
      quantidade: remainder,
      fabricacao: '',
      validade: ''
    });
    renderLotesModal();
  }

  if (btnModalAddLote) btnModalAddLote.addEventListener('click', addNewLoteRow);
  if (btnTableAddLote) btnTableAddLote.addEventListener('click', addNewLoteRow);
  if (btnCloseLotesModal) btnCloseLotesModal.addEventListener('click', closeLotesModal);
  if (btnCancelLotes) btnCancelLotes.addEventListener('click', closeLotesModal);

  if (modalGerenciarLotes) {
    modalGerenciarLotes.addEventListener('click', (e) => {
      if (e.target === modalGerenciarLotes) closeLotesModal();
    });
  }

  if (btnSaveLotes) {
    btnSaveLotes.addEventListener('click', () => {
      if (isReadOnlyMode) {
        closeLotesModal();
        return;
      }

      if (!currentEditingItemForLotes) return;

      for (let i = 0; i < temporaryLotes.length; i++) {
        const l = temporaryLotes[i];
        if (!l.quantidade || l.quantidade <= 0) {
          if (typeof Toast !== 'undefined') Toast.warning(`Informe uma quantidade válida para o lote ${i + 1}.`);
          return;
        }
        if (!l.validade) {
          if (typeof Toast !== 'undefined') Toast.warning(`Informe a data de validade para o lote ${i + 1} (${l.lote || 'Sem código'}).`);
          return;
        }
      }

      currentEditingItemForLotes.lotes = JSON.parse(JSON.stringify(temporaryLotes));
      renderCart();

      const sum = temporaryLotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
      if (typeof Toast !== 'undefined') {
        if (sum === Number(currentEditingItemForLotes.quantidade)) {
          Toast.success(`Validades cadastradas com sucesso para "${currentEditingItemForLotes.nome}"!`);
        } else {
          Toast.warning(`Lotes salvos, mas a soma (${sum} un) difere do pedido (${currentEditingItemForLotes.quantidade} un).`);
        }
      }

      closeLotesModal();
    });
  }

  // 12. Modal de Conclusão e Finalização do Pedido
  const modalConcluirPedido = document.getElementById('modalConcluirPedido');
  const btnCloseConcluirModal = document.getElementById('btnCloseConcluirModal');
  const btnCancelConcluir = document.getElementById('btnCancelConcluir');
  const btnSubmitFinalizarPedido = document.getElementById('btnSubmitFinalizarPedido');
  const modalConcluirCod = document.getElementById('modalConcluirCod');
  const modalConcluirQtde = document.getElementById('modalConcluirQtde');
  const modalConcluirDestino = document.getElementById('modalConcluirDestino');

  function openConcluirModal() {
    if (isReadOnlyMode) return;
    if (cartItems.length === 0) {
      if (typeof Toast !== 'undefined') {
        Toast.warning('Adicione ao menos 1 produto antes de confirmar o pedido.');
      }
      return;
    }

    // REGRA DE VALIDAÇÃO ESTRITA DE VALIDADES
    for (let item of cartItems) {
      if (item.lotes && item.lotes.length > 0) {
        const lotesSum = item.lotes.reduce((acc, l) => acc + (Number(l.quantidade) || 0), 0);
        if (lotesSum !== Number(item.quantidade)) {
          if (typeof Toast !== 'undefined') {
            Toast.error(`O produto "${item.nome}" possui lotes divergentes da quantidade do pedido (${lotesSum}/${item.quantidade} un). Ajuste os lotes antes de finalizar.`);
          }
          openLotesModal(item);
          return;
        }
      }
    }

    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const dest = selectHeroDestino ? selectHeroDestino.value : 'Mini Mercado 03 Simples Nacional';

    if (modalConcluirCod) modalConcluirCod.textContent = currentOrderCode;
    if (modalConcluirQtde) modalConcluirQtde.textContent = `${totalUnits} un (${cartItems.length} SKUs)`;
    if (modalConcluirDestino) modalConcluirDestino.textContent = dest;

    if (modalConcluirPedido) modalConcluirPedido.classList.add('show', 'active');
  }

  function closeConcluirModal() {
    if (modalConcluirPedido) modalConcluirPedido.classList.remove('show', 'active');
  }

  if (btnFooterConfirm) btnFooterConfirm.addEventListener('click', openConcluirModal);
  if (btnHeaderSave) btnHeaderSave.addEventListener('click', openConcluirModal);
  if (btnCloseConcluirModal) btnCloseConcluirModal.addEventListener('click', closeConcluirModal);
  if (btnCancelConcluir) btnCancelConcluir.addEventListener('click', closeConcluirModal);

  if (modalConcluirPedido) {
    modalConcluirPedido.addEventListener('click', (e) => {
      if (e.target === modalConcluirPedido) closeConcluirModal();
    });
  }

  document.querySelectorAll('.finish-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.finish-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentSelectedStatus = card.getAttribute('data-status') || 'Pendente de Abastecimento';
    });
  });

  // Gravação definitiva (Criação de Novo ou Atualização de Aberto)
  function executeOrderSave(statusToSet) {
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const totalValue = cartItems.reduce((acc, curr) => acc + ((Number(curr.quantidade) || 0) * (Number(curr.preco) || 0)), 0);
    const dest = selectHeroDestino ? selectHeroDestino.value : 'Mini Mercado 03 Simples Nacional';
    const orig = selectHeroOrigem ? selectHeroOrigem.value : '';

    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

    const orderPayload = {
      id: currentLoadedOrder ? currentLoadedOrder.id : Date.now(),
      codigo: currentOrderCode,
      filial: dest,
      filialOrigem: orig || null,
      planoBase: currentLoadedOrder ? (currentLoadedOrder.planoBase || '') : '',
      tipo: currentLoadedOrder ? (currentLoadedOrder.tipo || 'manual') : 'manual',
      qtdeItens: totalUnits,
      valorTotal: totalValue,
      dataCriacao: currentLoadedOrder ? (currentLoadedOrder.dataCriacao || dataFormatada) : dataFormatada,
      status: statusToSet,
      responsavel: (document.getElementById('inputResponsavel') ? document.getElementById('inputResponsavel').value : 'B2U Operações'),
      observacoes: (document.getElementById('textareaObservacoes') ? document.getElementById('textareaObservacoes').value : ''),
      itens: cartItems
    };

    if (currentLoadedOrder && typeof window.atualizarPedidoNoStorage === 'function') {
      window.atualizarPedidoNoStorage(orderPayload);
    } else if (typeof window.salvarNovoPedidoNoStorage === 'function') {
      window.salvarNovoPedidoNoStorage(orderPayload);
    }

    if (typeof Toast !== 'undefined') {
      Toast.success(`Pedido ${currentOrderCode} salvo com sucesso! Status: ${statusToSet}. Redirecionando...`);
    }

    if (btnSubmitFinalizarPedido) {
      btnSubmitFinalizarPedido.disabled = true;
      btnSubmitFinalizarPedido.textContent = 'SALVANDO...';
    }

    setTimeout(() => {
      window.location.href = './pedidos-abastecimento.html';
    }, 600);
  }

  if (btnSubmitFinalizarPedido) {
    btnSubmitFinalizarPedido.addEventListener('click', () => {
      closeConcluirModal();
      executeOrderSave(currentSelectedStatus);
    });
  }

  if (btnFooterDraft) {
    btnFooterDraft.addEventListener('click', () => {
      if (cartItems.length === 0) {
        if (typeof Toast !== 'undefined') Toast.warning('Adicione itens antes de salvar rascunho.');
        return;
      }
      executeOrderSave('Aberto');
    });
  }

  if (btnFooterDiscard) {
    btnFooterDiscard.addEventListener('click', () => {
      if (cartItems.length > 0) {
        if (typeof Toast !== 'undefined') Toast.info('Descartando alterações...');
      }
      setTimeout(() => {
        window.location.href = './pedidos-abastecimento.html';
      }, 250);
    });
  }

  if (btnFooterBackToOrders) {
    btnFooterBackToOrders.addEventListener('click', () => {
      window.location.href = './pedidos-abastecimento.html';
    });
  }

  // 13. Renderização Inicial
  renderCart();
});
