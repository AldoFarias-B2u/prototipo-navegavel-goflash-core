/**
 * GOFLASH CORE - NAVIGATION MANAGER (NAV)
 * Sistema centralizado e reutilizável de gerenciamento de rotas,
 * histórico de navegação e controle de sub-visões para todo o ERP GoMarket.
 */

const NavigationManager = (function () {
  const STORAGE_KEY = 'goflash_nav_history_stack';
  const viewChangeListeners = [];
  let subViewBackHandler = null;

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
   * Normaliza a URL da página (pathname limpo) para a pilha de navegação entre páginas
   */
  function getCleanPageUrl() {
    return window.location.pathname;
  }

  /**
   * Registra a página atual na pilha
   */
  function trackCurrentPage() {
    const cleanUrl = getCleanPageUrl();
    const currentTitle = document.title || 'Goflash CORE';
    const stack = getStack();

    // Se a última página da pilha for diferente da atual, adiciona
    if (stack.length === 0 || stack[stack.length - 1].url !== cleanUrl) {
      stack.push({
        url: cleanUrl,
        title: currentTitle,
        timestamp: Date.now()
      });
      if (stack.length > 30) stack.shift();
      saveStack(stack);
    }
  }

  /**
   * Permite que controladores de página com sub-visões internas (ex: Master-Detail)
   * registrem um manipulador de retorno interno.
   * Se a função retornar `true`, significa que a sub-visão interna foi tratada
   * e o NavigationManager não deve desempilhar a página inteira.
   * Se retornar `false`, o NavigationManager desempilha para a página anterior.
   */
  function registerSubViewHandler(handler) {
    subViewBackHandler = handler;
  }

  /**
   * Executa o retorno unificado (Hierárquico: Sub-visão -> Página Anterior -> Fallback)
   * @param {string} fallbackUrl - URL de fallback caso não haja histórico
   */
  function back(fallbackUrl = './dashboard.html') {
    // 1. Se a tela atual possui um manipulador de sub-visão ativo (ex: Detalhes -> Lista)
    if (typeof subViewBackHandler === 'function') {
      const handledInternally = subViewBackHandler();
      if (handledInternally) {
        return;
      }
    }

    // 2. Navegação entre Páginas: desempilha da pilha de sessão
    const stack = getStack();
    const cleanUrl = getCleanPageUrl();

    // Remove ocorrências da página atual do topo da pilha
    while (stack.length > 0 && stack[stack.length - 1].url === cleanUrl) {
      stack.pop();
    }

    // Se houver uma página anterior na pilha, navega para ela
    if (stack.length > 0) {
      const previousEntry = stack.pop();
      saveStack(stack);
      window.location.href = previousEntry.url;
      return;
    }

    // 3. Fallback seguro caso não haja histórico na sessão
    saveStack(stack);
    if (fallbackUrl) {
      window.location.href = fallbackUrl;
    } else {
      window.history.back();
    }
  }

  /**
   * Registra uma nova sub-visão interna na página sem recarregar (pushState)
   */
  function pushSubView(state, title, url) {
    const fullState = { ...state, subView: true, title: title || document.title };
    window.history.pushState(fullState, title || document.title, url);
    if (title) document.title = `Goflash CORE - ${title}`;
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
    registerSubViewHandler,
    getStack
  };
})();

// Expõe globalmente como NavigationManager e alias Nav
window.NavigationManager = NavigationManager;
window.Nav = NavigationManager;
