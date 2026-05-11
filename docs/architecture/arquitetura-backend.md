# Arquitetura do Backend — SmartCart

## Visão Geral

O backend é uma API REST escrita em **PHP 8.2 puro**, sem frameworks. Segue o padrão **MVC em camadas** (Routes → Controller → Service → Repository → Database), com autenticação via **JWT**.

```
HTTP Request
     │
     ▼
 index.php          ← entry point, carrega .env, CORS, inclui rotas
     │
     ▼
  Router.php        ← faz match da rota e chama o Controller
     │
     ▼
 Controller         ← recebe a request, chama o Service, retorna JSON
     │
     ▼
  Service           ← regras de negócio
     │
     ▼
 Repository         ← queries SQL via PDO
     │
     ▼
 Connection.php     ← singleton PDO → MySQL
```

---

## Camadas

### 1. Entry Point — `public/index.php`

Único arquivo exposto publicamente. Responsável por:

- Carregar variáveis de ambiente via `vlucas/phpdotenv`
- Definir headers CORS
- Responder requisições `OPTIONS` (preflight)
- Incluir todos os arquivos de rotas
- Disparar o `$router->dispatch()`

> O servidor deve sempre apontar para `public/` como document root.

---

### 2. Router — `src/core/Router.php`

Roteador minimalista sem dependências externas.

- Registra rotas com `get()`, `post()`, `put()`, `delete()`
- Converte parâmetros `{id}` em grupos de captura regex
- No `dispatch()`:
  1. Lê `REQUEST_METHOD` e `REQUEST_URI`
  2. Remove o base path (`dirname(SCRIPT_NAME)`)
  3. Itera as rotas até encontrar match
  4. Instancia o Controller e chama o método com os parâmetros
  5. Retorna 404 se nenhuma rota bater

```php
// Exemplo de registro
$router->get('/product/{id}', [ProductController::class, 'show']);

// Pattern gerado internamente
#^/product/([^/]+)$#
```

---

### 3. Controller — `src/controller/`

Responsável apenas por:

- Ler o body da request (`json_decode(file_get_contents('php://input'))`)
- Chamar o método correto do Service
- Fazer `echo json_encode(...)` da resposta

Não contém lógica de negócio. Controllers admin também chamam `AuthMiddleware::handle()` no construtor para proteger todos os endpoints.

```php
public function __construct() {
    AuthMiddleware::handle(); // bloqueia se token inválido
    $this->service = new AdminProductService();
}
```

---

### 4. Service — `src/service/`

Camada de regras de negócio. Recebe dados já parseados do Controller, processa e chama o Repository quando precisa de dados.

Exemplo real (`AdminAuthService`):
1. Lê `email` e `senha` do body
2. Chama `UserRepository::findByEmail()`
3. Valida senha com `password_verify()`
4. Verifica se `role === 'admin'` (retorna 403 se não)
5. Gera JWT com `Jwt::generate()`
6. Retorna token + dados do usuário

---

### 5. Repository — `src/repository/`

Única camada que toca o banco de dados. Usa PDO com prepared statements.

```php
// Exemplo
public function findByEmail(string $email): ?array {
    $stmt = $this->db->prepare('
        SELECT u.id, u.nome, u.email, u.senha, r.nome AS role
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.email = ?
    ');
    $stmt->execute([$email]);
    return $stmt->fetch() ?: null;
}
```

---

### 6. Connection — `src/core/connection.php`

Singleton PDO. Garante uma única conexão por ciclo de vida da request.

- Lê `DB_HOST`, `DB_NAME`, `DB_USER`, `DB_PASS`, `DB_PORT` do `.env`
- Configura `ERRMODE_EXCEPTION` e `FETCH_ASSOC`
- Charset `utf8mb4`

---

### 7. Middleware — `src/middleware/AuthMiddleware.php`

Executado no construtor dos controllers admin.

```
Authorization: Bearer <token>
        │
        ▼
  Jwt::verify()
        │
   ┌────┴────┐
válido     inválido/expirado
   │             │
continua      exit(401)
```

---

### 8. JWT — `src/core/Jwt.php`

Implementação própria de JWT com HMAC-SHA256.

| Método | Descrição |
|--------|-----------|
| `generate(array $payload)` | Cria token com expiração de 8 horas |
| `verify(string $token)` | Valida assinatura e expiração, retorna payload |

O secret vem de `$_ENV['JWT_SECRET']`.

---

## Fluxo de Autenticação Admin

```
POST /admin/auth/login
        │
        ▼
AdminAuthController::login()
        │
        ▼
AdminAuthService::login()
  ├── UserRepository::findByEmail()
  ├── password_verify()
  ├── verifica role === 'admin'
  └── Jwt::generate(['userId', 'email', 'role'])
        │
        ▼
{ token: "eyJ...", user: { ... } }
```

O frontend armazena o token em `localStorage` como `admin_token`. Nas próximas requests, o Axios interceptor adiciona `Authorization: Bearer <token>` automaticamente.

---

## Fluxo de Request Protegida

```
GET /admin/product
  + Authorization: Bearer eyJ...
        │
        ▼
AdminProductController::__construct()
  └── AuthMiddleware::handle()
        ├── Extrai header Authorization
        ├── Remove "Bearer "
        └── Jwt::verify(token)
              ├── válido → prossegue para getAllProducts()
              └── inválido → http_response_code(401) + exit
```

---

## Como Executar

```bash
# A partir de modern/backend/
php -S localhost:3001 -t public/
```

O `.htaccess` em `public/` é para uso com Apache e não tem efeito no servidor embutido do PHP.

---

## Variáveis de Ambiente (`.env`)

| Variável | Descrição |
|----------|-----------|
| `DB_HOST` | Host do MySQL (ex: `localhost`) |
| `DB_NAME` | Nome do banco (`smartcart`) |
| `DB_USER` | Usuário do MySQL |
| `DB_PASS` | Senha do MySQL |
| `DB_PORT` | Porta do MySQL (padrão `3306`) |
| `JWT_SECRET` | Chave secreta para assinar tokens |
