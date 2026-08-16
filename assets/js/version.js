/**
 * GOFLASH CORE - VERSION MANAGER
 * Centraliza o número da versão e atualiza os elementos da interface dinamicamente.
 */

const AppVersion = {
  version: '1.9.4.0',
  releaseTag: 'v1.1.0',
  buildDate: '2026-08-16',

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      // Atualiza automaticamente todos os elementos com a classe .drawer-version-tag ou data-version
      const versionElements = document.querySelectorAll('.drawer-version-tag, [data-version-target]');
      versionElements.forEach(el => {
        el.textContent = this.version;
      });
    });
  }
};

AppVersion.init();
window.AppVersion = AppVersion;
