# Testes Automatizados — SmartCart

Stack: **Vitest** + **@testing-library/react** + **@testing-library/user-event** + **@testing-library/jest-dom**

Rodar: `npm test` dentro de `modern/frontend/`

Arquivos em: `modern/frontend/src/test/`

---

## StarRating

Arquivo: `src/test/starRating.test.jsx`

| Teste | O que verifica |
|---|---|
| renderiza 5 estrelas | sempre renderiza exatamente 5 SVGs |
| com rating=3, as 3 primeiras são amarelas | 3 elementos com `.text-yellow-400` e 2 com `.text-gray-300` |
| com rating=0, todas são cinzas | 5 elementos com `.text-gray-300` |

---

## Toast

Arquivo: `src/test/Toast.test.jsx`

| Teste | O que verifica |
|---|---|
| renderiza mensagem | texto da prop `message` aparece no DOM |
| se tipo = error, ícone = AlertCircle | 1 elemento com `.text-red-500` no DOM |
| botão X chama onClose | clique no botão dispara o callback `onClose` |

---

## ConfirmDialog

Arquivo: `src/test/ConfirmDialog.test.jsx`

| Teste | O que verifica |
|---|---|
| renderiza título e mensagem | texto das props `title` e `message` aparecem no DOM |
| botões confirmar e cancelar chamam callbacks | `vi.fn()` + `userEvent.click` nos dois botões |

---

## ProdutoCard

Arquivo: `src/test/ProductCard.test.jsx`

| Teste | O que verifica |
|---|---|
| exibe o nome do produto | texto da prop `nome` aparece no DOM |
| exibe o preço do produto | preço formatado em BRL aparece no DOM |
| a foto possui url | `<img>` tem o atributo `src` correto |
| ao clicar, envia para detalhes | `<a>` tem `href` com o slug correto |
| com desconto, exibe badge e preço riscado | badge `-X%`, preço final e preço original riscado |
| sem foto_url, exibe "Sem imagem" | texto alternativo aparece quando não há foto |
| com produto null, não renderiza nada | `container.firstChild` é null |

---

## useAuth

Arquivo: `src/test/useAuth.test.jsx`

| Teste | O que verifica |
|---|---|
| sem token, isLogged é false e nome é vazio | estado inicial sem localStorage |
| com token, isLogged é true | lê `user_token` do localStorage |
| com user_nome, retorna o nome | lê `user_nome` do localStorage |

---

## AdminHeader

Arquivo: `src/test/AdminHeader.test.jsx`

| Teste | O que verifica |
|---|---|
| renderiza o título | prop `title` aparece no DOM |
| renderiza a descrição | prop `description` aparece no DOM |

---

## CardInfo

Arquivo: `src/test/CardInfo.test.jsx`

| Teste | O que verifica |
|---|---|
| exibe título e info | props `title` e `info` aparecem no DOM |
| exibe skeleton quando loading=true | elemento `.animate-pulse` existe |
| não exibe skeleton quando loading=false | elemento `.animate-pulse` não existe |

---

## useTheme

Arquivo: `src/test/useTheme.test.jsx`

| Teste | O que verifica |
|---|---|
| valor inicial dark é false | sem localStorage, `dark` começa false |
| toggle() alterna dark | chama `toggle()` e `dark` vira true |
| lê tema dark do localStorage | `localStorage.theme = 'dark'` → `dark` é true |

---

## useAdminData

Arquivo: `src/test/useAdminData.test.jsx`

| Teste | O que verifica |
|---|---|
| estado inicial sem cache | `data=[]` e `loading=true` |
| após fetch, data preenchido | `loading` vira false e `data` recebe resultado |
| refetch() recarrega os dados | segunda chamada retorna novos dados |
| erro no fetch | `loading=false` e `data=[]` |

---

## Footer

Arquivo: `src/test/Footer.test.jsx`

| Teste | O que verifica |
|---|---|
| exibe e-mail de contato | e-mail da config aparece no DOM |
| exibe telefones de contato | os dois telefones aparecem no DOM |
| exibe link do Instagram | link com aria-label "Instagram" existe |

---

## ProtectedRouteUser

Arquivo: `src/test/ProtectRoutesUser.test.jsx`

| Teste | O que verifica |
|---|---|
| sem token, redireciona | sem `user_token`, vai para `/admin/login` |
| com token, renderiza filho | com `user_token`, renderiza `<Outlet />` |

---

## ProtectedRouteAdmin

Arquivo: `src/test/ProtectedRouteAdmin.test.jsx`

| Teste | O que verifica |
|---|---|
| sem token, redireciona | sem `admin_token`, vai para `/admin/login` |
| com token admin válido, renderiza painel | token JWT com `role=admin` libera acesso |
| com token expirado, redireciona | token com `exp` no passado bloqueia acesso |

---

## Pulados (dependências externas)

| Componente | Motivo |
|---|---|
| `SmartCart3D` | WebGL/Three.js |
| `AiChat` | API Groq externa |
| `Carroussel` | Swiper + `fetch()` direto |
| `SwiperDisplay` | Swiper |
| `RichTextEditor` | TipTap + Cloudinary |
| `AdminMenu` | Sistema de permissões + múltiplas APIs |
| `Chart` / `ProductsChart` | Chart.js em Canvas |
| `RecentOrders` | API no mount sem controle exposto |
| `Navbar` | API + localStorage + eventos + router |
