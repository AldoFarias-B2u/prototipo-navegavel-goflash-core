/**
 * GOFLASH CORE - CONTROLADOR DE PEDIDO DE ABASTECIMENTO MANUAL (EM BRANCO)
 * Gerencia a adição manual de produtos, steppers de quantidade, controle estrito de validades e lotes,
 * cálculo financeiro em tempo real e persistência com múltiplos status do ERP.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Estado da Aplicação
  const rawCatalog = window.CatalogoCompletoProdutos || window.ConsultaProdutosBase || [];
  let cartItems = [];
  let currentEditingItemForLotes = null;
  let temporaryLotes = [];
  let currentSelectedStatus = 'Pendente de Abastecimento';

  // 2. Parâmetros da URL e Inicialização do Hero
  const urlParams = new URLSearchParams(window.location.search);
  const paramDestino = urlParams.get('destino') || 'Mini Mercado 03 Simples Nacional';
  const paramOrigem = urlParams.get('origem') || '';

  const selectHeroDestino = document.getElementById('selectHeroDestino');
  const selectHeroOrigem = document.getElementById('selectHeroOrigem');
  const txtHeroCode = document.getElementById('txtHeroCode');

  if (selectHeroDestino && paramDestino) {
    // Se o valor existir nas opções, seleciona; senão cria option
    let found = false;
    for (let opt of selectHeroDestino.options) {
      if (opt.value === paramDestino) {
        opt.selected = true;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOpt = new Option(paramDestino, paramDestino, true, true);
      selectHeroDestino.add(newOpt);
    }
  }

  if (selectHeroOrigem && paramOrigem) {
    let found = false;
    for (let opt of selectHeroOrigem.options) {
      if (opt.value === paramOrigem) {
        opt.selected = true;
        found = true;
        break;
      }
    }
    if (!found) {
      const newOpt = new Option(paramOrigem, paramOrigem, true, true);
      selectHeroOrigem.add(newOpt);
    }
  }

  // Gera próximo código do pedido
  const existingOrders = window.PedidosAbastecimentoData || [];
  const nextNum = existingOrders.length + 7;
  const currentOrderCode = String(nextNum).padStart(6, '0');
  if (txtHeroCode) txtHeroCode.textContent = currentOrderCode;

  // 3. Controle das Abas (PRODUTOS / DETALHES)
  const tabBtnProdutos = document.getElementById('tabBtnProdutos');
  const tabBtnDetalhes = document.getElementById('tabBtnDetalhes');
  const paneProdutos = document.getElementById('paneProdutos');
  const paneDetalhes = document.getElementById('paneDetalhes');
  const tabCountProdutos = document.getElementById('tabCountProdutos');

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

  // 4. Formatação de Moeda e Valores
  function formatMoney(value) {
    return Number(value || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // 5. Renderização da Tabela de Itens e Cards Mobile
  const tbody = document.getElementById('pedidoTableBody');
  const cardsGrid = document.getElementById('pedidoCardsGrid');
  const emptyState = document.getElementById('pedidoEmptyState');
  const tableWrapper = document.getElementById('pedidoTableWrapper');

  const footerSkusCount = document.getElementById('footerSkusCount');
  const footerUnitsCount = document.getElementById('footerUnitsCount');
  const footerTotalValue = document.getElementById('footerTotalValue');

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
        label: 'Informar Validade',
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
      const diff = Math.abs(Number(item.quantidade) - lotesSum);
      return {
        status: 'pending',
        label: `Validade Divergente (${lotesSum}/${item.quantidade} un)`,
        icon: 'warning_amber',
        className: 'validity-pending'
      };
    }
  }

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
              <div class="quantity-stepper-box">
                <button type="button" class="stepper-btn btn-stepper-dec" data-id="${item.id}" title="Diminuir quantidade">&minus;</button>
                <input type="number" class="stepper-input input-item-qty" data-id="${item.id}" value="${item.quantidade}" min="1" max="9999">
                <button type="button" class="stepper-btn btn-stepper-inc" data-id="${item.id}" title="Aumentar quantidade">&plus;</button>
              </div>
            </td>
            <td style="text-align: right; font-weight: 700; color: var(--primary-color);">
              ${formatMoney(subtotal)}
            </td>
            <td style="text-align: center;">
              <button type="button" class="validity-status-btn ${valStatus.className} btn-open-validity" data-id="${item.id}" title="Gerenciar Lotes e Validades">
                <span class="material-icons">${valStatus.icon}</span>
                <span>${valStatus.label}</span>
              </button>
            </td>
            <td style="text-align: center;">
              <button type="button" class="btn-delete-item" data-id="${item.id}" title="Remover item do pedido">
                <span class="material-icons">delete_outline</span>
              </button>
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
              <button type="button" class="btn-delete-item" data-id="${item.id}" title="Remover">
                <span class="material-icons">delete_outline</span>
              </button>
            </div>

            <div class="item-card-footer">
              <div>
                <span style="font-size: 0.75rem; color: #757575;">Preço:</span>
                <strong>${formatMoney(item.preco)}</strong>
                <span style="margin: 0 4px; color: #ccc;">|</span>
                <span style="font-size: 0.75rem; color: #757575;">Subtotal:</span>
                <strong style="color: var(--primary-color);">${formatMoney(subtotal)}</strong>
              </div>

              <div class="quantity-stepper-box">
                <button type="button" class="stepper-btn btn-stepper-dec" data-id="${item.id}">&minus;</button>
                <input type="number" class="stepper-input input-item-qty" data-id="${item.id}" value="${item.quantidade}" min="1" max="9999">
                <button type="button" class="stepper-btn btn-stepper-inc" data-id="${item.id}">&plus;</button>
              </div>
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

  // 6. Manipulação de Eventos do Carrinho
  function bindCartEvents() {
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
          // Remove se já for 1
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
        if (isNaN(val) || val <= 0) {
          item.quantidade = 1;
        } else {
          item.quantidade = val;
        }
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
    const item = cartItems.find(i => String(i.id) === String(id));
    cartItems = cartItems.filter(i => String(i.id) !== String(id));
    renderCart();
    if (typeof Toast !== 'undefined' && item) {
      Toast.info(`"${item.nome}" removido do pedido.`);
    }
  }

  // 7. Adicionar Produto ao Carrinho
  function addProductToCart(product, qtyToAdd = 1) {
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

  // 8. Omnibar: Busca e Bipe com Autocomplete
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

  if (omnibarInput) {
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

        // Procura correspondência exata por EAN ou primeiro resultado
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

  // 9. Modal do Catálogo de Produtos
  const modalCatalog = document.getElementById('modalCatalog');
  const btnOpenCatalogModal = document.getElementById('btnOpenCatalogModal');
  const btnEmptyStateAdd = document.getElementById('btnEmptyStateAdd');
  const btnCloseCatalogModal = document.getElementById('btnCloseCatalogModal');
  const btnCloseCatalogBtn = document.getElementById('btnCloseCatalogBtn');
  const catalogSearchInput = document.getElementById('catalogSearchInput');
  const catalogModalGrid = document.getElementById('catalogModalGrid');
  let currentCatalogCategory = 'ALL';

  function openCatalog() {
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

  // 10. Modal de Gerenciamento de Lotes e Validades (Shelf-Life)
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
    // Clone dos lotes atuais ou 1 lote padrão com a quantidade do item
    if (item.lotes && item.lotes.length > 0) {
      temporaryLotes = JSON.parse(JSON.stringify(item.lotes));
    } else {
      // Sugere 1 lote inicial com a quantidade do item
      temporaryLotes = [
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
            Nenhum lote adicionado. Clique no botão abaixo para adicionar.
          </td>
        </tr>
      `;
      updateLotesAllocationUI();
      return;
    }

    lotesTableBody.innerHTML = temporaryLotes.map((lote, index) => `
      <tr data-index="${index}">
        <td>
          <input type="text" class="lote-input input-lote-code" value="${lote.lote || ''}" placeholder="Ex: L001">
        </td>
        <td>
          <input type="number" class="lote-input input-lote-qty" value="${lote.quantidade || ''}" min="1" placeholder="Qtd">
        </td>
        <td>
          <input type="date" class="lote-input input-lote-fab" value="${lote.fabricacao || ''}">
        </td>
        <td>
          <input type="date" class="lote-input input-lote-val" value="${lote.validade || ''}" required>
        </td>
        <td style="text-align: center;">
          <button type="button" class="btn-delete-item btn-del-lote-row" data-index="${index}" title="Remover lote">
            <span class="material-icons">delete_outline</span>
          </button>
        </td>
      </tr>
    `).join('');

    // Bind inputs changes in lotes
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

    updateLotesAllocationUI();
  }

  function addNewLoteRow() {
    if (!currentEditingItemForLotes) return;
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
      if (!currentEditingItemForLotes) return;

      // Validação: data de validade é obrigatória por linha
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

      // Salva no item do carrinho
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

  // 11. Modal de Conclusão / Finalização do Pedido
  const modalConcluirPedido = document.getElementById('modalConcluirPedido');
  const btnCloseConcluirModal = document.getElementById('btnCloseConcluirModal');
  const btnCancelConcluir = document.getElementById('btnCancelConcluir');
  const btnSubmitFinalizarPedido = document.getElementById('btnSubmitFinalizarPedido');
  const modalConcluirCod = document.getElementById('modalConcluirCod');
  const modalConcluirQtde = document.getElementById('modalConcluirQtde');
  const modalConcluirDestino = document.getElementById('modalConcluirDestino');

  const btnFooterConfirm = document.getElementById('btnFooterConfirm');
  const btnHeaderSave = document.getElementById('btnHeaderSave');
  const btnFooterDraft = document.getElementById('btnFooterDraft');
  const btnFooterDiscard = document.getElementById('btnFooterDiscard');

  function openConcluirModal() {
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

  // Seleção de Opção de Status no Modal de Conclusão
  document.querySelectorAll('.finish-option-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.finish-option-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      currentSelectedStatus = card.getAttribute('data-status') || 'Pendente de Abastecimento';
    });
  });

  // Finalização definitiva e gravação no Storage
  function executeOrderSave(statusToSet) {
    const totalUnits = cartItems.reduce((acc, curr) => acc + (Number(curr.quantidade) || 0), 0);
    const totalValue = cartItems.reduce((acc, curr) => acc + ((Number(curr.quantidade) || 0) * (Number(curr.preco) || 0)), 0);
    const dest = selectHeroDestino ? selectHeroDestino.value : 'Mini Mercado 03 Simples Nacional';
    const orig = selectHeroOrigem ? selectHeroOrigem.value : '';

    const hoje = new Date();
    const dataFormatada = `${String(hoje.getDate()).padStart(2, '0')}/${String(hoje.getMonth() + 1).padStart(2, '0')}/${hoje.getFullYear()}`;

    const novoPedido = {
      id: Date.now(),
      codigo: currentOrderCode,
      filial: dest,
      filialOrigem: orig || null,
      planoBase: '',
      tipo: 'manual',
      qtdeItens: totalUnits,
      valorTotal: totalValue,
      dataCriacao: dataFormatada,
      status: statusToSet,
      responsavel: (document.getElementById('inputResponsavel') ? document.getElementById('inputResponsavel').value : 'B2U Operações'),
      observacoes: (document.getElementById('textareaObservacoes') ? document.getElementById('textareaObservacoes').value : ''),
      itens: cartItems
    };

    if (typeof window.salvarNovoPedidoNoStorage === 'function') {
      window.salvarNovoPedidoNoStorage(novoPedido);
    }

    if (typeof Toast !== 'undefined') {
      Toast.success(`Pedido ${currentOrderCode} gerado com sucesso! Status: ${statusToSet}. Redirecionando...`);
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
        if (typeof Toast !== 'undefined') {
          Toast.info('Descartando pedido manual...');
        }
      }
      setTimeout(() => {
        window.location.href = './pedidos-abastecimento.html';
      }, 300);
    });
  }

  // 12. Adicionar automaticamente 2 itens de demonstração se URL vier com parâmetro
  // (Caso o usuário queira começar direto com produtos ou limpo)
  renderCart();
});
