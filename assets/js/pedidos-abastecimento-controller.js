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
          <td>${item.planoBase || ''}</td>
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
          Toast.info(`Pedido ${selected.codigo} selecionado (${selected.filial}).`);
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

  // 4. Botão Flutuante (FAB) Novo Pedido
  if (fabNewPedido) {
    fabNewPedido.addEventListener('click', () => {
      if (typeof Toast !== 'undefined') {
        Toast.info('Novo Pedido de Abastecimento... (Protótipo Navegável)');
      }
    });
  }

  // 5. Renderização Inicial
  renderTable(currentList);
});
