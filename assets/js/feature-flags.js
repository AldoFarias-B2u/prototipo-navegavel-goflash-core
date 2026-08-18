/**
 * GOFLASH CORE - GERENCIADOR DE FEATURE FLAGS & PARAMETRIZAÇÕES DO PROTÓTIPO
 * Controla a ativação/desativação dinâmica de recursos e módulos demonstrativos do ERP.
 */

const FeatureFlags = (function () {
  const STORAGE_KEY = 'goflash_feature_flags_v1';

  // Configurações e Flags Padrão da Versão Atual (v1.9.4.0)
  const DEFAULT_FLAGS = {
    // 1. Inteligência Artificial
    ai_chat_fullscreen: true,       // Página de Chat com IA em Tela Cheia (chat-ia.html)
    ai_chat_fab: true,              // Botão Flutuante (FAB IA) nas Telas
    ai_chat_topbar: true,           // Botão de Atalho GoFlash IA no Topbar / Popover

    // 2. Operação & Abastecimento
    operacao_pedidos: true,         // Listagem e Detalhes de Pedidos de Abastecimento
    operacao_consulta_bipe: true,   // Consulta Avançada de Abastecimento com Bipe e Steppers
    operacao_planos_edicao: true,   // Edição em Lote e Manutenção de Planos de Abastecimento

    // 3. Módulos Estratégicos (Roadmap)
    gerencial_module: false,        // Módulo Gerencial (Dashboards & Reports)
    financeiro_module: false,       // Módulo Financeiro (DRE & Fiscal)

    // 4. Usabilidade & Efeitos
    sound_effects: true,            // Efeitos sonoros ao bipar ou gerar pedidos
    compact_tables: false           // Densidade compacta de tabelas
  };

  /**
   * Obtém todas as flags armazenadas ou os padrões
   */
  function getAll() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_FLAGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Erro ao ler Feature Flags:', e);
    }
    return { ...DEFAULT_FLAGS };
  }

  /**
   * Obtém o estado de uma flag específica
   */
  function get(flagKey) {
    const flags = getAll();
    return flags[flagKey] !== undefined ? flags[flagKey] : !!DEFAULT_FLAGS[flagKey];
  }

  /**
   * Salva o estado de uma flag
   */
  function set(flagKey, value) {
    const flags = getAll();
    flags[flagKey] = !!value;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(flags));
      dispatchChangeEvent(flagKey, flags[flagKey]);
      applyToDOM();
    } catch (e) {
      console.error('Erro ao salvar Feature Flag:', e);
    }
  }

  /**
   * Restaura todas as flags para os padrões da versão
   */
  function resetDefaults() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_FLAGS));
      dispatchChangeEvent('all', DEFAULT_FLAGS);
      applyToDOM();
    } catch (e) {
      console.error('Erro ao restaurar padrões de Feature Flags:', e);
    }
    return { ...DEFAULT_FLAGS };
  }

  /**
   * Dispara evento customizado para que outros componentes reajam
   */
  function dispatchChangeEvent(flagKey, value) {
    const event = new CustomEvent('featureflags:changed', {
      detail: { flag: flagKey, value: value, all: getAll() }
    });
    window.dispatchEvent(event);
  }

  /**
   * Aplica as flags diretamente no DOM de forma abrangente e dinâmica
   */
  function applyToDOM() {
    const flags = getAll();
    
    // 1. Elementos declarativos genéricos com data-feature-flag
    const elements = document.querySelectorAll('[data-feature-flag]');
    elements.forEach(el => {
      const flagName = el.getAttribute('data-feature-flag');
      const isEnabled = flags[flagName] !== undefined ? flags[flagName] : true;
      el.style.display = isEnabled ? '' : 'none';
    });

    // 2. FLAG: ai_chat_fullscreen (Controla o item do Chat IA no Drawer Lateral)
    const isFullscreenAiActive = !!flags.ai_chat_fullscreen;
    const drawerAiSections = document.querySelectorAll('.drawer-section-ai, .drawer-section-title:has(+ .drawer-item-ai)');
    const drawerAiItems = document.querySelectorAll('.drawer-item-ai');
    const drawerAiDividers = document.querySelectorAll('.drawer-divider-ai');

    drawerAiSections.forEach(el => {
      el.style.display = isFullscreenAiActive ? '' : 'none';
    });
    drawerAiItems.forEach(el => {
      el.style.display = isFullscreenAiActive ? '' : 'none';
    });
    drawerAiDividers.forEach(el => {
      el.style.display = isFullscreenAiActive ? '' : 'none';
    });

    // 3. FLAG: ai_chat_fab (Controla o Botão Flutuante e Widget na Home e Operação)
    const isFabActive = !!flags.ai_chat_fab;
    const aiFabs = document.querySelectorAll('.ai-floating-fab, #aiFloatingFab');
    const aiWidgets = document.querySelectorAll('.ai-chat-widget, #aiChatWidget');
    const aiBackdrops = document.querySelectorAll('.ai-chat-backdrop, #aiChatBackdrop');

    aiFabs.forEach(fab => {
      fab.style.display = isFabActive ? 'flex' : 'none';
    });
    if (!isFabActive) {
      aiWidgets.forEach(w => {
        w.classList.remove('show');
        w.style.display = 'none';
      });
      aiBackdrops.forEach(b => {
        b.classList.remove('show');
        b.style.display = 'none';
      });
    } else {
      aiWidgets.forEach(w => {
        w.style.display = '';
      });
      aiBackdrops.forEach(b => {
        b.style.display = '';
      });
    }

    // 3.1 Reposicionamento Condicional do Botão Amarelo de Rolagem (#scrollFab)
    const scrollFab = document.getElementById('scrollFab');
    if (scrollFab) {
      if (isFabActive) {
        scrollFab.classList.add('centered');
      } else {
        scrollFab.classList.remove('centered');
      }
    }

    // 4. FLAG: ai_chat_topbar (Controla o atalho da IA no Popover de 9 Pontos e Topbar)
    const isTopbarAiActive = !!flags.ai_chat_topbar && isFullscreenAiActive;
    const aiTopbarBtns = document.querySelectorAll('.topbar-ai-btn, #topbarAiBtn');
    const aiAppsShortcuts = document.querySelectorAll('.app-shortcut-item-ai, #appsPopoverAiShortcut');

    aiTopbarBtns.forEach(btn => {
      btn.style.display = isTopbarAiActive ? 'inline-flex' : 'none';
    });
    aiAppsShortcuts.forEach(card => {
      card.style.display = isTopbarAiActive ? '' : 'none';
    });

    // 5. Re-renderiza o popover padrão se disponível
    if (typeof window.renderStandardAppsPopover === 'function') {
      window.renderStandardAppsPopover();
    }
  }

  // Auto-aplica no carregamento do DOM
  document.addEventListener('DOMContentLoaded', () => {
    applyToDOM();
  });

  // Re-aplica quando as flags mudarem na sessão
  window.addEventListener('featureflags:changed', () => {
    applyToDOM();
  });

  return {
    get,
    set,
    getAll,
    resetDefaults,
    applyToDOM,
    DEFAULT_FLAGS
  };
})();

// Exportação global
window.FeatureFlags = FeatureFlags;
