# SmartCart

Carrinho de supermercado inteligente que identifica produtos automaticamente, calcula o total em tempo real e permite pagamento sem fila.

![Status](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Licença](https://img.shields.io/badge/License-MIT-blue)

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS |
| Backend | PHP 8.2 |
| Banco de dados | MySQL |
| Autenticação | JWT |

---

## Pré-requisitos

- Node.js v18+
- PHP 8.2+ e Composer (ou Docker Desktop)
- MySQL

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

Na primeira execução o Composer instala as dependências automaticamente.

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

```bash
mysql -u root -p < modern/backend/database/schema.sql
```

#### 3. Backend

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

| | URL | Credenciais |
|-|-----|-------------|
|Site em Produção | https://smartcart-production-5a73.up.railway.app/ | - |
| Site | http://localhost:5173 | — |
| Admin | http://localhost:5173/admin/login | admin@smartcart.com / admin123 |
| API | http://localhost:3001 | — |

---

## Documentação

Documentação técnica completa em [`docs/architecture/`](./docs/architecture/).
