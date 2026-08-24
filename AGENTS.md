# AGENTS.md - Manual de Diretrizes para Agentes de IA

Este documento é a referência primária de contexto, regras de arquitetura, padrões de código e diretrizes de desenvolvimento para qualquer Agente de IA ou desenvolvedor que atue no projeto **Goflash CORE / GoMarket**.

---

## 1. Contexto do Projeto

### 1.1 O que é o GoMarket / Goflash CORE
O **Goflash CORE** (integrado ao ecossistema GoMarket da B2U Sistemas) é um sistema de gestão empresarial (ERP) robusto voltado para os setores de varejo, franquias, lojas autônomas, e-commerce e gestão corporativa. Ele centraliza a operação do negócio em módulos estratégicos (*Operação*, *Gerencial*, *Financeiro*, *Integrações*, *Configurações*).

### 1.2 Objetivo deste Protótipo Navegável
Construir uma réplica navegável, estática, de alta fidelidade visual (pixel-perfect) e com comportamento dinâmico interativo do sistema de referência original. O protótipo serve para:
- Validação de fluxos de navegação e ergonomia de telas com stakeholders e clientes.
- Especificação visual e funcional para equipes de backend e engenharia de produto.
- Documentação viva da arquitetura de interface e Design System do produto.

### 1.3 Estágio Atual do Projeto
- **Versão Atual**: `v1.1.0` (código de versão do sistema: `1.9.4.0`).
- **Módulos Concluídos**:
  - `Autenticação` ([`index.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/index.html)): Tela de login completa, validação de credenciais simuladas, feedback tátil e persistência de sessão.
  - `Home Page / Dashboard` ([`pages/dashboard.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/dashboard.html)): Hero com marca d'água, topbar dinâmico com scroll, FAB amarelo com smooth scroll, popovers flutuantes (9 pontos e perfil), menu lateral (drawer retrátil) e cards de módulos interativos com animação de hover.
  - `Módulo de Operação` ([`pages/operacao.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/operacao.html)): Grid assimétrico de 2 colunas, seções completas (*Varejo*, *Operação loja autônoma*, *Produtos*, *Relatórios*, *Integrações*, *Configurações*), marcação roxa no topo dos cards e barra de pesquisa dinâmica com filtragem instantânea e atalho `Ctrl + K`.
- **Módulos Planejados**: *Gerencial*, *Financeiro*, telas internas de cadastro e listagem.

### 1.4 Propósito em Relação ao Futuro Produto
O protótipo desacopla o design e a experiência de uso (UI/UX) das regras pesadas de backend. Ele define os contratos de tela, a hierarquia de navegação e os componentes reutilizáveis que serão consumidos na implementação de produção.

---

## 2. Stack Tecnológica

O projeto adota intencionalmente uma stack web **puramente nativa (Vanilla)**, eliminando dependências pesadas de build, bundlers ou frameworks opinativos:

- **Estrutura**: HTML5 Semântico (`<header>`, `<nav>`, `<main>`, `<aside>`, `<article>`, `<section>`).
- **Estilização**: CSS3 Puro (Vanilla CSS) com Design Tokens estruturados em variáveis CSS (`var(--...)`), Flexbox, CSS Grid e media queries modernas com unidades `dvh` e `clamp()`.
- **Lógica e Interatividade**: JavaScript Vanilla (ES6+) sem bibliotecas externas.
- **Tipografia e Ícones**:
  - Fonte: Google Fonts `Roboto` (300, 400, 500, 700).
  - Ícones: Google `Material Icons` clássico (`font-family: 'Material Icons'`, `.material-icons`) com fallback `@font-face` WOFF2 local e SVGs nativos para símbolos de marca.
- **Imagens e Assets**: Logotipos oficiais em PNG com transparência e SVGs vetoriais em `assets/images/`.
- **Controle de Versão**: Git com branches `main` (estável/release) e `develop` (desenvolvimento contínuo).

> [!IMPORTANT]
> **NÃO introduza** frameworks como React, Vue, Angular, TailwindCSS, Bootstrap, jQuery ou compiladores (Webpack/Vite) a menos que o usuário solicite explicitamente. A simplicidade estática sem etapa de build é um requisito arquitetural deste protótipo.

---

## 3. Arquitetura do Projeto

### 3.1 Organização de Pastas
```
Protótipo Navegavel Core/
├── assets/
│   ├── css/
│   │   ├── global.css        # Tokens CSS, variáveis de cores, resets, fontes e utilitários
│   │   ├── components.css    # Inputs com underline, botões, checkbox e sistema de toast
│   │   ├── login.css         # Layout específico da tela de autenticação
│   │   ├── dashboard.css     # Layout da Home (Hero, Topbar dinâmico, Cards e Drawer)
│   │   └── module-view.css   # Layout padronizado para páginas de módulos do ERP
│   ├── js/
│   │   ├── auth.js           # Gerenciamento de credenciais, sessão e proteção de rotas
│   │   ├── toast.js          # Sistema leve de notificações e alertas em tela
│   │   ├── dashboard.js      # Controle de popovers, drawer lateral e eventos de scroll
│   │   ├── module-search.js  # Motor de busca dinâmica em tempo real para módulos
│   │   └── version.js        # Centralizador de versão sincronizado no DOM
│   └── images/               # Logos oficiais (logo-homepage.png, logo-h.png, SVGs)
├── docs/
│   └── architecture.md       # Documentação detalhada da arquitetura técnica
├── pages/
│   ├── dashboard.html        # Painel principal do ERP
│   └── operacao.html         # Página completa do Módulo de Operação
├── index.html                # Tela inicial de autenticação (Login)
├── version.json              # Fonte única de verdade de versão e status de módulos
├── CHANGELOG.md              # Histórico de releases no padrão SemVer
├── README.md                 # Guia de execução rápida do protótipo
└── AGENTS.md                 # Este manual de diretrizes para IAs
```

### 3.2 Camadas e Responsabilidades
1. **Camada de Apresentação (HTML)**: Documentos semânticos e autocontidos que definem a estrutura da página.
2. **Camada de Estilo (CSS Modular)**:
   - `global.css`: Base compartilhada por todo o ecossistema.
   - `components.css`: Componentes atômicos reutilizáveis.
   - Folhas de estilo especializadas por contexto (`dashboard.css`, `module-view.css`, `login.css`).
3. **Camada de Lógica (JS Vanilla Modular)**: Objetos e módulos expostos no escopo global (`window.Auth`, `window.Toast`, `window.AppVersion`) permitindo desacoplamento e interoperabilidade.
4. **Camada de Estado e Persistência**:
   - `sessionStorage` e `localStorage` para retenção de sessão do usuário logado (`goflash_session`, `goflash_remember`).
   - Objeto `version.json` e `version.js` para controle centralizado de versão.

### 3.3 Navegação e Roteamento
- Navegação multi-page estática via links relativos (`./dashboard.html`, `./operacao.html`, `../index.html`).
- Guards de autenticação em JavaScript: `Auth.requireAuth()` no carregamento das páginas protegidas redireciona para a raiz caso não haja sessão válida.

---

## 4. Regras Obrigatórias para Agentes de IA

1. **Análise Prévia**: Antes de alterar qualquer linha de código, inspecione os arquivos existentes e compreenda a estrutura atual.
2. **Reutilização Obrigatória**: Reutilize sempre as classes de `global.css`, `components.css` e `module-view.css`. **Nunca crie classes duplicadas** para botões, inputs, cards ou ícones.
3. **Não Quebrar Comportamentos**: Nunca altere funcionalidades consolidadas (ex: autenticação, popovers, drawer, busca) sem solicitação explícita.
4. **Zero Dependências Não Justificadas**: Não adicione bibliotecas externas ou scripts de terceiros via CDN sem autorização expressa.
5. **Preservação Visual e Pixel-Perfect**: Qualquer nova tela ou ajuste deve ser idêntico à referência visual fornecida (cores exatas, proporções, sombras e tipografia).
6. **Responsividade Estrita**: Toda nova interface deve funcionar perfeitamente em Desktop (1920x1080, 1366x768), Tablets (768px - 1024px) e Smartphones (360px - 430px).
7. **Escopo Delimitado**: Modifique apenas os arquivos estritamente necessários para a tarefa atual.
8. **Não Assumir Regras de Negócio**: Em caso de ambiguidade sobre fluxos ou regras de negócio do ERP, **pergunte ao usuário** antes de tomar decisões arbitrárias.
9. **Planejamento Obrigatório**: Apresente um plano claro antes de executar grandes mudanças estruturais ou criar novas páginas.
10. **Commits e Branches**: Trabalhe estritamente em branches de feature/fix/style (`feature/*`, `fix/*`, `style/*`) e mantenha as mensagens de commit no padrão Conventional Commits (`feat:`, `style:`, `fix:`).
11. **Merge e Publicação Remota Somente sob Autorização Explícita**: **NUNCA mescle alterações na branch `develop` ou `main` automaticamente**. O agente deve concluir a implementação na branch de trabalho, convidar o usuário a testar e aguardar o comando explícito de autorização ("pode liberar", "ok"). **No repositório remoto (GitHub), envie SOMENTE as branches `main` e `develop`**; as branches de feature devem permanecer estritamente locais e nunca serem enviadas ao repositório remoto.

---

## 5. Padrões de Código

### 5.1 Nomenclatura
- **Arquivos**: `kebab-case` para HTML, CSS e JS (ex: `module-view.css`, `module-search.js`, `dashboard.html`).
- **Classes CSS**: `kebab-case` semântico com prefixo contextual quando aplicável (ex: `.module-primary-card`, `.module-feature-item`, `.topbar-btn`, `.drawer-divider`).
- **IDs HTML**: `camelCase` para referências JavaScript (ex: `#mainTopbar`, `#moduleSearchInput`, `#appsPopover`).
- **Variáveis e Funções JS**: `camelCase` (ex: `normalizeText()`, `filterItems()`, `currentSession`).
- **Objetos e Módulos Globais**: `PascalCase` (ex: `window.Auth`, `window.Toast`, `window.AppVersion`).

### 5.2 Estrutura e Estilos de Código
- **CSS**:
  - Uso consistente de variáveis CSS (`var(--primary-color)`, `var(--text-main)`, etc.).
  - Sem seletores `!important` desnecessários (reservados apenas para overrides de ícones ou utilitários críticos).
- **JavaScript**:
  - Funções puras e modulares com tratamento defensivo (`if (!element) return;`).
  - Listeners de evento encapsulados dentro de `document.addEventListener('DOMContentLoaded', ...)`.
  - Tratamento de erros com feedback visual via `Toast.error()` ou animações de shake.

---

## 6. Diretrizes de UI/UX e Design System

### 6.1 Paleta de Cores Oficial
| Papel | Hex | Uso |
|---|---|---|
| **Primary (Roxo Principal)** | `#6530b5` | Botões principais, faixas ativas, links em destaque, borda superior de cards |
| **Primary Dark (Header/Hero)** | `#23143d` | Topbar do ERP, fundo do Hero e cabeçalho de módulos |
| **Search Background** | `#543f70` | Fundo sólido da barra de pesquisa do header |
| **Gerencial (Azul)** | `#3f51b5` | Banner do módulo Gerencial |
| **Operação (Roxo)** | `#7356bf` | Banner do módulo Operação |
| **Financeiro (Verde)** | `#5ebd74` | Banner do módulo Financeiro |
| **Yellow Accent (FAB)** | `#ffeb3b` / `#ffd600` | Botão flutuante de rolagem |
| **Background Neutro** | `#f1f3f6` | Fundo geral das páginas de módulos e dashboards |
| **Textos Primários** | `#333333` / `#202124` | Títulos e elementos de alto contraste |
| **Textos Secundários** | `#5f6368` / `#757575` | Títulos de cards, links do drawer, descrições |
| **Bordas e Divisórias** | `#e8e8e8` / `#eeeeee` | Linhas separadoras sutis |

### 6.2 Tipografia
- Fonte principal: `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`.
- Pesos: `300` (Light), `400` (Regular), `500` (Medium), `700` (Bold).
- Ícones: `Material Icons` clássico (Google Material v145).

### 6.3 Cards e Elevação
- Borda superior roxa: `border-top: 4px solid #6530b5; border-radius: 2px 2px 4px 4px;`.
- Sombra padrão: `box-shadow: 0 3px 12px rgba(0, 0, 0, 0.09), 0 1px 3px rgba(0, 0, 0, 0.05);`.
- Hover em cards interativos: elevação vertical suave (`transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);`).

### 6.4 Micro-Interações
- **Deslizamento no Hover**: Ícones dos cards de módulos deslizam suavemente para o centro (`transform: translateX(0)`) com aceleração `cubic-bezier(0.25, 1, 0.5, 1)`.
- **Busca em Tempo Real**: Highlight imediato com `<mark class="search-highlight">` e feedback de "Nenhum resultado encontrado".
- **Drawer e Popovers**: Animação de entrada e fechamento automático ao clicar fora (`click outside`).

---

## 7. Processo Recomendado para Desenvolvimento

Todo agente ou desenvolvedor deve seguir rigorosamente o ciclo de 5 etapas:

```
┌────────────┐     ┌────────────┐     ┌───────────────┐     ┌────────────┐     ┌───────────┐
│  ANALISAR  │ ──> │  PLANEJAR  │ ──> │  IMPLEMENTAR  │ ──> │   TESTAR   │ ──> │  REVISAR  │
└────────────┘     └────────────┘     └───────────────┘     └────────────┘     └───────────┘
```

1. **ANALISAR**:
   - Examinar as imagens de referência, o código existente, as variáveis em `global.css` e a documentação.
   - Identificar dependências e impactos na responsividade.
2. **PLANEJAR**:
   - Elaborar um plano de alterações detalhado.
   - Validar dúvidas de escopo com o usuário antes da execução.
3. **IMPLEMENTAR**:
   - Trabalhar na branch adequada (`develop` ou `feature/*`).
   - Aplicar alterações limpas, reutilizando componentes e respeitando as convenções do projeto.
4. **TESTAR**:
   - Verificar a navegação entre telas, comportamento da busca, responsividade em múltiplos viewports e ausência de erros no console.
5. **REVISAR**:
   - Commitar com mensagens semânticas no padrão Conventional Commits.
   - Atualizar o `CHANGELOG.md` e `version.json` quando houver novos recursos ou releases.
