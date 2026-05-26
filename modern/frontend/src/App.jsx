import Navbar from "./components/Navbar"
import { Route, Routes, BrowserRouter, Outlet } from "react-router-dom"
import { Menu } from "lucide-react"
import Home from "./pages/Home"
import Produtos from "./pages/Produtos"
import SobreNos from "./pages/SobreNos"
import Contato from "./pages/Contato"
import Footer from "./components/Footer"
import ScrollToTop from "./components/ScrollToTop"
import Cart from "./pages/Cart"
import ProductDetail from "./pages/ProductDetail"
import Login from "./pages/Login"
import Register from "./pages/Register"
import NotFound from "./pages/NotFound"
import AdminHome from "./pages/admin/AdminHome"
import AdminMenu from "./components/admin/AdminMenu"
import AdminClients from "./pages/admin/AdminClients"
import AdminProducts from "./pages/admin/AdminProducts"
import AdminOrders from "./pages/admin/AdminOrders"
import AdminCategories from "./pages/admin/AdminCategories"
import AdminManageUsers from "./pages/admin/AdminManageUsers"
import AdminRoles from "./pages/admin/AdminRoles"
import AdminSettings from "./pages/admin/AdminSettings"
import AdminProfile from "./pages/admin/AdminProfile"
import AdminCurriculos from "./pages/admin/AdminCurriculos"
import AdminLogin from "./pages/admin/AdminLogin"
import ProtectedRouteAdmin from "./components/admin/ProtectedRouteAdmin"
import { ThemeProvider, useTheme } from "./context/ThemeContext"
import { useEffect, useState } from "react"
import Checkout from "./pages/Checkout"
import UserProfile from "./pages/UserProfile"
import Politicas from "./pages/Politicas"
import Sobre from "./pages/Sobre"
import Candidatura from "./pages/Candidatura"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import CategoriaGrid from "./pages/CategoriaGrid"
import OrderConfirmation from "./pages/OrderConfirmation"
import MeusPedidos from "./pages/MeusPedidos"
import AiChat from "./components/AiChat"
import AdminCupons from "./pages/admin/AdminCupons"
import AdminRelatorios from "./pages/admin/AdminRelatorios"
import AdminHelp from "./pages/admin/AdminHelp"

function Layout() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="pt-20">
        <Outlet />
      </div>
      <Footer />
      <AiChat />
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
        <Routes>
          {/* Rotas com Navbar + Footer */}
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/produtos" element={<Produtos />} />
            <Route path="/sobre-nos" element={<SobreNos />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/carrinho" element={<Cart />} />
            <Route path="/produto/:slug" element={<ProductDetail />} />
            <Route path="/checkout/:id" element={<Checkout />}/>
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/politicas" element={<Politicas />} />
            <Route path="/politicas/:slug" element={<Politicas />} />
            <Route path="/sobre" element={<Sobre />} />
            <Route path="/sobre/:slug" element={<Sobre />} />
            <Route path="/candidatura/:slug" element={<Candidatura />} />
            <Route path="/produtos/categoria/:slug" element={<CategoriaGrid />} />
            <Route path="/pedido/confirmado" element={<OrderConfirmation />} />
            <Route path="/meus-pedidos" element={<MeusPedidos />} />
          </Route>

          {/* Rotas sem Navbar */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
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
              <Route path="cupons" element={<AdminCupons />} />
              <Route path="relatorios" element={<AdminRelatorios />} />
              <Route path="help" element={<AdminHelp />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
