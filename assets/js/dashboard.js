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

  // 2. Elementos de Interação
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

  // 3. Controle dos Popovers (Apps & Usuário)
  function closeAllPopovers() {
    if (appsPopover) appsPopover.classList.remove('show');
    if (userPopover) userPopover.classList.remove('show');
  }

  if (appsBtn && appsPopover) {
    appsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = appsPopover.classList.contains('show');
      closeAllPopovers();
      if (!isVisible) {
        appsPopover.classList.add('show');
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
      }
    });
  }

  // Fechar popovers ao clicar fora
  document.addEventListener('click', (e) => {
    if (appsPopover && !appsPopover.contains(e.target) && e.target !== appsBtn) {
      appsPopover.classList.remove('show');
    }
    if (userPopover && !userPopover.contains(e.target) && e.target !== userBtn) {
      userPopover.classList.remove('show');
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
    const heroHeight = window.innerHeight * 0.7;
    if (window.scrollY > 80 || window.scrollY >= heroHeight) {
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
