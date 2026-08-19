/**
 * GOFLASH CORE - AUTHENTICATION & LOGIN LOGIC
 * Gerenciamento de sessão simulada e validação de credenciais.
 */

const Auth = (function () {
  // Credenciais Válidas do Protótipo
  const VALID_USER = 'B2U';
  const VALID_PASS = 'protótipo';

  const STORAGE_KEY = 'goflash_core_session';

  /**
   * Obtém a sessão salva (seja em localStorage ou sessionStorage)
   */
  function getSession() {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      try { return JSON.parse(local); } catch (e) { return null; }
    }
    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) {
      try { return JSON.parse(session); } catch (e) { return null; }
    }
    return null;
  }

  /**
   * Realiza login simulado
   */
  function login(username, password, rememberMe = false) {
    const trimmedUser = (username || '').trim();
    const trimmedPass = (password || '').trim();

    // Validação de credenciais (aceita 'protótipo' ou 'prototipo' sem acento)
    const isUserValid = trimmedUser.toUpperCase() === VALID_USER;
    const isPassValid = trimmedPass.toLowerCase() === 'protótipo' || trimmedPass.toLowerCase() === 'prototipo';

    if (isUserValid && isPassValid) {
      const sessionData = {
        user: 'B2U',
        name: 'Administrador B2U',
        role: 'Super Administrador',
        avatar: 'account_circle',
        loginTime: new Date().toISOString(),
        rememberMe: !!rememberMe
      };

      const serialized = JSON.stringify(sessionData);
      if (rememberMe) {
        localStorage.setItem(STORAGE_KEY, serialized);
      } else {
        sessionStorage.setItem(STORAGE_KEY, serialized);
      }

      return { success: true, user: sessionData };
    }

    return { 
      success: false, 
      error: 'Usuário ou senha incorretos. Verifique suas credenciais e tente novamente.' 
    };
  }

  /**
   * Encerra a sessão
   */
  function logout() {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    
    // Determina o caminho para a página de login
    const isPagesDir = window.location.pathname.includes('/pages/');
    const loginUrl = isPagesDir ? '../index.html' : './index.html';
    window.location.href = loginUrl;
  }

  /**
   * Verifica se o usuário está autenticado. Redireciona se não estiver.
   */
  function requireAuth() {
    const session = getSession();
    if (!session) {
      const isPagesDir = window.location.pathname.includes('/pages/');
      const loginUrl = isPagesDir ? '../index.html' : './index.html';
      window.location.href = loginUrl;
      return null;
    }
    return session;
  }

  return {
    login,
    logout,
    getSession,
    requireAuth,
    VALID_USER,
    VALID_PASS
  };
})();

// Export global
window.Auth = Auth;

// Inicialização da Tela de Login (quando presente na página)
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const rememberCheckbox = document.getElementById('rememberMe');
  const loginBtn = document.getElementById('loginBtn');
  const loginCard = document.getElementById('loginCard');
  const togglePassBtn = document.getElementById('togglePassword');

  // Alternar visibilidade da senha
  if (togglePassBtn && passwordInput) {
    togglePassBtn.addEventListener('click', () => {
      const isPassword = passwordInput.type === 'password';
      passwordInput.type = isPassword ? 'text' : 'password';
      togglePassBtn.textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  }

  // Efeito Ripple nos botões
  document.querySelectorAll('.btn-primary').forEach(button => {
    button.addEventListener('click', function (e) {
      const circle = document.createElement('span');
      const diameter = Math.max(button.clientWidth, button.clientHeight);
      const radius = diameter / 2;

      const rect = button.getBoundingClientRect();
      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.classList.add('ripple');

      const ripple = button.getElementsByClassName('ripple')[0];
      if (ripple) {
        ripple.remove();
      }

      button.appendChild(circle);
    });
  });

  // Limpar estado de erro ao digitar
  [usernameInput, passwordInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      const wrapper = input.closest('.input-wrapper');
      if (wrapper) wrapper.classList.remove('has-error');
    });
  });

  // Tratamento do Submit de Login
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const username = usernameInput.value;
    const password = passwordInput.value;
    const rememberMe = rememberCheckbox ? rememberCheckbox.checked : false;

    if (!username.trim()) {
      Toast.warning('Por favor, informe o usuário.');
      usernameInput.focus();
      return;
    }

    if (!password.trim()) {
      Toast.warning('Por favor, informe a senha.');
      passwordInput.focus();
      return;
    }

    // Estado visual de carregamento
    loginBtn.disabled = true;
    const originalText = loginBtn.innerHTML;
    loginBtn.innerHTML = `
      <span class="material-icons" style="animation: spin 1s linear infinite; font-size: 20px;">sync</span>
      ENTRANDO...
    `;

    // Pequeno delay simulado para fluidez de UI
    setTimeout(() => {
      const result = Auth.login(username, password, rememberMe);

      if (result.success) {
        Toast.success('Login realizado com sucesso! Redirecionando...');
        
        // Redirecionamento suave para o Dashboard
        setTimeout(() => {
          window.location.href = './pages/dashboard.html';
        }, 600);
      } else {
        // Feedback de erro
        loginBtn.disabled = false;
        loginBtn.innerHTML = originalText;

        Toast.error(result.error);

        // Shake visual no card
        if (loginCard) {
          loginCard.classList.remove('animate-shake');
          void loginCard.offsetWidth; // Trigger reflow
          loginCard.classList.add('animate-shake');
        }

        // Destaca campos com erro
        const userWrap = usernameInput.closest('.input-wrapper');
        const passWrap = passwordInput.closest('.input-wrapper');
        if (userWrap) userWrap.classList.add('has-error');
        if (passWrap) passWrap.classList.add('has-error');

        passwordInput.value = '';
        passwordInput.focus();
      }
    }, 400);
  });
});
