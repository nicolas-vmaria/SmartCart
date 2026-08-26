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

### Para instalação com Docker

* Windows 10/11 com suporte ao WSL 2
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* Conta Docker para login, caso solicitado durante a configuração

> 💡 Com Docker, **não é necessário instalar PHP ou Composer manualmente**, pois o ambiente do backend é configurado automaticamente pelos containers.

### Para instalação manual

* Node.js v18+
* PHP 8.2+
* [Composer](https://getcomposer.org/download/)
* MySQL
* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) — opcional, caso prefira executar o schema pela interface gráfica

---

## Instalação

### Opção A — Instalação com Docker (recomendado)

Esta é a forma mais simples de executar o projeto, pois o Docker configura o ambiente do backend automaticamente. Dessa forma, você não precisa instalar o PHP ou o Composer manualmente.

#### 1. Instale o Docker Desktop

Antes de começar, é necessário instalar o **Docker Desktop** no computador.

Baixe e instale o Docker Desktop pelo site oficial:

https://www.docker.com/products/docker-desktop/

Durante a instalação, mantenha o **WSL 2** habilitado quando essa opção for apresentada. Em versões recentes do Windows, o Docker Desktop pode solicitar configurações adicionais do WSL.

Após a instalação:

1. Abra o **Docker Desktop**.
2. Aguarde até que ele esteja totalmente iniciado.
3. Se necessário, faça login na sua conta Docker.

> ⚠️ **Importante:** o Docker Desktop precisa estar aberto e em execução antes de utilizar os comandos `docker` ou `docker compose` no terminal.

Você pode verificar se o Docker está funcionando executando:

```bash
docker --version
```

E:

```bash
docker compose version
```

Se os dois comandos exibirem suas respectivas versões, o Docker está configurado corretamente.

#### 2. Clone o repositório

Com o Docker Desktop aberto e funcionando, abra o PowerShell ou outro terminal e clone o projeto:

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

#### 3. Configure o backend

Crie o arquivo `.env` do backend a partir do arquivo de exemplo:

```powershell
Copy-Item modern/backend/.env.example modern/backend/.env
```

Depois, abra o arquivo:

```text
modern/backend/.env
```

e preencha as variáveis de ambiente necessárias para o projeto.

#### 4. Inicie o backend com Docker

Na pasta principal do projeto, execute:

```bash
docker compose up --build
```

Na primeira execução, o Docker irá criar os containers e instalar automaticamente as dependências do backend, incluindo as dependências do Composer.

> 💡 **Importante:** a primeira execução pode demorar um pouco mais, pois o Docker precisa baixar as imagens necessárias, criar os containers e instalar as dependências.

Depois que o processo terminar, mantenha esse terminal aberto enquanto estiver utilizando o backend.

#### 5. Configure e execute o frontend

Abra **outro terminal**. Não é necessário fechar o terminal onde o Docker está executando.

Entre na pasta do frontend:

```bash
cd modern/frontend
```

Crie o arquivo `.env`:

```powershell
Copy-Item .env.example .env
```

Abra o arquivo `.env` e confirme que a URL da API está configurada como:

```env
VITE_API_URL=http://localhost:3001
```

Depois, instale as dependências do frontend:

```bash
npm install
```

Por fim, inicie o frontend:

```bash
npm run dev
```

Após isso, o sistema estará disponível em:

```text
http://localhost:5173
```

> 💡 **Resumo:** para utilizar o SmartCart com Docker, você precisa ter o **Docker Desktop instalado, aberto e em execução**, além de estar logado no Docker quando solicitado. O PHP e o Composer não precisam ser instalados manualmente.

---

### Opção B — Instalação manual

Caso você não queira utilizar Docker, é possível configurar o PHP, Composer, MySQL e Node.js diretamente no computador.

#### 1. Clone o repositório

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

#### 2. Banco de dados

O schema do banco fica em:

```text
modern/backend/database/schema.sql
```

Você pode executá-lo de duas formas — escolha a que preferir.

**Opção 1 — pelo terminal (MySQL CLI)**

```bash
mysql -u root -p < modern/backend/database/schema.sql
```

**Opção 2 — pelo MySQL Workbench**

1. Abra o MySQL Workbench e conecte na sua instância local do MySQL.
2. Crie uma nova aba de query (ícone de folha com um "+", ou `Ctrl+T`).
3. Abra o arquivo `modern/backend/database/schema.sql` no seu editor de código e copie **todo** o conteúdo.
4. Cole o conteúdo copiado na aba de query do Workbench.
5. Execute o script inteiro clicando no ícone de raio (⚡) na barra de ferramentas, ou pressionando `Ctrl+Shift+Enter`.
6. No painel **Schemas**, no lado esquerdo, clique com o botão direito e selecione **Refresh All** para confirmar que o banco `smartcart` e suas tabelas foram criados com sucesso.

> 💡 Depois de executar o script, confira se as credenciais de conexão (host, usuário, senha e porta) utilizadas no `.env` do backend são as mesmas configuradas na sua instância do MySQL.

#### 3. Backend

Instale as dependências PHP com o Composer.

Se ainda não tiver o Composer instalado, baixe pelo site oficial:

https://getcomposer.org/download/

Depois:

```bash
cd modern/backend
composer install
```

Crie o arquivo `.env`:

```powershell
Copy-Item .env.example .env
```

Preencha as variáveis necessárias no arquivo `.env`.

Depois, entre na pasta `public` e inicie o servidor:

```bash
cd public
php -S localhost:3001 index.php
```

#### 4. Frontend

Abra outro terminal e entre na pasta do frontend:

```bash
cd modern/frontend
```

Crie o arquivo `.env`:

```powershell
Copy-Item .env.example .env
```

Defina a URL da API:

```env
VITE_API_URL=http://localhost:3001
```

Instale as dependências:

```bash
npm install
```

Inicie o frontend:

```bash
npm run dev
```

---

## Acessos

| Serviço | URL                               | Credenciais                        |
| ------- | --------------------------------- | ---------------------------------- |
| Site    | http://localhost:5173             | —                                  |
| Admin   | http://localhost:5173/admin/login | `admin@smartcart.com` / `admin123` |
| API     | http://localhost:3001             | —                                  |

---

## Documentação

A documentação técnica completa do projeto está disponível em:

[`docs/architecture/`](https://github.com/nicolas-vmaria/SmartCart/tree/main/docs/architecture)

---

## Licença

Este projeto está licenciado sob a licença MIT.
