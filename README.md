# SmartCart

Carrinho de supermercado inteligente que identifica produtos automaticamente, calcula o total em tempo real e permite pagamento sem fila.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Licença](https://img.shields.io/badge/License-MIT-blue)

---

## Stack

| Camada         | Tecnologia                     |
| -------------- | ------------------------------ |
| Frontend       | React 19 + Vite + Tailwind CSS |
| Backend        | PHP 8.2                        |
| Banco de dados | MySQL                          |
| Autenticação   | JWT                            |

---

## Pré-requisitos

- Node.js v18+
- PHP 8.2+ e [Composer](https://getcomposer.org/download/) — https://getcomposer.org/download/ (ou Docker Desktop)
- MySQL (ou [MySQL Workbench](https://dev.mysql.com/downloads/workbench/), se preferir rodar o schema pela interface gráfica)

---

## Instalação

### Opção A — com Docker (recomendado)

Não precisa instalar PHP nem Composer. Apenas o [Docker Desktop](https://www.docker.com/products/docker-desktop/) com WSL 2 habilitado.

#### 1. Clone o repositório

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

#### 2. Configure o backend

```bash
Copy-Item modern/backend/.env.example modern/backend/.env
# Preencha as variáveis no modern/backend/.env
```

#### 3. Suba o backend

```bash
docker compose up --build
```

Na primeira execução o Composer instala as dependências automaticamente (não precisa instalar nada manualmente nesse caso).

#### 4. Frontend

```bash
cd modern/frontend
Copy-Item .env.example .env   # defina VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

---

### Opção B — instalação manual

#### 1. Clone o repositório

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

#### 2. Banco de dados

O schema do banco fica em `modern/backend/database/schema.sql`. Você pode rodá-lo de duas formas — escolha a que preferir:

**Opção 1 — pelo terminal (mysql CLI)**

```bash
mysql -u root -p < modern/backend/database/schema.sql
```

**Opção 2 — pelo MySQL Workbench**

1. Abra o MySQL Workbench e conecte na sua instância local do MySQL.
2. Crie uma nova aba de query (ícone de folha com um "+", ou `Ctrl+T`).
3. Abra o arquivo `modern/backend/database/schema.sql` no seu editor de código, copie **todo** o conteúdo dele.
4. Cole o conteúdo copiado na aba de query do Workbench.
5. Execute o script inteiro clicando no ícone de raio (⚡) na barra de ferramentas, ou pressionando `Ctrl+Shift+Enter`.
6. No painel **Schemas** (lado esquerdo), clique com o botão direito e em **Refresh All** para confirmar que o banco `smartcart` (e suas tabelas) foi criado com sucesso.

> 💡 Depois de rodar o script, confira se as credenciais de conexão (host, usuário, senha e porta) que você vai usar no `.env` do backend são as mesmas configuradas no Workbench.

#### 3. Backend

Instale as dependências PHP com o Composer. Se ainda não tiver instalado, baixe em: https://getcomposer.org/download/

```bash
cd modern/backend
composer install
Copy-Item .env.example .env   # preencha as variáveis no .env
cd public
php -S localhost:3001 index.php
```

#### 4. Frontend

```bash
cd modern/frontend
Copy-Item .env.example .env   # defina VITE_API_URL=http://localhost:3001
npm install
npm run dev
```

---

## Acessos

|       | URL                                 | Credenciais                      |
| ----- | ------------------------------------ | --------------------------------- |
| Site  | http://localhost:5173               | —                                 |
| Admin | http://localhost:5173/admin/login   | admin@smartcart.com / admin123    |
| API   | http://localhost:3001               | —                                 |

---

## Documentação

Documentação técnica completa em [`docs/architecture/`](https://github.com/nicolas-vmaria/SmartCart/blob/main/docs/architecture).
