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

* Windows 10/11 com suporte ao WSL 2 (ou Linux / macOS)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

> 💡 Com Docker, **não é necessário instalar PHP, Composer, Node.js, npm ou MySQL manualmente**, pois todo o ambiente (Frontend, Backend e Banco de Dados) é provisionado e executado automaticamente em containers.

### Para instalação manual (sem Docker)

* Node.js v18+
* PHP 8.2+ (ou 8.4)
* [Composer](https://getcomposer.org/download/)
* MySQL 8.0+
* [MySQL Workbench](https://dev.mysql.com/downloads/workbench/) — opcional, caso prefira executar o schema pela interface gráfica

---

## Instalação

### Opção A — Instalação com Docker (recomendado)

Esta é a forma mais rápida e simples de executar o projeto completo. Um único comando inicializa o **banco de dados MySQL**, o **backend PHP** e o **frontend React**.

#### 1. Instale e abra o Docker Desktop

Baixe e instale o Docker Desktop pelo site oficial:

https://www.docker.com/products/docker-desktop/

Durante a instalação no Windows, mantenha o suporte a **WSL 2** habilitado.

Após a instalação, abra o **Docker Desktop** e aguarde até que ele esteja totalmente iniciado.

Você pode confirmar que o Docker está funcionando executando no terminal:

```bash
docker --version
docker compose version
```

#### 2. Clone o repositório

```bash
git clone https://github.com/nicolas-vmaria/SmartCart.git
cd SmartCart
```

#### 3. Configure as variáveis de ambiente

Crie os arquivos `.env` do backend e do frontend a partir dos modelos:

```powershell
Copy-Item modern/backend/.env.example modern/backend/.env
Copy-Item modern/frontend/.env.example modern/frontend/.env
```

*(No Linux/macOS: `cp modern/backend/.env.example modern/backend/.env && cp modern/frontend/.env.example modern/frontend/.env`)*

> 💡 O `.env` do backend já vem pré-configurado para conectar ao container do banco (`DB_HOST=db`, `DB_USER=root`, `DB_PASS=root`), e o frontend para `http://localhost:3001`. Se desejar, adicione suas credenciais do Brevo (e-mail) ou Gemini no `.env`.

#### 4. Inicie o projeto com Docker

Na pasta raiz do projeto, execute:

```bash
docker compose up --build
```

*(Ou `docker compose up -d` para rodar em segundo plano)*

O Docker irá:
1. **Criar e inicializar o container do MySQL (`db`):** executa automaticamente o script `schema.sql` na primeira vez, criando todas as tabelas e o usuário administrador.
2. **Iniciar o Backend PHP (`backend`):** instala as dependências do Composer e inicia a API em `http://localhost:3001` assim que o banco estiver saudável.
3. **Iniciar o Frontend React + Vite (`frontend`):** instala os pacotes npm e disponibiliza a interface com Hot Reload em `http://localhost:5173`.

> 💡 **Dica:** a primeira execução pode demorar alguns minutos para baixar as imagens e instalar os pacotes. Nas próximas inicializações, o processo é praticamente instantâneo.

Para parar todos os containers, pressione `Ctrl + C` no terminal ou execute:

```bash
docker compose down
```

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

| Serviço                | URL / Porta                       | Credenciais                          |
| ---------------------- | --------------------------------- | ------------------------------------ |
| Frontend (Site)        | http://localhost:5173             | —                                    |
| Painel Admin           | http://localhost:5173/admin/login | `admin@smartcart.com` / `admin123`   |
| Backend (API)          | http://localhost:3001             | —                                    |
| Banco de Dados (MySQL) | `localhost:3307`                  | `root` / `root` (banco: `smartcart`) |

---

## Documentação

A documentação técnica completa do projeto está disponível em:

[`docs/architecture/`](https://github.com/nicolas-vmaria/SmartCart/tree/main/docs/architecture)

---

## Licença

Este projeto está licenciado sob a licença MIT.
