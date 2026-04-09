import Navbar from "./components/Navbar"
import { Route, Routes, BrowserRouter, useLocation } from "react-router-dom"
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

const hideNavRoutes = ['/login', '/register', '/not-found']

function Layout() {
  const location = useLocation()
  const hideNav = hideNavRoutes.includes(location.pathname)

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
        </Routes>
      </div>

      {!hideNav && <Footer />}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}

export default App
