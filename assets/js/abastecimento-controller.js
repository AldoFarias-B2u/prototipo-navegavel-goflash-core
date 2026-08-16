/**
 * GOFLASH CORE - ABASTECIMENTO CONTROLLER
 * Controlador de Interface para a tela de Planos de Abastecimento.
 * Gerencia listagem, filtros, KPIs, inclusão individual/em lote, clonagem e persistência.
 */

document.addEventListener('DOMContentLoaded', () => {
  // Referências do DOM
  const tableBody = document.getElementById('plansTableBody');
  const mobileCardsContainer = document.getElementById('mobilePlansGrid');
  const searchInput = document.getElementById('planSearchInput');
  const filialFilter = document.getElementById('filialFilterSelect');
  const statusFilter = document.getElementById('statusFilterSelect');
  
  // KPIs
  const kpiTotalPlanos = document.getElementById('kpiTotalPlanos');
  const kpiPlanosAtivos = document.getElementById('kpiPlanosAtivos');
  const kpiLojasCobertas = document.getElementById('kpiLojasCobertas');
  const kpiSkusMonitorados = document.getElementById('kpiSkusMonitorados');

  // Modal
  const planModal = document.getElementById('planModal');
  const btnOpenNewModal = document.getElementById('btnOpenNewModal');
  const btnCloseModal = document.getElementById('btnCloseModal');
  const btnCancelModal = document.getElementById('btnCancelModal');
  const btnSavePlan = document.getElementById('btnSavePlan');
  const modalTitle = document.getElementById('modalTitle');

  // Campos do Formulário do Modal
  const inputPlanId = document.getElementById('inputPlanId');
  const inputPlanName = document.getElementById('inputPlanName');
  const selectPlanFilial = document.getElementById('selectPlanFilial');
  const selectCopyFromPlan = document.getElementById('selectCopyFromPlan');
  const inputPlanDesc = document.getElementById('inputPlanDesc');
  const selectPlanStatus = document.getElementById('selectPlanStatus');

  // Adição em Lote
  const selectLotCategory = document.getElementById('selectLotCategory');
  const inputLotIdeal = document.getElementById('inputLotIdeal');
  const inputLotMin = document.getElementById('inputLotMin');
  const btnAddLotCategory = document.getElementById('btnAddLotCategory');

  // Adição Individual
  const singleProductSearch = document.getElementById('singleProductSearch');
  const singleAutocompleteResults = document.getElementById('singleAutocompleteResults');

  // Tabela de Itens no Modal
  const modalItemsTableBody = document.getElementById('modalItemsTableBody');
  const modalItemsCountTag = document.getElementById('modalItemsCountTag');

  // Estado Local
  let planosList = AbastecimentoMock.getPlanos();
  let currentEditingItems = []; // Array temporário de itens durante edição no modal

  /**
   * Inicialização
   */
  function init() {
    populateFilterSelects();
    renderKPIs();
    renderPlanosList();
    setupEventListeners();
  }

  /**
   * Popula os selects de filiais e categorias
   */
  function populateFilterSelects() {
    // Filtro da página
    if (filialFilter) {
      filialFilter.innerHTML = '<option value="">Todas as Filiais / Lojas</option>';
      AbastecimentoMock.filiais.forEach(f => {
        filialFilter.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
      });
    }

    // Selects dentro do modal
    if (selectPlanFilial) {
      selectPlanFilial.innerHTML = '<option value="">Selecione a Filial de Destino...</option>';
      AbastecimentoMock.filiais.forEach(f => {
        selectPlanFilial.innerHTML += `<option value="${f.id}">${f.nome}</option>`;
      });
    }

    if (selectLotCategory) {
      selectLotCategory.innerHTML = '<option value="">Selecione uma Categoria...</option>';
      AbastecimentoMock.categorias.forEach(c => {
        selectLotCategory.innerHTML += `<option value="${c.id}">${c.nome}</option>`;
      });
    }
  }

  /**
   * Popula o dropdown de "Copiar itens de um plano existente"
   */
  function updateCopyPlanDropdown(excludeId = null) {
    if (!selectCopyFromPlan) return;
    selectCopyFromPlan.innerHTML = '<option value="">-- Não copiar (Criar plano em branco) --</option>';
    planosList.forEach(p => {
      if (p.id !== excludeId) {
        selectCopyFromPlan.innerHTML += `<option value="${p.id}">${p.nome} (${p.itens.length} itens)</option>`;
      }
    });
  }

  /**
   * Renderiza os 4 Indicadores KPIs do Topo
   */
  function renderKPIs() {
    const total = planosList.length;
    const ativos = planosList.filter(p => p.status === 'ativo').length;
    
    // Lojas únicas com ao menos um plano
    const lojasUnicas = new Set(planosList.map(p => p.filialId)).size;
    
    // Total de SKUs monitorados somando todos os planos
    const totalSKUs = planosList.reduce((acc, p) => acc + (p.itens ? p.itens.length : 0), 0);

    if (kpiTotalPlanos) kpiTotalPlanos.textContent = total;
    if (kpiPlanosAtivos) kpiPlanosAtivos.textContent = ativos;
    if (kpiLojasCobertas) kpiLojasCobertas.textContent = lojasUnicas;
    if (kpiSkusMonitorados) kpiSkusMonitorados.textContent = totalSKUs;
  }

  /**
   * Renderiza a listagem de planos (Tabela Desktop e Cards Mobile)
   */
  function renderPlanosList() {
    const term = (searchInput?.value || '').toLowerCase().trim();
    const filialSelected = filialFilter?.value || '';
    const statusSelected = statusFilter?.value || '';

    // Filtragem
    const filtered = planosList.filter(p => {
      const matchText = p.nome.toLowerCase().includes(term) || 
                        p.filialNome.toLowerCase().includes(term) ||
                        p.id.toLowerCase().includes(term);
      const matchFilial = !filialSelected || p.filialId === filialSelected;
      const matchStatus = !statusSelected || p.status === statusSelected;
      return matchText && matchFilial && matchStatus;
    });

    // 1. Tabela Desktop
    if (tableBody) {
      if (filtered.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; padding: 2.5rem; color: #757575;">
              <span class="material-icons" style="font-size: 36px; color: #b0bec5; display: block; margin-bottom: 6px;">search_off</span>
              Nenhum plano de abastecimento encontrado com os filtros selecionados.
            </td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = filtered.map(p => {
          const isAtivo = p.status === 'ativo';
          const skuCount = p.itens ? p.itens.length : 0;
          return `
            <tr>
              <td>
                <div class="plan-name-cell">
                  <span>${p.nome}</span>
                  <span class="plan-desc-cell" title="${p.descricao || ''}">${p.descricao || 'Sem descrição adicional'}</span>
                </div>
              </td>
              <td>
                <div class="plan-store-tag">
                  <span class="material-icons">storefront</span>
                  <span>${p.filialNome}</span>
                </div>
              </td>
              <td>
                <span class="sku-count-badge">
                  <span class="material-icons" style="font-size: 14px;">inventory_2</span>
                  ${skuCount} SKUs
                </span>
              </td>
              <td>
                <span class="status-badge ${isAtivo ? 'status-ativo' : 'status-inativo'}">
                  ${isAtivo ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td style="color: #616161; font-size: 0.85rem;">
                ${p.dataCriacao || '-'}
              </td>
              <td>
                <div class="table-actions-cell">
                  <button class="btn-row-action" title="Editar / Visualizar Plano" onclick="window.AbastecimentoController.openEditModal('${p.id}')">
                    <span class="material-icons">edit</span>
                  </button>
                  <button class="btn-row-action" title="Duplicar / Clonar Plano" onclick="window.AbastecimentoController.clonePlan('${p.id}')">
                    <span class="material-icons">content_copy</span>
                  </button>
                  <button class="btn-row-action" title="${isAtivo ? 'Desativar' : 'Ativar'}" onclick="window.AbastecimentoController.toggleStatus('${p.id}')">
                    <span class="material-icons">${isAtivo ? 'toggle_on' : 'toggle_off'}</span>
                  </button>
                  <button class="btn-row-action btn-delete" title="Excluir Plano" onclick="window.AbastecimentoController.deletePlan('${p.id}')">
                    <span class="material-icons">delete</span>
                  </button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 2. Cards Mobile First
    if (mobileCardsContainer) {
      if (filtered.length === 0) {
        mobileCardsContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; background: #fff; border-radius: 4px; color: #757575;">
            <span class="material-icons" style="font-size: 36px; color: #b0bec5;">search_off</span>
            <p style="margin-top: 6px;">Nenhum plano encontrado.</p>
          </div>
        `;
      } else {
        mobileCardsContainer.innerHTML = filtered.map(p => {
          const isAtivo = p.status === 'ativo';
          const skuCount = p.itens ? p.itens.length : 0;
          return `
            <article class="mobile-plan-card">
              <div class="mobile-plan-header">
                <span class="mobile-plan-title">${p.nome}</span>
                <span class="status-badge ${isAtivo ? 'status-ativo' : 'status-inativo'}">
                  ${isAtivo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
              <div class="mobile-plan-store">
                <span class="material-icons">storefront</span>
                <span>${p.filialNome}</span>
              </div>
              <div class="mobile-plan-details">
                <span><strong>Mix:</strong> ${skuCount} produtos</span>
                <span><strong>Criado em:</strong> ${p.dataCriacao}</span>
              </div>
              <div class="mobile-plan-actions">
                <button class="btn-mobile-action btn-mobile-edit" onclick="window.AbastecimentoController.openEditModal('${p.id}')">
                  <span class="material-icons">edit</span> Editar
                </button>
                <button class="btn-mobile-action" onclick="window.AbastecimentoController.clonePlan('${p.id}')">
                  <span class="material-icons">content_copy</span> Clonar
                </button>
                <button class="btn-mobile-action" onclick="window.AbastecimentoController.toggleStatus('${p.id}')">
                  <span class="material-icons">${isAtivo ? 'block' : 'check_circle'}</span>
                </button>
              </div>
            </article>
          `;
        }).join('');
      }
    }
  }

  /**
   * Abre o modal para NOVO Plano
   */
  function openNewModal() {
    inputPlanId.value = '';
    inputPlanName.value = '';
    selectPlanFilial.value = '';
    inputPlanDesc.value = '';
    selectPlanStatus.value = 'ativo';
    currentEditingItems = [];

    updateCopyPlanDropdown();
    modalTitle.textContent = 'Novo Plano de Abastecimento';
    renderModalItems();
    planModal.classList.add('show');
  }

  /**
   * Abre o modal para EDITAR Plano
   */
  function openEditModal(planId) {
    const plano = planosList.find(p => p.id === planId);
    if (!plano) return;

    inputPlanId.value = plano.id;
    inputPlanName.value = plano.nome;
    selectPlanFilial.value = plano.filialId;
    inputPlanDesc.value = plano.descricao || '';
    selectPlanStatus.value = plano.status;
    
    // Clona os itens do plano para edição
    currentEditingItems = JSON.parse(JSON.stringify(plano.itens || []));

    updateCopyPlanDropdown(plano.id);
    modalTitle.textContent = `Editar Plano: ${plano.nome}`;
    renderModalItems();
    planModal.classList.add('show');
  }

  /**
   * Fecha o modal
   */
  function closeModal() {
    planModal.classList.remove('show');
    singleAutocompleteResults.classList.remove('show');
  }

  /**
   * Renderiza a tabela de itens dentro do modal
   */
  function renderModalItems() {
    if (!modalItemsTableBody) return;

    if (modalItemsCountTag) {
      modalItemsCountTag.textContent = `${currentEditingItems.length} SKUs no Mix`;
    }

    if (currentEditingItems.length === 0) {
      modalItemsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 2rem; color: #757575;">
            Nenhum produto adicionado neste plano ainda. Utilize a adição em lote por categoria acima ou pesquise individualmente.
          </td>
        </tr>
      `;
      return;
    }

    modalItemsTableBody.innerHTML = currentEditingItems.map((item, idx) => {
      const prod = AbastecimentoMock.getProdutoById(item.produtoId);
      if (!prod) return '';

      return `
        <tr>
          <td>
            <div style="font-weight: 500; color: #212121;">${prod.nome}</div>
            <div style="font-size: 0.75rem; color: #757575;">EAN: ${prod.ean} | Marca: ${prod.marca}</div>
          </td>
          <td>
            <span style="font-size: 0.8rem; color: #5f6368; text-transform: capitalize;">${prod.categoria}</span>
          </td>
          <td>
            <div class="stepper-control">
              <button type="button" class="btn-stepper" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', -1)">-</button>
              <input type="number" class="input-stepper-val" value="${item.estoqueIdeal}" min="1" onchange="window.AbastecimentoController.setItemQty(${idx}, 'ideal', this.value)">
              <button type="button" class="btn-stepper" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'ideal', 1)">+</button>
            </div>
          </td>
          <td>
            <div class="stepper-control">
              <button type="button" class="btn-stepper" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', -1)">-</button>
              <input type="number" class="input-stepper-val" value="${item.estoqueMinimo}" min="0" onchange="window.AbastecimentoController.setItemQty(${idx}, 'min', this.value)">
              <button type="button" class="btn-stepper" onclick="window.AbastecimentoController.updateItemQty(${idx}, 'min', 1)">+</button>
            </div>
          </td>
          <td style="text-align: right;">
            <button type="button" class="btn-row-action btn-delete" title="Remover do plano" onclick="window.AbastecimentoController.removeItem(${idx})">
              <span class="material-icons">delete_outline</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Adiciona todos os produtos de uma categoria em Lote
   */
  function addLotCategory() {
    const catId = selectLotCategory.value;
    if (!catId) {
      if (typeof Toast !== 'undefined') Toast.warning('Selecione uma categoria para adicionar em lote.');
      return;
    }

    const idealVal = parseInt(inputLotIdeal.value, 10) || 12;
    const minVal = parseInt(inputLotMin.value, 10) || 3;

    // Filtra produtos do catálogo que pertencem à categoria
    const categoryProducts = AbastecimentoMock.produtos.filter(p => p.categoria === catId);
    let addedCount = 0;

    categoryProducts.forEach(prod => {
      // Se o produto já não estiver no plano, adiciona
      const exists = currentEditingItems.find(item => item.produtoId === prod.id);
      if (!exists) {
        currentEditingItems.push({
          produtoId: prod.id,
          estoqueIdeal: idealVal,
          estoqueMinimo: minVal
        });
        addedCount++;
      }
    });

    renderModalItems();
    if (typeof Toast !== 'undefined') {
      if (addedCount > 0) {
        Toast.success(`${addedCount} produtos da categoria adicionados ao plano com sucesso!`);
      } else {
        Toast.info('Todos os produtos desta categoria já faziam parte do plano.');
      }
    }
  }

  /**
   * Copia itens de outro plano quando o usuário seleciona no select de clone
   */
  function handleCopyFromPlan(sourcePlanId) {
    if (!sourcePlanId) return;
    const source = planosList.find(p => p.id === sourcePlanId);
    if (!source || !source.itens) return;

    currentEditingItems = JSON.parse(JSON.stringify(source.itens));
    renderModalItems();
    if (typeof Toast !== 'undefined') {
      Toast.info(`Itens importados de "${source.nome}" (${source.itens.length} SKUs).`);
    }
  }

  /**
   * Salva o plano (Criação ou Edição)
   */
  function savePlan() {
    const name = inputPlanName.value.trim();
    const filialId = selectPlanFilial.value;

    if (!name) {
      if (typeof Toast !== 'undefined') Toast.error('Informe o nome do plano de abastecimento.');
      inputPlanName.focus();
      return;
    }

    if (!filialId) {
      if (typeof Toast !== 'undefined') Toast.error('Selecione a filial/loja de destino.');
      selectPlanFilial.focus();
      return;
    }

    if (currentEditingItems.length === 0) {
      if (typeof Toast !== 'undefined') Toast.warning('Adicione ao menos um produto no plano de abastecimento.');
      return;
    }

    const filialObj = AbastecimentoMock.getFilialById(filialId);
    const planId = inputPlanId.value;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    if (planId) {
      // Edição de plano existente
      const index = planosList.findIndex(p => p.id === planId);
      if (index !== -1) {
        planosList[index] = {
          ...planosList[index],
          nome: name,
          filialId: filialId,
          filialNome: filialObj ? filialObj.nome : 'Filial',
          descricao: inputPlanDesc.value.trim(),
          status: selectPlanStatus.value,
          dataAtualizacao: formattedDate,
          itens: currentEditingItems
        };
        if (typeof Toast !== 'undefined') Toast.success(`Plano "${name}" atualizado com sucesso!`);
      }
    } else {
      // Novo plano
      const newId = `PLN-${String(planosList.length + 1).padStart(3, '0')}`;
      const newPlan = {
        id: newId,
        nome: name,
        filialId: filialId,
        filialNome: filialObj ? filialObj.nome : 'Filial',
        descricao: inputPlanDesc.value.trim(),
        status: selectPlanStatus.value,
        dataCriacao: formattedDate,
        dataAtualizacao: formattedDate,
        itens: currentEditingItems
      };
      planosList.unshift(newPlan);
      if (typeof Toast !== 'undefined') Toast.success(`Novo plano "${name}" cadastrado com sucesso!`);
    }

    // Persistência
    AbastecimentoMock.savePlanos(planosList);

    closeModal();
    renderKPIs();
    renderPlanosList();
  }

  /**
   * Duplica/Clona um plano existente diretamente da tabela
   */
  function clonePlan(planId) {
    const source = planosList.find(p => p.id === planId);
    if (!source) return;

    const newId = `PLN-${String(planosList.length + 1).padStart(3, '0')}`;
    const now = new Date();
    const formattedDate = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;

    const cloned = {
      id: newId,
      nome: `Cópia de ${source.nome}`,
      filialId: source.filialId,
      filialNome: source.filialNome,
      descricao: source.descricao,
      status: 'ativo',
      dataCriacao: formattedDate,
      dataAtualizacao: formattedDate,
      itens: JSON.parse(JSON.stringify(source.itens || []))
    };

    planosList.unshift(cloned);
    AbastecimentoMock.savePlanos(planosList);

    renderKPIs();
    renderPlanosList();

    if (typeof Toast !== 'undefined') {
      Toast.success(`Plano clonado com sucesso: "${cloned.nome}"!`);
    }
  }

  /**
   * Alterna status Ativo / Inativo
   */
  function toggleStatus(planId) {
    const plano = planosList.find(p => p.id === planId);
    if (!plano) return;

    plano.status = plano.status === 'ativo' ? 'inativo' : 'ativo';
    AbastecimentoMock.savePlanos(planosList);

    renderKPIs();
    renderPlanosList();

    if (typeof Toast !== 'undefined') {
      Toast.info(`Status do plano alterado para: ${plano.status.toUpperCase()}`);
    }
  }

  /**
   * Exclui um plano com confirmação
   */
  function deletePlan(planId) {
    const plano = planosList.find(p => p.id === planId);
    if (!plano) return;

    if (confirm(`Deseja realmente excluir o plano "${plano.nome}"?`)) {
      planosList = planosList.filter(p => p.id !== planId);
      AbastecimentoMock.savePlanos(planosList);

      renderKPIs();
      renderPlanosList();

      if (typeof Toast !== 'undefined') {
        Toast.warning(`Plano "${plano.nome}" removido.`);
      }
    }
  }

  /**
   * Listeners de Eventos
   */
  function setupEventListeners() {
    // Filtros
    if (searchInput) searchInput.addEventListener('input', renderPlanosList);
    if (filialFilter) filialFilter.addEventListener('change', renderPlanosList);
    if (statusFilter) statusFilter.addEventListener('change', renderPlanosList);

    // Modal
    if (btnOpenNewModal) btnOpenNewModal.addEventListener('click', openNewModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (btnCancelModal) btnCancelModal.addEventListener('click', closeModal);
    if (btnSavePlan) btnSavePlan.addEventListener('click', savePlan);

    // Cópia de outro plano
    if (selectCopyFromPlan) {
      selectCopyFromPlan.addEventListener('change', (e) => handleCopyFromPlan(e.target.value));
    }

    // Adição em Lote
    if (btnAddLotCategory) {
      btnAddLotCategory.addEventListener('click', addLotCategory);
    }

    // Adição Individual - Autocomplete
    if (singleProductSearch) {
      singleProductSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (!query) {
          singleAutocompleteResults.classList.remove('show');
          return;
        }

        const matches = AbastecimentoMock.produtos.filter(p => 
          p.nome.toLowerCase().includes(query) || 
          p.ean.includes(query) ||
          p.marca.toLowerCase().includes(query)
        );

        if (matches.length === 0) {
          singleAutocompleteResults.innerHTML = '<div style="padding: 10px; color: #757575; font-size: 0.85rem;">Nenhum produto encontrado no catálogo.</div>';
        } else {
          singleAutocompleteResults.innerHTML = matches.map(p => `
            <div class="autocomplete-item" onclick="window.AbastecimentoController.addSingleProduct('${p.id}')">
              <span class="autocomplete-item-name">${p.nome}</span>
              <span class="autocomplete-item-meta">${p.marca} | EAN: ${p.ean}</span>
            </div>
          `).join('');
        }
        singleAutocompleteResults.classList.add('show');
      });

    // Fechar modal ao clicar fora ou na tecla Escape
    if (planModal) {
      planModal.addEventListener('click', (e) => {
        if (e.target === planModal) closeModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && planModal && planModal.classList.contains('show')) {
        closeModal();
      }
    });
  }

  // Métodos expostos globalmente para callbacks de elementos HTML
  window.AbastecimentoController = {
    openEditModal,
    clonePlan,
    toggleStatus,
    deletePlan,
    removeItem(index) {
      currentEditingItems.splice(index, 1);
      renderModalItems();
    },
    updateItemQty(index, field, delta) {
      if (field === 'ideal') {
        currentEditingItems[index].estoqueIdeal = Math.max(1, (currentEditingItems[index].estoqueIdeal || 1) + delta);
      } else {
        currentEditingItems[index].estoqueMinimo = Math.max(0, (currentEditingItems[index].estoqueMinimo || 0) + delta);
      }
      renderModalItems();
    },
    setItemQty(index, field, val) {
      const parsed = parseInt(val, 10);
      if (field === 'ideal') {
        currentEditingItems[index].estoqueIdeal = Math.max(1, isNaN(parsed) ? 1 : parsed);
      } else {
        currentEditingItems[index].estoqueMinimo = Math.max(0, isNaN(parsed) ? 0 : parsed);
      }
      renderModalItems();
    },
    addSingleProduct(productId) {
      const prod = AbastecimentoMock.getProdutoById(productId);
      if (!prod) return;

      const exists = currentEditingItems.find(item => item.produtoId === prod.id);
      if (exists) {
        if (typeof Toast !== 'undefined') Toast.info('Este produto já está incluído no plano.');
      } else {
        currentEditingItems.push({
          produtoId: prod.id,
          estoqueIdeal: prod.idealPadrao || 12,
          estoqueMinimo: prod.minimoPadrao || 3
        });
        renderModalItems();
        if (typeof Toast !== 'undefined') Toast.success(`"${prod.nome}" adicionado ao plano!`);
      }

      if (singleProductSearch) singleProductSearch.value = '';
      if (singleAutocompleteResults) singleAutocompleteResults.classList.remove('show');
    }
  };

  init();
});
