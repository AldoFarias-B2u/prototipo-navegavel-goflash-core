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
    ai_chat_topbar: true,           // Botão de Atalho GoFlash IA no Topbar

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
   * Aplica as flags diretamente no DOM (elementos com data-feature-flag="key")
   */
  function applyToDOM() {
    const flags = getAll();
    
    // 1. Elementos com atributo declarativo data-feature-flag
    const elements = document.querySelectorAll('[data-feature-flag]');
    elements.forEach(el => {
      const flagName = el.getAttribute('data-feature-flag');
      const isEnabled = flags[flagName] !== undefined ? flags[flagName] : true;
      if (isEnabled) {
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });

    // 2. Comportamento do FAB de IA
    const aiFabs = document.querySelectorAll('.ai-floating-fab, #aiFloatingFab');
    aiFabs.forEach(fab => {
      fab.style.display = flags.ai_chat_fab ? 'flex' : 'none';
    });

    // 3. Comportamento do botão de IA no Topbar
    const aiTopbarBtns = document.querySelectorAll('.topbar-ai-btn, #topbarAiBtn');
    aiTopbarBtns.forEach(btn => {
      btn.style.display = flags.ai_chat_topbar ? 'inline-flex' : 'none';
    });
  }

  // Auto-aplica no carregamento do DOM
  document.addEventListener('DOMContentLoaded', () => {
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
