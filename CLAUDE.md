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

### Frontend
- Usar `Toast` para feedback de erro e sucesso
- Usar `ConfirmDialog` antes de ações destrutivas (deletar, sair, etc.)
- Loading states em toda chamada ao backend: spinner no botão + `disabled` durante requisição
- Página admin carregando: spinner centralizado na tabela/grid
- Hooks em `src/hooks/`, funções de API em `src/lib/api/`
- Ícones: preferir `lucide-react` (traço fino) ou `react-icons`

### Backend
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

## Variáveis de ambiente (frontend)
```
VITE_API_URL=
VITE_GROQ_KEY=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```
