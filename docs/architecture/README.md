# Documentação do Sistema — SmartCart

Índice de toda a documentação técnica do projeto.

---

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| [arquitetura-backend.md](./arquitetura-backend.md) | Estrutura em camadas do backend PHP, fluxo de request, Router, JWT, Middleware |
| [arquitetura-frontend.md](./arquitetura-frontend.md) | Stack React, roteamento, camada de API, tema, estrutura de pastas |
| [autenticacao.md](./autenticacao.md) | Fluxo completo de login admin, estrutura do JWT, proteção de rotas |
| [banco-de-dados.md](./banco-de-dados.md) | Schema MySQL, tabelas, relacionamentos, script de criação |
| [rotas-api.md](./rotas-api.md) | Todas as rotas da API com métodos HTTP e descrições |
| [variaveis-ambiente.md](./variaveis-ambiente.md) | Variáveis `.env` do backend e frontend |

---

## Visão Rápida

```
SmartCart/
├── modern/
│   ├── backend/       ← API REST em PHP 8.2 puro
│   │   ├── public/    ← entry point (php -S localhost:3001 -t public/)
│   │   ├── src/       ← controllers, services, repositories, core
│   │   └── database/  ← schema.sql
│   └── frontend/      ← SPA em React 19 + Vite + Tailwind
│       └── src/       ← pages, components, api, context
└── docs/
    └── sistema/       ← esta documentação
```
