import Navbar from "./components/Navbar"
import { Route, Routes, BrowserRouter  } from "react-router-dom"
import Home from "./pages/Home"
import Produtos from "./pages/Produtos"
import SobreNos from "./pages/SobreNos"
import Contato from "./pages/Contato"
import Footer from "./components/Footer"




function App() {
  

  return (
    <>
      <BrowserRouter>

      <Navbar />
      
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/produtos" element={<Produtos />}></Route>
          <Route path="/sobre-nos" element={<SobreNos />}></Route>
          <Route path="/contato" element={<Contato />}></Route>
        </Routes>

        <Footer />

      </BrowserRouter>
    </>
  )
}

export default App
