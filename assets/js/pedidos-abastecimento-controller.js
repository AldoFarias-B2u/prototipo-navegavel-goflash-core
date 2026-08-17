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

    // Vincular clique nas linhas
    const rows = tbody.querySelectorAll('.pedido-row');
    rows.forEach(row => {
      row.addEventListener('click', () => {
        const id = row.getAttribute('data-id');
        const selected = rawData.find(p => p.id == id);
        if (selected && typeof Toast !== 'undefined') {
          Toast.info(`Pedido ${selected.codigo} selecionado (${selected.filial}) - Status: ${selected.status}.`);
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
  const btnDiscardNovaConsulta = document.getElementById('btnDiscardNovaConsulta');
  const btnAvancarConsulta = document.getElementById('btnAvancarConsulta');

  const modalNovoPedidoBranco = document.getElementById('modalNovoPedidoBranco');
  const btnClosePedidoBranco = document.getElementById('btnClosePedidoBrancoModal');
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

  if (btnClosePedidoBranco) btnClosePedidoBranco.addEventListener('click', closePedidoBrancoModal);
  if (btnDiscardPedidoBranco) btnDiscardPedidoBranco.addEventListener('click', closePedidoBrancoModal);

  if (btnAvancarPedidoBranco) {
    btnAvancarPedidoBranco.addEventListener('click', () => {
      const selectDestino = document.getElementById('selectBlankDestino');
      const selectOrigem = document.getElementById('selectBlankOrigem');

      const destinoText = selectDestino ? selectDestino.value : 'Mini Mercado 03 Simples Nacional';
      const origemText = selectOrigem ? selectOrigem.value : '';

      closePedidoBrancoModal();
      if (typeof Toast !== 'undefined') {
        Toast.info('Iniciando Pedido em Branco...');
      }

      let url = `./pedido-manual.html?destino=${encodeURIComponent(destinoText)}`;
      if (origemText) {
        url += `&origem=${encodeURIComponent(origemText)}`;
      }

      setTimeout(() => {
        window.location.href = url;
      }, 300);
    });
  }

  if (btnCloseNovaConsulta) btnCloseNovaConsulta.addEventListener('click', closeNovaConsultaModal);
  if (btnDiscardNovaConsulta) btnDiscardNovaConsulta.addEventListener('click', closeNovaConsultaModal);

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

  // Avançar para a Tela de Consulta
  if (btnAvancarConsulta) {
    btnAvancarConsulta.addEventListener('click', () => {
      const selectOrigem = document.getElementById('selectModalOrigem');
      const selectDestino = document.getElementById('selectModalDestino');
      const selectPlano = document.getElementById('selectModalPlano');
      const selectedRadio = document.querySelector('input[name="filtroPlanoConsulta"]:checked');

      const origemText = selectOrigem ? selectOrigem.options[selectOrigem.selectedIndex].text : 'Estoque central';
      const destinoText = selectDestino ? selectDestino.options[selectDestino.selectedIndex].text : 'Mini Mercado 03 Simples Nacional';
      const planoText = selectPlano ? selectPlano.options[selectPlano.selectedIndex].text : 'Plano MiniMercado 03';
      const filtroVal = selectedRadio ? selectedRadio.value : 'completo';

      const url = `./consulta-abastecimento.html?origem=${encodeURIComponent(origemText)}&destino=${encodeURIComponent(destinoText)}&plano=${encodeURIComponent(planoText)}&filtro=${encodeURIComponent(filtroVal)}`;
      
      closeNovaConsultaModal();
      if (typeof Toast !== 'undefined') {
        Toast.info('Carregando produtos do plano...');
      }

      setTimeout(() => {
        window.location.href = url;
      }, 350);
    });
  }

  // 5. Renderização Inicial
  renderTable(currentList);
});
