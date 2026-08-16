# Changelog - Goflash CORE (Protótipo Navegável)

Todas as alterações notáveis, novas telas e refinamentos de design deste projeto serão documentados neste arquivo seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/) e [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.1.0] - 2026-08-16
### ✨ Adicionado
- **Módulo de Operação** ([`pages/operacao.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/operacao.html)):
  - Estrutura completa em 2 colunas com seções *Varejo*, *Operação loja autônoma*, *Produtos*, *Relatórios*, *Integrações* e *Configurações*.
  - Marcação de barrinha roxa (`border-top: 4px solid #6530b5`) no topo de cada card.
  - Escalonamento assimétrico de alturas entre as colunas sobre o título "OPERAÇÃO".
- **Barra de Pesquisa Dinâmica em Tempo Real** ([`assets/js/module-search.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/module-search.js)):
  - Filtragem instantânea por texto com highlight de termos e atalho `Ctrl + K`.
- **Arquitetura Modular para Telas do ERP** ([`assets/css/module-view.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/module-view.css)).
- **Controle Central de Versão** ([`version.json`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/version.json) e [`assets/js/version.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/version.js)).

### 🎨 Modificado
- **Cards de Módulos da Home Page**:
  - Implementada a caixa com barras azuis no card Gerencial e ícones grandes brancos em Operação e Financeiro.
  - Adicionada a micro-interação de deslizamento suave dos ícones para o centro no hover.
  - Suavizada a cor dos títulos dos cards para `#757575`.
- **Menu Lateral (Drawer)**:
  - Inclusão do logotipo vertical empilhado no cabeçalho.
  - Adicionadas linhas divisórias horizontais sutis entre blocos.
  - Suavizada a cor dos links para `#5f6368` com peso regular.
- **Popover de Módulos**:
  - Removidas caixas escuras dos ícones e adicionada a linha divisória horizontal central.
- **Logotipos Oficiais**:
  - Vinculados os arquivos oficiais `logo-homepage.png` e `logo-h.png`.

---

## [1.0.0] - 2026-08-16
### ✨ Adicionado
- **Estrutura Base do Protótipo Navegável**:
  - Arquitetura de pastas (`assets/css`, `assets/js`, `assets/images`, `pages`).
- **Tela de Login** ([`index.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/index.html)):
  - Card central Material Design com credenciais simuladas (`B2U` / `b2u@sistemas`).
  - Responsividade total para Desktop, Tablet e Smartphones (`100dvh`).
- **Home Page / Dashboard Inicial** ([`pages/dashboard.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/dashboard.html)):
  - Hero com marca d'água central e botão FAB amarelo com scroll suave.
  - Popovers de 9 pontos e perfil de usuário.
  - Controle de autenticação e sessão com `auth.js`.
