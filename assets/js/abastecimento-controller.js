/**
 * GOFLASH CORE - ABASTECIMENTO CONTROLLER
 * Controlador para a Listagem de Planos, Modal Novo Plano e Visualização de Detalhes.
 * Fiel 100% às imagens de referência (Imagem 1, 2 e 3).
 */

document.addEventListener('DOMContentLoaded', () => {
  // Elementos das Visões
  const planListView = document.getElementById('planListView');
  const planDetailView = document.getElementById('planDetailView');
  const pageSearchInput = document.getElementById('pageSearchInput');

  // Elementos da Lista
  const plansTableBody = document.getElementById('plansTableBody');
  const breadcrumbCount = document.getElementById('breadcrumbCount');
  const fabRedAdd = document.getElementById('fabRedAdd');

  // Elementos do Modal NOVO PLANO
  const newPlanModal = document.getElementById('newPlanModal');
  const btnCloseNewModal = document.getElementById('btnCloseNewModal');
  const btnDiscardNewModal = document.getElementById('btnDiscardNewModal');
  const btnFinalizeNewModal = document.getElementById('btnFinalizeNewModal');
  
  const inputModalName = document.getElementById('inputModalName');
  const inputModalDesc = document.getElementById('inputModalDesc');
  const selectModalFilial = document.getElementById('selectModalFilial');
  const selectModalCopyPlan = document.getElementById('selectModalCopyPlan');

  // Elementos da Tela de Detalhes
  const detailBreadcrumbLink = document.getElementById('detailBreadcrumbLink');
  const detailPlanName = document.getElementById('detailPlanName');
  const detailPlanDesc = document.getElementById('detailPlanDesc');
  const detailPlanCode = document.getElementById('detailPlanCode');
  const detailPlanFilial = document.getElementById('detailPlanFilial');
  const detailPlanAtivo = document.getElementById('detailPlanAtivo');
  const detailProductsTableBody = document.getElementById('detailProductsTableBody');

  // Estado Local
  let planos = AbastecimentoMock.getPlanos();
  let currentActivePlanId = null;

  /**
   * Inicialização
   */
  function init() {
    populateModalSelects();
    renderPlansTable();
    setupEventListeners();

    // Verifica se há ID na URL para abrir direto os detalhes
    const urlParams = new URLSearchParams(window.location.search);
    const urlPlanId = urlParams.get('id');
    if (urlPlanId) {
      showDetailView(urlPlanId);
    } else {
      showListView();
    }
  }

  /**
   * Popula os selects dentro do modal
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
  function showListView() {
    currentActivePlanId = null;
    if (planDetailView) planDetailView.classList.remove('show');
    if (planListView) planListView.style.display = 'block';
    if (fabRedAdd) fabRedAdd.style.display = 'flex';
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
   * Exibe a Tela de Detalhes do Plano (Imagem 3)
   */
  function showDetailView(planId) {
    const plano = planos.find(p => p.id === planId);
    if (!plano) return;

    currentActivePlanId = planId;
    if (planListView) planListView.style.display = 'none';
    if (fabRedAdd) fabRedAdd.style.display = 'none';
    if (planDetailView) planDetailView.classList.add('show');

    // Preenche dados do Hero Card Roxo
    if (detailPlanName) detailPlanName.textContent = plano.nome;
    if (detailPlanDesc) detailPlanDesc.textContent = plano.descricao || 'Nenhuma descrição informada';
    if (detailPlanCode) detailPlanCode.textContent = plano.codigo;
    if (detailPlanFilial) detailPlanFilial.textContent = plano.filialNome;
    if (detailPlanAtivo) detailPlanAtivo.innerHTML = plano.status === 'ativo' ? '<span class="material-icons">check</span>' : '';

    // Renderiza a lista de produtos
    renderDetailProducts(plano);
  }

  /**
   * Renderiza a Tabela de Produtos do Plano com Fotos e Badges (Imagem 3)
   */
  function renderDetailProducts(plano) {
    if (!detailProductsTableBody) return;

    const itens = plano.itens || [];

    if (itens.length === 0) {
      detailProductsTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 3rem; color: #757575;">
            <span class="material-icons" style="font-size: 40px; color: #b0bec5; display: block; margin-bottom: 6px;">inventory_2</span>
            Nenhum produto cadastrado neste plano de abastecimento.
          </td>
        </tr>
      `;
      return;
    }

    detailProductsTableBody.innerHTML = itens.map(item => {
      const prod = AbastecimentoMock.getProdutoById(item.produtoId);
      if (!prod) return '';

      return `
        <tr>
          <td>
            <div class="product-code-cell">
              <div class="product-thumb-box" style="background-color: ${prod.thumbColor};">
                <span class="material-icons" style="font-size: 22px;">${prod.icone || 'local_drink'}</span>
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
            <span class="pill-ideal">${item.estoqueIdeal}</span>
          </td>
          <td style="text-align: center;">
            <span class="pill-minimo">${item.estoqueMinimo}</span>
          </td>
        </tr>
      `;
    }).join('');
  }

  /**
   * Abre o Modal NOVO PLANO (Imagem 2)
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

  /**
   * Fecha o Modal NOVO PLANO
   */
  function closeNewPlanModal() {
    newPlanModal.classList.remove('show');
  }

  /**
   * Finaliza e cria o novo plano a partir do Modal (Imagem 2)
   */
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

    // Gera o próximo código numérico sequencial (ex: 000005)
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
      Toast.success(`Plano ${codigoFormatado} - ${nome} criado com sucesso!`);
    }

    // Abre diretamente a tela de detalhes do plano recém-criado
    showDetailView(newPlan.id);
  }

  /**
   * Listeners de Eventos
   */
  function setupEventListeners() {
    // Busca
    if (pageSearchInput) {
      pageSearchInput.addEventListener('input', () => {
        if (currentActivePlanId) {
          // Filtra produtos na tela de detalhes
          const plano = planos.find(p => p.id === currentActivePlanId);
          if (plano) {
            const term = pageSearchInput.value.toLowerCase().trim();
            const filteredPlan = {
              ...plano,
              itens: plano.itens.filter(item => {
                const prod = AbastecimentoMock.getProdutoById(item.produtoId);
                return prod && (prod.nome.toLowerCase().includes(term) || prod.ean.includes(term));
              })
            };
            renderDetailProducts(filteredPlan);
          }
        } else {
          renderPlansTable();
        }
      });
    }

    // Modal
    if (fabRedAdd) fabRedAdd.addEventListener('click', openNewPlanModal);
    if (btnCloseNewModal) btnCloseNewModal.addEventListener('click', closeNewPlanModal);
    if (btnDiscardNewModal) btnDiscardNewModal.addEventListener('click', closeNewPlanModal);
    if (btnFinalizeNewModal) btnFinalizeNewModal.addEventListener('click', finalizeNewPlan);

    // Fechar modal ao clicar fora ou na tecla Escape
    if (newPlanModal) {
      newPlanModal.addEventListener('click', (e) => {
        if (e.target === newPlanModal) closeNewPlanModal();
      });
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && newPlanModal && newPlanModal.classList.contains('show')) {
        closeNewPlanModal();
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

  // Exposição global para callbacks
  window.AbastecimentoController = {
    showDetailView,
    showListView,
    openNewPlanModal
  };

  init();
});
