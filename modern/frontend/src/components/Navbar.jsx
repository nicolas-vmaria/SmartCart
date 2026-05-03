import { Link } from "react-router-dom";
import logo from '../assets/smartcart-logo-transparente.png'
import { FaCartShopping } from "react-icons/fa6";
import { FiChevronDown } from "react-icons/fi";
import { LuShoppingCart, LuPackage, LuWrench, LuBuilding2 } from "react-icons/lu";

const categorias = [
    { label: 'Carrinhos Inteligentes', descricao: 'Linha completa SmartCart', icon: <LuShoppingCart />, to: '/produtos/categoria/carrinhos-inteligentes' },
    { label: 'Acessórios',            descricao: 'Complementos e periféricos', icon: <LuPackage />,      to: '/produtos/categoria/acessorios' },
    { label: 'Peças de Reposição',    descricao: 'Manutenção e suporte',       icon: <LuWrench />,       to: '/produtos/categoria/pecas-de-reposicao' },
    { label: 'Soluções Empresariais', descricao: 'Para redes e atacadistas',   icon: <LuBuilding2 />,    to: '/produtos/categoria/solucoes-empresariais' },
]

export default function Navbar() {
    return (
        <nav className="flex items-center justify-between h-20 px-10 fixed w-full bg-verde-escuro z-1000">

            <Link to="/"><img className="w-40" src={logo} alt="" /></Link>

            <ul className="flex gap-20 items-center">
                <li>
                    <Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/">
                        Home
                    </Link>
                </li>

                {/* Produtos com dropdown */}
                <li className="relative group">
                    <Link
                        to="/produtos"
                        className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1 flex items-center gap-1"
                    >
                        Produtos
                        <FiChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                    </Link>

                    {/* Dropdown */}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-72">
                            {categorias.map(({ label, descricao, icon, to }) => (
                                <Link
                                    key={label}
                                    to={to}
                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                >
                                    <div className="w-9 h-9 rounded-lg bg-verde-escuro/10 text-verde-escuro flex items-center justify-center text-lg shrink-0 group-hover/item:bg-verde-escuro group-hover/item:text-verde-claro transition-colors">
                                        {icon}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-gray-800">{label}</p>
                                        <p className="text-xs text-gray-400">{descricao}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </li>

                <li>
                    <Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/sobre-nos">
                        Sobre Nós
                    </Link>
                </li>
                <li>
                    <Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/contato">
                        Contato
                    </Link>
                </li>
            </ul>

            <div className="flex items-center gap-5">
                <Link to="/login" className="btn-border-draw text-verde-claro flex items-center h-10 px-5 rounded-full transition-all duration-300 hover:bg-white/10">Login</Link>
                <Link to="/register" className="text-verde-claro border-2 border-verde-claro flex items-center h-10 p-5 rounded-full transition-all cursor-pointer hover:bg-verde-claro hover:text-verde-escuro">Entrar</Link>
                <Link to="/carrinho"><FaCartShopping className="w-10 h-auto m-5 text-verde-claro transition-all hover:text-[#F8FFC2]" /></Link>
            </div>
        </nav>
    )
}
