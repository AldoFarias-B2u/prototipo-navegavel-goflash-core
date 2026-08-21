# Documento de Requisitos Funcionais e Regras de Negócio
## Módulo: Consulta e Abertura de Abastecimento

Este documento descreve de forma clara, objetiva e visual os requisitos das telas de abertura do fluxo de abastecimento para orientar tanto o **Desenvolvedor** na implementação das interfaces e regras, quanto a equipe de **QA** na validação dos testes.

---

## 1. Tela 1: Modal de Escolha Inicial ("Criar Pedido de Abastecimento")

![Modal de Escolha Inicial](file:///C:/Users/Aldo%20Farias/.gemini/antigravity/brain/ddcde27a-0217-45b5-8085-0691f26c8e30/.user_uploaded/media_1787346316414.png)

### 1.1 Objetivo da Tela
Apresentar ao usuário as duas opções de início para um novo pedido de abastecimento quando ele clica no botão principal de criação (`+ Novo Pedido`).

---

### 1.2 Elementos Visuais e Layout
1. **Cabeçalho**:
   - Barra roxa superior com o título em letras maiúsculas: **CRIAR PEDIDO DE ABASTECIMENTO**.
   - Botão de fechar (`✕`) no canto superior direito.
2. **Subtítulo / Instrução**:
   - Texto: *"Escolha como deseja iniciar este pedido de reposição:"*.
3. **Card 1 (Esquerda - Fazer Consulta para Abastecer)**:
   - Ícone central: Lupa com detalhes de busca (`manage_search`) dentro de um círculo com fundo lilás suave.
   - Título em destaque: **Fazer Consulta para Abastecer**.
   - Texto descritivo: *"Sugere automaticamente produtos e quantidades baseado no estoque atual e no plano da loja."*
   - Efeito visual: Ao passar o mouse (hover), o card deve ter leve elevação e borda destacada indicando ser a opção recomendada.
4. **Card 2 (Direita - Pedido em Branco)**:
   - Ícone central: Folha com sinal de mais (`post_add`) dentro de um círculo com fundo cinza neutro.
   - Título em destaque: **Pedido em Branco**.
   - Texto descritivo: *"Inicia um pedido sem itens para você escanear e adicionar produtos manualmente."*
5. **Rodapé**:
   - Botão **CANCELAR** alinhado à esquerda em cor cinza/neutra.

---

### 1.3 Ações do Usuário e Regras de Negócio
* **Ação 1 - Clicar em "Fazer Consulta para Abastecer"**:
  - **Comportamento**: O modal atual se fecha e o sistema abre o modal de parametrização da consulta (**Tela 2**).
* **Ação 2 - Clicar em "Pedido em Branco"**:
  - **Comportamento**: O modal atual se fecha e o sistema abre o modal para escolha da loja de destino e início do pedido manual em branco.
* **Ação 3 - Clicar em "CANCELAR", no "✕" ou fora do modal**:
  - **Comportamento**: Fecha o modal sem realizar nenhuma ação, mantendo o usuário na tela de listagem de pedidos.

---

### 1.4 Critérios de Validação para QA
- [ ] O modal deve abrir centralizado na tela sobre um fundo escurecido (backdrop).
- [ ] O clique em "Fazer Consulta para Abastecer" deve abrir o modal de Nova Consulta.
- [ ] O clique em "Pedido em Branco" deve abrir o modal de Pedido em Branco.
- [ ] O botão "CANCELAR" e o ícone "✕" devem fechar o modal corretamente.

---

## 2. Tela 2: Modal de Nova Consulta de Abastecimento (Estado Inicial / Sem Plano)

![Modal Nova Consulta Inicial](file:///C:/Users/Aldo%20Farias/.gemini/antigravity/brain/ddcde27a-0217-45b5-8085-0691f26c8e30/.user_uploaded/media_1787346430090.png)

### 2.1 Objetivo da Tela
Permitir que o usuário defina os parâmetros iniciais da consulta de reposição (filial de origem opcional, filial de destino obrigatória e plano de abastecimento opcional).

---

### 2.2 Elementos Visuais e Layout
1. **Cabeçalho**:
   - Barra roxa superior com o título: **NOVA CONSULTA DE ABASTECIMENTO** e botão de fechar (`✕`).
2. **Card Informativo de Destaque (Topo)**:
   - Caixa com fundo lavanda suave e faixa roxa na lateral esquerda.
   - Ícone de busca (`manage_search`) seguido do título em negrito: **Consulta de Abastecimento**.
   - Texto descritivo: *"Identifique rapidamente as necessidades de reposição das filiais. Consulte o estoque, aplique os filtros e, ao selecionar um Plano de Abastecimento, receba sugestões de quantidades para abastecer. Em seguida, revise os itens e gere seu Pedido de Abastecimento."*
3. **Campo 1 - Filial do Estoque Origem (Opcional)**:
   - Rótulo: *"Selecione a Filial do Estoque Origem (Opcional)"*.
   - Ícone de armazém/depósito (`warehouse`).
   - Opção padrão: `-- Nenhuma (Sem filial de origem) --`.
   - Texto no canto direito do campo: `Opcional`.
4. **Campo 2 - Filial para Repor (Obrigatório \*)**:
   - Rótulo: *"Selecione a Filial para Repor \*"*.
   - Ícone de loja (`storefront`).
   - Opção padrão: `-- Selecione a filial para repor --`.
   - Texto no canto direito: `--`.
5. **Campo 3 - Plano de Abastecimento (Opcional)**:
   - Rótulo: *"Plano de Abastecimento (Opcional)"*.
   - Ícone de documento (`description`).
   - Opção padrão: `-- Nenhum plano (Consulta geral / Sem plano) --`.
   - Texto no canto direito: `Opcional`.
6. **Dica Informativa de Apoio (Abaixo do Campo de Plano)**:
   - Ícone de lâmpada (`lightbulb`) em roxo.
   - Texto: *"Selecione um plano para receber sugestões automáticas de reposição ou deixe vazio para consulta livre."*
7. **Rodapé com 3 Botões de Ação**:
   - **← VOLTAR** (lado esquerdo): Botão com ícone de seta para a esquerda em texto roxo.
   - **DESCARTAR** (lado direito): Botão em texto cinza neutro.
   - **CONSULTAR** (lado direito): Botão sólido verde em alto destaque.

---

### 2.3 Ações do Usuário e Regras de Negócio
* **RN01 - Obrigatoriedade da Filial de Destino**:
  - O campo **"Selecione a Filial para Repor \*"** é de preenchimento **obrigatório**.
  - Se o usuário clicar em **CONSULTAR** sem selecionar uma loja, o sistema deve:
    1. Bloquear o avanço.
    2. Destacar o campo com borda vermelha de erro.
    3. Exibir uma mensagem/toast: *"Por favor, selecione a filial para repor."*
* **RN02 - Filial de Origem Opcional**:
  - Se selecionada uma filial de origem (ex: CD Central), o sistema carregará o saldo do CD para cada produto na tela de consulta.
  - Se mantida como *Nenhuma*, a consulta trará os dados focando apenas no estoque da loja destino.
* **RN03 - Consulta Sem Plano (Consulta Livre / Avulsa)**:
  - Quando o plano estiver como *Nenhum plano*, a dica da lâmpada permanece visível e nenhuma opção extra de filtro é exibida.
* **RN04 - Ação do Botão "VOLTAR"**:
  - Fecha este modal e reabre o modal anterior (**Tela 1 - Criar Pedido de Abastecimento**).
* **RN05 - Ação do Botão "DESCARTAR" ou "✕"**:
  - Fecha o modal e cancela a abertura da consulta.
* **RN06 - Ação do Botão "CONSULTAR"**:
  - Com a filial destino preenchida, direciona o usuário para a **Tela de Consulta Dinâmica de Abastecimento**.

---

### 2.4 Critérios de Validação para QA
- [ ] Ao abrir o modal, os 3 campos devem iniciar com seus valores padrões/vazios.
- [ ] Clicar em "CONSULTAR" sem preencher a filial destino deve impedir o avanço e sinalizar o erro.
- [ ] Clicar em "VOLTAR" deve retornar exatamente para a Tela 1.
- [ ] Em telas de celulares (mobile), os botões `VOLTAR`, `DESCARTAR` e `CONSULTAR` devem aparecer 100% visíveis, sem quebras e sem cortar o texto do botão verde.

---

## 3. Tela 3: Modal de Nova Consulta de Abastecimento (Com Plano e Filtros Selecionados)

![Modal Nova Consulta com Plano](file:///C:/Users/Aldo%20Farias/.gemini/antigravity/brain/ddcde27a-0217-45b5-8085-0691f26c8e30/.user_uploaded/media_1787346456746.png)

### 3.1 Objetivo da Tela
Exibir as opções adicionais de filtro de estoque quando o usuário decide selecionar uma filial de origem, uma filial de destino e um **Plano de Abastecimento** cadastrado.

---

### 3.2 Elementos Visuais e Mudanças Dinâmicas
1. **Identificação dos Códigos das Filiais e Plano**:
   - Ao selecionar a Filial de Origem (ex: `Estoque central`), o canto direito atualiza para o código: `000005`.
   - Ao selecionar a Filial para Repor (ex: `Mini Mercado 01`), o canto direito atualiza para o código: `000001`.
   - Ao selecionar o Plano (ex: `Plano MiniMercado 03`), o canto direito atualiza para o código: `000003`.
2. **Exibição Condicional dos Filtros do Plano**:
   - Assim que um plano é escolhido no select, a dica de lâmpada é ocultada e aparece a seção: **"Filtro do Plano de Abastecimento"**.
3. **Cards de Opções de Filtro (Seleção Única / Radio Cards)**:
   - **Opção 1: Plano completo (Padrão Selecionado)**
     - Radio button roxo marcado e card com contorno roxo ativo.
     - Título: **Plano completo**.
     - Descrição: *"Exibe todos os produtos do plano."*
   - **Opção 2: Apenas produtos com saldo menor que o estoque ideal**
     - Título: **Apenas produtos com saldo menor que o estoque ideal**.
     - Descrição: *"Filtra produtos com necessidade de reposição."*
   - **Opção 3: Apenas produtos com saldo menor que o crítico**
     - Título: **Apenas produtos com saldo menor que o crítico**.
     - Descrição: *"Filtra produtos em nível crítico de ruptura."*

---

### 3.3 Ações do Usuário e Regras de Negócio
* **RN07 - Reatividade ao Selecionar um Plano**:
  - A seleção de um plano de abastecimento é o gatilho que faz os 3 radio cards de filtro aparecerem na tela. Se o usuário voltar o select para *Nenhum plano*, esses filtros devem sumir e a dica com ícone de lâmpada deve reaparecer.
* **RN08 - Regra do Filtro "Plano Completo"**:
  - O sistema carregará na tela de consulta **todos os produtos** cadastrados naquele plano, mesmo aqueles que estiverem com estoque suficiente na loja (com sugestão zero).
* **RN09 - Regra do Filtro "Apenas produtos com saldo menor que o estoque ideal"**:
  - O sistema filtrará e trará apenas os produtos da loja onde o estoque atual for menor do que a meta ideal definida no plano ($\text{Estoque Loja} < \text{Estoque Ideal}$).
* **RN10 - Regra do Filtro "Apenas produtos com saldo menor que o crítico"**:
  - O sistema filtrará e trará apenas os produtos que atingiram nível crítico ou estoque zerado ($\text{Estoque Loja} \le \text{Mínimo Crítico}$).
* **RN11 - Seleção Exclusiva de Filtro**:
  - Apenas 1 dos 3 cards de filtro pode estar selecionado por vez. Ao clicar em um card, a seleção visual e o botão de rádio mudam imediatamente.
* **RN12 - Ação ao Clicar em "CONSULTAR"**:
  - O sistema realiza a busca dos itens da loja `Mini Mercado 01` cruzando com as metas do `Plano MiniMercado 03` e o filtro escolhido, abrindo a tela de consulta com as quantidades sugeridas já calculadas automaticamente.

---

### 3.4 Critérios de Validação para QA
- [ ] Ao escolher um plano válido no select, os 3 cards de filtro de plano devem aparecer na hora.
- [ ] O código identificador de cada filial e do plano deve ser atualizado no canto direito dos selects.
- [ ] O card "Plano completo" deve vir selecionado por padrão com borda roxa ativa.
- [ ] O usuário deve conseguir alternar entre as 3 opções de filtro clicando em qualquer área do card.
- [ ] Clicar em "CONSULTAR" com os parâmetros preenchidos deve carregar a tela de consulta com os produtos e sugestões corretas de acordo com o filtro selecionado.
