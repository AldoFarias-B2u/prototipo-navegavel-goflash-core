/**
 * GOFLASH CORE - MODULE SEARCH CONTROLLER
 * Mecanismo de busca dinâmica em tempo real para telas de módulos ERP.
 */

document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('moduleSearchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const noResultsBox = document.getElementById('noResultsBox');
  const noResultsQuerySpan = document.getElementById('noResultsQuery');
  const resetSearchBtn = document.getElementById('resetSearchBtn');

  const allItems = Array.from(document.querySelectorAll('.module-feature-item'));
  const allGroups = Array.from(document.querySelectorAll('.module-section-group, .module-side-card'));

  if (!searchInput) return;

  // Armazenar o texto original de cada item para poder restaurar após destacar
  const itemCache = allItems.map(item => {
    const titleEl = item.querySelector('.module-feature-title');
    const descEl = item.querySelector('.module-feature-description');
    return {
      element: item,
      titleEl: titleEl,
      descEl: descEl,
      originalTitle: titleEl ? titleEl.textContent : '',
      originalDesc: descEl ? descEl.textContent : ''
    };
  });

  /**
   * Normaliza texto para busca (remove acentos e converte para minúsculas)
   */
  function normalizeText(text) {
    return (text || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  /**
   * Executa a filtragem dinâmica
   */
  function filterItems(query) {
    const term = normalizeText(query.trim());
    let visibleCount = 0;

    // Mostrar ou ocultar botão de limpar busca
    if (searchClearBtn) {
      searchClearBtn.classList.toggle('show', term.length > 0);
    }

    if (!term) {
      // Restaurar tudo para o estado original
      itemCache.forEach(cache => {
        cache.element.classList.remove('search-hidden');
        if (cache.titleEl) cache.titleEl.textContent = cache.originalTitle;
        if (cache.descEl) cache.descEl.textContent = cache.originalDesc;
      });

      allGroups.forEach(group => group.classList.remove('search-hidden'));
      if (noResultsBox) noResultsBox.classList.remove('show');
      return;
    }

    // Filtrar cada item individualmente
    itemCache.forEach(cache => {
      const normTitle = normalizeText(cache.originalTitle);
      const normDesc = normalizeText(cache.originalDesc);

      const matchesTitle = normTitle.includes(term);
      const matchesDesc = normDesc.includes(term);

      if (matchesTitle || matchesDesc) {
        cache.element.classList.remove('search-hidden');
        visibleCount++;

        // Realce de texto
        if (cache.titleEl) {
          cache.titleEl.innerHTML = highlightMatch(cache.originalTitle, query.trim());
        }
        if (cache.descEl) {
          cache.descEl.innerHTML = highlightMatch(cache.originalDesc, query.trim());
        }
      } else {
        cache.element.classList.add('search-hidden');
      }
    });

    // Ocultar grupos/seções vazias
    allGroups.forEach(group => {
      const visibleChildren = group.querySelectorAll('.module-feature-item:not(.search-hidden)');
      group.classList.toggle('search-hidden', visibleChildren.length === 0);
    });

    // Exibir caixa de "Nenhum resultado" caso não haja correspondências
    if (noResultsBox) {
      if (visibleCount === 0) {
        noResultsBox.classList.add('show');
        if (noResultsQuerySpan) noResultsQuerySpan.textContent = `"${query.trim()}"`;
      } else {
        noResultsBox.classList.remove('show');
      }
    }
  }

  /**
   * Aplica tag <mark> no trecho correspondente
   */
  function highlightMatch(originalText, term) {
    if (!term) return originalText;
    const regex = new RegExp(`(${escapeRegExp(term)})`, 'gi');
    return originalText.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Listener no input de busca
  searchInput.addEventListener('input', (e) => {
    filterItems(e.target.value);
  });

  // Limpar busca pelo botão X
  if (searchClearBtn) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      filterItems('');
    });
  }

  // Limpar busca pelo botão no banner de "Nenhum resultado"
  if (resetSearchBtn) {
    resetSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchInput.focus();
      filterItems('');
    });
  }

  // Atalho de teclado (Ctrl + K ou tecla /) para focar na busca
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement !== searchInput)) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
      searchInput.value = '';
      filterItems('');
      searchInput.blur();
    }
  });

  // Feedback de clique nos itens do módulo (apenas para links ainda em mock '#')
  allItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const href = item.getAttribute('href');
      if (!href || href === '#') {
        e.preventDefault();
        const title = item.querySelector('.module-feature-title')?.textContent || 'Funcionalidade';
        if (typeof Toast !== 'undefined') {
          Toast.info(`Abrindo ${title.trim()}... (Protótipo Navegável)`);
        }
      }
    });
  });
});
