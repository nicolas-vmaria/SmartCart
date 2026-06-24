import { useState, useEffect, useRef } from "react";
import { useAuth } from '../hooks/useAuth'
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import logo from '../assets/smartcart-logo-transparente.png'
import { FaCartShopping } from "react-icons/fa6";
import { FiChevronDown, FiMenu, FiX } from "react-icons/fi";
import { LuTag, LuCircleUserRound } from "react-icons/lu";
import { getCart } from "../lib/api/cart";
import { getCategories } from "../lib/api/categories";
import { slugIconMap } from "../lib/categoryIcons";

export default function Navbar() {
    const [menuAberto, setMenuAberto] = useState(false);
    const [produtosAberto, setProdutosAberto] = useState(false);
    const [cartCount, setCartCount] = useState(0);
    const [categorias, setCategorias] = useState([]);
    const [loadingCategorias, setLoadingCategorias] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const [hidden, setHidden] = useState(false);
    const { isLogged, nome } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()
    const isHome = location.pathname === '/'

    useEffect(() => {
        if (!isHome) { setScrolled(false); return }
        function onScroll() { setScrolled(window.scrollY > 10) }
        onScroll()
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [isHome])

    useEffect(() => {
        if (!isHome) { setHidden(false); return }
        function onScrollVideo(e) { setHidden(e.detail) }
        window.addEventListener('scrollvideo:active', onScrollVideo)
        return () => window.removeEventListener('scrollvideo:active', onScrollVideo)
    }, [isHome])
    const [searchOpen, setSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')
    const searchInputRef = useRef(null)

    useEffect(() => {
        if (searchOpen) searchInputRef.current?.focus()
    }, [searchOpen])

    function handleSearch(e) {
        e.preventDefault()
        const q = searchQuery.trim()
        if (!q) return
        setSearchOpen(false)
        setSearchQuery('')
        navigate(`/busca?q=${encodeURIComponent(q)}`)
    }

    useEffect(() => {
        getCategories()
            .then(({ data }) => setCategorias(data.data ?? []))
            .catch(() => {})
            .finally(() => setLoadingCategorias(false))
    }, [])

    function fetchCartCount() {
        if (!localStorage.getItem('user_token')) { setCartCount(0); return }
        getCart()
            .then(res => {
                const items = res.data.carrinho ?? []
                setCartCount(items.length)
            })
            .catch(() => setCartCount(0))
    }

    useEffect(() => {
        fetchCartCount()
    }, [isLogged, location.pathname])

    useEffect(() => {
        window.addEventListener('cart:updated', fetchCartCount)
        return () => window.removeEventListener('cart:updated', fetchCartCount)
    }, [])

    const fecharMenu = () => {
        setMenuAberto(false);
        setProdutosAberto(false);
    };

    return (
        <nav className={`flex items-center justify-between h-20 px-6 md:px-10 w-full transition-all duration-300 ${isHome && !scrolled ? 'bg-transparent' : 'bg-verde-escuro'} ${hidden ? '-translate-y-full opacity-0 pointer-events-none' : ''}`}>

            <Link to="/" onClick={fecharMenu}><img className="w-36 md:w-40" src={logo} alt="" /></Link>

            {/* Menu desktop */}
            <ul className="hidden md:flex gap-20 items-center">
                <li>
                    <Link className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1" to="/">
                        Home
                    </Link>
                </li>

                <li className={`relative${!loadingCategorias && categorias.length > 0 ? ' group' : ''}`}>
                    <Link
                        to="/produtos"
                        className="text-verde-claro transition-all hover:bg-green-800 hover:text-gray-100 rounded-full px-5 py-1 flex items-center gap-1"
                    >
                        Produtos
                        {!loadingCategorias && categorias.length > 0 && (
                            <FiChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                        )}
                    </Link>

                    {!loadingCategorias && categorias.length > 0 && (
                        <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4 opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all duration-200 z-50">
                            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 w-72">
                                {categorias.map(({ nome, slug, descricao }) => {
                                    const Icon = slugIconMap[slug] ?? LuTag
                                    return (
                                        <Link
                                            key={slug}
                                            to={`/produtos/categoria/${slug}`}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 transition-colors group/item"
                                        >
                                            <div className="w-9 h-9 rounded-lg bg-verde-escuro/10 text-verde-escuro flex items-center justify-center text-lg shrink-0 group-hover/item:bg-verde-escuro group-hover/item:text-verde-claro transition-colors">
                                                <Icon />
                                            </div>
                                            <div>
                                                <p className="font-bold text-sm text-gray-800">{nome}</p>
                                                <p className="text-xs text-gray-400">{descricao}</p>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </div>
                    )}
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

            {/* Botões desktop */}
            <div className="hidden md:flex items-center gap-5">
            {isLogged ? (
                <>
                    <span className="text-verde-claro capitalize">Olá, {nome.split(' ')[0].toLowerCase()}</span>
                    <Link to="/profile" className="text-verde-claro p-2 rounded-full hover:bg-white/15 hover:scale-110 transition-all duration-200">
                        <LuCircleUserRound size={38} strokeWidth={1.3} />
                    </Link>
                </>
            ) : (
                <>
                    <Link to="/login" className="btn-border-draw text-verde-claro flex items-center h-10 px-5 rounded-full transition-all duration-300 hover:bg-white/10">Login</Link>
                    <Link to="/register" className="text-verde-claro border-2 border-verde-claro flex items-center h-10 p-5 rounded-full transition-all cursor-pointer hover:bg-verde-claro hover:text-verde-escuro">Cadastrar</Link>
                </>
            )}
                
                <div className="flex items-center gap-1">
                    <form
                        onSubmit={handleSearch}
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${searchOpen ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
                    >
                        <input
                            ref={searchInputRef}
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={e => e.key === 'Escape' && setSearchOpen(false)}
                            placeholder="Buscar produtos..."
                            className="w-full bg-white/15 text-verde-claro placeholder-verde-claro/50 rounded-full px-4 py-1.5 text-sm outline-none border border-verde-claro/30"
                        />
                    </form>
                    <button
                        onClick={() => { setSearchOpen(v => !v); if (searchOpen) setSearchQuery('') }}
                        className="text-verde-claro p-2 rounded-full hover:bg-white/15 hover:scale-110 transition-all duration-200 relative w-9 h-9 flex items-center justify-center shrink-0"
                    >
                        <Search size={20} className={`absolute transition-all duration-200 ${searchOpen ? 'opacity-0 scale-50 rotate-90' : 'opacity-100 scale-100 rotate-0'}`} />
                        <X size={20} className={`absolute transition-all duration-200 ${searchOpen ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-50 -rotate-90'}`} />
                    </button>
                </div>

                <Link to="/carrinho" className="relative text-verde-claro p-2 rounded-full hover:bg-white/15 hover:scale-110 transition-all duration-200">
                    <FaCartShopping size={36} />
                    {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center leading-none">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </Link>
            </div>

            {/* Ícones mobile direita */}
            <div className="flex md:hidden items-center gap-3">
                <button onClick={() => navigate('/busca')} className="text-verde-claro p-1">
                    <Search size={22} />
                </button>
                <Link to="/carrinho" onClick={fecharMenu} className="relative">
                    <FaCartShopping className="w-6 h-auto text-verde-claro" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                            {cartCount > 99 ? '99+' : cartCount}
                        </span>
                    )}
                </Link>
                <button onClick={() => setMenuAberto(v => !v)} className="text-verde-claro p-1">
                    {menuAberto ? <FiX size={26} /> : <FiMenu size={26} />}
                </button>
            </div>

            {/* Menu mobile */}
            <div className={`md:hidden absolute top-20 left-0 w-full bg-verde-escuro border-t border-white/10 transition-all duration-300 ${menuAberto ? 'max-h-[calc(100vh-5rem)] overflow-y-auto opacity-100' : 'max-h-0 overflow-hidden opacity-0'}`}>
                <div className="flex flex-col px-6 py-4 gap-1">
                    <Link onClick={fecharMenu} to="/" className="text-verde-claro py-3 px-4 rounded-xl hover:bg-green-800 transition-colors">
                        Home
                    </Link>

                    {/* Produtos com submenu */}
                    <div>
                        {!loadingCategorias && categorias.length > 0 ? (
                            <>
                                <button
                                    onClick={() => setProdutosAberto(v => !v)}
                                    className="w-full text-left text-verde-claro py-3 px-4 rounded-xl hover:bg-green-800 transition-colors flex items-center justify-between"
                                >
                                    Produtos
                                    <FiChevronDown className={`transition-transform duration-300 ${produtosAberto ? 'rotate-180' : ''}`} />
                                </button>

                                <div className={`overflow-hidden transition-all duration-300 ${produtosAberto ? 'max-h-screen' : 'max-h-0'}`}>
                                    <div className="mt-1 ml-4 flex flex-col gap-1">
                                        <Link
                                            to="/produtos"
                                            onClick={fecharMenu}
                                            className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-800 transition-colors text-sm font-bold text-verde-claro"
                                        >
                                            Ver todos os produtos
                                        </Link>
                                        {categorias.map(({ nome, slug, descricao }) => {
                                            const Icon = slugIconMap[slug] ?? LuTag
                                            return (
                                                <Link
                                                    key={slug}
                                                    to={`/produtos/categoria/${slug}`}
                                                    onClick={fecharMenu}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-green-800 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-lg bg-white/10 text-verde-claro flex items-center justify-center text-base shrink-0">
                                                        <Icon />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-sm text-verde-claro">{nome}</p>
                                                        <p className="text-xs text-verde-claro/60">{descricao}</p>
                                                    </div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <Link onClick={fecharMenu} to="/produtos" className="text-verde-claro py-3 px-4 rounded-xl hover:bg-green-800 transition-colors flex items-center">
                                Produtos
                            </Link>
                        )}
                    </div>

                    <Link onClick={fecharMenu} to="/sobre-nos" className="text-verde-claro py-3 px-4 rounded-xl hover:bg-green-800 transition-colors">
                        Sobre Nós
                    </Link>
                    <Link onClick={fecharMenu} to="/contato" className="text-verde-claro py-3 px-4 rounded-xl hover:bg-green-800 transition-colors">
                        Contato
                    </Link>

                    <div className="flex flex-col gap-3 mt-4 pt-4 border-t border-white/10">
                        {isLogged ? (
                            <Link onClick={fecharMenu} to="/profile" className="text-center text-verde-claro border border-verde-claro py-2 rounded-full hover:bg-white/10 transition-colors">
                                Minha conta
                            </Link>
                        ) : (
                            <>
                                <Link onClick={fecharMenu} to="/login" className="text-center text-verde-claro border border-verde-claro py-2 rounded-full hover:bg-white/10 transition-colors">
                                    Login
                                </Link>
                                <Link onClick={fecharMenu} to="/register" className="text-center text-verde-escuro bg-verde-claro py-2 rounded-full hover:opacity-90 transition-opacity font-semibold">
                                    Cadastrar
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
