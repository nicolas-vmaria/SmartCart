import { LayoutDashboard, Users, Package, ClipboardList, UserCog, HelpCircle, Settings, LogOut, Tag, ShieldCheck, FileUser, Ticket, BarChart2, Briefcase, Paintbrush, TrendingUp, MessageSquare, ScrollText, Bug, Wrench, ChevronDown, Search } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ConfirmDialog from '../../components/ConfirmDialog'
import { getAdminOrders } from '../../lib/api/adminOrders'
import { getCurriculos } from '../../lib/api/adminCurriculos'
import { getAdminConfiguracoes } from '../../lib/api/adminConfiguracoes'
import { getProduct } from '../../lib/api/adminProducts'
import { adminApi } from '../../lib/api'

const linkClass = "cursor-pointer flex gap-2 items-center h-10 px-2 rounded-md transition-all hover:bg-gray-100 dark:text-(--admin-text) dark:hover:bg-(--admin-hover) outline-none"
const activeLinkClass = "bg-verde-escuro/10 text-verde-escuro font-semibold dark:bg-(--admin-hover) dark:text-(--admin-accent)"

const DASHBOARD_ITEM = { key: 'dashboard', label: 'Dashboard', to: '/admin', icon: LayoutDashboard, permKey: 'dashboard' }

const GROUPS_STATIC = [
    { groupKey: 'vendas', groupLabel: 'VENDAS', items: [
        { key: 'pedidos', label: 'Pedidos', to: '/admin/orders', icon: ClipboardList, permKey: 'pedidos' },
        { key: 'clientes', label: 'Clientes', to: '/admin/clients', icon: Users, permKey: 'clientes' },
        { key: 'cupons', label: 'Cupons', to: '/admin/cupons', icon: Ticket, permKey: 'cupons' },
    ]},
    { groupKey: 'catalogo', groupLabel: 'CATÁLOGO', items: [
        { key: 'produtos', label: 'Produtos', to: '/admin/products', icon: Package, permKey: 'produtos' },
        { key: 'categorias', label: 'Categorias', to: '/admin/categories', icon: Tag, permKey: 'categorias' },
        { key: 'reviews', label: 'Reviews', to: '/admin/reviews', icon: MessageSquare, permKey: 'reviews' },
    ]},
    { groupKey: 'marketing', groupLabel: 'MARKETING', items: [
        { key: 'marketing', label: 'Marketing', to: '/admin/marketing', icon: TrendingUp, permKey: 'marketing' },
        { key: 'customizacao', label: 'Customização', to: '/admin/customizacao', icon: Paintbrush, permKey: 'customizacao' },
    ]},
    { groupKey: 'rh', groupLabel: 'RH', items: [
        { key: 'curriculos', label: 'Currículos', to: '/admin/curriculos', icon: FileUser, permKey: 'curriculos' },
        { key: 'trabalhos', label: 'Vagas', to: '/admin/vagas', icon: Briefcase, permKey: 'trabalhos' },
    ]},
    { groupKey: 'relatorios', groupLabel: 'RELATÓRIOS', items: [
        { key: 'relatorios', label: 'Relatórios', to: '/admin/relatorios', icon: BarChart2, permKey: 'relatorios' },
        { key: 'auditoria', label: 'Auditoria', to: '/admin/auditoria', icon: ScrollText, permKey: 'auditoria' },
    ]},
    { groupKey: 'administracao', groupLabel: 'ADMINISTRAÇÃO', items: [
        { key: 'usuarios', label: 'Gerenciar usuários', to: '/admin/manage-users', icon: UserCog, permKey: 'usuarios' },
        { key: 'papeis', label: 'Gerenciar Papéis', to: '/admin/roles', icon: ShieldCheck, permKey: 'papeis' },
    ]},
    { groupKey: 'tecnico', groupLabel: 'TÉCNICO', items: [
        { key: 'reports', label: 'Reports', to: '/admin/reports', icon: Bug, permKey: 'reports' },
        { key: 'chamados', label: 'Chamados', to: '/admin/report-tickets', icon: Wrench, permKey: 'chamados' },
    ]},
]

const FIXED_ITEMS = [
    { key: 'configuracoes', label: 'Configurações', to: '/admin/settings', icon: Settings, permKey: 'configuracoes' },
    { key: 'ajuda', label: 'Ajuda', to: '/admin/help', icon: HelpCircle, permKey: null },
]

function isItemActive(pathname, item) {
    if (item.to === '/admin') return pathname === '/admin'
    return pathname === item.to || pathname.startsWith(item.to + '/')
}

function findActiveGroupKey(pathname) {
    const group = GROUPS_STATIC.find(g => g.items.some(i => isItemActive(pathname, i)))
    return group ? group.groupKey : null
}

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
    const [search, setSearch] = useState('')
    const [openGroups, setOpenGroups] = useState(() => {
        const active = findActiveGroupKey(location.pathname)
        return active ? new Set([active]) : new Set()
    })

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
            .then(({ data }) => setNotifCurriculos(Number(data.stats?.novos ?? 0)))
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

    useEffect(() => {
        function refreshCurriculos() {
            getCurriculos()
                .then(({ data }) => setNotifCurriculos(Number(data.stats?.novos ?? 0)))
                .catch(() => {})
        }
        window.addEventListener('curriculos:updated', refreshCurriculos)
        return () => window.removeEventListener('curriculos:updated', refreshCurriculos)
    }, [])

    useEffect(() => {
        const active = findActiveGroupKey(location.pathname)
        if (active) setOpenGroups(prev => prev.has(active) ? prev : new Set(prev).add(active))
    }, [location.pathname])

    let adminUser = {}
    try { adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}') } catch { adminUser = {} }
    const nome = adminUser.nome || 'Usuário'
    const papel = adminUser.nome_papel || 'Admin'
    const initials = nome.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

    const perms = adminUser.permissions ?? null
    const can = (key) => {
        if (!perms) return true
        return Object.prototype.hasOwnProperty.call(perms, key) ? !!perms[key] : false
    }

    const badgeByKey = {
        produtos: notifCfg.notify_estoque_baixo !== '0' ? notifEstoque : 0,
        pedidos: notifCfg.notify_novos_pedidos !== '0' ? notifPedidos : 0,
        curriculos: notifCfg.notify_novos_curriculos !== '0' ? notifCurriculos : 0,
    }

    const visibleGroups = useMemo(() =>
        GROUPS_STATIC
            .map(g => ({ ...g, items: g.items.filter(i => !i.permKey || can(i.permKey)) }))
            .filter(g => g.items.length > 0),
        [perms]
    )

    const query = search.trim().toLowerCase()
    const isSearching = query.length > 0

    const displayGroups = useMemo(() => {
        if (!isSearching) return visibleGroups
        return visibleGroups
            .map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(query)) }))
            .filter(g => g.items.length > 0)
    }, [visibleGroups, query, isSearching])

    function toggleGroup(key) {
        setOpenGroups(prev => {
            const next = new Set(prev)
            next.has(key) ? next.delete(key) : next.add(key)
            return next
        })
    }

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

                <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-md px-3 py-2 my-3">
                    <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        aria-label="Buscar no menu"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="outline-none bg-transparent dark:text-(--admin-text) text-sm w-full"
                    />
                </div>

                <div>
                    {can('dashboard') && (
                        <Link
                            to={DASHBOARD_ITEM.to}
                            onClick={onClose}
                            className={`${linkClass} ${isItemActive(location.pathname, DASHBOARD_ITEM) ? activeLinkClass : ''}`}
                        >
                            <LayoutDashboard size={18} />Dashboard
                        </Link>
                    )}

                    <div className="flex flex-col gap-1 py-3">
                        {displayGroups.map(group => {
                            const isEffectivelyOpen = isSearching ? true : openGroups.has(group.groupKey)
                            return (
                                <div key={group.groupKey}>
                                    <button
                                        type="button"
                                        onClick={() => toggleGroup(group.groupKey)}
                                        aria-expanded={isEffectivelyOpen}
                                        className="flex items-center justify-between w-full py-2 text-left cursor-pointer"
                                    >
                                        <h1 className="font-bold text-xs uppercase tracking-wide text-verde-escuro-escarlate dark:text-(--admin-accent)">{group.groupLabel}</h1>
                                        <ChevronDown size={16} className={`transition-transform ${isEffectivelyOpen ? 'rotate-180' : ''}`} />
                                    </button>
                                    {isEffectivelyOpen && (
                                        <div className="flex flex-col gap-2 pb-3">
                                            {group.items.map(item => {
                                                const Icon = item.icon
                                                return (
                                                    <Link
                                                        key={item.key}
                                                        to={item.to}
                                                        onClick={onClose}
                                                        className={`${linkClass} ${isItemActive(location.pathname, item) ? activeLinkClass : ''}`}
                                                    >
                                                        <Icon size={18} />{item.label}
                                                        <Badge count={badgeByKey[item.key] ?? 0} />
                                                    </Link>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-1 pt-3 border-t border-gray-200 dark:border-(--admin-border)">
                {FIXED_ITEMS.filter(item => !item.permKey || can(item.permKey)).map(item => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.key}
                            to={item.to}
                            onClick={onClose}
                            className={`${linkClass} ${isItemActive(location.pathname, item) ? activeLinkClass : ''}`}
                        >
                            <Icon size={18} />{item.label}
                        </Link>
                    )
                })}
                <button onClick={closeAdmin} className={linkClass}>
                    <LogOut size={18} />
                    <p>Sair</p>
                </button>
            </div>

        </aside>
        {confirm && <ConfirmDialog message='Ao sair você perde o acesso e terá que logar novamente.' title='Deseja realmente sair?' onConfirm={() => { localStorage.clear(); navigate('/admin/login'); adminApi.post('/admin/auth/logout').catch(() => {}) }} onCancel={() => {setConfirm(false)}}/>}
        </>
    )
}
