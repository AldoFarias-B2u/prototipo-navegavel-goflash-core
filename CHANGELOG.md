# Changelog - Goflash CORE (Protótipo Navegável)

Todas as alterações notáveis, novas telas e refinamentos de design deste projeto serão documentados neste arquivo seguindo o padrão [Semantic Versioning (SemVer)](https://semver.org/lang/pt-BR/) e [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/).

## [1.9.8] - 2026-08-23
### ✨ Otimização de Modais & UI/UX
- **Comboboxes Pesquisáveis e Reordenação Estratégica nos Modais de Abastecimento** ([`pages/pedidos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedidos-abastecimento.html), [`assets/css/abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/abastecimento.css), [`assets/js/pedidos-abastecimento-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/pedidos-abastecimento-controller.js)):
  - **Componente Searchable Combobox**: Substituição dos selects nativos por autocompletes modernos com filtragem instantânea com highlight, dropdown suave e botão de limpeza rápida (`✕`).
  - **Reordenação Operacional**: Priorização do fluxo: `1º Filial para Repor:` ➔ `2º Filial do Estoque Origem: [Opcional]` ➔ `3º Plano de Abastecimento: [Opcional]`.
  - **Badges de Quantidade de Itens**: Exibição dos badges numéricos com a contagem de produtos cadastrados em cada plano de abastecimento.
  - **Banner de Instruções Colapsável**: Redução drástica da altura inicial de cabeçalho para apenas ~38px no mobile com suporte a dicas expansíveis sob demanda (*"Como funciona? ⌵"*).
  - **Labels Limpos & Badge Visual**: Padronização dos rótulos e inclusão do badge pill `.field-optional-badge` nos campos opcionais.
  - **Laboratório de Testes UI/UX ([`pages/lab-modais.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/lab-modais.html))**: Vitrine interativa para simulação e teste de variantes de modais em tempo real.

---

## [1.9.7] - 2026-08-22
### 🐛 Responsividade & Correção de Modais
- **Resolução Definitiva da Barra de Rolagem e Responsividade em Modais de Abastecimento** ([`pages/pedidos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedidos-abastecimento.html), [`assets/css/abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/abastecimento.css)):
  - **Scroll Suave em Notebooks e Telas Menores**: Reestruturação do `.official-modal-body` com `flex: 1 1 auto; min-height: 0; overflow-y: auto;`, permitindo que o corpo do modal acione barra de rolagem roxa suave sempre que a altura útil da tela (ex: 1366x768 ou mobile) for inferior ao conteúdo do formulário.
  - **Eliminação de Conflitos de CSS**: Remoção da folha `consulta-abastecimento.css` na tela de pedidos e inclusão nativa das classes `.modal-radio-*` e `.initial-choice-*` diretamente em `abastecimento.css`.
  - **Expansão Dinâmica Reativa**: O formulário agora recalcula seu espaço e exibe instantaneamente os 3 critérios de plano de abastecimento (*Plano completo*, *Apenas saldo < ideal*, *Apenas saldo < crítico*) sem cortes e mantendo cabeçalho e rodapé fixos na tela.

---
### ✨ Identidade Visual & IA (Maestro IA)
- **Evolução da Marca da Inteligência Artificial para "Maestro IA"**:
  - **Identidade Unificada**: Renomeação global de *GoFlash AI / GoFlash IA* para **Maestro IA** em todos os pontos de contato da plataforma.
  - **Página de Chat Dedicada ([`pages/chat-ia.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/chat-ia.html))**: Atualização do título, Topbar (`MAESTRO IA • COPILOTO INTELIGENTE`), card de versão lateral (`Maestro IA v1.0`), tooltip do Drawer e legenda de rodapé: *"Maestro IA • Inteligência Artificial integrada a plataforma da B2U Sistemas."*.
  - **Widgets e Menus do Sistema ([`pages/dashboard.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/dashboard.html), [`pages/operacao.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/operacao.html), [`pages/parametrizacoes.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/parametrizacoes.html))**:
    - Botão de acesso rápido na Topbar com rótulo `Maestro IA`.
    - Popover de 9 pontos com atalho dinâmico `MAESTRO IA`.
    - Header do widget flutuante, mensagem inicial de apresentação e rodapé oficial.
  - **Motor e Base de Conhecimento ([`assets/js/ai-chat-knowledge.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-knowledge.js), [`assets/js/ai-chat-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-controller.js), [`assets/js/ai-chat-fullscreen-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-fullscreen-controller.js))**:
    - Exportação global `window.MaestroIAKnowledge` com alias retrocompatível `window.GoFlashAIKnowledge`.
    - Assinatura nos balões de resposta formatada como `Agora • Maestro IA`.

---

## [1.8.0] - 2026-08-20
### ✨ Adicionado & Otimizado
- **Otimização e Despoluição Visual do Cabeçalho da Consulta de Abastecimento** ([`pages/consulta-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/consulta-abastecimento.html), [`assets/css/consulta-abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/consulta-abastecimento.css), [`assets/js/consulta-abastecimento-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/consulta-abastecimento-controller.js)):
  - **Foco Operacional Primário**: Scanner EAN e botão `+ ADICIONAR PRODUTOS` com protagonismo absoluto na barra de ferramentas.
  - **Menu Flutuante "Mais Ações" (`[ ⋮ Mais Ações ]`)**: Dropdown elegante agrupando opções secundárias (*Ocultar/Mostrar Desmarcados*, *Definir Qtde em Lote* com badge de itens selecionados e *Excluir Todos os Produtos* com confirmação de segurança).
  - **Ordenação Dinâmica de Colunas (Tri-State)**: Ordenação interativa por clique nas colunas *Estoque Loja*, *Estoque CD* e *Sugestão* com ciclo Crescente ($\uparrow$), Decrescente ($\downarrow$) e Ordem Original ($\updownarrow$), sincronizada com a busca e os cards mobile.
  - **Bloco do Produto em "Formato Ficha"**: Nome do produto em destaque no topo (`#1f2937`), EAN em tipografia sutil (`#757575`) e badges de status (*Estoque Zerado*, *Nível Crítico*, *Abaixo do Ideal*, *Estoque OK*) em alto contraste, sem ícones internos e sem quebras indesejadas de linha.
- **Harmonização da Toolbar em Planos de Abastecimento** ([`pages/planos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/planos-abastecimento.html), [`assets/css/abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/abastecimento.css)):
  - Toolbar unificada com botão *Editar Plano* na seção de produtos e simplificação de botões de cabeçalho.
- **Validação de Parâmetros Iniciais**:
  - Selects de parametrização vazios por padrão e obrigatoriedade da *Filial para repor* para avançar.

---

## [1.7.0] - 2026-08-18
### ✨ Adicionado
- **Assistente Virtual GoFlash IA (Full-Screen & Omnichannel)** ([`pages/chat-ia.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/chat-ia.html), [`assets/css/ai-chat.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/ai-chat.css), [`assets/js/ai-chat-knowledge.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-knowledge.js), [`assets/js/ai-chat-fullscreen-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-fullscreen-controller.js), [`assets/js/ai-chat-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/ai-chat-controller.js)):
  - **Tela Exclusiva de Chat em Tela Cheia**: Interface conversacional dedicada com painel lateral de tópicos e histórico, cards de sugestões em grid inicial, digitação simulada e botões de ação executáveis do ERP.
  - **Botão Flutuante (FAB IA) & Widget Assistivo**: Botão flutuante roxo com indicador de status online e modal conversacional compacto na Home e Operação.
- **Painel de Parametrizações do Protótipo & Feature Flags** ([`pages/parametrizacoes.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/parametrizacoes.html), [`assets/js/feature-flags.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/feature-flags.js), [`assets/css/components.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/components.css)):
  - Central de controle com *Toggle Switches* táteis para ativar/desativar módulos e recursos em tempo real durante demonstrações.
  - Persistência em `localStorage` e reatividade no DOM via eventos customizados.
  - Atalho oficial na seção *Configurações* do Drawer lateral em todo o sistema.

### 🎨 Melhorado & Refinado
- **Harmonização Visual da Home Page** ([`pages/dashboard.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/dashboard.html), [`assets/css/dashboard.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/dashboard.css)):
  - Remoção de caixas e chips de busca com alto contraste no centro do Hero, restaurando a marca d'água oficial em destaque limpo.
  - **Reposicionamento Condicional do Botão de Rolagem (#scrollFab)**: Centralizado horizontalmente quando o FAB de IA está ativo (garantindo simetria perfeita em 3 pontos) e retornado à direita quando o FAB de IA é desativado.

### 🐛 Corrigido
- **Alinhamento do Cabeçalho e Colunas em Planos de Abastecimento** ([`pages/planos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/planos-abastecimento.html), [`assets/js/abastecimento-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/abastecimento-controller.js)):
  - Corrigido o número e alinhamento de colunas no `<thead>` dinâmico (5 colunas em modo leitura e 7 colunas em modo edição com checkbox mestre de seleção em lote).

---

## [1.6.1] - 2026-08-17
### 🎨 Corrigido & Padronizado
- **Padronização Inteligente do Menu de Atalhos Principais (Popover de 9 Pontos)** ([`assets/js/dashboard.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/dashboard.js), [`pages/pedidos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedidos-abastecimento.html), [`pages/pedido-manual.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedido-manual.html), [`pages/consulta-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/consulta-abastecimento.html)):
  - **Grid Canônica Unificada de 5 Módulos**: Inclusão de `GERENCIAL`, `OPERAÇÃO`, `FINANCEIRO` (linha superior) e `HOME`, `PAINEL DE CO...` (linha inferior) em todas as telas do sistema.
  - **Sincronizador Central `renderStandardAppsPopover()`**: Injeção e sincronização automática em tempo de execução via `dashboard.js`, garantindo manutenção em ponto único de verdade (DRY).
- **Ajuste Visual de Tipografia e Contraste na Coluna de Índice das Tabelas** ([`assets/css/abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/abastecimento.css)):
  - Corrigido o cabeçalho `#` da primeira coluna para fundo transparente e tipografia cinza clara (`#757575`).
  - Definida fonte branca clara, nítida e legível (`#ffffff`, peso 500) para os números de linha sobre o fundo roxo, idêntico à imagem de referência oficial.

---

## [1.6.0] - 2026-08-17
### ✨ Adicionado & Aprimorado
- **Seleção e Visualização de Pedidos de Abastecimento com Permissões por Status** ([`pages/pedidos-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedidos-abastecimento.html), [`pages/pedido-manual.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedido-manual.html), [`assets/js/pedido-manual-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/pedido-manual-controller.js), [`assets/css/pedido-manual.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/pedido-manual.css)):
  - **Navegação a Partir da Listagem**: Clique em qualquer linha da tabela de pedidos abre a visão de detalhes (`pedido-manual.html?id=...&codigo=...`).
  - **Controle de Permissões por Status**:
    - **`Aberto` (Modo de Edição)**: Totalmente liberado para inclusão/remoção de produtos, alteração de quantidades via steppers `[-] [Qtd] [+]`, edição de lotes e opções de confirmação.
    - **`Pendente de Abastecimento` (Modo Somente Leitura)**: Banner informativo laranja (*🚚 Pedido em Trânsito*), ferramentas de edição e lixeira ocultadas, quantidades fixas, modal de lotes em consulta e botão `VOLTAR PARA PEDIDOS`.
    - **`Recebido` (Modo Somente Leitura)**: Banner informativo verde (*📦 Pedido Recebido*), edições bloqueadas com abastecimento e movimentação de estoque concluídos na filial.
    - **`Cancelado` (Modo Somente Leitura)**: Banner informativo vermelho (*🚫 Pedido Cancelado*).
  - **Unificação do Status de Conclusão**: A opção de finalizar imediatamente no modal de conclusão grava oficialmente o pedido com o status **`Recebido`** (Verde).
  - **Hidratação Dinâmica de Itens**: Pedidos históricos do mock carregam produtos realistas com fotos, descrições, estoques e validades simuladas.

---

## [1.5.0] - 2026-08-17
### ✨ Adicionado
- **Fluxo Completo de Pedido de Abastecimento Manual (Em Branco)** ([`pages/pedido-manual.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/pedido-manual.html), [`assets/css/pedido-manual.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/pedido-manual.css), [`assets/js/pedido-manual-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/pedido-manual-controller.js)):
  - **Modal de Parametrização Inicial** no FAB de criação de pedidos para seleção da *Filial Destino* e *Filial Origem* opcional (para transferências entre estoques).
  - **Hero Card Moderno**: Visualização integrada de filial destino, filial origem, código sequencial automático (`000038`) e abas *PRODUTOS* e *DETALHES*.
  - **Omnibar Inteligente com Bipe EAN**: Campo unificado para bipe com leitor de código de barras ou busca por texto com dropdown de autocomplete em tempo real.
  - **Catálogo Modal com Filtros por Categoria**: Inclusão rápida de produtos categorizados (*Bebidas*, *Snacks*, *Doces*, *Cervejas*).
  - **Controle de Quantidade com Stepper Tátil**: Botões `[-]` e `[+]` de 44px para operação ágil no mobile e edição inline direta no Desktop.
  - **Controle e Gestão de Lotes / Validades (Shelf-Life)**:
    - Modal *"GERENCIAR LOTES E VALIDADES"* com barra de progresso animada de alocação de itens (`X / Y un`) e badge de status (*Completo*, *Pendente*, *Excedido*).
    - Suporte a múltiplos lotes com código, quantidade, data de fabricação e data de validade.
    - **Validação Estrita de Validade**: Bloqueio de finalização do pedido caso a soma das quantidades dos lotes cadastrados divirja da quantidade informada no item do pedido (`∑ Lotes == Qtde Pedido`).
  - **Máquina de Estados de Status do ERP**:
    - Suporte aos status: `Aberto` (rascunho editável), `Pendente de Abastecimento` (em trânsito / bloqueado), `Recebido` (entregue na loja) e `Finalizado` (abastecimento concluído com movimentação de estoque).
    - Modal de conclusão ao clicar em *CONFIRMAR* oferecendo opções de colocar em trânsito, finalizar imediatamente ou salvar como rascunho.
  - **Sticky Action Footer**: Barra fixa com resumo de SKUs, total de unidades, valor estimado (`R$`) e ações de finalização.

---

## [1.4.2] - 2026-08-17
### 🎨 Modificado & Melhorado
- **Refinamento de Responsividade Mobile na Consulta de Abastecimento** ([`assets/css/consulta-abastecimento.css`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/css/consulta-abastecimento.css), [`pages/consulta-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/consulta-abastecimento.html)):
  - Corrigido o alinhamento da barra de ferramentas e alternador de visualização `[ ≡ | ☷ ]` em telas estreitas (≤ 420px, 396px, 360px), evitando quebras e cortes laterais.
  - Otimização do espaçamento dos botões de ação e chips de filtro em smartphones.
  - Suporte a área segura (*safe-area-inset-bottom*) no Sticky Action Footer.

---

## [1.4.1] - 2026-08-16
### 🎨 Modificado & Melhorado
- **Seleção em Lote na Consulta de Abastecimento** ([`pages/consulta-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/consulta-abastecimento.html), [`assets/js/consulta-abastecimento-controller.js`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/assets/js/consulta-abastecimento-controller.js)):
  - Adicionado checkbox mestre no cabeçalho da tabela para marcar e desmarcar todos os produtos visíveis com um único clique.
  - Sincronização de estado bidirecional com suporte a estado indeterminado (`-`) quando houver seleção parcial de itens.

---

## [1.4.0] - 2026-08-16
### ✨ Adicionado
- **Fluxo de Novo Pedido de Abastecimento**:
  - Modal de escolha inicial entre **"Fazer Consulta para Abastecer (Recomendado)"** e **"Pedido em Branco"**.
  - Modal oficial de parâmetros de consulta ("NOVA CONSULTA DE ABASTECIMENTO") com seleção de Filial de Origem (CD), Filial Destino, Plano de Abastecimento e filtros de estoque (*Plano completo*, *Saldo < Ideal*, *Saldo <= Crítico*).
- **Tela Avançada de Consulta para Abastecimento** ([`pages/consulta-abastecimento.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Prot%C3%B3tipo%20Navegavel%20Core/pages/consulta-abastecimento.html)):
  - **Banner de Contexto**: Filial ativa, CD de origem e plano com botão rápido "Alterar Parâmetros".
  - **Barra de Ferramentas Rica**: Bipe de código de barras (`qr_code_scanner`), busca instantânea, botão "Adicionar Produtos", botão "Ocultar Desmarcados" e alternância Tabela / Cards.
  - **Chips de Filtragem Rápida**: `Todos`, `Saldo < Ideal`, `Críticos`, `Selecionados`, `Estoque Zerado`.
  - **Steppers Táteis `+` e `−`**: Controle numérico de 44px com edição inline sincronizada no Desktop e Celular.
  - **Modal Multicritério**: Inclusão de produtos extras do catálogo corporativo com fotos reais em alta resolução.
  - **Sticky Action Footer**: Barra fixa com contagem de itens, volume total e botão verde "GERAR PEDIDO DE ABASTECIMENTO" com persistência dinâmica no mock.

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
