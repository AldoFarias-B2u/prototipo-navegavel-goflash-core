---
name: ui-ux
description: Diretrizes de UI/UX, Design System, usabilidade e padrões de interface específicas para o ERP GoMarket / Goflash CORE. Use para criar ou modificar telas, componentes, formulários e fluxos navegáveis mantendo fidelidade visual, acessibilidade e ergonomia operacional.
---

# UI/UX Skill - GoMarket / Goflash CORE

Este guia estabelece as diretrizes práticas de **Engenharia de Interface (UI)**, **Experiência do Usuário (UX)** e **Design System** que todo agente de IA deve seguir ao construir ou modificar telas no protótipo navegável do **GoMarket / Goflash CORE**.

---

## 1. Contexto do Produto

O **GoMarket / Goflash CORE** é um sistema ERP e de gestão operacional de alta densidade voltado para os setores de varejo tradicional, franquias, e-commerce e especialmente **lojas autônomas e minimercados (mercados de condomínio / honest market)**.

### Características do Usuário e Cenários de Uso
- **Operadores e Abastecedores de Lojas Autônomas**: Usuários em trânsito que utilizam o sistema **diretamente pelo smartphone (celular)** para a rotina operacional em campo:
  - Abastecimento de gôndolas e confirmação de pedidos de reposição.
  - Realização de inventários, contagens e auditorias de estoque direto no ponto de venda.
  - Consulta e registro de validade de produtos (*shelf-life*).
  - Movimentações e transferências de mercadorias entre centros de distribuição e minimercados.
- **Operadores de Caixa, Gerentes e Analistas de Retaguarda**: Usuários que utilizam o sistema em computadores desktop para gestão financeira, emissão fiscal, relatórios consolidados e parametrizações.
- **Abordagem Mobile-First & Responsividade Omnichannel**:
  - Toda nova tela ou módulo operacional deve ser projetado com mentalidade **Mobile-First**, garantindo uma experiência excelente, ergonômica e ágil tanto para quem opera com o celular na mão no corredor de uma loja autônoma quanto para quem acessa a **mesma tela** em monitores desktop de alta resolução.
- **Natureza do Protótipo**: Interface estática navegável (HTML5/CSS3/JS Vanilla) com comportamento dinâmico e fidelidade visual milimétrica (*pixel-perfect*) ao sistema de referência.

---

## 2. Princípios Fundamentais de UI/UX do GoMarket

Ao desenhar ou codificar qualquer elemento, siga estes 8 princípios:

1. **Clareza e Densidade Equilibrada**: Apresente dados cruciais de forma direta. Em ERPs, whitespace excessivo prejudica a visão panorâmica, mas aglomeração sem hierarquia gera fadiga.
2. **Eficiência Operacional**: Reduza cliques. Campos frequentes devem ter navegação por teclado (`Tab`, `Enter`, `Ctrl+K`), e ações primárias devem ser imediatamente visíveis.
3. **Consistência Estrita**: Nunca crie um estilo visual novo se já existir um padrão no projeto. O GoMarket possui contratos visuais consolidados que devem ser preservados.
4. **Hierarquia Visual Direta**: O olho do usuário deve entender a ordem de importância na sequência:
   - `1º Topo/Identidade do Módulo` → `2º Filtros e Busca` → `3º Conteúdo Principal (Cards/Tabelas)` → `4º Ações e Status`.
5. **Simplicidade Sem Perda de Poder**: Mantenha as interfaces intuitivas para novatos, mas com atalhos e respostas rápidas para veteranos.
6. **Acessibilidade Prática**: Contraste adequado (WCAG AA), tamanhos de toque mínimos de 44px e semântica HTML pura.
7. **Responsividade com Adaptação Real**: A interface não deve apenas "encolher" no mobile; ela deve reorganizar colunas em pilhas lógicas e manter ações ao alcance do polegar.
8. **Feedback Imediato**: Nenhuma ação do usuário pode ficar sem resposta tátil ou visual (hover suave, ripple no clique, loading spinner ou toast notification).

---

## 3. Guia de Aplicação do Design System

> [!IMPORTANT]
> Consulte sempre os documentos completos [`docs/design-system.md`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/docs/design-system.md) e [`assets/css/global.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/global.css). Não invente cores ou variáveis fora do catálogo oficial.

### 3.1 Paleta de Cores e Aplicação
- **Identidade Principal (Roxo GoFlash)**: `--primary-color: #6530b5`. Usado em botões de ação principal, faixas de destaque, links ativos e na **marcação roxa no topo dos cards**.
- **Cabeçalho e Hero Escuro**: `#23143d`. Usado no Topbar superior, fundo do Hero e cabeçalho de módulos.
- **Barra de Pesquisa Oficial**: `#543f70` (repouso) e `#614a82` (foco).
- **Módulos do ERP**:
  - *Gerencial*: Azul `#3f51b5`
  - *Operação*: Roxo `#7356bf`
  - *Financeiro*: Verde `#5ebd74`
- **Fundos**: Fundo de aplicação `#f1f3f6` e cards brancos `#ffffff`.
- **Textos**:
  - Títulos de alto contraste: `#212529` / `#333333`
  - Títulos de cards e links: `#5f6368` / `#757575`
  - Textos de apoio e legendas: `#757575` / `#8e959e`

### 3.2 Tipografia e Ícones
- **Fonte**: `'Roboto', sans-serif`.
- **Pesos**: `400` (Regular) para textos, `500` (Medium) para títulos de seções e cards, `700` (Bold) para botões em caixa alta.
- **Ícones**: Utilizar **exclusivamente** a classe `.material-icons` com nomes oficiais do Google Material Icons (ex: `shopping_bag`, `store`, `sync`, `tune`, `account_circle`, `search`).

### 3.3 Cards e Elevação
- **Marcação Roxa Obrigatória no Topo dos Cards de Módulos**:
  ```css
  border-top: 4px solid #6530b5;
  border-radius: 2px 2px 4px 4px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.09), 0 1px 3px rgba(0, 0, 0, 0.05);
  ```
- **Hover em Cards Interativos**: Elevação vertical suave (`transform: translateY(-5px); box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);`).

---

## 4. Regra de Ouro: Reutilização de Componentes

Antes de escrever qualquer linha de CSS ou HTML novo:

1. **Procure nos arquivos existentes**:
   - `assets/css/components.css`: Inputs com linha inferior, botões com ripple, checkbox, toasts, loading spinners.
   - `assets/css/module-view.css`: Estrutura de grid em 2 colunas, barra de pesquisa no header, cards primários e laterais.
   - `assets/js/module-search.js`: Motor de busca dinâmica em tempo real.
   - `assets/js/toast.js`: Sistema de notificações centralizado.
2. **Reutilize as classes CSS oficiais**: Nunca crie `.meu-novo-botao` ou `.meu-card`. Utilize `.btn-primary`, `.module-primary-card`, `.module-feature-item`, etc.

---

## 5. Responsividade e Adaptação de Dispositivos

```
┌───────────────────────────┬────────────────────────────────────────────────────────┐
│ Breakpoint                │ Comportamento Esperado                                 │
├───────────────────────────┼────────────────────────────────────────────────────────┤
│ Desktop (> 1080px)        │ Grid assimétrico de 2 colunas, cards laterais escalo-  │
│                           │ nados (margin-top: 42px) sobre o Hero superior.       │
├───────────────────────────┼────────────────────────────────────────────────────────┤
│ Tablet (769px a 1080px)   │ Card principal em largura total; cards laterais orga- │
│                           │ nizados lado a lado em sub-grid.                      │
├───────────────────────────┼────────────────────────────────────────────────────────┤
│ Mobile (≤ 768px)          │ Coluna única empilhada, Drawer como overlay fullscreen,│
│                           │ unidades 100dvh, padding reduzido para 1rem.          │
└───────────────────────────┴────────────────────────────────────────────────────────┘
```

### Regras Específicas de Responsividade e Operação Mobile
- **Ergonomia para Operação em Campo (Smartphones)**:
  - Elementos de ação principal (confirmar contagem, bipar produto, registrar validade, salvar) devem ficar posicionados na **zona de alcance do polegar (*thumb-friendly zone*)**, preferencialmente fixados na base ou em posições de toque confortável.
  - Para telas de inventário, contagens e validade, prefira cards compactos ou linhas em lista com botões de incremento/decremento (`+` e `-`) amplos e legíveis.
- **Tabelas vs. Listagens Operacionais**: Em telas menores, tabelas complexas devem adotar scroll horizontal suave (`overflow-x: auto; -webkit-overflow-scrolling: touch;`) ou converter linhas densas em cards de leitura rápida contendo código de barras, descrição, lote e validade.
- **Formulários**: Em desktop, campos relacionados ficam em grids de 2 a 4 colunas; em mobile, colapsam para 1 coluna vertical sem quebra de fluxo.
- **Áreas de Toque**: Todos os botões, checkboxes, selects e links interativos devem ter área mínima de toque de **44px x 44px**.

---

## 6. Acessibilidade (A11y)

- **Contraste de Cores**: Garantir relação de contraste mínima de 4.5:1 para texto normal e 3:1 para textos grandes (como o `#38245b` sobre fundo `#23143d`).
- **Navegação por Teclado**: Todos os elementos interativos (`button`, `a`, `input`) devem possuir outline visível no foco (`:focus-visible` ou foco estilizado com glow roxo/branco).
- **Semântica HTML5**:
  - Utilizar `<main>`, `<header>`, `<nav>`, `<aside>`, `<section>`, `<article>`, `<h1>` a `<h3>`.
  - Não utilizar `<div>` com `onclick` quando o elemento deveria ser um `<button>` ou `<a>`.
- **Atributos ARIA**: Fornecer `aria-label` ou `title` em botões de apenas ícone (ex: botões do topbar, fechar modal, menu hambúrguer).

---

## 7. Padrões de Estados de Interface

Toda tela ou componente interativo deve prever e tratar os seguintes estados:

| Estado | Padrão Visual no GoMarket |
|---|---|
| **Repouso (Default)** | Superfície limpa, sombra sutil (`--elevation-1` ou `--elevation-2`), cores neutras. |
| **Hover** | Elevação sutil (`translateY(-2px)` a `-5px`), transição suave `0.25s cubic-bezier(0.4, 0, 0.2, 1)`, ícone deslizando ou cor primária. |
| **Focus** | Linha inferior roxa de 2px nos inputs (`--primary-color`), outline suave sem quebra de layout. |
| **Loading** | Classe `.btn-loading` com spinner circular giratório em CSS puro ou placeholder esqueleto sutil. |
| **Desabilitado** | Fundo cinza `#c4c4c4`, texto `#888888`, `cursor: not-allowed;`, sem sombra e sem hover. |
| **Vazio (Empty State)** | Componente `.module-no-results` com ícone grande (`48px`), mensagem clara de "Nenhum resultado" e botão de ação corretiva. |
| **Erro** | Linha inferior vermelha (`#d32f2f`), texto explicativo e animação de tremor horizontal (`.animate-shake`). |
| **Sucesso** | Toast verde com ícone `check_circle` e persistência temporária de 4 segundos. |

---

## 8. Padrões para Formulários no ERP

1. **Estrutura dos Campos**:
   - Sempre utilize a estrutura com linha inferior Material:
     ```html
     <div class="input-group">
       <div class="input-wrapper">
         <span class="material-icons input-icon">account_circle</span>
         <input type="text" class="input-field" placeholder="Digite seu usuário">
       </div>
     </div>
     ```
2. **Validação**:
   - Feedback em tempo real ou no submit.
   - Em caso de erro, adicionar a classe `.has-error` no `.input-wrapper` e exibir a notificação correspondente.
3. **Campos Numéricos e Moeda**:
   - Valores monetários devem ser alinhados à direita e pré-fixados com `R$`.
   - Quantidades e estoques devem ser alinhados à direita com números tabulares.

---

## 9. Padrões para Apresentação de Tabelas e Dados

Como o GoMarket é um ERP corporativo, tabelas de listagem são essenciais:

1. **Cabeçalho da Tabela (`<thead>`)**:
   - Fundo neutro suave (`#f8f9fa`), texto em cinza escuro `#5f6368`, caixa alta sutil, `font-weight: 500`, tamanho `0.8rem`.
2. **Linhas (`<tr>`)**:
   - Borda inferior sutil `1px solid #eeeeee`, altura de linha de `44px` a `52px`.
   - Hover em toda a linha com fundo `#f5f6f8` e cursor pointer quando a linha for clicável.
3. **Alinhamento de Conteúdo**:
   - Textos descritivos e nomes: Alinhados à esquerda (`text-align: left`).
   - Códigos, datas e status: Centralizados (`text-align: center`).
   - Valores monetários e números: Alinhados à direita (`text-align: right`).
4. **Badges de Status**:
   - `Ativo / Concluído`: Verde (`color: #2e7d32; background: #edf7ed;`).
   - `Pendente / Em Análise`: Laranja (`color: #ed6c02; background: #fff4e5;`).
   - `Cancelado / Inativo`: Vermelho (`color: #d32f2f; background: #fdeded;`).
   - `Rascunho`: Cinza (`color: #616161; background: #eeeeee;`).

---

## 10. Fluxos Operacionais Eficientes

Para evitar sobrecarga e manter a velocidade dos operadores do ERP:
- **Evite Cadeias de Modais**: Não abra um modal por cima de outro modal. Se a tarefa for complexa, use uma tela dedicada de cadastro ou painel lateral retrátil.
- **Atalhos Rápidos**: Sempre forneça busca dinâmica com atalho `Ctrl + K`.
- **Previsibilidade de Navegação**: O botão do topo esquerdo deve abrir o Drawer ou retornar à tela anterior com ícone de seta (`arrow_back`).

---

## 11. Processo Passo a Passo para Criar uma Nova Tela

Ao receber a solicitação de uma nova tela no GoMarket, siga rigorosamente este roteiro:

```
1. ANALISAR O OBJETIVO
   └── Qual o módulo? (Gerencial, Operação, Financeiro)
   └── Quem é o usuário e qual a tarefa prioritária?

2. INSPECIONAR TELAS SEMELHANTES
   └── Ex: Se for tela de módulo, inspecione 'pages/operacao.html'.
   └── Se for tela inicial, inspecione 'pages/dashboard.html'.

3. REUTILIZAR COMPONENTES EXISTENTES
   └── Importar 'global.css', 'components.css', 'module-view.css'.
   └── Usar 'module-search.js', 'auth.js', 'toast.js', 'version.js'.

4. ESTRUTURAR A HIERARQUIA
   └── Topbar com busca e ações → Hero com título do módulo → Grid com borda roxa de 4px.

5. VERIFICAR OS ESTADOS
   └── Como fica com dados? Como fica na busca vazia? Como fica no hover?

6. VALIDAR RESPONSIVIDADE
   └── Testar em Desktop (1920px), Tablet (768px) e Mobile (375px).
```

---

## 12. Regras Proibitivas (O Que NUNCA Fazer)

> [!CAUTION]
> As seguintes práticas são expressamente proibidas no ecossistema GoMarket:

- ❌ **NUNCA** adicione frameworks como Bootstrap, TailwindCSS, React ou Vue sem ordem expressa do usuário.
- ❌ **NUNCA** crie estilos inline (`style="..."`) para propriedades estruturais ou cores de tema.
- ❌ **NUNCA** utilize cores aleatórias fora da paleta oficial documentada.
- ❌ **NUNCA** remova ou esqueça a marcação com barrinha roxa (`border-top: 4px solid #6530b5`) nos cards principais de módulos.
- ❌ **NUNCA** crie botões sem feedback visual (hover, ripple ou loading).
- ❌ **NUNCA** ignore o comportamento mobile; todas as telas devem funcionar em smartphones.
- ❌ **NUNCA** use `alert()` ou `confirm()` nativos do navegador; utilize o módulo `Toast` existente.
