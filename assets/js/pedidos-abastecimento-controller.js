/**
 * GOFLASH CORE - CONTROLADOR DA LISTAGEM DE PEDIDOS DE ABASTECIMENTO
 * Gerencia a renderização dos dados, filtragem dinâmica e interatividade.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Dados e Elementos do DOM
  const rawData = window.PedidosAbastecimentoData || [];
  let currentList = [...rawData];

  const tbody = document.getElementById('pedidosTableBody');
  const searchInput = document.getElementById('pageSearchInput');
  const breadcrumbCount = document.getElementById('breadcrumbCount');
  const fabNewPedido = document.getElementById('fabNewPedido');
  const emptyState = document.getElementById('pedidosEmptyState');

  // 2. Renderização da Tabela Oficial
  function renderTable(dataToRender) {
    if (!tbody) return;

    if (dataToRender.length === 0) {
      tbody.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (breadcrumbCount) breadcrumbCount.textContent = '0 item(s)';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (breadcrumbCount) breadcrumbCount.textContent = `${dataToRender.length} item(s)`;

    const rowsHtml = dataToRender.map((item, index) => {
      // Normalização da classe de status
      const statusLower = (item.status || '').toLowerCase();
      let statusBadgeClass = 'badge-status-aberto';
      if (statusLower.includes('cancelado')) {
        statusBadgeClass = 'badge-status-cancelado';
      } else if (statusLower.includes('recebido')) {
        statusBadgeClass = 'badge-status-recebido';
      } else if (statusLower.includes('pendente') || statusLower.includes('trânsito') || statusLower.includes('transito')) {
        statusBadgeClass = 'badge-status-pendente-abastecimento';
      } else if (statusLower.includes('finalizado') || statusLower.includes('concluído') || statusLower.includes('concluido')) {
        statusBadgeClass = 'badge-status-finalizado';
      }

      return `
        <tr data-id="${item.id}" class="pedido-row" title="Clique para ver detalhes do Pedido ${item.codigo}">
          <td class="col-num-indicator">${index + 1}</td>
          <td>
            <div class="pedidos-code-cell">
              <span class="material-icons pedidos-code-icon">assignment</span>
              <span class="pedidos-num-text">${item.codigo}</span>
            </div>
          </td>
          <td>${item.filial || '-'}</td>
          <td>${item.planoBase || (item.tipo === 'manual' ? '<span style="color:#888; font-style:italic;">Manual (Em branco)</span>' : '')}</td>
          <td>${item.qtdeItens}</td>
          <td>${item.dataCriacao}</td>
          <td>
            <span class="badge-status-pedido ${statusBadgeClass}">${item.status}</span>
          </td>
        </tr>
      `;
    }).join('');

    tbody.innerHTML = rowsHtml;

    // Vincular clique nas linhas para abrir os detalhes do pedido
    const rows = tbody.querySelectorAll('.pedido-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        const selected = rawData.find(p => p.id == id);
        if (selected) {
          if (typeof Toast !== 'undefined') {
            Toast.info(`Abrindo Pedido ${selected.codigo} (${selected.status})...`);
          }
          setTimeout(() => {
            window.location.href = `./pedido-manual.html?id=${encodeURIComponent(id)}&codigo=${encodeURIComponent(selected.codigo)}`;
          }, 200);
        }
      });
    });
  }

  // 3. Filtragem Dinâmica em Tempo Real
  function handleSearch() {
    const query = (searchInput ? searchInput.value : '').trim().toLowerCase();
    if (!query) {
      currentList = [...rawData];
    } else {
      currentList = rawData.filter(item => {
        const cod = (item.codigo || '').toLowerCase();
        const fil = (item.filial || '').toLowerCase();
        const pla = (item.planoBase || '').toLowerCase();
        const sta = (item.status || '').toLowerCase();
        const dat = (item.dataCriacao || '').toLowerCase();
        return cod.includes(query) || fil.includes(query) || pla.includes(query) || sta.includes(query) || dat.includes(query);
      });
    }
    renderTable(currentList);
  }

  if (searchInput) {
    searchInput.addEventListener('input', handleSearch);
    searchInput.addEventListener('keyup', (e) => {
      if (e.key === 'Escape') {
        searchInput.value = '';
        handleSearch();
      }
    });
  }

  // 4. Modais de Novo Pedido, Nova Consulta e Pedido em Branco
  const modalChoice = document.getElementById('modalChoicePedido');
  const btnCloseChoice = document.getElementById('btnCloseChoiceModal');
  const btnDiscardChoice = document.getElementById('btnDiscardChoice');
  const btnChooseConsulta = document.getElementById('btnChooseConsulta');
  const btnChooseBlank = document.getElementById('btnChooseBlank');

  const modalNovaConsulta = document.getElementById('modalNovaConsulta');
  const btnCloseNovaConsulta = document.getElementById('btnCloseNovaConsultaModal');
  const btnBackNovaConsulta = document.getElementById('btnBackNovaConsulta');
  const btnDiscardNovaConsulta = document.getElementById('btnDiscardNovaConsulta');
  const btnAvancarConsulta = document.getElementById('btnAvancarConsulta');

  const modalNovoPedidoBranco = document.getElementById('modalNovoPedidoBranco');
  const btnClosePedidoBranco = document.getElementById('btnClosePedidoBrancoModal');
  const btnBackPedidoBranco = document.getElementById('btnBackPedidoBranco');
  const btnDiscardPedidoBranco = document.getElementById('btnDiscardPedidoBranco');
  const btnAvancarPedidoBranco = document.getElementById('btnAvancarPedidoBranco');

  function openChoiceModal() {
    if (modalChoice) modalChoice.classList.add('show', 'active');
  }

  function closeChoiceModal() {
    if (modalChoice) modalChoice.classList.remove('show', 'active');
  }

  function openNovaConsultaModal() {
    closeChoiceModal();
    const bodyHelp = document.getElementById('bodyConsultaHelp');
    const btnHelp = document.getElementById('btnConsultaHelpText');
    if (bodyHelp) bodyHelp.style.display = 'none';
    if (btnHelp) {
      btnHelp.classList.remove('open');
      btnHelp.setAttribute('aria-expanded', 'false');
    }
    if (modalNovaConsulta) modalNovaConsulta.classList.add('show', 'active');
  }

  function closeNovaConsultaModal() {
    if (modalNovaConsulta) modalNovaConsulta.classList.remove('show', 'active');
  }

  function openPedidoBrancoModal() {
    closeChoiceModal();
    if (modalNovoPedidoBranco) modalNovoPedidoBranco.classList.add('show', 'active');
  }

  function closePedidoBrancoModal() {
    if (modalNovoPedidoBranco) modalNovoPedidoBranco.classList.remove('show', 'active');
  }

  if (fabNewPedido) {
    fabNewPedido.addEventListener('click', (e) => {
      e.stopPropagation();
      openChoiceModal();
    });
  }

  if (btnCloseChoice) btnCloseChoice.addEventListener('click', closeChoiceModal);
  if (btnDiscardChoice) btnDiscardChoice.addEventListener('click', closeChoiceModal);
  if (btnChooseConsulta) btnChooseConsulta.addEventListener('click', openNovaConsultaModal);
  if (btnChooseBlank) btnChooseBlank.addEventListener('click', openPedidoBrancoModal);

  // Ações de Retorno (Voltar para o Modal Anterior de Escolha)
  if (btnBackNovaConsulta) {
    btnBackNovaConsulta.addEventListener('click', () => {
      closeNovaConsultaModal();
      openChoiceModal();
    });
  }

  if (btnBackPedidoBranco) {
    btnBackPedidoBranco.addEventListener('click', () => {
      closePedidoBrancoModal();
      openChoiceModal();
    });
  }

  // Fechar ao clicar fora da caixa do modal (no backdrop)
  if (modalChoice) {
    modalChoice.addEventListener('click', (e) => {
      if (e.target === modalChoice) closeChoiceModal();
    });
  }

  if (modalNovaConsulta) {
    modalNovaConsulta.addEventListener('click', (e) => {
      if (e.target === modalNovaConsulta) closeNovaConsultaModal();
    });
  }

  if (modalNovoPedidoBranco) {
    modalNovoPedidoBranco.addEventListener('click', (e) => {
      if (e.target === modalNovoPedidoBranco) closePedidoBrancoModal();
    });
  }

  if (btnCloseNovaConsulta) btnCloseNovaConsulta.addEventListener('click', closeNovaConsultaModal);
  if (btnDiscardNovaConsulta) btnDiscardNovaConsulta.addEventListener('click', closeNovaConsultaModal);
  if (btnClosePedidoBranco) btnClosePedidoBranco.addEventListener('click', closePedidoBrancoModal);
  if (btnDiscardPedidoBranco) btnDiscardPedidoBranco.addEventListener('click', closePedidoBrancoModal);

  /**
   * Componente Reutilizável de Combobox Pesquisável (Searchable Autocomplete)
   */
  class SearchableCombobox {
    constructor(config) {
      this.container = document.getElementById(config.containerId);
      this.input = document.getElementById(config.inputId);
      this.clearBtn = document.getElementById(config.clearBtnId);
      this.toggleBtn = document.getElementById(config.toggleBtnId);
      this.dropdown = document.getElementById(config.dropdownId);
      this.getOptions = config.getOptions || (() => []);
      this.onSelect = config.onSelect || (() => {});
      this.selectedValue = config.initialValue || '';
      this.selectedLabel = config.initialLabel || '';

      if (!this.container || !this.input || !this.dropdown) return;
      this.init();
    }

    init() {
      // Valor inicial
      if (this.selectedLabel) {
        this.setValue(this.selectedValue, this.selectedLabel);
      }

      // Digitação para filtrar
      this.input.addEventListener('input', () => {
        const query = this.input.value.trim();
        this.renderDropdown(query);
        this.open();
        if (this.clearBtn) {
          this.clearBtn.style.display = query ? 'flex' : 'none';
        }
        if (this.container) this.container.classList.remove('has-error');
      });

      // Foco para abrir dropdown
      this.input.addEventListener('focus', () => {
        this.renderDropdown(this.input.value.trim());
        this.open();
      });

      // Botão de toggle (abrir/fechar)
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
        if (this.container && !this.container.contains(e.target)) {
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
      if (this.container) this.container.classList.remove('has-error');
    }

    getValue() {
      return this.selectedValue || this.input.value.trim();
    }

    getLabel() {
      return this.selectedLabel || this.input.value.trim();
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
          (!opt.value && !this.selectedValue && opt.label === this.selectedLabel);
        const countBadge = (opt.count !== undefined && opt.count !== null && opt.count > 0) ? 
          `<span class="combobox-count">${opt.count} itens</span>` : '';
        
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
          <div class="combobox-option ${isSelected ? 'selected' : ''}" data-value="${opt.value || ''}" data-label="${opt.label || ''}">
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

  // 4.1 Dados das Opções dos Comboboxes
  const filiaisDestinoOptions = [
    { value: 'Mini Mercado 03 Simples Nacional', label: 'Mini Mercado 03 Simples Nacional' },
    { value: 'Mini Mercado 01', label: 'Mini Mercado 01' },
    { value: 'Mini Mercado 02 Condomínio Jardins', label: 'Mini Mercado 02 Condomínio Jardins' },
    { value: 'Mini Mercado 04 Empresarial Prime', label: 'Mini Mercado 04 Empresarial Prime' }
  ];

  const filiaisOrigemOptions = [
    { value: '', label: '-- Nenhuma (Sem filial de origem) --' },
    { value: 'Estoque central', label: 'Estoque central' },
    { value: 'CD Principal Zona Sul', label: 'CD Principal Zona Sul' }
  ];

  const planosAbastecimentoOptions = [
    { value: '', label: '-- Nenhum plano (Consulta livre / Sem plano) --', count: 0 },
    { value: 'Plano MiniMercado 03', label: 'Plano MiniMercado 03', count: 45 },
    { value: 'Plano Snacks & Mercearia', label: 'Plano Snacks & Mercearia', count: 32 },
    { value: 'Plano Bebidas & Conveniência', label: 'Plano Bebidas & Conveniência', count: 28 }
  ];

  // Elementos auxiliares do plano
  const containerFiltrosPlano = document.getElementById('containerFiltrosPlano');
  const hintPlanoHelper = document.getElementById('hintPlanoHelper');

  // 4.1.1 Controle do Banner Colapsável de Instruções
  const btnToggleConsultaHelp = document.getElementById('btnToggleConsultaHelp');
  const bodyConsultaHelp = document.getElementById('bodyConsultaHelp');
  const btnConsultaHelpText = document.getElementById('btnConsultaHelpText');

  if (btnToggleConsultaHelp && bodyConsultaHelp) {
    btnToggleConsultaHelp.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = bodyConsultaHelp.style.display === 'flex';
      bodyConsultaHelp.style.display = isOpen ? 'none' : 'flex';
      if (btnConsultaHelpText) {
        btnConsultaHelpText.classList.toggle('open', !isOpen);
        btnConsultaHelpText.setAttribute('aria-expanded', !isOpen ? 'true' : 'false');
      }
    });
  }

  // 4.2 Instanciação dos Comboboxes do Modal de Nova Consulta
  const comboboxModalDestino = new SearchableCombobox({
    containerId: 'comboboxModalDestino',
    inputId: 'inputComboboxModalDestino',
    clearBtnId: 'btnClearModalDestino',
    toggleBtnId: 'btnToggleModalDestino',
    dropdownId: 'dropdownModalDestino',
    getOptions: () => filiaisDestinoOptions,
    onSelect: () => {}
  });

  const comboboxModalOrigem = new SearchableCombobox({
    containerId: 'comboboxModalOrigem',
    inputId: 'inputComboboxModalOrigem',
    clearBtnId: 'btnClearModalOrigem',
    toggleBtnId: 'btnToggleModalOrigem',
    dropdownId: 'dropdownModalOrigem',
    getOptions: () => filiaisOrigemOptions,
    onSelect: () => {}
  });

  const comboboxModalPlano = new SearchableCombobox({
    containerId: 'comboboxModalPlano',
    inputId: 'inputComboboxModalPlano',
    clearBtnId: 'btnClearModalPlano',
    toggleBtnId: 'btnToggleModalPlano',
    dropdownId: 'dropdownModalPlano',
    getOptions: () => planosAbastecimentoOptions,
    onSelect: (val) => {
      const hasPlan = !!val;
      if (containerFiltrosPlano) {
        containerFiltrosPlano.style.display = hasPlan ? 'block' : 'none';
      }
      if (hintPlanoHelper) {
        hintPlanoHelper.style.display = hasPlan ? 'none' : 'flex';
      }
    }
  });

  // 4.3 Instanciação dos Comboboxes do Modal de Pedido em Branco
  const comboboxBlankDestino = new SearchableCombobox({
    containerId: 'comboboxBlankDestino',
    inputId: 'inputComboboxBlankDestino',
    clearBtnId: 'btnClearBlankDestino',
    toggleBtnId: 'btnToggleBlankDestino',
    dropdownId: 'dropdownBlankDestino',
    initialValue: 'Mini Mercado 03 Simples Nacional',
    initialLabel: 'Mini Mercado 03 Simples Nacional',
    getOptions: () => filiaisDestinoOptions,
    onSelect: () => {}
  });

  const comboboxBlankOrigem = new SearchableCombobox({
    containerId: 'comboboxBlankOrigem',
    inputId: 'inputComboboxBlankOrigem',
    clearBtnId: 'btnClearBlankOrigem',
    toggleBtnId: 'btnToggleBlankOrigem',
    dropdownId: 'dropdownBlankOrigem',
    getOptions: () => [
      { value: '', label: '-- Nenhuma (Entrada direta / Compra) --' },
      { value: 'Estoque central', label: 'Estoque central (000005)' },
      { value: 'CD Principal Zona Sul', label: 'CD Principal Zona Sul (000001)' },
      { value: 'Mini Mercado 01', label: 'Mini Mercado 01 (Transferência)' },
      { value: 'Mini Mercado 02 Condomínio Jardins', label: 'Mini Mercado 02 Condomínio Jardins (Transferência)' }
    ],
    onSelect: () => {}
  });

  // Ação Avançar do Modal Pedido em Branco
  if (btnAvancarPedidoBranco) {
    btnAvancarPedidoBranco.addEventListener('click', () => {
      const destinoVal = comboboxBlankDestino.getValue();
      const origemVal = comboboxBlankOrigem.getValue();

      if (!destinoVal) {
        const container = document.getElementById('comboboxBlankDestino');
        if (container) {
          container.classList.add('has-error');
          setTimeout(() => container.classList.remove('has-error'), 3000);
        }
        if (typeof Toast !== 'undefined') {
          Toast.warning('Por favor, selecione a Filial para Repor (Destino).');
        }
        return;
      }

      closePedidoBrancoModal();
      if (typeof Toast !== 'undefined') {
        Toast.info('Iniciando Pedido em Branco...');
      }

      let url = `./pedido-manual.html?destino=${encodeURIComponent(destinoVal)}`;
      if (origemVal) {
        url += `&origem=${encodeURIComponent(origemVal)}`;
      }

      setTimeout(() => {
        window.location.href = url;
      }, 300);
    });
  }

  // Seleção de Radio Cards no Modal de Consulta
  const radioCards = document.querySelectorAll('#modalNovaConsulta .modal-radio-card');
  radioCards.forEach(card => {
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const input = card.querySelector('input[type="radio"]');
      if (input) input.checked = true;
    });
  });

  // Ação Avançar do Modal Nova Consulta
  if (btnAvancarConsulta) {
    btnAvancarConsulta.addEventListener('click', () => {
      const destinoVal = comboboxModalDestino.getValue();
      const origemVal = comboboxModalOrigem.getValue();
      const planoVal = comboboxModalPlano.getValue();
      const selectedRadio = document.querySelector('input[name="filtroPlanoConsulta"]:checked');

      // Validação obrigatória da Filial para Repor
      if (!destinoVal) {
        const container = document.getElementById('comboboxModalDestino');
        if (container) {
          container.classList.add('has-error');
          setTimeout(() => container.classList.remove('has-error'), 3000);
        }
        if (typeof Toast !== 'undefined') {
          Toast.warning('Por favor, selecione a Filial para Repor para continuar.');
        }
        return;
      }

      const filtroVal = (planoVal && selectedRadio) ? selectedRadio.value : 'completo';

      let url = `./consulta-abastecimento.html?destino=${encodeURIComponent(destinoVal)}`;
      if (origemVal) {
        url += `&origem=${encodeURIComponent(origemVal)}`;
      }
      if (planoVal) {
        url += `&plano=${encodeURIComponent(planoVal)}&filtro=${encodeURIComponent(filtroVal)}`;
      }

      closeNovaConsultaModal();
      if (typeof Toast !== 'undefined') {
        Toast.info(planoVal ? 'Carregando produtos do plano...' : 'Iniciando consulta para inserção de produtos...');
      }

      setTimeout(() => {
        window.location.href = url;
      }, 350);
    });
  }

  // 5. Renderização Inicial
  renderTable(currentList);
});
