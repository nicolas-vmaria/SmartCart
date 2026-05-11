import { LayoutDashboard, Users, Package, ClipboardList, UserCog, HelpCircle, Settings, LogOut, Tag, ShieldCheck, FileUser, Ticket, BarChart2 } from 'lucide-react'
import { Link } from 'react-router-dom'

const linkClass = "cursor-pointer flex gap-2 items-center h-10 px-2 rounded-md transition-all hover:bg-gray-100 dark:text-(--admin-text) dark:hover:bg-(--admin-hover) outline-none"

// Mock notification counts — replace with real data when backend is ready
const NOTIF_PEDIDOS = 5
const NOTIF_CURRICULOS = 3

function Badge({ count }) {
    if (!count) return null
    return (
        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-5 text-center leading-tight">
            {count > 99 ? '99+' : count}
        </span>
    )
}

export default function AdminMenu() {
    return (
        <aside className="w-80 h-screen bg-white dark:bg-(--admin-sidebar) fixed flex flex-col justify-between p-5 text-verde-escuro shadow-2xl dark:shadow-black/60 rounded-tr-2xl rounded-br-2xl z-10">
            <div>
                <Link to="/admin/profile" className="flex items-center gap-2 p-2 rounded-xl transition-all hover:dark:bg-(--admin-border) hover:bg-gray-100">
                    <div className="flex border border-verde-escuro dark:border-(--admin-border) aspect-square w-12 h-12 rounded-full justify-center items-center">
                        <p className="dark:text-(--admin-text)">user</p>
                    </div>
                    <div>
                        <h1 className="font-bold text-xl text-verde-escuro dark:text-(--admin-accent)">Ciclano da Silva</h1>
                        <p className="text-verde-escuro dark:text-(--admin-text-muted)">Admin</p>
                    </div>
                </Link>

                <div>
                    <ul className="flex flex-col gap-2 py-5">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate dark:text-(--admin-accent)">Geral</h1>
                        <div className="flex flex-col gap-4">
                            <Link to="/admin" className={linkClass}><LayoutDashboard size={18} />Dashboard</Link>
                            <Link to="/admin/clients" className={linkClass}><Users size={18} />Clientes</Link>
                            <Link to="/admin/products" className={linkClass}><Package size={18} />Produtos</Link>
                            <Link to="/admin/categories" className={linkClass}><Tag size={18} />Categorias</Link>
                            <Link to="/admin/orders" className={linkClass}><ClipboardList size={18} />Pedidos<Badge count={NOTIF_PEDIDOS} /></Link>
                            <Link to="/admin/curriculos" className={linkClass}><FileUser size={18} />Currículos<Badge count={NOTIF_CURRICULOS} /></Link>
                            <Link to="/admin/cupons" className={linkClass}><Ticket size={18} />Cupons</Link>
                            <Link to="/admin/relatorios" className={linkClass}><BarChart2 size={18} />Relatórios</Link>
                        </div>
                    </ul>

                    <hr className="border-gray-200 dark:border-(--admin-border)" />

                    <ul className="py-5 flex flex-col gap-4">
                        <h1 className="font-bold text-xl text-verde-escuro-escarlate dark:text-(--admin-accent)">Admin</h1>
                        <Link to="/admin/manage-users" className={linkClass}><UserCog size={18} />Gerenciar usuários</Link>
                        <Link to="/admin/roles" className={linkClass}><ShieldCheck size={18} />Gerenciar Pápeis</Link>
                        <Link to="/admin/help" className={linkClass}><HelpCircle size={18} />Ajuda</Link>
                        <Link to="/admin/settings" className={linkClass}><Settings size={18} />Configurações</Link>
                    </ul>
                </div>
            </div>

            
                <Link to="/" onClick={() => {localStorage.clear()}} className={linkClass}>

                    <LogOut size={18} />
                    <p>Sair</p>

                </Link>
        
        </aside>
    )
}
