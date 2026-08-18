/**
 * GOFLASH CORE - CONTROLADOR DA PÁGINA EXCLUSIVA DE CHAT COM IA (FULL-SCREEN)
 * Gerencia a tela cheia, envio de mensagens, cards de sugestão, histórico lateral e nova conversa.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificação de Autenticação
  const session = typeof Auth !== 'undefined' ? Auth.requireAuth() : null;
  const currentUsername = session ? (session.user || 'B2U') : 'B2U';

  // 2. Elementos do DOM
  const chatFeed = document.getElementById('aiFullscreenChatFeed');
  const welcomeHero = document.getElementById('aiFullscreenWelcomeHero');
  const chatForm = document.getElementById('aiFullscreenForm');
  const chatInput = document.getElementById('aiFullscreenInput');
  const btnNewChat = document.getElementById('btnNewChat');
  const historyList = document.getElementById('aiHistoryList');
  const suggestionCards = document.querySelectorAll('.ai-suggestion-card');
  const sidebarTopicBtns = document.querySelectorAll('.ai-sidebar-topic-item');

  // Estado da Conversa
  let isTyping = false;
  let hasMessages = false;
  let historyItems = [];

  /**
   * 3. Utilitários de Rolagem e Horário
   */
  function scrollToBottom() {
    if (!chatFeed) return;
    setTimeout(() => {
      chatFeed.scrollTop = chatFeed.scrollHeight;
    }, 50);
  }

  function getFormattedTime() {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * 4. Adiciona Mensagem do Usuário
   */
  function appendUserMessage(text) {
    if (!chatFeed) return;

    // Se for a primeira mensagem, oculta o Hero de boas-vindas
    if (!hasMessages && welcomeHero) {
      welcomeHero.style.display = 'none';
      hasMessages = true;
    }

    const row = document.createElement('div');
    row.className = 'ai-msg-row user';
    row.innerHTML = `
      <div class="ai-msg-avatar">
        <span class="material-icons">person</span>
      </div>
      <div class="ai-msg-bubble">
        <p>${escapeHtml(text)}</p>
        <div class="ai-msg-time">${getFormattedTime()} &bull; ${escapeHtml(currentUsername)}</div>
      </div>
    `;

    chatFeed.appendChild(row);
    scrollToBottom();

    // Adiciona ao histórico lateral
    addToHistory(text);
  }

  /**
   * 5. Indicador de Digitação da IA
   */
  function showTypingIndicator() {
    if (!chatFeed) return null;
    isTyping = true;

    const row = document.createElement('div');
    row.className = 'ai-msg-row bot typing-row';
    row.id = 'aiFullscreenTyping';
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

    chatFeed.appendChild(row);
    scrollToBottom();
    return row;
  }

  function removeTypingIndicator() {
    const typingEl = document.getElementById('aiFullscreenTyping');
    if (typingEl) typingEl.remove();
    isTyping = false;
  }

  /**
   * 6. Adiciona Resposta da IA
   */
  function appendBotMessage(data) {
    if (!chatFeed) return;

    removeTypingIndicator();

    const row = document.createElement('div');
    row.className = 'ai-msg-row bot';

    let actionsHtml = '';
    if (data.actions && data.actions.length > 0) {
      actionsHtml = `
        <div class="ai-msg-actions">
          ${data.actions.map(act => `
            <a href="${act.url}" class="ai-action-btn-link">
              <span style="display: flex; align-items: center; gap: 8px;">
                <span class="material-icons" style="font-size: 18px;">${act.icon || 'arrow_forward'}</span>
                <strong>${act.label}</strong>
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
        <div class="ai-msg-time">${getFormattedTime()} &bull; GoFlash AI Copilot</div>
      </div>
    `;

    chatFeed.appendChild(row);
    scrollToBottom();
  }

  /**
   * 7. Processamento e Envio de Perguntas
   */
  function handleSend(queryText) {
    const cleanText = (queryText || '').trim();
    if (!cleanText || isTyping) return;

    // 1. Renderiza mensagem do usuário
    appendUserMessage(cleanText);
    if (chatInput) {
      chatInput.value = '';
      chatInput.focus();
    }

    // 2. Mostra indicador de digitação
    showTypingIndicator();

    // 3. Obtém resposta da base de conhecimento
    const answer = (window.GoFlashAIKnowledge && typeof window.GoFlashAIKnowledge.findAnswer === 'function')
      ? window.GoFlashAIKnowledge.findAnswer(cleanText)
      : { 
          title: 'GoFlash AI',
          reply: `<p>Recebi sua pergunta: <em>"${escapeHtml(cleanText)}"</em>. Como posso acelerar suas operações?</p>`,
          actions: []
        };

    // 4. Responde após delay natural simulado
    const delay = Math.min(1000, Math.max(500, cleanText.length * 18));
    setTimeout(() => {
      appendBotMessage(answer);
    }, delay);
  }

  /**
   * 8. Adiciona Item ao Histórico Lateral
   */
  function addToHistory(query) {
    if (!historyList) return;
    if (historyItems.includes(query)) return;

    historyItems.unshift(query);
    if (historyItems.length > 8) historyItems.pop();

    historyList.innerHTML = historyItems.map(item => `
      <button type="button" class="ai-sidebar-topic-item history-item" title="${escapeHtml(item)}">
        <span class="material-icons">chat_bubble_outline</span>
        <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 190px;">${escapeHtml(item)}</span>
      </button>
    `).join('');

    // Re-vincula cliques no histórico
    const items = historyList.querySelectorAll('.history-item');
    items.forEach((btn, idx) => {
      btn.addEventListener('click', () => {
        handleSend(historyItems[idx]);
      });
    });
  }

  /**
   * 9. Reinicia a Conversa ("Nova Conversa")
   */
  function startNewChat() {
    if (!chatFeed) return;
    
    // Limpa o feed e restaura o Hero
    chatFeed.innerHTML = '';
    if (welcomeHero) {
      chatFeed.appendChild(welcomeHero);
      welcomeHero.style.display = 'flex';
    }
    hasMessages = false;
    isTyping = false;

    if (chatInput) {
      chatInput.value = '';
      chatInput.focus();
    }

    if (typeof Toast !== 'undefined') {
      Toast.info('Nova sessão de conversa iniciada.');
    }
  }

  /**
   * 10. Registro de Eventos e Gatilhos
   */
  function initListeners() {
    // 10.1 Submissão do Formulário
    if (chatForm) {
      chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (chatInput) handleSend(chatInput.value);
      });
    }

    // 10.2 Botão Nova Conversa
    if (btnNewChat) {
      btnNewChat.addEventListener('click', (e) => {
        e.preventDefault();
        startNewChat();
      });
    }

    // 10.3 Cards de Sugestões Rápidas (Grid Inicial)
    suggestionCards.forEach(card => {
      card.addEventListener('click', () => {
        const query = card.getAttribute('data-query') || card.querySelector('.ai-card-icon-title')?.textContent.trim();
        if (query) handleSend(query);
      });
    });

    // 10.4 Tópicos na Barra Lateral
    sidebarTopicBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const query = btn.getAttribute('data-query') || btn.querySelector('span:last-child')?.textContent.trim();
        if (query) handleSend(query);
      });
    });
  }

  initListeners();
  if (chatInput) chatInput.focus();
});
