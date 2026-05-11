# Rotas da API — SmartCart

Base URL: `http://localhost:3001`

Rotas marcadas com 🔒 exigem `Authorization: Bearer <token>` no header.

---

## Autenticação — `/auth`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login do usuário comum |
| POST | `/auth/register` | Cadastro de novo usuário |
| POST | `/auth/forgot-password` | Solicitar redefinição de senha |
| POST | `/auth/reset-password` | Redefinir senha com token |

---

## Admin — Autenticação

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/admin/auth/login` | Login do administrador — retorna JWT |

---

## Produtos — `/product`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/product` | Listar todos os produtos |
| GET | `/product/{id}` | Buscar produto por ID |

---

## Categorias — `/category`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/category` | Listar todas as categorias |
| GET | `/category/{slug}` | Buscar categoria por slug |

---

## Carrinho — `/cart`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/cart` | Retornar carrinho do usuário |
| POST | `/cart/item` | Adicionar item ao carrinho |
| PUT | `/cart/item/{id}` | Atualizar quantidade do item |
| DELETE | `/cart/item/{id}` | Remover item do carrinho |
| DELETE | `/cart` | Limpar carrinho inteiro |

---

## Pedidos — `/order`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/order` | Listar pedidos do usuário |
| GET | `/order/{id}` | Detalhes de um pedido |
| POST | `/order` | Criar novo pedido |
| PUT | `/order/{id}/status` | Atualizar status do pedido |
| DELETE | `/order/{id}` | Cancelar pedido |
| GET | `/order/{id}/tracking` | Rastreamento do pedido |

---

## Avaliações — `/product/{id}/review`

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/product/{id}/review` | Listar avaliações do produto |
| POST | `/product/{id}/review` | Adicionar avaliação |
| PUT | `/review/{id}/helpful` | Marcar avaliação como útil |

---

## Cupom

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/coupon/validate` | Validar código de cupom |

---

## Contato / Carreiras

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/contact` | Enviar mensagem de contato |
| POST | `/career/apply` | Enviar candidatura |

---

## Admin — Produtos 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/product` | Listar todos os produtos |
| POST | `/admin/product` | Criar produto |
| PUT | `/admin/product/{id}` | Editar produto |
| DELETE | `/admin/product/{id}` | Remover produto |

---

## Admin — Pedidos 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/order` | Listar todos os pedidos |
| PUT | `/admin/order/{id}/status` | Atualizar status |
| DELETE | `/admin/order/{id}` | Deletar pedido |
| GET | `/admin/order/analytics/monthly` | Analytics mensais |

---

## Admin — Clientes 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/client` | Listar clientes |
| POST | `/admin/client` | Criar cliente |
| PUT | `/admin/client/{id}` | Editar cliente |
| DELETE | `/admin/client/{id}` | Remover cliente |

---

## Admin — Categorias 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/category` | Listar categorias |
| POST | `/admin/category` | Criar categoria |
| PUT | `/admin/category/{id}` | Editar categoria |
| DELETE | `/admin/category/{id}` | Remover categoria |

---

## Admin — Usuários e Papéis 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/user` | Listar usuários |
| PUT | `/admin/user/{id}/role` | Alterar papel do usuário |
| DELETE | `/admin/user/{id}` | Remover usuário |
| GET | `/admin/role` | Listar papéis |
| POST | `/admin/role` | Criar papel |
| PUT | `/admin/role/{id}` | Editar papel |
| DELETE | `/admin/role/{id}` | Remover papel |

---

## Admin — Currículos 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/curriculo` | Listar candidaturas |
| PUT | `/admin/curriculo/{id}` | Atualizar status da candidatura |
| DELETE | `/admin/curriculo/{id}` | Remover candidatura |

---

## Admin — Cupons 🔒

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/coupon` | Listar cupons |
| POST | `/admin/coupon` | Criar cupom |
| PUT | `/admin/coupon/{id}` | Editar cupom |
| DELETE | `/admin/coupon/{id}` | Remover cupom |

---

## Health Check

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Verifica se a API está no ar |

**Resposta:**
```json
{ "status": "ok", "message": "API is healthy" }
```
