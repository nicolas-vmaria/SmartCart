# Guia Definitivo de Conteinerização com Docker: Projeto SmartCart

Este guia foi elaborado para explicar **detalhadamente** toda a arquitetura, conceitos, decisões de engenharia e cada linha de código utilizada para transformar o projeto **SmartCart** (PHP 8.4 + React 19/Vite + MySQL 8.0) em um ecossistema 100% conteinerizado e reproduzível com Docker.

---

## Sumário
1. [Conceitos Fundamentais: O que é Docker e por que usá-lo?](#1-conceitos-fundamentais-o-que-é-docker-e-por-que-usá-lo)
2. [Visão Geral da Arquitetura do SmartCart](#2-visão-geral-da-arquitetura-do-smartcart)
3. [A Rede do Docker e Comunicação entre Serviços](#3-a-rede-do-docker-e-comunicação-entre-serviços)
4. [O Container de Banco de Dados (`db` - MySQL 8.0)](#4-o-container-de-banco-de-dados-db---mysql-80)
5. [O Container do Backend (`backend` - PHP 8.4)](#5-o-container-do-backend-backend---php-84)
6. [O Container do Frontend (`frontend` - React 19 + Vite)](#6-o-container-do-frontend-frontend---react-19--vite)
7. [Dissecando o `docker-compose.yml` Linha por Linha](#7-dissecando-o-docker-composeyml-linha-por-linha)
8. [Gotchas e Desafios Reais Superados (Windows, WSL2 e OneDrive)](#8-gotchas-e-desafios-reais-superados-windows-wsl2-e-onedrive)
9. [Checklist Mental & Guia de Bolso para Projetos Futuros](#9-checklist-mental--guia-de-bolso-para-projetos-futuros)

---

## 1. Conceitos Fundamentais: O que é Docker e por que usá-lo?

### O problema clássico: *"Na minha máquina funciona"*
Antes da conteinerização, para executar o SmartCart em um novo computador, era necessário instalar manualmente:
1. **PHP 8.2+ (ou 8.4)** com extensões compiladas (`pdo_mysql`, `curl`, `mbstring`).
2. **Composer** instalado globalmente no sistema operacional.
3. **Servidor MySQL 8.0** local com usuários, senhas e permissões configuradas.
4. **Node.js 20+** e **npm**.
5. Executar scripts SQL manualmente pelo Workbench ou terminal para criar tabelas e dados iniciais.

Se a versão do PHP ou do Node de outra máquina fosse diferente, ou se o MySQL já estivesse rodando em outra porta, o projeto simplesmente não iniciava.

### A solução com Containers
Diferente de uma **Máquina Virtual (VM)** — que emula um hardware completo com placa mãe, BIOS e um sistema operacional hóspede inteiro de dezenas de gigabytes —, o **Docker** isola apenas processos a nível de sistema operacional (usando recursos do kernel Linux como *Namespaces* para isolar redes/processos e *Cgroups* para limitar uso de CPU/memória).

- **Imagem (`Image`):** É o blueprint, um pacote somente-leitura contendo o código, runtime, ferramentas de sistema e bibliotecas necessárias para a aplicação.
- **Container:** É a instância viva e em execução de uma imagem. É rápido, leve e idêntico em qualquer sistema operacional (Windows, Linux, macOS).
- **Docker Compose:** Ferramenta declarativa que permite definir, interconectar e orquestrar múltiplos containers através de um único arquivo YAML (`docker-compose.yml`).

---

## 2. Visão Geral da Arquitetura do SmartCart

O sistema foi estruturado em **3 containers dedicados** operando de forma coordenada:

```
+-----------------------------------------------------------------------------------+
|                                   MÁQUINA HOST                                    |
|       (Navegador: localhost:5173 / 3001  |  DBeaver / Workbench: localhost:3307)  |
+-----------------------------------------------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                       REDE VIRTUAL BRIDGE (smartcart_default)                     |
|                                                                                   |
|   +--------------------------+           +---------------------------------+      |
|   |   smartcart-frontend     |           |        smartcart-backend        |      |
|   |    (Node 20 / Vite)      |           |            (PHP 8.4)            |      |
|   |       Porta 5173         |           |           Porta 3001            |      |
|   +--------------------------+           +---------------------------------+      |
|                 |                                         |                       |
|                 | Requisições HTTP via Navegador          | Conexão PDO           |
|                 +---------------------------------------->| Host: 'db:3306'       |
|                                                           v                       |
|                                          +---------------------------------+      |
|                                          |          smartcart-db           |      |
|                                          |           (MySQL 8.0)           |      |
|                                          |           Porta 3306            |      |
|                                          +---------------------------------+      |
|                                                           |                       |
|                                                           v                       |
|                                          +---------------------------------+      |
|                                          |  Volume: smartcart_mysql_data   |      |
|                                          +---------------------------------+      |
+-----------------------------------------------------------------------------------+
```

---

## 3. A Rede do Docker e Comunicação entre Serviços

Um dos pontos que mais confundem desenvolvedores iniciantes em Docker é como as redes funcionam.

### Resolução de Nomes por DNS Interno
Quando o Docker Compose inicializa, ele cria uma rede virtual privada do tipo **bridge** (`smartcart_default`).
Dentro dessa rede, o Docker possui um servidor DNS interno automático. Isso significa que **os containers conversam entre si usando o próprio nome do serviço**:
- O Backend PHP **NÃO** se conecta ao banco usando `localhost` ou `127.0.0.1`.
- Para o backend, `localhost` seria a sua própria sandbox interna!
- O backend se conecta ao banco através do host **`db`** na porta `3306` (`mysql:host=db;port=3306;dbname=smartcart`).

### E como o Navegador Web acessa a aplicação?
O navegador do usuário está rodando na máquina física (**Host**), fora da rede interna do Docker.
Por esse motivo, utilizamos o mapeamento de portas (`ports:`):
- `5173:5173`: O container do frontend expõe a porta `5173` para a porta `5173` do Host.
- `3001:3001`: O container do backend expõe a porta `3001` para a porta `3001` do Host.
- Quando o React faz chamadas à API via Axios/Fetch, a requisição parte do navegador para `http://localhost:3001`, atingindo a API no backend perfeitamente.

---

## 4. O Container de Banco de Dados (`db` - MySQL 8.0)

O serviço do banco de dados no `docker-compose.yml`:

```yaml
  db:
    image: mysql:8.0
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: smartcart
    ports:
      - "3307:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./modern/backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot"]
      interval: 5s
      timeout: 5s
      retries: 10
```

### O Segredo do `/docker-entrypoint-initdb.d/`
A imagem oficial do MySQL possui um comportamento nativo programado em seu script de entrada (*entrypoint*): na **primeira vez** que o container sobe com o diretório `/var/lib/mysql` vazio, ela varre o diretório `/docker-entrypoint-initdb.d/` e executa automaticamente qualquer script `.sql` ali presente, em ordem alfabética.
- Mapeamos: `./modern/backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro`.
- O modificador `:ro` (*read-only*) garante que o container possa apenas ler o arquivo, protegendo o arquivo original no seu disco.
- Com isso, **todas as 18 tabelas, configurações, papéis e o usuário administrador padrão são criados sozinhos no primeiro boot**!

### O Ajuste Crítico no `schema.sql` (Idempotência)
No arquivo original, a linha 1 continha:
```sql
create database smartcart;
```
Como definimos no Docker `MYSQL_DATABASE: smartcart`, o próprio motor do MySQL criava o banco milissegundos antes de rodar os scripts de inicialização. Ao tentar executar `create database smartcart;`, o MySQL travava com o erro fatal `1007 (HY000): database exists`.
Ajustamos para:
```sql
CREATE DATABASE IF NOT EXISTS smartcart;
USE smartcart;
```
Isso tornou o script idempotente (capaz de rodar sem falhar, independentemente de o banco já existir ou não).

### Mapeamento de Portas (`3307:3306`): Evitando Conflitos no Windows
A sintaxe é sempre `PORTA_NO_HOST : PORTA_NO_CONTAINER`.
- Internamente, o MySQL sempre opera na sua porta padrão `3306`.
- Externamente (no Windows), mapeamos para **`3307`**.
- **Motivo de Engenharia:** Se você ou qualquer pessoa já tiver um MySQL, MariaDB ou XAMPP instalado localmente no Windows escutando na porta 3306, o Docker apresentaria o erro `ports are not available: listen tcp 0.0.0.0:3306: bind: endereço já em uso`. Usando a porta `3307`, eliminamos completamente a chance de conflito. Para acessar o banco via DBeaver ou Workbench no Windows, basta conectar em `localhost:3307`.

### Volume Persistente (`mysql_data`)
Containers são efêmeros por definição. Se você encerrar um container sem volumes montados, todos os dados gravados nele desaparecem.
O volume nomeado `mysql_data:/var/lib/mysql` armazena os dados fora do container, gerenciado pelo Docker. Você pode desligar seu computador, atualizar imagens ou recriar containers que os dados do banco de dados continuam salvos.

### Healthcheck (`mysqladmin ping`)
O MySQL demora alguns segundos para inicializar os motores de armazenamento (InnoDB), ler logs e abrir portas de socket.
Se o backend PHP tentasse se conectar imediatamente no segundo zero, ele receberia um erro de `Connection refused` (PDOException).
O `healthcheck` dispara o utilitário nativo `mysqladmin ping` a cada 5 segundos. O backend foi configurado para esperar até que o status do banco mude de `Starting` para `Healthy`.

---

## 5. O Container do Backend (`backend` - PHP 8.4)

### Dissecando o `modern/backend/Dockerfile`

```dockerfile
FROM php:8.4-cli

RUN apt-get update && apt-get install -y unzip git && rm -rf /var/lib/apt/lists/*

RUN docker-php-ext-install pdo pdo_mysql

COPY . /var/www/html

WORKDIR /var/www/html

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN composer install --no-dev --optimize-autoloader

EXPOSE ${PORT:-8080}

CMD php -S 0.0.0.0:${PORT:-8080} -t public
```

- `FROM php:8.4-cli`: Utiliza a imagem oficial do PHP 8.4 baseada no Debian Slim (otimizada e segura).
- `RUN apt-get ... unzip git`: O Composer precisa do utilitário `unzip` para descompactar os pacotes distribuídos em formato zip pelo Packagist, e do `git` para resolver dependências de repositórios. O `rm -rf /var/lib/apt/lists/*` remove o cache do gerenciador de pacotes Debian, reduzindo dezenas de megabytes da imagem final.
- `RUN docker-php-ext-install pdo pdo_mysql`: O PHP oficial vem sem os drivers do banco de dados compilados. Este comando compila o driver PDO nativo para MySQL diretamente no binário do PHP.
- `RUN curl ... composer`: Faz o download seguro do instalador oficial do Composer e o disponibiliza globalmente no PATH do sistema (`/usr/local/bin/composer`).
- `RUN composer install --no-dev --optimize-autoloader`: Instala as bibliotecas de produção e gera o mapa de classes otimizado em memória (*classmap*), acelerando a resolução de classes no runtime.

### O Comando de Inicialização no Compose
```bash
bash -c "[ -d vendor ] || composer install --no-interaction; php -d display_errors=On -d error_reporting=E_ALL -d log_errors=On -d error_log=/dev/stderr -S 0.0.0.0:3001 -t public public/index.php"
```
1. `[ -d vendor ] || composer install`: Como montamos a pasta do host no container (`./modern/backend:/var/www/html`), o container enxerga os arquivos locais. Se na sua máquina a pasta `vendor` ainda não existia, o container instala as dependências automaticamente sem que você precise rodar nada.
2. `php -S 0.0.0.0:3001 -t public public/index.php`:
   - **Por que `0.0.0.0` e não `localhost`?** Dentro de um container, se o PHP escutar em `localhost`, ele responderá **apenas** a chamadas originadas de dentro da própria sandbox do container. Usando `0.0.0.0`, ele faz o bind em todas as interfaces de rede, permitindo receber conexões vindas do Host e de outros containers.
   - `-t public`: Define a pasta pública onde residem os arquivos estáticos.
   - `public/index.php`: Atua como *Front Controller*, interceptando e roteando todas as requisições HTTP da aplicação.

### O Ajuste de Precedência de Variáveis no PHP (`index.php`)
No arquivo `modern/backend/public/index.php`, a linha original continha:
```php
$_ENV = array_merge(getenv(), $_ENV);
```
No PHP, a função `array_merge($a, $b)` faz com que os elementos do segundo array (`$b`) sobrescrevam os do primeiro (`$a`). Isso fazia com que qualquer valor do arquivo `.env` estático tivesse prioridade sobre as variáveis injetadas pelo container do Docker.
Invertemos para:
```php
$_ENV = array_merge($_ENV, getenv());
```
Com essa alteração, as variáveis passadas pelo Docker Compose (`DB_HOST=db`, `DB_USER=root`, `DB_PASS=root`) ganham prioridade absoluta, garantindo a conectividade imediata.

### O Arquivo `modern/backend/.dockerignore`
Criamos o `.dockerignore` contendo `vendor` e `.git`. Isso impede que pastas pesadas locais sejam transferidas desnecessariamente para o contexto de build do Docker, tornando o `docker compose build` muito mais rápido.

---

## 6. O Container do Frontend (`frontend` - React 19 + Vite)

### Multi-Stage Build no `modern/frontend/Dockerfile`
Aplicamos o padrão profissional **Multi-Stage Build**, que separa os estágios de compilação e execução:

```dockerfile
# Estágio 1: Desenvolvimento com Live Reload
FROM node:20-alpine AS development

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Estágio 2: Builder de Produção
FROM development AS builder

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Estágio 3: Servidor Web Nginx de Produção
FROM nginx:alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Benefícios dessa arquitetura:**
- Para o desenvolvimento diário, o Docker Compose executa `target: development`. Ele sobe o Vite Dev Server com **Hot Module Replacement (HMR)** ativo na porta 5173.
- Para deploy em produção (nuvem ou servidor real), o comando `docker build --target production .` gera uma imagem estática mínima servida pelo Nginx na porta 80, sem carregar o Node.js em produção.

### O Volume Anônimo do `node_modules`
No `docker-compose.yml`, configuramos dois volumes para o frontend:
```yaml
    volumes:
      - ./modern/frontend:/app
      - /app/node_modules
```
**Por que essa segunda linha (`/app/node_modules`) é indispensável?**
Ela cria um **volume anônimo** gerenciado pelo Docker.
Se montássemos apenas `./modern/frontend:/app`, a pasta do seu computador (Windows) iria sobrepor todo o diretório `/app` do container. Se a sua máquina não tivesse a pasta `node_modules`, o container ficaria sem pacotes; ou pior, se você tivesse bibliotecas com binários nativos compilados para Windows, elas causariam falhas fatais no ambiente Linux do container.
O volume anônimo preserva a pasta `/app/node_modules` intacta dentro do Linux do container, mesmo com a pasta de código montada!

### O Ajuste no `vite.config.js` para Windows / WSL2 / OneDrive
No Windows, especialmente ao trabalhar em diretórios sincronizados pelo OneDrive ou via WSL2, o sistema de arquivos muitas vezes não emite notificações normais de alteração (`inotify`) para dentro de containers Linux.
Para garantir que o Hot Reload funcione instantaneamente ao salvar qualquer arquivo no VS Code, configuramos:
```javascript
  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: {
      usePolling: true, // Monitora ativamente mudanças nos arquivos
    },
  },
```

---

## 7. Dissecando o `docker-compose.yml` Linha por Linha

Aqui está a análise detalhada de cada bloco do arquivo de orquestração:

```yaml
services:
  # ==========================================
  # SERVIÇO 1: BANCO DE DADOS (MySQL)
  # ==========================================
  db:
    image: mysql:8.0                       # Imagem estável e oficial do MySQL
    restart: unless-stopped                # Reinicia automaticamente em caso de crash
    environment:
      MYSQL_ROOT_PASSWORD: root            # Define senha do superusuário root
      MYSQL_DATABASE: smartcart            # Cria a database 'smartcart' automaticamente
    ports:
      - "3307:3306"                        # Porta 3307 no Host -> Porta 3306 no Container
    volumes:
      - mysql_data:/var/lib/mysql          # Salva os arquivos do banco no volume persistente
      - ./modern/backend/database/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-u", "root", "-proot"]
      interval: 5s                         # Checa a cada 5 segundos
      timeout: 5s                          # Timeout de resposta
      retries: 10                          # Tenta até 10 vezes antes de considerar falho

  # ==========================================
  # SERVIÇO 2: API BACKEND (PHP 8.4)
  # ==========================================
  backend:
    build:
      context: ./modern/backend            # Constrói a partir do Dockerfile do backend
    ports:
      - "3001:3001"                        # Disponibiliza a API em http://localhost:3001
    volumes:
      - ./modern/backend:/var/www/html     # Espelha o código local (edição em tempo real)
    env_file:
      - path: ./modern/backend/.env
        required: false                    # Permite inicializar mesmo se o .env não existir
    environment:
      - DB_HOST=db                         # Aponta para o container do MySQL via DNS
      - DB_NAME=smartcart
      - DB_USER=root
      - DB_PASS=root
      - DB_PORT=3306
    depends_on:
      db:
        condition: service_healthy         # Espera o MySQL passar no teste de ping
    command: bash -c "[ -d vendor ] || composer install --no-interaction; php -d display_errors=On -d error_reporting=E_ALL -d log_errors=On -d error_log=/dev/stderr -S 0.0.0.0:3001 -t public public/index.php"

  # ==========================================
  # SERVIÇO 3: INTERFACE FRONTEND (React)
  # ==========================================
  frontend:
    build:
      context: ./modern/frontend
      target: development                  # Executa o primeiro estágio (dev server)
    ports:
      - "5173:5173"                        # Disponibiliza o site em http://localhost:5173
    volumes:
      - ./modern/frontend:/app             # Espelha o código React local
      - /app/node_modules                  # Isola o node_modules interno do container Linux
    env_file:
      - path: ./modern/frontend/.env
        required: false
    environment:
      - VITE_API_URL=http://localhost:3001
      - CHOKIDAR_USEPOLLING=true           # Garante detecção de mudanças no Windows
    command: npm run dev -- --host 0.0.0.0
    depends_on:
      - backend

# Declaração dos volumes nomeados gerenciados pelo Docker
volumes:
  mysql_data:

# Configurações de rede
networks:
  default:
    driver: bridge
    driver_opts:
      com.docker.network.driver.mtu: "1400"  # Otimização de MTU para redes WSL2
```

---

## 8. Gotchas e Desafios Reais Superados (Windows, WSL2 e OneDrive)

Durante a conteinerização deste ecossistema, nos deparamos com problemas práticos que ocorrem frequentemente em projetos profissionais:

1. **Conflito de Porta 3306 no Windows:**
   - *Problema:* A porta padrão 3306 estava ocupada por um serviço Windows pré-existente.
   - *Solução:* Mapeamos a porta pública do host para `3307`, mantendo `3306` na rede interna Docker.
2. **Precedência de Variáveis no PHP:**
   - *Problema:* O arquivo `.env` local sobrescrevia os valores do Docker por causa do `array_merge(getenv(), $_ENV)`.
   - *Solução:* Invertemos para `$_ENV = array_merge($_ENV, getenv())`, garantindo que o Docker forneça os valores corretos de rede.
3. **Resiliência a Arquivos Ausentes com `required: false`:**
   - *Problema:* Se um usuário clonasse o repositório do zero e executasse `docker compose up`, o Docker falharia dizendo que o arquivo `.env` não foi encontrado.
   - *Solução:* Configuramos `path: ... required: false` com variáveis padrão injetadas via bloco `environment:`, permitindo que o sistema suba perfeitamente mesmo sem nenhum `.env` criado.
4. **Proteção de Credenciais com `.gitignore` Global:**
   - Criamos proteção em camadas para assegurar que nenhum arquivo de configuração local contendo senhas reais ou chaves de API seja rastreado acidentalmente pelo Git.

---

## 9. Checklist Mental & Guia de Bolso para Projetos Futuros

Ao planejar a conteinerização de qualquer sistema web moderno, siga este roteiro de 5 passos:

### 1. Separação de Responsabilidades
- **1 Container = 1 Processo principal.** Não tente colocar PHP, Nginx e MySQL no mesmo container. Mantenha-os separados para poder escalá-los e reiniciá-los de forma independente.

### 2. Definição da Rede e Comunicação
- Containers conversam entre si usando o **nome do serviço** (ex: `host: 'db'`).
- O navegador do cliente conversa com as portas mapeadas no **Host** (ex: `localhost:5173`).

### 3. Gerenciamento de Dados e Volumes
- **Dados que mudam e devem persistir (banco de dados, uploads de mídia):** use volumes nomeados (`meu_volume:/var/lib/mysql`).
- **Código-fonte em desenvolvimento:** use bind mounts (`./src:/app/src`).
- **Dependências de compilação (node_modules):** use volumes anônimos para evitar sobrescrita pelo host.

### 4. Ordem e Saúde dos Serviços
- Não confie apenas no `depends_on` simples para bancos de dados. Utilize sempre `healthcheck` (`mysqladmin ping`, `pg_isready`) associado a `condition: service_healthy`.

### 5. Tabela de Comandos Essenciais para o Dia a Dia

| Comando | O que faz na prática |
| :--- | :--- |
| `docker compose up --build` | Constrói as imagens e inicia todos os containers com logs no terminal |
| `docker compose up -d` | Inicia todos os containers em segundo plano (*detached*) |
| `docker compose down` | Para e remove os containers e redes, **preservando o banco de dados** |
| `docker compose down -v` | Para e remove tudo, **apagando os volumes** (reseta o banco do zero) |
| `docker compose logs -f [servico]` | Acompanha os logs ao vivo de um container (ex: `docker compose logs -f backend`) |
| `docker compose ps` | Lista o status de saúde e portas de todos os containers |
| `docker exec -it [container] bash` | Abre um terminal interativo dentro do container em execução |
