# Arquitetura do Frontend — SmartCart

## Stack

| Tecnologia | Versão | Função |
|-----------|--------|--------|
| React | 19.2 | UI / componentes |
| Vite | 8.0 | Build e dev server |
| React Router | 7.13 | Roteamento SPA |
| Tailwind CSS | 4.2 | Estilização |
| Axios | 1.16 | Requisições HTTP |
| Lucide React | — | Ícones |
| Chart.js | 4.5 | Gráficos no admin |
| Swiper | 12.1 | Carrossel de imagens |
| React Three Fiber | — | Modelo 3D na home |

---

## Estrutura de Pastas

```
src/
├── api/                  ← configuração HTTP e serviços de API
│   ├── config.js         ← exporta API_URL do .env
│   ├── api.js            ← re-exporta funções de auth
│   ├── adminApi.js       ← instância Axios com interceptor JWT
│   └── authService.js    ← função loginAdmin()
│
├── assets/               ← imagens, logos, fotos do carrossel
│
├── components/           ← componentes reutilizáveis
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   ├── SmartCart3D.jsx   ← modelo 3D interativo (React Three Fiber)
│   ├── Toast.jsx
│   ├── ConfirmDialog.jsx
│   └── admin/
│       ├── AdminMenu.jsx       ← sidebar do painel admin
│       ├── AdminHeader.jsx     ← cabeçalho das páginas admin
│       ├── ProtectedRoute.jsx  ← guarda de rota JWT
│       ├── CardInfo.jsx
│       ├── Chart.jsx
│       ├── ProductsChart.jsx
│       └── RecentOrders.jsx
│
├── context/
│   └── ThemeContext.jsx  ← Provider global de tema claro/escuro
│
├── pages/                ← páginas públicas
│   ├── Home.jsx
│   ├── Produtos.jsx
│   ├── ProductDetail.jsx
│   ├── Cart.jsx
│   ├── Checkout.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── ...
│   └── admin/            ← páginas do painel admin
│       ├── AdminHome.jsx
│       ├── AdminProducts.jsx
│       ├── AdminOrders.jsx
│       └── ...
│
├── App.jsx               ← definição de todas as rotas
├── main.jsx              ← entry point React
└── index.css             ← Tailwind + tokens de cor customizados
```

---

## Roteamento

O `App.jsx` define três grupos de rotas:

### 1. Rotas públicas com Layout (Navbar + Footer)

```
/                        → Home
/produtos                → Produtos
/produto/:id             → Detalhe do produto
/carrinho                → Carrinho
/checkout/:id            → Checkout
/profile                 → Perfil do usuário
/contato                 → Contato
/sobre, /sobre/:slug     → Sobre
/politicas/:slug         → Políticas
/candidatura/:slug       → Candidatura
/pedido/confirmado       → Confirmação de pedido
```

### 2. Rotas públicas sem Layout

```
/login
/register
/forgot-password
/admin/login
```

### 3. Rotas protegidas do Admin

Envoltas por `ProtectedRoute` (verifica `admin_token`) e `AdminLayout` (sidebar + tema).

```
/admin                   → Dashboard
/admin/products          → Produtos
/admin/orders            → Pedidos
/admin/clients           → Clientes
/admin/categories        → Categorias
/admin/cupons            → Cupons
/admin/relatorios        → Relatórios
/admin/curriculos        → Currículos
/admin/manage-users      → Usuários
/admin/roles             → Papéis
/admin/settings          → Configurações
/admin/profile           → Perfil admin
/admin/help              → Ajuda
```

---

## Camada de API

```
components/pages
      │
      ▼
  api/adminApi.js          ← Axios com base URL + interceptor JWT
      │
      ▼
  api/authService.js       ← funções por domínio (loginAdmin, etc.)
      │
      ▼
  Backend PHP (localhost:3001)
```

**Interceptor JWT (`adminApi.js`):**

```javascript
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})
```

---

## Gerenciamento de Estado

O sistema não usa Redux ou Zustand. O estado é local por página via `useState` e `useEffect`. A única exceção é o `ThemeContext`:

| Context | Dados | Quem usa |
|---------|-------|----------|
| `ThemeContext` | `dark: boolean`, `setDark()` | AdminLayout, AdminSettings |

---

## Tema Claro / Escuro

- O painel admin suporta dark mode via classe `.dark` no elemento raiz
- Cores customizadas definidas em `index.css` com variáveis CSS:

```css
--admin-bg, --admin-sidebar, --admin-card,
--admin-border, --admin-text, --admin-accent, ...
```

- `AdminLayout` aplica `.dark` baseado no contexto e ajusta o `body.backgroundColor`
- A preferência é salva em `localStorage` como `themeMode`

---

## Cores da Marca

Definidas em `index.css` como tokens Tailwind:

| Token | Hex | Uso |
|-------|-----|-----|
| `verde-escuro` | `#18572C` | Cor principal, fundo do hero |
| `verde-claro` | `#E9FF75` | Destaques, textos no hero |
| `verde-escuro-escarlate` | `#349954` | Títulos de seção no admin |

---

## Como Executar

```bash
# A partir de modern/frontend/
npm run dev
```

O Vite sobe em `http://localhost:5173` por padrão.  
A variável `VITE_API_URL` em `.env` define a URL do backend.
