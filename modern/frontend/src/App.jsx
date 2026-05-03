import Navbar from "./components/Navbar"
import { Route, Routes, BrowserRouter, useLocation, Outlet } from "react-router-dom"
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
import { ThemeProvider, useTheme } from "./context/ThemeContext"

const hideNavRoutes = ['/login', '/register', '/not-found', '/admin']

function Layout() {
  const location = useLocation()
  const hideNav = hideNavRoutes.includes(location.pathname) || location.pathname.startsWith('/admin')

  return (
    <>
      <ScrollToTop />

      {!hideNav && <Navbar />}

      <div className={!hideNav ? 'pt-20' : ''}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/sobre-nos" element={<SobreNos />} />
          <Route path="/contato" element={<Contato />} />
          <Route path="/carrinho" element={<Cart />} />
          <Route path="/produto/:id" element={<ProductDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
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
          </Route>
        </Routes>
      </div>

      {!hideNav && <Footer />}
    </>
  )
}

function AdminLayout() {
  const { dark } = useTheme()
  return (
    <main className={`flex${dark ? ' dark' : ''}`}>
      <AdminMenu />
      <section className="p-10 box-border w-full bg-gray-50 dark:bg-(--admin-bg) ml-80 min-h-screen">
        <Outlet />
      </section>
    </main>
  )
}

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
