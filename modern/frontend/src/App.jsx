import { lazy, Suspense, useEffect, useState } from "react"
import { Route, Routes, BrowserRouter, Outlet } from "react-router-dom"
import { Menu, X } from "lucide-react"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"
import AdminMenu from "./components/admin/AdminMenu"
import AiChat from "./components/AiChat"
import ProtectedRouteAdmin from "./components/admin/ProtectedRouteAdmin"
import ProtectedRouteUser from "./components/ProtectRoutesUser"
import { ThemeProvider, useTheme } from "./context/ThemeContext"
import { useConfiguracoes } from "./hooks/useConfiguracoes"

const Home              = lazy(() => import("./pages/Home"))
const Produtos          = lazy(() => import("./pages/Produtos"))
const SobreNos          = lazy(() => import("./pages/SobreNos"))
const Contato           = lazy(() => import("./pages/Contato"))
const Cart              = lazy(() => import("./pages/Cart"))
const ProductDetail     = lazy(() => import("./pages/ProductDetail"))
const Login             = lazy(() => import("./pages/Login"))
const Register          = lazy(() => import("./pages/Register"))
const NotFound          = lazy(() => import("./pages/NotFound"))
const Checkout          = lazy(() => import("./pages/Checkout"))
const UserProfile       = lazy(() => import("./pages/UserProfile"))
const Politicas         = lazy(() => import("./pages/Politicas"))
const Sobre             = lazy(() => import("./pages/Sobre"))
const Candidatura       = lazy(() => import("./pages/Candidatura"))
const ForgotPassword    = lazy(() => import("./pages/ForgotPassword"))
const ResetPassword     = lazy(() => import("./pages/ResetPassword"))
const CategoriaGrid     = lazy(() => import("./pages/CategoriaGrid"))
const OrderConfirmation = lazy(() => import("./pages/OrderConfirmation"))
const MeusPedidos       = lazy(() => import("./pages/MeusPedidos"))
const ReviewPedido      = lazy(() => import("./pages/ReviewPedido"))
const BuscaIA           = lazy(() => import("./pages/BuscaIA"))
const VerificarEmail    = lazy(() => import("./pages/VerificarEmail"))

const AdminHome            = lazy(() => import("./pages/admin/AdminHome"))
const AdminClients         = lazy(() => import("./pages/admin/AdminClients"))
const AdminProducts        = lazy(() => import("./pages/admin/AdminProducts"))
const AdminOrders          = lazy(() => import("./pages/admin/AdminOrders"))
const AdminCategories      = lazy(() => import("./pages/admin/AdminCategories"))
const AdminManageUsers     = lazy(() => import("./pages/admin/AdminManageUsers"))
const AdminRoles           = lazy(() => import("./pages/admin/AdminRoles"))
const AdminSettings        = lazy(() => import("./pages/admin/AdminSettings"))
const AdminProfile         = lazy(() => import("./pages/admin/AdminProfile"))
const AdminCurriculos      = lazy(() => import("./pages/admin/AdminCurriculos"))
const AdminCurriculoDetalhe = lazy(() => import("./pages/admin/AdminCurriculoDetalhe"))
const AdminLogin           = lazy(() => import("./pages/admin/AdminLogin"))
const AdminReviews         = lazy(() => import("./pages/admin/AdminReviews"))
const AdminVagas           = lazy(() => import("./pages/admin/AdminVagas"))
const AdminCupons          = lazy(() => import("./pages/admin/AdminCupons"))
const AdminRelatorios      = lazy(() => import("./pages/admin/AdminRelatorios"))
const AdminHelp            = lazy(() => import("./pages/admin/AdminHelp"))
const AdminCustomizacao    = lazy(() => import("./pages/admin/AdminCustomizacao"))
const AdminMarketing       = lazy(() => import("./pages/admin/AdminMarketing"))
const AdminAuditoria       = lazy(() => import("./pages/admin/AdminAuditoria"))

function useCountdown(targetDate) {
  const [timeLeft, setTimeLeft] = useState(null)
  useEffect(() => {
    if (!targetDate) return
    function update() {
      const diff = new Date(targetDate).getTime() - Date.now()
      if (diff <= 0) { setTimeLeft(null); return }
      setTimeLeft({
        h: Math.floor(diff / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      })
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [targetDate])
  return timeLeft
}

function FlashSaleBanner({ config, onDismiss }) {
  const timeLeft = useCountdown(config.flash_fim)
  if (!timeLeft) return null

  const pad = n => String(n).padStart(2, '0')
  const tempo = `${pad(timeLeft.h)}:${pad(timeLeft.m)}:${pad(timeLeft.s)}`

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50" style={{ backgroundColor: config.flash_cor || '#dc2626' }}>
      <div className="flex items-center justify-between px-4 py-2.5 gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <X size={14} className="text-transparent shrink-0" />
          <span className="text-white text-sm font-medium truncate">{config.flash_titulo}</span>
          <span className="text-white/90 text-sm font-mono tabular-nums shrink-0">{tempo}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {config.flash_link && (
            <a href={config.flash_link}
              className="bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 rounded-full transition-all">
              Ver oferta
            </a>
          )}
          <button onClick={onDismiss} className="text-white/70 hover:text-white transition-colors p-0.5">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  )
}

function PopupPromocional({ config }) {
  const [visible, setVisible] = useState(() => {
    if (config.popup_ativo !== '1') return false
    return sessionStorage.getItem('popup_dismissed') !== '1'
  })

  const show = visible && config.popup_ativo === '1' && !!config.popup_titulo

  function close() {
    sessionStorage.setItem('popup_dismissed', '1')
    setVisible(false)
  }

  if (!show) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-100 flex items-center justify-center p-4" onClick={close}>
      <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <button onClick={close} className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white rounded-full p-1 transition-all">
          <X size={16} className="text-gray-500" />
        </button>
        {config.popup_imagem && (
          <img src={config.popup_imagem} alt="" className="w-full h-44 object-cover" />
        )}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800">{config.popup_titulo}</h2>
          {config.popup_texto && (
            <p className="text-gray-500 mt-2 text-sm leading-relaxed">{config.popup_texto}</p>
          )}
          {config.popup_botao_link && config.popup_botao_texto && (
            <a href={config.popup_botao_link} onClick={close}
              className="block mt-4 bg-verde-escuro text-white text-center py-3 rounded-xl font-bold text-sm hover:opacity-90 transition-all">
              {config.popup_botao_texto}
            </a>
          )}
          <button onClick={close} className="block w-full mt-3 text-gray-400 text-xs hover:text-gray-600 transition-colors text-center">
            Fechar
          </button>
        </div>
      </div>
    </div>
  )
}

function AnnouncementBar({ texto, cor, onDismiss }) {
  return (
    <div
      className="h-9 flex items-center justify-center relative px-10 text-white text-sm font-medium"
      style={{ backgroundColor: cor || '#166534' }}
    >
      <span>{texto}</span>
      <button
        onClick={onDismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 hover:opacity-70 transition-opacity"
        aria-label="Fechar anúncio"
      >
        <X size={14} />
      </button>
    </div>
  )
}

function Layout() {
  const { config } = useConfiguracoes()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('anuncio_dismissed') === '1'
  )
  const [flashDismissed, setFlashDismissed] = useState(
    () => sessionStorage.getItem('flash_dismissed') === '1'
  )

  const showAnuncio = config.anuncio_ativo === '1' && !!config.anuncio_texto && !dismissed
  const showFlash   = config.flash_ativo === '1' && !!config.flash_titulo && !!config.flash_fim
                      && !flashDismissed && new Date(config.flash_fim) > new Date()

  function handleDismiss() {
    sessionStorage.setItem('anuncio_dismissed', '1')
    setDismissed(true)
  }

  function handleFlashDismiss() {
    sessionStorage.setItem('flash_dismissed', '1')
    setFlashDismissed(true)
  }

  return (
    <>
      <ScrollToTop />
      <PopupPromocional config={config} />
      <header className="fixed top-0 w-full z-50">
        {showAnuncio && (
          <AnnouncementBar
            texto={config.anuncio_texto}
            cor={config.anuncio_cor}
            onDismiss={handleDismiss}
          />
        )}
        <Navbar />
      </header>
      <div style={{ paddingTop: showAnuncio ? '116px' : '80px', paddingBottom: showFlash ? '44px' : '0' }}>
        <Outlet />
      </div>
      <Footer />
      <AiChat />
      {showFlash && <FlashSaleBanner config={config} onDismiss={handleFlashDismiss} />}
    </>
  )
}

function AdminLayout() {
  const { dark } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (dark) {
      document.body.style.backgroundColor = '#080808'
      document.body.style.colorScheme = 'dark'
    } else {
      document.body.style.backgroundColor = ''
      document.body.style.colorScheme = ''
    }
    return () => {
      document.body.style.backgroundColor = ''
      document.body.style.colorScheme = ''
    }
  }, [dark])

  return (
    <main className={`flex${dark ? ' dark' : ''}`}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-10 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <AdminMenu isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <section className="p-5 md:p-10 box-border w-full bg-gray-50 dark:bg-(--admin-bg) md:ml-80 min-h-screen">
        <div className="flex items-center gap-3 mb-5 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg border border-gray-200 dark:border-(--admin-border) hover:bg-white dark:hover:bg-(--admin-card) text-verde-escuro dark:text-(--admin-accent) transition-all"
          >
            <Menu size={20} />
          </button>
          <span className="font-bold text-verde-escuro dark:text-(--admin-accent) text-lg">SmartCart Admin</span>
        </div>
        <Outlet />
      </section>
    </main>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Suspense fallback={<div className="min-h-screen" />}>
          <Routes>
            {/* Rotas com Navbar + Footer */}
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/sobre-nos" element={<SobreNos />} />
              <Route path="/contato" element={<Contato />} />
              <Route path="/produto/:slug" element={<ProductDetail />} />
              <Route path="/politicas" element={<Politicas />} />
              <Route path="/politicas/:slug" element={<Politicas />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/sobre/:slug" element={<Sobre />} />
              <Route path="/candidatura/:slug" element={<Candidatura />} />
              <Route path="/produtos/categoria/:slug" element={<CategoriaGrid />} />
              <Route path="/pedido/confirmado" element={<OrderConfirmation />} />
              <Route element={<ProtectedRouteUser />}>
                <Route path="/carrinho" element={<Cart />} />
                <Route path="/checkout/:id" element={<Checkout />}/>
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/meus-pedidos" element={<MeusPedidos />} />
              </Route>
              <Route path="/review-pedido/:pedidoId" element={<ReviewPedido />} />
              <Route path="/busca" element={<BuscaIA />} />
            </Route>

            {/* Rotas sem Navbar */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/verificar-email" element={<VerificarEmail />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRouteAdmin />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminHome />} />
                <Route path="clients" element={<AdminClients />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="manage-users" element={<AdminManageUsers />} />
                <Route path="roles" element={<AdminRoles />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="profile" element={<AdminProfile />} />
                <Route path="curriculos" element={<AdminCurriculos />} />
                <Route path="curriculos/:id" element={<AdminCurriculoDetalhe />} />
                <Route path="vagas" element={<AdminVagas />} />
                <Route path="cupons" element={<AdminCupons />} />
                <Route path="relatorios" element={<AdminRelatorios />} />
                <Route path="help" element={<AdminHelp />} />
                <Route path="customizacao" element={<AdminCustomizacao />} />
                <Route path="marketing" element={<AdminMarketing />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="auditoria" element={<AdminAuditoria />} />
              </Route>
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
