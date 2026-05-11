# Banco de Dados — SmartCart

**SGBD:** MySQL  
**Banco:** `smartcart`  
**Charset:** `utf8mb4` / `utf8mb4_unicode_ci`

---

## Tabelas

### `roles`

Armazena os papéis de acesso do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT PK AUTO_INCREMENT | Identificador |
| `nome` | VARCHAR(50) UNIQUE | Nome do papel |

**Dados padrão:**

| id | nome |
|----|------|
| 1 | cliente |
| 2 | admin |

---

### `users`

Armazena os usuários do sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| `id` | INT PK AUTO_INCREMENT | Identificador |
| `nome` | VARCHAR(100) | Nome completo |
| `email` | VARCHAR(150) UNIQUE | E-mail (usado no login) |
| `senha` | VARCHAR(255) | Hash bcrypt da senha |
| `role_id` | INT FK → roles.id | Papel do usuário (padrão: 1 = cliente) |
| `created_at` | TIMESTAMP | Data de criação |

**Usuário admin padrão:**

| Campo | Valor |
|-------|-------|
| nome | Administrador |
| email | admin@smartcart.com |
| senha | `admin123` (armazenada como hash bcrypt) |
| role_id | 2 (admin) |

---

## Relacionamentos

```
roles (1) ──── (N) users
  id                role_id
```

---

## Script de criação

```sql
CREATE DATABASE IF NOT EXISTS smartcart
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartcart;

CREATE TABLE roles (
    id   INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    senha      VARCHAR(255) NOT NULL,
    role_id    INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (role_id) REFERENCES roles(id)
);

INSERT INTO roles (nome) VALUES ('cliente'), ('admin');

INSERT INTO users (nome, email, senha, role_id) VALUES
    ('Administrador', 'admin@smartcart.com',
     '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2);
```

---

## Observações

- Senhas nunca são armazenadas em texto puro — sempre como hash `bcrypt` via `password_hash()` do PHP
- O `role_id` padrão é `1` (cliente), então todo usuário novo é automaticamente um cliente
- O schema atual cobre apenas autenticação; as demais tabelas (produtos, pedidos, carrinho, etc.) ainda precisam ser criadas conforme o desenvolvimento avançar
