# SmartCart

> Um carrinho de supermercado inteligente que automatiza e otimiza a experiência de compra do cliente.

![Status do Projeto](https://img.shields.io/badge/Status-Em%20Desenvolvimento-green)
![Licença](https://img.shields.io/badge/License-MIT-blue)

---

## Sobre o Projeto

O **SmartCart** é um sistema desenvolvido para modernizar a experiência de compras em supermercados. O projeto consiste em um carrinho inteligente capaz de identificar e contabilizar automaticamente os produtos colocados ou retirados de seu interior, eliminando filas e permitindo que o cliente acompanhe o valor total em tempo real.

---

## Tecnologias

- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** PHP 8.2
- **Banco de Dados:** MySQL
- **Autenticação:** JWT

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) (v18+)
- PHP 8.2+
- Composer
- MySQL

---

## Como rodar o projeto

### 1. Clone o repositório

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

### 2. Frontend

```bash
cd modern/frontend
npm install
```

Crie o arquivo `.env` com base no `.env.example`:

```powershell
Copy-Item .env.example .env
```

Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

O frontend estará disponível em `http://localhost:5173`.

---

### 3. Backend

```bash
cd modern/backend
composer install
```

Crie o arquivo `.env` com base no `.env.example`:

```powershell
Copy-Item .env.example .env
```

Preencha as variáveis no `.env`:

```env
JWT_SECRET=sua_chave_secreta_aqui

DB_HOST=localhost
DB_NAME=smartcart
DB_USER=root
DB_PASS=sua_senha_aqui
DB_PORT=3306
```

### 4. Banco de Dados

Execute o script SQL no MySQL para criar as tabelas:

```bash
mysql -u root -p < database/schema.sql
```

Ou abra o arquivo `database/schema.sql` no MySQL Workbench e execute.

### 5. Inicie o servidor PHP

```bash
cd modern/backend/public
php -S localhost:3001 index.php
```

O backend estará disponível em `http://localhost:3001`.

---

## Acesso Admin

Após rodar o SQL, um administrador padrão é criado:

- **E-mail:** admin@smartcart.com
- **Senha:** admin123

Acesse o painel em `http://localhost:5173/admin/login`.
