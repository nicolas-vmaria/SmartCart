import { LayoutDashboard, Users, Package, ClipboardList, UserCog, HelpCircle, Settings, LogOut, Tag, ShieldCheck, FileUser, Ticket, BarChart2, Briefcase, Paintbrush, TrendingUp, MessageSquare, ScrollText } from 'lucide-react'
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import { getAdminOrders } from '../../lib/api/adminOrders'
import { getCurriculos } from '../../lib/api/adminCurriculos'
import { getAdminConfiguracoes } from '../../lib/api/adminConfiguracoes'
import { getProduct } from '../../lib/api/adminProducts'
import { adminApi } from '../../lib/api'

const linkClass = "cursor-pointer flex gap-2 items-center h-10 px-2 rounded-md transition-all hover:bg-gray-100 dark:text-(--admin-text) dark:hover:bg-(--admin-hover) outline-none"

function Badge({ count }) {
    if (!count) return null
    return (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-tight">
            {count > 99 ? '99+' : count}
        </span>
    )
}

export default function AdminMenu({ isOpen, onClose }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [confirm, setConfirm] = useState(false)
    const [notifPedidos, setNotifPedidos]       = useState(0)
    const [notifCurriculos, setNotifCurriculos] = useState(0)
    const [notifEstoque, setNotifEstoque]       = useState(0)
    const [notifCfg, setNotifCfg]               = useState({})

    function fetchConfig() {
        getAdminConfiguracoes()
            .then(({ data }) => setNotifCfg(data.configuracoes ?? {}))
            .catch(() => {})
    }

    useEffect(() => {
        fetchConfig()

        getAdminOrders()
            .then(({ data }) => {
                const count = (data.orders ?? []).filter(o => o.status === 'aguardando').length
                setNotifPedidos(count)
            })
            .catch(() => {})

        getCurriculos()
            .then(({ data }) => setNotifCurriculos(data.stats?.novos ?? 0))
            .catch(() => {})

        getProduct()
            .then(({ data }) => {
                const prods = data.products ?? data ?? []
                setNotifEstoque(prods.filter(p => p.estoque > 0 && p.estoque < 10).length)
            })
            .catch(() => {})
    }, [location.pathname])

    useEffect(() => {
        window.addEventListener('config:updated', fetchConfig)
        return () => window.removeEventListener('config:updated', fetchConfig)
    }, [])

    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}')
    const nome = adminUser.nome || 'Usuário'
    const papel = adminUser.nome_papel || 'Admin'
    const initials = nome.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

    const perms = adminUser.permissions ?? null
    const can = (key) => !perms || !!(perms[key])

    function closeAdmin() {
        setConfirm(true)
    }

    return (
        <>
        <aside className={`w-72 md:w-80 h-screen bg-white dark:bg-(--admin-sidebar) fixed flex flex-col justify-between p-5 text-verde-escuro shadow-2xl dark:shadow-black/60 rounded-tr-2xl rounded-br-2xl z-20 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hide">
                <Link to="/admin/profile" onClick={onClose} className="flex items-center gap-2 p-2 rounded-xl transition-all hover:dark:bg-(--admin-border) hover:bg-gray-100">
                    <div className="flex border border-verde-escuro dark:border-(--admin-border) aspect-square w-12 h-12 rounded-full justify-center items-center shrink-0">
                        <span className="text-verde-escuro dark:text-(--admin-accent) font-bold text-sm">{initials}</span>
                    </div>
                    <div className="min-w-0">
                        <h1 className="font-bold text-base text-verde-escuro dark:text-(--admin-accent) truncate">{nome}</h1>
                        <p className="text-sm text-verde-escuro dark:text-(--admin-text-muted) truncate">{papel}</p>
                    </div>
                </Link>

                <div>
                    <ul className="flex flex-col gap-2 py-5">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate dark:text-(--admin-accent)">Geral</h1>
                        <div className="flex flex-col gap-4">
                            {can('dashboard')   && <Link to="/admin" onClick={onClose} className={linkClass}><LayoutDashboard size={18} />Dashboard</Link>}
                            {can('clientes')    && <Link to="/admin/clients" onClick={onClose} className={linkClass}><Users size={18} />Clientes</Link>}
                            {can('produtos')    && <Link to="/admin/products" onClick={onClose} className={linkClass}><Package size={18} />Produtos<Badge count={notifCfg.notify_estoque_baixo !== '0' ? notifEstoque : 0} /></Link>}
                            {can('categorias')  && <Link to="/admin/categories" onClick={onClose} className={linkClass}><Tag size={18} />Categorias</Link>}
                            {can('reviews')     && <Link to="/admin/reviews" onClick={onClose} className={linkClass}><MessageSquare size={18} />Reviews</Link>}
                            {can('pedidos')     && <Link to="/admin/orders" onClick={onClose} className={linkClass}><ClipboardList size={18} />Pedidos<Badge count={notifCfg.notify_novos_pedidos !== '0' ? notifPedidos : 0} /></Link>}
                            {can('curriculos')  && <Link to="/admin/curriculos" onClick={onClose} className={linkClass}><FileUser size={18} />Currículos<Badge count={notifCfg.notify_novos_curriculos !== '0' ? notifCurriculos : 0} /></Link>}
                            {can('trabalhos')   && <Link to="/admin/vagas" onClick={onClose} className={linkClass}><Briefcase size={18} />Vagas</Link>}
                            {can('cupons')      && <Link to="/admin/cupons" onClick={onClose} className={linkClass}><Ticket size={18} />Cupons</Link>}
                            {can('customizacao') && <Link to="/admin/customizacao" onClick={onClose} className={linkClass}><Paintbrush size={18} />Customização</Link>}
                            {can('marketing')    && <Link to="/admin/marketing"    onClick={onClose} className={linkClass}><TrendingUp size={18} />Marketing</Link>}
                            {can('relatorios')  && <Link to="/admin/relatorios" onClick={onClose} className={linkClass}><BarChart2 size={18} />Relatórios</Link>}
                            {can('auditoria')   && <Link to="/admin/auditoria" onClick={onClose} className={linkClass}><ScrollText size={18} />Auditoria</Link>}
                        </div>
                    </ul>

                    <hr className="border-gray-200 dark:border-(--admin-border)" />

                    <ul className="py-5 flex flex-col gap-4">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate dark:text-(--admin-accent)">Admin</h1>
                        {can('usuarios')      && <Link to="/admin/manage-users" onClick={onClose} className={linkClass}><UserCog size={18} />Gerenciar usuários</Link>}
                        {can('papeis')        && <Link to="/admin/roles" onClick={onClose} className={linkClass}><ShieldCheck size={18} />Gerenciar Pápeis</Link>}
                        <Link to="/admin/help" onClick={onClose} className={linkClass}><HelpCircle size={18} />Ajuda</Link>
                        {can('configuracoes') && <Link to="/admin/settings" onClick={onClose} className={linkClass}><Settings size={18} />Configurações</Link>}
                    </ul>
                </div>
            </div>

            <button onClick={closeAdmin} className={linkClass}>
                <LogOut size={18} />
                <p>Sair</p>
            </button>

        </aside>
        {confirm && <ConfirmDialog message='Ao sair você perde o acesso e terá que logar novamente.' title='Deseja realmente sair?' onConfirm={() => { localStorage.clear(); navigate('/admin/login'); adminApi.post('/admin/auth/logout').catch(() => {}) }} onCancel={() => {setConfirm(false)}}/>}
        </>
    )
}
