# SmartCart — Guia do Projeto

## Stack
- **Frontend:** React + Vite + Tailwind CSS
- **Backend:** PHP (sem framework)
- **Banco de dados:** MySQL hospedado no Railway
- **Imagens:** Cloudinary (upload direto do frontend)
- **Autenticação:** JWT (HS256) com `user_token` e `admin_token` no localStorage

## Estrutura de pastas
```
modern/
  frontend/
    src/
      pages/          # Páginas (usuário e admin)
      pages/admin/    # Páginas do painel admin
      components/     # Componentes reutilizáveis
      components/admin/
      hooks/          # Custom hooks (ex: useAuth)
      lib/            # Configuração axios, funções de API, cloudinary
      lib/api/        # Funções de chamada à API separadas por domínio
  backend/
    src/
      controller/     # Controllers (recebem requisição, chamam service)
      service/        # Regras de negócio
      repository/     # Queries SQL
      middleware/     # AuthMiddleware (valida JWT + role)
      routes/         # Definição de rotas
      core/           # JWT, Mailer
```

## Convenções de código

### Geral
- Explicar o que vai fazer antes de codar — nunca implementar sem ser pedido
- Não criar arquivos desnecessários
- Não adicionar comentários óbvios no código
- Não adicionar features além do que foi pedido
- **Nunca fazer commit ou push sem o usuário pedir explicitamente** — sempre deixar o usuário verificar as mudanças antes

### Frontend
- Usar `Toast` para feedback de erro e sucesso
- Usar `ConfirmDialog` antes de ações destrutivas (deletar, sair, etc.)
- Loading states em toda chamada ao backend: spinner no botão + `disabled` durante requisição
- Listas e grids de conteúdo carregando: usar **skeleton loading** (`animate-pulse`) no lugar de spinners — criar um componente skeleton que imita a forma do card/item real
- Página admin carregando: spinner centralizado na tabela/grid
- Hooks em `src/hooks/`, funções de API em `src/lib/api/`
- Arquivos de API em `src/lib/api/`: prefixar com `admin` quando chamam rotas admin (ex: `adminProducts.js`, `adminCoupons.js`); sem prefixo quando chamam rotas de cliente (ex: `products.js`, `cart.js`) — nunca misturar chamadas admin e cliente no mesmo arquivo
- Ícones: preferir `lucide-react` (traço fino) ou `react-icons`

### Backend
- **Antes de qualquer migration ou referência a tabela/coluna**, ler `modern/backend/database/schema.sql` para confirmar nomes exatos — nomes de tabelas não seguem plural padrão (ex: `Usuario` e não `Usuarios`, `Cupons` e não `Cupom`)
- Toda alteração no schema do banco (nova coluna, tabela, índice, etc.) deve gerar um arquivo de migration em `modern/backend/database/migration/` seguindo a nomenclatura `mig-NNN.sql` (incrementar o número do último arquivo existente) **e também atualizar `modern/backend/database/schema.sql`**
- Toda nova seção do painel admin deve ter uma coluna `ver_*` correspondente na tabela `Papeis` (ex: nova página "Reviews" → `ver_reviews BOOLEAN DEFAULT FALSE`), com migration própria, e deve ser atualizada em **todos** os seguintes lugares:
  - `AdminRolesRepository.php` — SELECT, INSERT e UPDATE
  - `AdminRolesService.php` — `validateRole()`
  - `AdminRoles.jsx` — array `SECTIONS`, `apiRoleToModel` e payload do `handleSubmit`
  - `AdminMenu.jsx` — usar `can('nova_secao')` (não reaproveitar permissão de outra seção)
  - `AuthRepository.php` — SELECT do `findByEmail` (para buscar a coluna do banco)
  - `AdminAuthService.php` — array `perms` (JWT) e array `permissions` (objeto salvo no localStorage)
- Toda rota admin usa `AuthMiddleware::handle('admin')` — nunca sem o parâmetro `'admin'`
- Toda rota de usuário usa `AuthMiddleware::handle()` sem parâmetro
- Estrutura: Controller → Service → Repository
- Retornar sempre JSON com `message` em sucesso e `error` em erro

## Autenticação
- `user_token` → usuário comum (`role: "cliente"`)
- `admin_token` → administrador (`role: "admin"`)
- Frontend decodifica JWT para checar role antes de liberar rotas admin
- `user_nome` salvo no localStorage no login/registro para exibir na Navbar

## Banco de dados
- Host externo Railway: `autorack.proxy.rlwy.net:49098`
- Banco: `railway`
- Schema em: `modern/backend/database/schema.sql`

## Testes (Vitest + Testing Library)
- Sempre usar `within(container)` para buscar elementos — nunca `screen.getBy*` sozinho
- O cleanup automático entre testes não funciona de forma confiável neste projeto; `within(container)` isola cada render e evita o erro "Found multiple elements"
- Padrão correto: `const { container } = render(<Comp />)` → `within(container).getByText(...)`
- Testes em `modern/frontend/src/test/` — documentação em `docs/TESTES.md`

## Variáveis de ambiente (frontend)
```
VITE_API_URL=
VITE_GROQ_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```
