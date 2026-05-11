import { useState } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import { ChevronDown, LayoutDashboard, Package, ClipboardList, Ticket, BarChart2, Mail, MessageCircle, BookOpen } from 'lucide-react'
import { Link } from 'react-router-dom'

function Section({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-4">
            <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{title}</h2>
            {children}
        </div>
    )
}

const faqs = [
    {
        q: 'Como adicionar um novo produto?',
        a: 'Acesse Produtos no menu lateral, clique em "Novo Produto" no canto superior direito, preencha nome, preço, categoria, estoque e imagem, depois clique em Salvar.',
    },
    {
        q: 'Como aprovar ou rejeitar um pedido?',
        a: 'Vá até Pedidos, localize o pedido desejado na tabela e clique no ícone de ação para alterar o status para Aprovado, Em preparo, Enviado ou Cancelado.',
    },
    {
        q: 'Como criar um cupom de desconto?',
        a: 'Acesse Cupons no menu lateral, clique em "Novo Cupom", defina o código, o tipo de desconto (percentual ou fixo), o valor e a data de expiração.',
    },
    {
        q: 'Como adicionar um novo usuário administrador?',
        a: 'Acesse Admin → Gerenciar Usuários, clique em "Novo Usuário", preencha os dados e atribua o papel de Admin. O usuário receberá acesso imediatamente.',
    },
    {
        q: 'Como visualizar os relatórios de vendas?',
        a: 'Acesse Relatórios no menu lateral. Você verá gráficos de faturamento por período, produtos mais vendidos e ticket médio. Use os filtros de data para ajustar o intervalo.',
    },
    {
        q: 'Como alterar o tema do painel (claro/escuro)?',
        a: 'Vá em Configurações → Aparência e selecione Claro, Escuro ou Sistema. A preferência é salva no navegador.',
    },
]

function Faq({ q, a }) {
    const [open, setOpen] = useState(false)
    return (
        <div className="border border-gray-200 dark:border-(--admin-border) rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen(o => !o)}
                className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all"
            >
                {q}
                <ChevronDown size={16} className={`shrink-0 ml-2 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="px-4 pb-4 text-sm text-gray-500 dark:text-(--admin-text-muted) border-t border-gray-100 dark:border-(--admin-border) pt-3">
                    {a}
                </div>
            )}
        </div>
    )
}

const quickLinks = [
    { label: 'Dashboard',  to: '/admin',             icon: LayoutDashboard },
    { label: 'Produtos',   to: '/admin/products',     icon: Package },
    { label: 'Pedidos',    to: '/admin/orders',       icon: ClipboardList },
    { label: 'Cupons',     to: '/admin/cupons',       icon: Ticket },
    { label: 'Relatórios', to: '/admin/relatorios',   icon: BarChart2 },
    { label: 'Documentação', to: 'https://github.com', icon: BookOpen, external: true },
]

export default function AdminHelp() {
    return (
        <main>
            <AdminHeader title="Ajuda" description="Tire suas dúvidas e acesse recursos úteis do painel." />

            <div className="mt-5 flex flex-col gap-5">

                <Section title="Perguntas Frequentes">
                    <div className="flex flex-col gap-2">
                        {faqs.map((f, i) => <Faq key={i} q={f.q} a={f.a} />)}
                    </div>
                </Section>

                <Section title="Acesso Rápido">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {quickLinks.map(({ label, to, icon: Icon, external }) => (
                            <Link
                                key={label}
                                to={to}
                                target={external ? '_blank' : undefined}
                                rel={external ? 'noopener noreferrer' : undefined}
                                className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-(--admin-border) hover:border-verde-escuro dark:hover:border-(--admin-accent) hover:bg-green-50 dark:hover:bg-(--admin-accent-soft) transition-all group"
                            >
                                <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 dark:text-(--admin-text-muted) group-hover:bg-verde-escuro dark:group-hover:bg-(--admin-accent) group-hover:text-white dark:group-hover:text-black transition-all shrink-0">
                                    <Icon size={16} />
                                </div>
                                <span className="text-sm font-medium text-gray-700 dark:text-(--admin-text) group-hover:text-verde-escuro dark:group-hover:text-(--admin-accent) transition-all">
                                    {label}
                                </span>
                            </Link>
                        ))}
                    </div>
                </Section>

                <Section title="Suporte">
                    <div className="flex flex-col gap-3">
                        <a
                            href="mailto:suporte@smartcart.com"
                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-(--admin-border) hover:border-verde-escuro dark:hover:border-(--admin-accent) transition-all group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 group-hover:bg-verde-escuro dark:group-hover:bg-(--admin-accent) group-hover:text-white dark:group-hover:text-black transition-all shrink-0">
                                <Mail size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">Email de suporte</p>
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">suporte@smartcart.com</p>
                            </div>
                        </a>
                        <a
                            href="https://wa.me/5511999999999"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-(--admin-border) hover:border-verde-escuro dark:hover:border-(--admin-accent) transition-all group"
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 group-hover:bg-verde-escuro dark:group-hover:bg-(--admin-accent) group-hover:text-white dark:group-hover:text-black transition-all shrink-0">
                                <MessageCircle size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">WhatsApp</p>
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Atendimento em horário comercial</p>
                            </div>
                        </a>
                    </div>
                </Section>

            </div>
        </main>
    )
}
