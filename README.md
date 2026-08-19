# Goflash CORE - Protótipo Navegável

Protótipo navegável interativo e responsivo do sistema ERP **Goflash CORE**, desenvolvido com tecnologias web nativas (HTML5 semântico, CSS3 moderno com Material Design e JavaScript Vanilla).

---

## 🚀 Como Executar

Por ser um projeto puramente estático (sem dependência de compilação ou frameworks pesados):

1. Abra o arquivo [`index.html`](file:///c:/Users/Aldo%20Farias/Documents/Projetos%20DEV/B2U/Protótipo%20Navegavel%20Core/index.html) diretamente em qualquer navegador moderno (Chrome, Edge, Firefox, Safari) ou utilize uma extensão de servidor local como *Live Server* no VSCode.
2. Acesse a tela de login.

---

## 🔐 Acesso ao Protótipo

As credenciais de autenticação são fornecidas diretamente pela equipe da **B2U Sistemas**.

---

## 📁 Estrutura do Projeto

```
Protótipo Navegavel Core/
├── assets/
│   ├── css/
│   │   ├── global.css        # Tokens globais, variáveis de cores, resets e tipografia
│   │   ├── components.css    # Inputs Material, botões, checkbox e sistema de toast
│   │   ├── login.css         # Estilização da tela de login e centralização
│   │   └── dashboard.css     # Layout do ERP (Sidebar, Appbar e cards de módulos)
│   ├── js/
│   │   ├── auth.js           # Validação de credenciais, sessão e animação
│   │   └── toast.js          # Sistema leve de feedback e alertas
│   └── images/
│       └── logo-goflash.svg  # Logotipo vetorial em alta definição
├── pages/
│   └── dashboard.html        # Painel principal do ERP pós-login
├── index.html                # Tela inicial de autenticação
└── README.md                 # Documentação do projeto
```

---

## 📱 Recursos de Responsividade

- Suporte completo a **Desktop, Notebooks, Tablets e Smartphones**.
- Unidades modernas (`dvh` e `clamp`) para evitar quebras em teclados virtuais mobile.
- Menu lateral adaptativo com gaveta (drawer/sidebar) retrátil em telas móveis.
- Feedback tátil com efeito ripple e áreas de clique ergonômicas (mínimo de 44-48px).
