import { Link } from "react-router-dom";

import logo from '../assets/smartcart-logo-transparente.png'

import { FaCartShopping } from "react-icons/fa6";

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between h-20 px-10   bg-verde-escuro ">
            
            <Link to={'/'}><img className="w-40" src={logo} alt="" /></Link>


            <ul className="flex gap-20">
                <li ><Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/" >Home</Link></li>
                <li ><Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/produtos" >Produtos</Link></li>
                <li ><Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/sobre-nos" >Sobre Nós</Link></li>
                <li ><Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/contato" >Contato</Link></li>
            </ul>

            <Link to={'/'}><FaCartShopping className="w-10 h-auto m-5 text-verde-claro transition-all hover:text-[#F8FFC2]" /></Link>

        </nav>
    )
}