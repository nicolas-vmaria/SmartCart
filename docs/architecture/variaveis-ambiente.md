# Variáveis de Ambiente — SmartCart

---

## Backend — `modern/backend/.env`

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `DB_HOST` | `localhost` | Host do servidor MySQL |
| `DB_NAME` | `smartcart` | Nome do banco de dados |
| `DB_USER` | `root` | Usuário do MySQL |
| `DB_PASS` | _(vazio)_ | Senha do MySQL |
| `DB_PORT` | `3306` | Porta do MySQL |
| `JWT_SECRET` | `sua_chave_secreta` | Chave para assinar e verificar tokens JWT |

**Exemplo de arquivo:**

```env
DB_HOST=localhost
DB_NAME=smartcart
DB_USER=root
DB_PASS=
DB_PORT=3306

JWT_SECRET=smartcart_839283810381fjsakjdkjakjwjd@*#(@*kajkdj
```

> O `JWT_SECRET` deve ser uma string longa e aleatória. Nunca use valores curtos ou óbvios em produção.

---

## Frontend — `modern/frontend/.env`

| Variável | Exemplo | Descrição |
|----------|---------|-----------|
| `VITE_API_URL` | `http://localhost:3001` | URL base da API do backend |

**Exemplo de arquivo:**

```env
VITE_API_URL=http://localhost:3001
```

> Variáveis do Vite precisam começar com `VITE_` para ficarem acessíveis no código via `import.meta.env`.

---

## Observações

- O arquivo `.env` **nunca deve ser commitado** no repositório. Adicione ao `.gitignore`
- Após criar ou modificar o `.env` do frontend, **reinicie o `npm run dev`** — o Vite só lê as variáveis na inicialização
- O backend lê as variáveis via `vlucas/phpdotenv` no `public/index.php`
