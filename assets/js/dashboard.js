/**
 * GOFLASH CORE - DASHBOARD CONTROLLER & INTERACTIONS
 * Gerencia o comportamento dos popovers, drawer, scroll dinâmico e eventos.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Verificação de Autenticação
  const session = typeof Auth !== 'undefined' ? Auth.requireAuth() : null;
  const currentUsername = session ? (session.user || 'B2U') : 'B2U';

  // Atualizar dados de usuário no DOM
  const drawerUserName = document.getElementById('drawerUserName');
  const popoverUserName = document.getElementById('popoverUserName');
  if (drawerUserName) drawerUserName.textContent = currentUsername;
  if (popoverUserName) popoverUserName.textContent = currentUsername;

  // 2. Padronização Inteligente do Menu de Atalhos (Popover de 9 Pontos)
  window.renderStandardAppsPopover = function() {
    const popover = document.getElementById('appsPopover');
    if (!popover) return;

    const isInsidePages = window.location.pathname.includes('/pages/') || window.location.pathname.endsWith('.html');
    const operacaoUrl = isInsidePages ? './operacao.html' : './pages/operacao.html';
    const dashboardUrl = isInsidePages ? './dashboard.html' : './pages/dashboard.html';

    popover.innerHTML = `
      <div class="popover-arrow"></div>
      
      <!-- Linha Superior -->
      <div class="apps-row apps-row-top">
        <a href="#" class="app-shortcut-item" title="Módulo Gerencial">
          <span class="material-icons app-shortcut-icon">insert_chart</span>
          <span class="app-shortcut-label">GERENCIAL</span>
        </a>

        <a href="${operacaoUrl}" class="app-shortcut-item" title="Módulo Operação">
          <span class="material-icons app-shortcut-icon">local_shipping</span>
          <span class="app-shortcut-label">OPERAÇÃO</span>
        </a>

        <a href="#" class="app-shortcut-item" title="Módulo Financeiro">
          <span class="material-icons app-shortcut-icon">credit_card</span>
          <span class="app-shortcut-label">FINANCEIRO</span>
        </a>
      </div>

      <!-- Linha Inferior -->
      <div class="apps-row apps-row-bottom">
        <a href="${dashboardUrl}" class="app-shortcut-item" title="Home">
          <span class="material-icons app-shortcut-icon">dashboard</span>
          <span class="app-shortcut-label">HOME</span>
        </a>

        <a href="#" class="app-shortcut-item" title="Painel de Controles">
          <span class="material-icons app-shortcut-icon">tune</span>
          <span class="app-shortcut-label">PAINEL DE CO...</span>
        </a>

        <div class="app-shortcut-item app-shortcut-item-ai" id="appsPopoverAiShortcut" title="Falar com a GoFlash IA" style="cursor: pointer;">
          <span class="ai-new-badge">NOVO</span>
          <span class="material-icons app-shortcut-icon">auto_awesome</span>
          <span class="app-shortcut-label">GOFLASH IA</span>
        </div>
      </div>
    `;
  };

  // Executa padronização se houver popover na página
  window.renderStandardAppsPopover();

  // 3. Elementos de Interação
  const topbar = document.getElementById('mainTopbar');
  const menuToggle = document.getElementById('menuToggle');
  const drawer = document.getElementById('goflashDrawer');
  const overlay = document.getElementById('sidebarOverlay');

  const appsBtn = document.getElementById('appsBtn');
  const appsPopover = document.getElementById('appsPopover');

  const userBtn = document.getElementById('userBtn');
  const userPopover = document.getElementById('userPopover');

  const scrollFab = document.getElementById('scrollFab');
  const modulesSection = document.getElementById('modulesSection');

  // 4. Controle dos Popovers (Apps & Usuário)
  function closeAllPopovers() {
    if (appsPopover) appsPopover.classList.remove('show');
    if (userPopover) userPopover.classList.remove('show');
    if (appsBtn) appsBtn.classList.remove('active');
    if (userBtn) userBtn.classList.remove('active');
  }

  if (appsBtn && appsPopover) {
    appsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = appsPopover.classList.contains('show');
      closeAllPopovers();
      if (!isVisible) {
        appsPopover.classList.add('show');
        appsBtn.classList.add('active');
      }
    });
  }

  if (userBtn && userPopover) {
    userBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = userPopover.classList.contains('show');
      closeAllPopovers();
      if (!isVisible) {
        userPopover.classList.add('show');
        userBtn.classList.add('active');
      }
    });
  }

  // Fechar popovers ao clicar fora
  document.addEventListener('click', (e) => {
    if (appsPopover && !appsPopover.contains(e.target) && e.target !== appsBtn) {
      appsPopover.classList.remove('show');
      if (appsBtn) appsBtn.classList.remove('active');
    }
    if (userPopover && !userPopover.contains(e.target) && e.target !== userBtn) {
      userPopover.classList.remove('show');
      if (userBtn) userBtn.classList.remove('active');
    }
  });

  // 4. Controle da Sidebar / Drawer Lateral
  function openDrawer() {
    closeAllPopovers();
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Impede scroll com drawer aberto
  }

  function closeDrawer() {
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (menuToggle) menuToggle.addEventListener('click', openDrawer);
  if (overlay) overlay.addEventListener('click', closeDrawer);

  // 5. Rolagem Suave pelo Botão FAB Amarelo
  if (scrollFab && modulesSection) {
    scrollFab.addEventListener('click', () => {
      modulesSection.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // 6. Transição de Cor do Header no Scroll (Dark Purple -> Purple)
  function handleScroll() {
    if (!topbar) return;
    
    // Se o header já possui a classe declarativa de topo roxo claro (.topbar-primary), mantém o padrão
    if (topbar.classList.contains('topbar-primary')) {
      return;
    }

    // Para páginas com Hero Banner (Dashboard, Módulos Operação/Gerencial/Financeiro)
    const hasHero = document.querySelector('.dashboard-hero, .module-hero-banner');
    const scrollThreshold = hasHero ? 35 : 10;

    if (window.scrollY > scrollThreshold) {
      topbar.classList.add('scrolled-header');
    } else {
      topbar.classList.remove('scrolled-header');
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll(); // Execução inicial

  // 7. Ações de Logout (no popover e na sidebar)
  const logoutButtons = document.querySelectorAll('.action-logout');
  logoutButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof Toast !== 'undefined') {
        Toast.info('Encerrando sessão...');
      }
      setTimeout(() => {
        if (typeof Auth !== 'undefined') {
          Auth.logout();
        } else {
          window.location.href = '../index.html';
        }
      }, 400);
    });
  });

  // 8. Feedback ao Clicar nos Módulos e Atalhos
  const moduleActionBtns = document.querySelectorAll('.module-action-btn, .app-shortcut-item, .drawer-item');
  moduleActionBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.classList.contains('action-logout')) return;
      
      const label = btn.querySelector('.module-card-title, .app-shortcut-label, span:last-child')?.textContent || 'Módulo';
      if (label && label.trim() !== 'GOFLASH' && label.trim() !== 'Sair') {
        if (typeof Toast !== 'undefined') {
          Toast.info(`Acessando ${label.trim()}... (Protótipo Navegável)`);
        }
      }
      closeDrawer();
      closeAllPopovers();
    });
  });
});
