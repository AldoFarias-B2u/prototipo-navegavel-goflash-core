# Changelog - Goflash CORE (Protótipo Navegável)

Todas as alterações notáveis, novas telas e refinamentos de design deste projeto serão documentados neste arquivo seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/) e [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

---

## [1.3.0] - 2026-08-16
### ✨ Adicionado
- **Tela Oficial de Pedidos de Abastecimento** ([`pages/pedidos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedidos-abastecimento.html)):
  - Réplica em alta fidelidade (*pixel-perfect*) da imagem de referência de Pedidos de Abastecimento.
  - Coluna indicadora roxa numerada (`#6530b5`), ícone de documento/prancheta e códigos do pedido (`000032`, `000031`, etc.).
  - Colunas completas de *Filial*, *Plano Base*, *Qtde Itens*, *Data de criação* e *Status*.
  - Badges coloridos de status: **Cancelado** (vermelho `#d32f2f`), **Recebido** (verde `#4caf50`) e **Aberto** (cinza `#9e9e9e`).
  - Topbar roxo claro padronizado (`.topbar-primary`) com pesquisa em tempo real e atalhos rápidos.
  - Botão de ação flutuante FAB vermelho (`#d32f2f`) fixado no canto inferior direito.
  - Mock com 32 registros realistas ([`assets/js/data/pedidos-abastecimento-mock.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/data/pedidos-abastecimento-mock.js)) e controlador reativo ([`assets/js/pedidos-abastecimento-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/pedidos-abastecimento-controller.js)).
- **Integração de Navegação**:
  - Link direto a partir do card "Operação loja autônoma" em [`pages/operacao.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/operacao.html).

---

## [1.2.1] - 2026-08-16
### 🎨 Modificado & Melhorado
- **Header Dinâmico no Scroll** ([`assets/css/module-view.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/module-view.css), [`assets/js/dashboard.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/dashboard.js)):
  - Transição de cor suave (`0.25s`) do header de `#23143d` (escuro) para `#6530b5` (roxo claro atraente) ao rolar páginas com Hero Banner (Home e Módulo de Operação).
  - Barra de pesquisa integrada que adapta dinamicamente sua cor para tom translúcido suave (`rgba(255, 255, 255, 0.18)`).
- **Padronização de Header Roxo Claro para Telas Internas**:
  - Aplicação da classe `.topbar-primary` em [`pages/planos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/planos-abastecimento.html) para inicialização direta no roxo claro atraente com sombra e busca estilizada.
- **Roteamento e Histórico Inteligente** ([`assets/js/navigation.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/navigation.js)):
  - Motor declarativo `NavigationManager` para navegação contextual com pilha de histórico persistente e contratos `data-nav="back"`.

---

## [1.2.0] - 2026-08-16
### ✨ Adicionado
- **Fluxo Completo de Planos de Abastecimento** ([`pages/planos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/planos-abastecimento.html)):
  - **Tela de Listagem Oficial** (Idêntica à Imagem 1 de referência):
    - Coluna indicadora vertical roxa com numeração de linhas (`#6530b5`).
    - Colunas de nome com ícone de documento, filial, quantidade de itens e data de criação.
    - Botão flutuante FAB vermelho (`#d32f2f`) no canto inferior direito para novos planos.
    - Linhas da tabela com clique interativo para abrir os detalhes do plano.
  - **Modal "NOVO PLANO"** (Idêntico à Imagem 2 de referência):
    - Cabeçalho roxo sólido, inputs com underline e container de cópia/clonagem de itens de outros planos.
    - Botões "DESCARTAR" e "FINALIZAR" verde (`#4caf50`).
  - **Tela de Detalhes do Plano e Grade de Produtos** (Idêntica à Imagem 3 de referência):
    - Hero Card Roxo com dados cadastrais do plano, thumbnail, filial e status Ativo.
    - Tabela de produtos com fotos reais de alta definição, código EAN em link azul e badges pill de Estoque Ideal (verde) e Mínimo Crítico (laranja).
    - Alternância inteligente entre **Modo Tabela** e **Modo Cards Atraentes** com fotos ampliadas e elevação suave no hover.
  - **Modo de Edição Avançado (Inline & Lote)**:
    - Steppers numéricos interativos `+` e `−` com área de toque de 44px (mobile-first).
    - Barra Flutuante de Ações em Lote (Sticky Batch Bar) para edição simultânea de estoque e exclusão em massa.
  - **Modal Multicritério de Inserção de Produtos**:
    - Busca e filtragem por Texto/EAN, Categoria, Marca e Fornecedor.
    - Parametrização antecipada de Estoque Ideal e Mínimo Padrão para inserção em lote.
  - **Pasta de Imagens de Produtos** ([`assets/images/products/`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/images/products/)):
    - Fotos reais dos produtos (Monster Energy, Sucos, Coca-Cola, Guaraná, Ruffles, Doritos, Bis).

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
