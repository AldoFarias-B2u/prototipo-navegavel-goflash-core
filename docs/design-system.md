# Design System - Goflash CORE / GoMarket

Este documento é a especificação viva e o guia de referência do **Design System** implementado no protótipo navegável do ERP **Goflash CORE**.

---

## 1. Princípios Fundamentais

1. **Fidelidade Visual (Pixel-Perfect)**: Alinhamento milimétrico com a identidade visual e ergonomia do sistema original.
2. **Base em Material Design Clássico**: Uso consistente de elevações, sombras, micro-interações táteis (ripple), inputs com linha inferior e tipografia Roboto.
3. **Vanilla Web Nativo**: Implementação em CSS3 puro sem dependência de frameworks externos ou bibliotecas opinativas.
4. **Reutilização Estrita**: Componentes e padrões visuais centralizados em `global.css`, `components.css` e `module-view.css`.

---

## 2. Tokens de Cores

### 2.1 Paleta Primária e Institucional
| Variável CSS | Hex | Uso Principal |
|---|---|---|
| `--primary-color` | `#6530b5` | Botões primários, faixas de destaque, borda superior de cards, links ativos |
| `--primary-hover` | `#532499` | Hover de botões primários e interações principais |
| `--primary-active` | `#451b82` | Estado ativo/pressionado de botões |
| `--primary-light` | `#ece3f9` | Fundo de badges suaves e seleções sutis |
| `--primary-dark` | `#2b124c` | Variações escuras secundárias |
| *(Header / Hero Dark)* | `#23143d` | Topbar do ERP, fundo do Hero e cabeçalho de módulos |
| *(Search Background)* | `#543f70` | Fundo sólido da barra de pesquisa no header dos módulos |
| *(Search Focus)* | `#614a82` | Fundo da barra de pesquisa em estado de foco |

### 2.2 Cores Temáticas dos Módulos ERP
| Módulo | Hex | Uso |
|---|---|---|
| **Gerencial** | `#3f51b5` | Banner azul do card Gerencial e barras do gráfico |
| **Operação** | `#7356bf` | Banner roxo do card Operação e faixas de destaque operacional |
| **Financeiro** | `#5ebd74` | Banner verde do card Financeiro |
| **Yellow Accent (FAB)** | `#ffeb3b` / `#ffd600` | Botão flutuante de rolagem suave (gradiente amarelo) |

### 2.3 Cores de Fundo (Backgrounds)
| Variável CSS | Hex / Valor | Aplicação |
|---|---|---|
| `--bg-app` | `#f1f3f6` / `#f4f6f9` | Fundo geral das páginas de módulos e dashboards |
| `--bg-card` | `#ffffff` | Fundo de cards, painéis, drawers e popovers |
| `--bg-login` | `#261543` | Fundo base da tela de autenticação |
| `--bg-login-gradient` | `radial-gradient(...)` | Gradiente radial do fundo da tela de login |

### 2.4 Textos e Neutros
| Variável CSS | Hex | Aplicação |
|---|---|---|
| `--text-main` | `#212529` / `#333333` | Títulos principais, labels e textos de alto contraste |
| `--text-secondary` | `#5f6368` / `#6c757d` | Títulos de cards, links do drawer, itens de menus |
| `--text-muted` | `#757575` / `#8e959e` | Descrições de itens, títulos de seções, textos de apoio |
| `--text-light` | `#ffffff` | Textos sobre fundos escuros e cabeçalhos |
| `--border-light` | `#e0e0e0` / `#eeeeee` | Linhas divisórias e bordas sutis |

### 2.5 Estados e Feedback (Alerts / Toasts)
| Tipo | Cor Hex | Fundo Hex | Aplicação |
|---|---|---|---|
| **Success** | `#2e7d32` | `#edf7ed` | Toasts e feedbacks de sucesso |
| **Error** | `#d32f2f` | `#fdeded` | Validações inválidas, bordas com erro e toasts |
| **Warning** | `#ed6c02` | `#fff4e5` | Avisos e alertas operacionais |
| **Info** | `#0288d1` | `#e1f5fe` | Mensagens informativas de navegação |

---

## 3. Tipografia e Ícones

### 3.1 Fonte Principal
- **Família**: `'Roboto', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- **Pesos Utilizados**:
  - `300` (Light): Textos grandes de rodapé e números decorativos.
  - `400` (Regular): Textos corridos, inputs, descrições e links do drawer.
  - `500` (Medium): Títulos de seções, títulos de cards (`.module-card-title`, `.module-group-title`).
  - `700` (Bold): Botões em caixa alta, títulos Hero ("OPERAÇÃO") e badges.

### 3.2 Escala Tipográfica
| Token | Tamanho Rem | Tamanho Px | Uso |
|---|---|---|---|
| `--font-size-xs` | `0.75rem` | 12px | Legendas, tags de versão e metadados |
| *(Descrições de Módulos)* | `0.78rem` - `0.8rem` | 12.5px - 13px | Descrições dos itens de funcionalidades |
| `--font-size-sm` | `0.875rem` | 14px | Botões secundários, toasts e checkbox |
| `--font-size-md` | `1rem` | 16px | Corpo de texto padrão e títulos de grupos |
| `--font-size-lg` | `1.125rem` - `1.15rem` | 18px | Título da página no topbar |
| `--font-size-xl` | `1.35rem` - `1.5rem` | 21px - 24px | Títulos dos cards da Home |
| *(Hero Headline)* | `clamp(3rem, 7vw, 5.8rem)` | 48px - 92px | Título gigante de fundo no topo de módulos |

### 3.3 Biblioteca de Ícones
- **Biblioteca Oficial**: **Google Material Icons** clássico (`.material-icons`, `font-family: 'Material Icons'`).
- **Configuração**: Fallback local via `@font-face` WOFF2 e Google Fonts CDN.
- **Tamanhos Padrão de Ícones**:
  - Topbar e Ações: `24px`
  - Inputs e Toasts: `20px` - `22px`
  - Itens de Módulos: `32px`
  - Banners de Módulos da Home: `94px`

---

## 4. Espaçamentos, Elevações e Bordas

### 4.1 Border Radius
| Token | Valor | Aplicação |
|---|---|---|
| `--radius-sm` | `4px` | Cards, botões, inputs, toasts e popovers |
| `--radius-md` | `8px` | Caixas de destaque e containers médios |
| `--radius-lg` | `12px` - `16px` | Caixa branca do gráfico Gerencial (`16px`) |
| `--radius-full` | `9999px` / `50%` | Botão FAB amarelo e avatares |

### 4.2 Sombras e Elevações (Material Elevations)
| Token | Valor CSS | Aplicação |
|---|---|---|
| `--elevation-1` | `0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)` | Itens sutis em repouso |
| `--elevation-2` | `0 3px 6px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.12)` | Cards em repouso |
| `--elevation-3` | `0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)` | Card de login, toasts e popovers |
| `--elevation-4` | `0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)` | Elevação de hover em cards |
| `--elevation-button` | `0 3px 5px -1px rgba(101,48,181,0.2), 0 6px 10px 0 rgba(101,48,181,0.14)` | Botão primário roxo |

### 4.3 Marcação Roxa no Topo dos Cards
Padrão exclusivo do ERP para delimitação visual de blocos operacionais:
```css
border-top: 4px solid #6530b5;
border-radius: 2px 2px 4px 4px;
box-shadow: 0 3px 12px rgba(0, 0, 0, 0.09), 0 1px 3px rgba(0, 0, 0, 0.05);
```

---

## 5. Componentes de Interface

### 5.1 Botões
1. **Botão Primário (`.btn-primary`)**:
   - Fundo roxo `#6530b5`, texto branco em caixa alta, `font-weight: 600`, `letter-spacing: 0.8px`, altura mínima `44px`.
   - Efeito **Ripple** animado no clique (`.ripple`).
   - Suporte a estado desabilitado (`:disabled`) e loading.
2. **Botão de Ação de Card (`.module-action-btn`)**:
   - Texto "ABRIR" em cinza `#757575`, caixa alta, sem borda, alinhado à direita no rodapé do card.
3. **Botão Flutuante FAB (`.hero-scroll-fab`)**:
   - Botão circular amarelo (`60px x 60px`), gradiente `#fff176` a `#ffd600`, posicionado com `top: -30px` na divisa do Hero com animação sutil de pulso.
4. **Botões de Ação do Topbar (`.topbar-btn`)**:
   - Ícone redondo (`40px x 40px`), fundo transparente, hover com `rgba(255, 255, 255, 0.12)`.

### 5.2 Campos de Formulário (Inputs)
- **Input com Linha Inferior Material (`.input-wrapper`)**:
  - Borda inferior sólida `#c7ccd4` (1px).
  - No foco (`:focus-within`): linha roxa `--primary-color` (2px) com compensação de padding para evitar deslocamento visual.
  - Ícone de prefixo à esquerda em cinza `#757d8a`, que se torna roxo no foco.
  - Estado de erro (`.has-error`): linha inferior e ícone em vermelho `#d32f2f`.

### 5.3 Barra de Pesquisa de Módulos (`.module-search-box`)
- Fundo sólido roxo escuro `#543f70`, sem borda, altura `40px`, cantos `4px`.
- Ícone de lupa branco/translúcido à esquerda.
- Input com texto branco `#ffffff` e placeholder suave.
- Botão de limpar (`close`) dinâmico e atalho `Ctrl + K`.

### 5.4 Checkbox Customizado (`.checkbox-container`)
- Caixa quadrada de `18px x 18px` com borda cinza `#757575`.
- No estado checado (`:checked`): fundo roxo `#6530b5` com checkmark branco em SVG/CSS.

### 5.5 Cards
1. **Card de Autenticação (`.login-card`)**: Card central branco flutuante com sombra `--elevation-3` e avatar circular.
2. **Cards de Módulos da Home (`.module-item-card`)**:
   - Banner colorido superior (`195px`).
   - Ícone com animação de deslizamento suave para o centro no hover (`transform: translateX(0)`).
   - Título em `#757575` (`font-weight: 400`) e botão ABRIR.
3. **Cards de Telas de Módulos (`.module-primary-card`, `.module-side-card`)**:
   - Borda superior roxa de `4px`.
   - Grid interno de itens com ícone de `32px` e descrições explicativas.

### 5.6 Menus e Navegação
1. **Menu Lateral (Drawer Retrátil - `.goflash-drawer`)**:
   - Largura: `280px`.
   - Cabeçalho roxo (`170px`) com logotipo vertical empilhado e avatar.
   - Divisórias sutis (`<hr class="drawer-divider">`) separando os blocos de navegação.
   - Links com ícone e texto em cinza suave `#5f6368`.
2. **Popover de Aplicativos (9 Pontos - `#appsPopover`)**:
   - Menu flutuante branco com seta superior (`.popover-arrow`).
   - Divisória central separando módulos do ERP dos atalhos de sistema.
   - Ícones diretos em cinza grafite `#616161`.
3. **Popover de Usuário (`#userPopover`)**:
   - Card de perfil com avatar, nome do usuário, cargo e botão de logout SAIR.

---

## 6. Estados de Interface e Feedback

### 6.1 Estados de Loading
- Botões com classe `.btn-loading` ocultam o texto e exibem spinner giratório centralizado em CSS puro (`border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;`).

### 6.2 Estados Vazios (Empty States)
- Componente `.module-no-results`: Exibido quando a busca não encontra termos correspondentes.
- Contém ícone `search_off` (`48px`), título informativo, descrição do termo pesquisado e botão primário "Limpar Pesquisa".

### 6.3 Feedback de Erro
- Animação de tremor horizontal (`.animate-shake` / `@keyframes cardShake`) em inputs e cards inválidos.
- Notificações Toast automáticas no canto superior direito (`#toast-container`).

---

## 7. Responsividade e Breakpoints

| Breakpoint | Dispositivos | Ajustes Principais |
|---|---|---|
| **Desktop (> 1080px)** | Monitores e Notebooks | Grid assimétrico de 2 colunas com sobreposição profunda no Hero e cards laterais escalonados |
| **Tablet (769px - 1080px)** | iPads e Tablets | Grid colapsa para coluna única no card principal e cards laterais dispostos lado a lado |
| **Mobile (≤ 768px)** | Smartphones | Alturas compactas no Hero, padding reduzido, busca responsiva e Drawer como overlay fullscreen |

---

## 8. Catálogo de Reutilização Obrigatória

| Para criar... | REUTILIZE estas classes | NUNCA faça... |
|---|---|---|
| **Nova tela de Módulo** | `.module-page-body`, `.module-topbar`, `.module-hero-banner`, `.module-primary-card`, `.module-side-card` | Criar nova folha de estilo do zero |
| **Itens/Links de Funcionalidade** | `.module-feature-item`, `.module-feature-icon`, `.module-feature-title`, `.module-feature-description` | Criar divs avulsas sem a estrutura padronizada |
| **Formulários e Inputs** | `.input-group`, `.input-wrapper`, `.input-icon`, `.input-field` | Usar inputs padrão do navegador sem underline |
| **Botões de Ação** | `.btn-primary` ou `.module-action-btn` | Criar estilos de botão inline ou cores arbitrárias |
| **Notificações** | `Toast.success()`, `Toast.error()`, `Toast.info()`, `Toast.warning()` | Usar `alert()` nativo do navegador |
