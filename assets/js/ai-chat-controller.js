/**
 * GOFLASH CORE - CONTROLADOR DO CHAT COM IA (GOFLASH AI)
 * Gerencia a abertura em todos os pontos de acesso, ciclo de mensagens,
 * animações de digitação, sugestões interativas e histórico da sessão.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Elementos do DOM
  const chatBackdrop = document.getElementById('aiChatBackdrop');
  const chatWidget = document.getElementById('aiChatWidget');
  const btnCloseChat = document.getElementById('btnCloseAiChat');
  const btnMinimizeChat = document.getElementById('btnMinimizeAiChat');
  const chatBody = document.getElementById('aiChatBody');
  const chatForm = document.getElementById('aiChatForm');
  const chatInput = document.getElementById('aiChatInput');
  const chatSuggestionsContainer = document.getElementById('aiChatSuggestions');

  // Pontos de Gatilho / Acesso
  const topbarAiBtn = document.getElementById('topbarAiBtn');
  const heroAiPromptBar = document.getElementById('heroAiPromptBar');
  const heroAiChips = document.querySelectorAll('.hero-ai-chip');
  const appsPopoverAi = document.getElementById('appsPopoverAiShortcut');
  const drawerAiItem = document.getElementById('drawerAiItem');
  const floatingFab = document.getElementById('aiFloatingFab');

  // Estado do Chat
  let isOpen = false;
  let isTyping = false;
  const userName = (typeof Auth !== 'undefined' && Auth.getCurrentUser()) ? Auth.getCurrentUser().name : 'B2U';

  /**
   * 2. Abertura e Fechamento do Chat
   */
  function openChat(initialPrompt = null) {
    if (!chatWidget) return;
    isOpen = true;
    
    if (chatBackdrop) chatBackdrop.classList.add('show');
    chatWidget.classList.add('show');

    // Se passou um prompt inicial (ex: clicou num chip do Hero), processa
    if (initialPrompt) {
      setTimeout(() => {
        handleUserSend(initialPrompt);
      }, 300);
    } else {
      setTimeout(() => {
        if (chatInput) chatInput.focus();
      }, 250);
    }

    scrollToBottom();
  }

  function closeChat() {
    if (!chatWidget) return;
    isOpen = false;
    if (chatBackdrop) chatBackdrop.classList.remove('show');
    chatWidget.classList.remove('show');
  }

  /**
   * 3. Sincronização e Rotação de Mensagens
   */
  function scrollToBottom() {
    if (!chatBody) return;
    setTimeout(() => {
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 50);
  }

  function getFormattedTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  /**
   * Adiciona mensagem do Usuário
   */
  function appendUserMessage(text) {
    if (!chatBody) return;

    const row = document.createElement('div');
    row.className = 'ai-msg-row user';
    row.innerHTML = `
      <div class="ai-msg-avatar">
        <span class="material-icons">person</span>
      </div>
      <div class="ai-msg-bubble">
        <p>${escapeHtml(text)}</p>
        <div class="ai-msg-time">${getFormattedTime()}</div>
      </div>
    `;

    chatBody.appendChild(row);
    scrollToBottom();
  }

  /**
   * Mostra indicador de digitação da IA
   */
  function showTypingIndicator() {
    if (!chatBody) return null;
    isTyping = true;

    const row = document.createElement('div');
    row.className = 'ai-msg-row bot typing-row';
    row.id = 'aiTypingIndicator';
    row.innerHTML = `
      <div class="ai-msg-avatar">
        <span class="material-icons">auto_awesome</span>
      </div>
      <div class="ai-typing-indicator">
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
        <div class="ai-typing-dot"></div>
      </div>
    `;

    chatBody.appendChild(row);
    scrollToBottom();
    return row;
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('aiTypingIndicator');
    if (typingEl) typingEl.remove();
    isTyping = false;
  }

  /**
   * Adiciona resposta da IA
   */
  function appendBotMessage(data) {
    if (!chatBody) return;

    removeTypingIndicator();

    const row = document.createElement('div');
    row.className = 'ai-msg-row bot';

    let actionsHtml = '';
    if (data.actions && data.actions.length > 0) {
      actionsHtml = `
        <div class="ai-msg-actions">
          ${data.actions.map(act => `
            <a href="${act.url}" class="ai-action-btn-link">
              <span style="display: flex; align-items: center; gap: 6px;">
                <span class="material-icons" style="font-size: 16px;">${act.icon || 'arrow_forward'}</span>
                ${act.label}
              </span>
              <span class="material-icons">chevron_right</span>
            </a>
          `).join('')}
        </div>
      `;
    }

    row.innerHTML = `
      <div class="ai-msg-avatar">
        <span class="material-icons">auto_awesome</span>
      </div>
      <div class="ai-msg-bubble">
        ${data.reply}
        ${actionsHtml}
        <div class="ai-msg-time">${getFormattedTime()} &bull; GoFlash AI</div>
      </div>
    `;

    chatBody.appendChild(row);
    scrollToBottom();
  }

  /**
   * 4. Envio de Mensagens pelo Usuário
   */
  function handleUserSend(text) {
    const cleanText = (text || '').trim();
    if (!cleanText || isTyping) return;

    // 1. Renderiza mensagem do usuário
    appendUserMessage(cleanText);
    if (chatInput) chatInput.value = '';

    // 2. Mostra digitação
    showTypingIndicator();

    // 3. Obtém resposta da base de conhecimento
    const answer = window.GoFlashAIKnowledge
      ? window.GoFlashAIKnowledge.findAnswer(cleanText)
      : { reply: '<p>Olá! Como posso ajudar você hoje no GoMarket?</p>' };

    // 4. Responde após delay natural simulado
    const delay = Math.min(1100, Math.max(550, cleanText.length * 20));
    setTimeout(() => {
      appendBotMessage(answer);
    }, delay);
  }

  /**
   * 5. Renderização das Sugestões Iniciais no Chat
   */
  function renderInitialSuggestions() {
    if (!chatSuggestionsContainer || !window.GoFlashAIKnowledge) return;
    const suggestions = window.GoFlashAIKnowledge.initialSuggestions || [];

    chatSuggestionsContainer.innerHTML = suggestions.map(item => `
      <button type="button" class="ai-suggestion-chip-btn" data-query="${escapeHtml(item.query)}">
        <span style="display: flex; align-items: center; gap: 8px;">
          <span class="material-icons">${item.icon || 'chat'}</span>
          <span>${item.label}</span>
        </span>
        <span class="material-icons">arrow_forward</span>
      </button>
    `).join('');

    // Vincula clique nas sugestões
    const chipBtns = chatSuggestionsContainer.querySelectorAll('.ai-suggestion-chip-btn');
    chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const q = btn.getAttribute('data-query');
        if (q) handleUserSend(q);
      });
    });
  }

  /**
   * 6. Registro de Eventos e Gatilhos
   */
  function bindTriggers() {
    // 6.1 Topbar
    if (topbarAiBtn) {
      topbarAiBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openChat();
      });
    }

    // 6.2 Hero Prompt Bar
    if (heroAiPromptBar) {
      heroAiPromptBar.addEventListener('click', (e) => {
        e.preventDefault();
        openChat();
      });
    }

    // 6.3 Hero Chips
    heroAiChips.forEach(chip => {
      chip.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const prompt = chip.getAttribute('data-prompt') || chip.textContent.trim();
        openChat(prompt);
      });
    });

    // 6.4 Popover 9 Pontos
    if (appsPopoverAi) {
      appsPopoverAi.addEventListener('click', (e) => {
        e.preventDefault();
        // Fecha o popover e abre o chat
        const appsPopover = document.getElementById('appsPopover');
        if (appsPopover) appsPopover.classList.remove('show');
        openChat();
      });
    }

    // 6.5 Drawer Lateral
    if (drawerAiItem) {
      drawerAiItem.addEventListener('click', (e) => {
        e.preventDefault();
        // Fecha drawer e abre chat
        const drawer = document.getElementById('goflashDrawer');
        const overlay = document.getElementById('sidebarOverlay');
        if (drawer) drawer.classList.remove('show');
        if (overlay) overlay.classList.remove('show');
        openChat();
      });
    }

    // 6.6 FAB Flutuante
    if (floatingFab) {
      floatingFab.addEventListener('click', (e) => {
        e.preventDefault();
        if (isOpen) {
          closeChat();
        } else {
          openChat();
        }
      });
    }

    // 6.7 Fechamento do Chat
    if (btnCloseChat) btnCloseChat.addEventListener('click', closeChat);
    if (btnMinimizeChat) btnMinimizeChat.addEventListener('click', closeChat);
    if (chatBackdrop) {
      chatBackdrop.addEventListener('click', (e) => {
        if (e.target === chatBackdrop) closeChat();
      });
    }

    // 6.8 Submissão do Formulário
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (chatInput) handleUserSend(chatInput.value);
      });
    }

    // 6.9 Tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        closeChat();
      }
    });
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // 7. Inicialização
  renderInitialSuggestions();
  bindTriggers();

  // Exposição Global
  window.GoFlashAIChat = {
    open: openChat,
    close: closeChat,
    send: handleUserSend
  };
});
