/**
 * GOFLASH CORE - TOAST NOTIFICATION SYSTEM
 * Utilitário para exibição de mensagens de feedback visual.
 */

const Toast = (function () {
  let container = null;

  function initContainer() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
      }
    }
    return container;
  }

  function show(message, type = 'info', duration = 3500) {
    const parent = initContainer();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');

    // Mapeamento de ícones por tipo
    let iconName = 'info';
    if (type === 'success') iconName = 'check_circle';
    if (type === 'error') iconName = 'error';
    if (type === 'warning') iconName = 'warning';

    toast.innerHTML = `
      <span class="material-icons toast-icon">${iconName}</span>
      <span class="toast-message">${message}</span>
      <span class="material-icons toast-close" title="Fechar">close</span>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    let timer = null;

    const removeToast = () => {
      if (timer) clearTimeout(timer);
      toast.classList.add('toast-hide');
      setTimeout(() => {
        if (toast.parentElement) {
          toast.parentElement.removeChild(toast);
        }
      }, 250);
    };

    closeBtn.addEventListener('click', removeToast);

    if (duration > 0) {
      timer = setTimeout(removeToast, duration);
    }

    parent.appendChild(toast);
  }

  return {
    show,
    success: (msg, duration) => show(msg, 'success', duration),
    error: (msg, duration) => show(msg, 'error', duration),
    warning: (msg, duration) => show(msg, 'warning', duration),
    info: (msg, duration) => show(msg, 'info', duration),
  };
})();

// Export global para uso em scripts
window.Toast = Toast;
