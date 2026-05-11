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
| `VITE_GROQ_KEY` | `gsk_...` | Chave da API do Groq para o assistente de IA |

**Exemplo de arquivo:**

```env
VITE_API_URL=http://localhost:3001
VITE_GROQ_KEY=gsk_sua_chave_aqui
```

> Variáveis do Vite precisam começar com `VITE_` para ficarem acessíveis no código via `import.meta.env`.

### Obtendo a chave do Groq

1. Acesse [console.groq.com](https://console.groq.com)
2. Vá em **API Keys → Create API Key**
3. Cole o valor em `VITE_GROQ_KEY` no `.env`

> A chave do Groq fica exposta no bundle do frontend — adequado para desenvolvimento. Em produção, as chamadas devem passar por um endpoint no backend.

---

## Observações

- O arquivo `.env` **nunca deve ser commitado** no repositório. Adicione ao `.gitignore`
- Após criar ou modificar o `.env` do frontend, **reinicie o `npm run dev`** — o Vite só lê as variáveis na inicialização
- O backend lê as variáveis via `vlucas/phpdotenv` no `public/index.php`
