/**
 * GOFLASH CORE - NAVIGATION MANAGER (NAV)
 * Sistema centralizado e reutilizável de gerenciamento de rotas,
 * histórico de navegação e controle de sub-visões para todo o ERP GoMarket.
 */

const NavigationManager = (function () {
  const STORAGE_KEY = 'goflash_nav_history_stack';
  const viewChangeListeners = [];

  /**
   * Obtém a pilha de histórico armazenada no sessionStorage
   */
  function getStack() {
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Erro ao ler pilha de navegação:', e);
      return [];
    }
  }

  /**
   * Salva a pilha de histórico no sessionStorage
   */
  function saveStack(stack) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(stack));
    } catch (e) {
      console.warn('Erro ao salvar pilha de navegação:', e);
    }
  }

  /**
   * Registra a página atual na pilha se for uma nova navegação
   */
  function trackCurrentPage() {
    const currentUrl = window.location.pathname + window.location.search;
    const currentTitle = document.title || 'Goflash CORE';
    const stack = getStack();

    // Evita duplicar a mesma URL no topo da pilha
    if (stack.length === 0 || stack[stack.length - 1].url !== currentUrl) {
      stack.push({
        url: currentUrl,
        title: currentTitle,
        timestamp: Date.now()
      });
      // Limita a pilha a 30 entradas para performance
      if (stack.length > 30) stack.shift();
      saveStack(stack);
    }
  }

  /**
   * Executa a navegação para voltar à tela imediatamente anterior
   * @param {string} fallbackUrl - URL de fallback caso não haja histórico
   */
  function back(fallbackUrl = './dashboard.html') {
    // 1. Se estivermos numa sub-visão interna (ex: URL com query params como ?id=...),
    // utilizamos o histórico nativo do navegador
    if (window.history.state && window.history.state.subView) {
      window.history.back();
      return;
    }

    const stack = getStack();
    const currentUrl = window.location.pathname + window.location.search;

    // Remove a página atual do topo da pilha se ela for a última
    if (stack.length > 0 && stack[stack.length - 1].url === currentUrl) {
      stack.pop();
    }

    // Se houver uma página anterior na pilha, navega para ela
    if (stack.length > 0) {
      const previousEntry = stack.pop();
      saveStack(stack);
      window.location.href = previousEntry.url;
      return;
    }

    // 2. Se a pilha estiver vazia, utiliza o fallback fornecido ou configurado no DOM
    saveStack(stack);
    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    } else {
      window.history.back();
    }
  }

  /**
   * Registra uma nova sub-visão interna na página sem recarregar (pushState)
   * @param {Object} state - Objeto de estado da sub-visão (ex: { view: 'detail', id: '003' })
   * @param {string} title - Título da sub-visão
   * @param {string} url - Query string ou URL relativa (ex: '?id=003')
   */
  function pushSubView(state, title, url) {
    const fullState = { ...state, subView: true, title: title || document.title };
    window.history.pushState(fullState, title || document.title, url);
    if (title) document.title = `Goflash CORE - ${title}`;
    trackCurrentPage();
    notifyViewChange(fullState);
  }

  /**
   * Substitui o estado atual de sub-visão (replaceState)
   */
  function replaceSubView(state, title, url) {
    const fullState = { ...state, subView: true, title: title || document.title };
    window.history.replaceState(fullState, title || document.title, url);
    if (title) document.title = `Goflash CORE - ${title}`;
    notifyViewChange(fullState);
  }

  /**
   * Notifica todos os listeners registrados sobre uma mudança de sub-visão
   */
  function notifyViewChange(state) {
    viewChangeListeners.forEach(listener => {
      try {
        listener(state);
      } catch (e) {
        console.error('Erro no listener de navegação:', e);
      }
    });
  }

  /**
   * Registra um callback para reagir a mudanças de sub-visão (popstate ou pushSubView)
   * @param {Function} callback 
   */
  function onViewChange(callback) {
    if (typeof callback === 'function') {
      viewChangeListeners.push(callback);
    }
  }

  /**
   * Inicialização e vinculação de eventos no DOM
   */
  function init() {
    trackCurrentPage();

    // Escuta o evento nativo de voltar/avançar do navegador
    window.addEventListener('popstate', (event) => {
      const state = event.state || {};
      notifyViewChange(state);
    });

    // Intercepta declarativamente qualquer elemento com data-nav="back" ou classe .btn-nav-back
    document.addEventListener('click', (event) => {
      const backBtn = event.target.closest('[data-nav="back"], .btn-nav-back');
      if (backBtn) {
        event.preventDefault();
        const fallback = backBtn.getAttribute('data-fallback-url') || './dashboard.html';
        back(fallback);
      }
    });
  }

  // Inicializa quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  return {
    back,
    pushSubView,
    replaceSubView,
    onViewChange,
    getStack
  };
})();

// Expõe globalmente como NavigationManager e alias Nav
window.NavigationManager = NavigationManager;
window.Nav = NavigationManager;
