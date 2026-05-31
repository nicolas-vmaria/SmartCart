# SmartCart — Roadmap de Melhorias

> Levantamento completo de oportunidades de melhoria identificadas em 2026-05-31.

---

## 🔴 Crítico — Segurança e Bugs

| # | Problema | Onde | O que fazer |
|---|----------|------|-------------|
| 1 | Token de usuário nunca expira | `src/core/Jwt.php` | Adicionar `exp: time() + 30 * 86400` no payload do user token |
| 2 | Sem rate limiting | `AuthMiddleware.php` | Limitar tentativas em login, forgot-password e coupon/validate |
| 3 | quant_usos do cupom não incrementa | `OrderService.php` | `UPDATE Cupons SET quant_usos = quant_usos + 1` ao finalizar pedido com cupom |

---

## 🟠 Alto — Features de produto

| # | Feature | Descrição |
|---|---------|-----------|
| 4 | Busca de produtos | Endpoint `GET /product?search=&preco_min=&preco_max=&rating_min=` + barra de busca com autocomplete no frontend |
| 5 | Wishlist / Favoritos | Nova tabela `Favoritos`, endpoints CRUD e botão de favoritar nos cards de produto |
| 6 | Alerta de estoque baixo | Notificação por e-mail ao admin quando estoque cai abaixo de threshold configurável |
| 7 | Paginação na API | `GET /product?page=1&limit=20` — retornar todos os registros de uma vez causa problemas em escala |
| 8 | Galeria de imagens | ProductDetail com múltiplas fotos, zoom e thumbnails (Cloudinary suporta múltiplos uploads) |

---

## 🟡 Médio — UX e qualidade

| # | Área | Detalhe |
|---|------|---------|
| 9 | Lazy loading de rotas | App.jsx importa 25+ páginas eagerly — usar `React.lazy()` + `Suspense` para code splitting |
| 10 | Otimização de imagens | URLs do Cloudinary sem transformações (`?q=auto&f=webp&w=800`). Sem `loading="lazy"` nas `<img>` |
| 11 | Índices no banco | Criar índices em: `Pedidos(status)`, `Pedidos(usuario_id)`, `Pedidos(created_at)`, `Review(produto_id)`, `Produtos(status)` |
| 12 | Email de verificação | Usuário cadastra e já está logado sem confirmação de e-mail |
| 13 | Breadcrumbs | Nenhuma página tem breadcrumb — usuário perde a navegação em categorias profundas |
| 14 | Dark mode no site público | ThemeContext existe mas só aplica no admin — adicionar toggle na Navbar do cliente |
| 15 | AI Chat contextual | AiChat usa Groq sem contexto de produtos ou pedidos. Integrar catálogo para respostas relevantes |
| 16 | Variantes de produto | Sem seletor de tamanho/cor/modelo por produto |
| 17 | Auditoria de ações admin | Sem tabela de log rastreando quem fez o quê no painel |

---

## 🟢 Baixo — DX e infraestrutura

| # | Área | Detalhe |
|---|------|---------|
| 18 | Testes automatizados | Zero testes no projeto. Iniciar com Vitest (frontend) e PHPUnit (backend) nas rotas críticas |
| 19 | Docker / docker-compose | Sem containerização — setup manual de PHP + MySQL. Dificulta onboarding e deploy |
| 20 | CI/CD | Sem GitHub Actions para lint, build e deploy automático |
| 21 | Soft deletes | Produto deletado some do histórico de pedidos. Adicionar `deleted_at` em Produtos e Categorias |
| 22 | Inconsistência na API | Mix de `{ error }` e `{ message }`. HTTP status incorretos em alguns endpoints |
| 23 | SEO | Sem meta tags, Open Graph ou structured data em nenhuma página |
| 24 | PWA | Sem manifest.json, service worker ou suporte offline |

---

## Esforço estimado

| Rápido (< 2h) | Médio (2–5h) | Grande (1–3 dias) |
|---|---|---|
| Fix token expiração (#1) | Busca de produtos (#4) | Wishlist / Favoritos (#5) |
| Fix quant_usos cupom (#3) | Paginação na API (#7) | Rate limiting completo (#2) |
| Índices no banco (#11) | Lazy loading de rotas (#9) | Testes automatizados (#18) |
| `loading="lazy"` nas imagens (#10) | Galeria de imagens (#8) | AI Chat contextual (#15) |
| | Email de verificação (#12) | Docker + CI/CD (#19, #20) |
