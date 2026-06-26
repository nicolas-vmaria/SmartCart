# SmartCart - Roadmap Pendente

> Atualizado em 2026-06-25. Este arquivo lista apenas o que ainda falta fazer.

---

## Pendencias imediatas

| Prioridade | Pendencia | Onde | Acao recomendada |
|---|---|---|---|
| Alta | Aplicar migracao de cupom no banco real | `modern/backend/database/migration/mig-022.sql` | Rodar `UPDATE Cupons SET quant_usos = 0 WHERE quant_usos IS NULL;` no ambiente usado. |
| Alta | Commitar/push das ultimas mudancas de expiracao JWT | `App.jsx`, `api.js`, `SessionWatcher.test.jsx` | Ainda ha arquivos modificados nao commitados. |
| Alta | Rate limit no login admin | `AdminAuthController.php` | Adicionar limite semelhante ao login de cliente por IP + email. |
| Media | Padronizar HTTP status em todos endpoints | Controllers/middlewares | Remover respostas manuais inconsistentes e centralizar erros. |
| Media | Teste backend para `quant_usos` | `OrderRepository`/`OrderService` | Cobrir incremento, cupom esgotado e `quant_usos NULL`. |
| Media | Teste backend para rate limit | `RateLimitMiddleware.php` | Cobrir bloqueio 429, janela de tempo e `retry_after`. |
| Media | Melhorar storage do rate limit | `RateLimitMiddleware.php` | Arquivo em `sys_get_temp_dir()` nao e ideal para producao multi-instancia. |
| Media | Atualizar docs de autenticacao | `docs/architecture/autenticacao.md` | Registrar cliente 24h, admin 8h e logout automatico no frontend. |
| Baixa | Revisar docs antigas de testes | `docs/TESTES.md` | Corrigir referencias antigas, como rota de usuario indo para `/admin/login`. |

---

## Produto

| Prioridade | Feature | Descricao |
|---|---|---|
| Alta | Busca de produtos completa | Endpoint com `search`, faixa de preco, rating e autocomplete no frontend. |
| Alta | Paginacao na API | `GET /product?page=1&limit=20`; evitar retornar todos os produtos em escala. |
| Alta | Wishlist / favoritos | Tabela `Favoritos`, endpoints CRUD e botao de favoritar nos cards. |
| Alta | Alerta de estoque baixo | Notificacao para admin quando produto cair abaixo de threshold configuravel. |
| Media | Galeria de imagens | ProductDetail com multiplas fotos, zoom e thumbnails. |
| Media | Variantes de produto | Tamanho/cor/modelo por produto. |
| Media | Breadcrumbs | Navegacao em categorias, produto e paginas profundas. |
| Media | Dark mode no site publico | Hoje o tema escuro e mais forte no admin. |
| Media | AI Chat contextual | Integrar catalogo, carrinho e pedidos com respostas mais relevantes. |
| Baixa | SEO | Meta tags, Open Graph e structured data. |
| Baixa | PWA | Manifest, service worker e suporte offline. |

---

## Tecnico e infraestrutura

| Prioridade | Area | Detalhe |
|---|---|---|
| Alta | CI/CD | GitHub Actions para lint, testes e build. |
| Alta | Testes backend | PHPUnit para auth, pedidos, cupons, carrinho e admin. |
| Media | Indices no banco | `Pedidos(status)`, `Pedidos(usuario_id)`, `Pedidos(created_at)`, `Review(produto_id)`, `Produtos(status)`. |
| Media | Soft deletes | `deleted_at` em Produtos e Categorias para preservar historico. |
| Media | Otimizacao de imagens | Cloudinary com `q=auto`, `f=webp`, tamanhos responsivos e `loading="lazy"`. |
| Media | Auditoria admin | Tabela de log rastreando quem fez o que no painel. |
| Baixa | Observabilidade | Logs estruturados para erros de API, auth, pedidos e pagamentos. |
| Baixa | Documentacao de deploy | Passo a passo para migrations, variaveis e ambientes. |

---

## Checklist antes do proximo deploy

- [ ] Rodar migracoes pendentes no banco real.
- [ ] Rodar testes focados de auth, token expirado e cupom.
- [ ] Confirmar manualmente que token expirado desloga em tela parada e mostra toast.
- [ ] Confirmar manualmente que cupom usado incrementa `quant_usos` no banco.
- [ ] Adicionar rate limit no login admin.
- [ ] Atualizar documentacao de auth e testes.
