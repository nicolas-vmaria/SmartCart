# Autenticação — SmartCart

O sistema usa **JWT (JSON Web Token)** com algoritmo **HMAC-SHA256** para autenticar administradores. A implementação é própria, sem bibliotecas externas.

---

## Fluxo de Login Admin

```
1. Frontend envia POST /admin/auth/login
   { "email": "admin@smartcart.com", "senha": "admin123" }

2. AdminAuthController → AdminAuthService::login()

3. Service busca usuário:
   UserRepository::findByEmail($email)
   → SELECT u.*, r.nome AS role FROM users u JOIN roles r ...

4. Valida senha:
   password_verify($senha, $user['senha'])
   → false → 401 Unauthorized

5. Verifica papel:
   $user['role'] === 'admin'
   → false → 403 Forbidden

6. Gera token:
   Jwt::generate(['userId' => ..., 'email' => ..., 'role' => ...])
   → "eyJ..." (válido por 8 horas)

7. Resposta:
   { "token": "eyJ...", "user": { "id", "nome", "email", "role" } }

8. Frontend salva em localStorage:
   localStorage.setItem('admin_token', token)
```

---

## Estrutura do JWT

```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9   ← header (base64)
.
eyJ1c2VySWQiOjEsImVtYWlsIjoiLi4uIn0    ← payload (base64)
.
SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV     ← assinatura HMAC-SHA256
```

**Payload:**

| Campo | Descrição |
|-------|-----------|
| `userId` | ID do usuário no banco |
| `email` | E-mail do admin |
| `role` | Papel (`admin`) |
| `iat` | Timestamp de emissão |
| `exp` | Timestamp de expiração (iat + 8h) |

---

## Proteção de Rotas (Backend)

Todo controller admin chama `AuthMiddleware::handle()` no construtor:

```
Request chega com header:
Authorization: Bearer eyJ...
        │
        ▼
AuthMiddleware::handle()
  ├── Header ausente?         → 401 "Token não fornecido"
  ├── Não começa com Bearer?  → 401 "Token inválido"
  └── Jwt::verify(token)
        ├── Assinatura inválida → 401 "Token inválido"
        ├── Token expirado      → 401 "Token expirado"
        └── Válido              → retorna payload, continua request
```

---

## Proteção de Rotas (Frontend)

O componente `ProtectedRoute` verifica se `admin_token` existe no `localStorage`:

```
Acessa /admin/*
        │
        ▼
ProtectedRoute
  ├── admin_token existe? → renderiza a página
  └── não existe?         → redireciona para /admin/login
```

O Axios (`adminApi.js`) injeta o token automaticamente em todas as requests via interceptor:

```javascript
// Request interceptor em adminApi.js
config.headers.Authorization = `Bearer ${localStorage.getItem('admin_token')}`
```

---

## Logout

O logout limpa o `localStorage` inteiramente:

```javascript
// AdminMenu.jsx
onClick={() => localStorage.clear()}
```

Não há invalidação de token no servidor — o token simplesmente deixa de ser enviado pelo frontend. Tokens já emitidos continuam válidos até expirar (8 horas).

---

## Segurança

| Ponto | Implementação |
|-------|--------------|
| Senhas | `password_hash()` bcrypt, nunca texto puro |
| Tokens | HMAC-SHA256, expiração de 8 horas |
| CORS | Restrito a `http://localhost:5173` |
| Rotas admin | Todas verificam JWT no construtor do controller |
| Role check | Login admin valida `role === 'admin'` antes de emitir token |
