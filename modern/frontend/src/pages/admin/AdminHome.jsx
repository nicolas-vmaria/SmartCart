import { useState, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import CardInfo from '../../components/admin/CardInfo'
import { Banknote, Users, ShoppingCart, Package, Wand2, RefreshCw, Bell, AlertTriangle, ShoppingBag, FileUser } from 'lucide-react'
import { generateDashboardInsights } from '../../lib/IaAssistant'
import Graph from '../../components/admin/Chart'
import ProductsChart from '../../components/admin/ProductsChart'
import RecentOrders from '../../components/admin/RecentOrders'
import { getDashboard } from '../../lib/api/adminDashboard'
import { useAdminData } from '../../hooks/useAdminData'
import { getProduct } from '../../lib/api/adminProducts'
import { getClients } from '../../lib/api/clients'
import { getCurriculos } from '../../lib/api/adminCurriculos'
import { getAdminConfiguracoes } from '../../lib/api/adminConfiguracoes'
import { Link } from 'react-router-dom'

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })


function AlertCard({ icon: Icon, color, title, description, to }) {
    return (
        <Link to={to} className={`flex items-start gap-3 p-4 rounded-xl border ${color} hover:opacity-80 transition-opacity`}>
            <Icon size={18} className="mt-0.5 shrink-0" />
            <div className="min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-xs mt-0.5 opacity-80">{description}</p>
            </div>
        </Link>
    )
}

export default function AdminHome() {
    const [dash, setDash]             = useState(null)
    const [loadingDash, setLoadingDash] = useState(true)
    const [notifCfg, setNotifCfg]     = useState({})
    const [curriculosNovos, setCurriculosNovos] = useState(0)

    const { data: products, loading: loadingProducts } = useAdminData(
        'admin_products',
        async () => { const { data } = await getProduct(); return data.products ?? data }
    )
    const { data: clients, loading: loadingClients } = useAdminData(
        'admin_clients',
        async () => { const { data } = await getClients(); return Array.isArray(data) ? data : [] }
    )

    function fetchConfig() {
        getAdminConfiguracoes()
            .then(({ data }) => setNotifCfg(data.configuracoes ?? {}))
            .catch(() => {})
    }

    useEffect(() => {
        getDashboard()
            .then(({ data }) => setDash(data))
            .catch(() => {})
            .finally(() => setLoadingDash(false))

        fetchConfig()

        getCurriculos()
            .then(({ data }) => setCurriculosNovos(data.stats?.novos ?? 0))
            .catch(() => {})
    }, [])

    useEffect(() => {
        window.addEventListener('config:updated', fetchConfig)
        return () => window.removeEventListener('config:updated', fetchConfig)
    }, [])

    const loading = loadingDash || loadingProducts || loadingClients

    const [insights, setInsights] = useState(null)
    const [insightsLoading, setInsightsLoading] = useState(false)

    async function fetchInsights() {
        if (!dash && clients.length === 0) return
        setInsightsLoading(true)
        try {
            const result = await generateDashboardInsights({
                faturamento: fmt(dash?.faturamento_total ?? 0),
                clientes: clients.length,
                pedidosNovos: dash?.pedidos_novos ?? 0,
                produtos: products.length,
            })
            setInsights(result)
        } catch {
            setInsights(null)
        } finally {
            setInsightsLoading(false)
        }
    }

    useEffect(() => {
        if (loadingDash || loadingProducts || loadingClients) return
        if (!dash) return
        fetchInsights()
    }, [loadingDash, loadingProducts, loadingClients, dash])

    // Alertas calculados com base na config e nos dados já carregados
    const alerts = []

    if (notifCfg.notify_novos_pedidos !== '0') {
        const pendentes = dash?.pedidos_novos ?? 0
        if (pendentes > 0)
            alerts.push({
                icon: ShoppingBag,
                color: 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-500/10 dark:border-blue-500/30 dark:text-blue-300',
                title: `${pendentes} pedido${pendentes > 1 ? 's' : ''} aguardando`,
                description: 'Clique para ver os pedidos pendentes',
                to: '/admin/orders',
            })
    }

    if (!loadingProducts && notifCfg.notify_estoque_baixo !== '0') {
        const baixo = products.filter(p => p.estoque > 0 && p.estoque < 10)
        if (baixo.length > 0)
            alerts.push({
                icon: AlertTriangle,
                color: 'bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-500/10 dark:border-yellow-500/30 dark:text-yellow-300',
                title: `${baixo.length} produto${baixo.length > 1 ? 's' : ''} com estoque baixo`,
                description: baixo.slice(0, 2).map(p => p.nome).join(', ') + (baixo.length > 2 ? '...' : ''),
                to: '/admin/products',
            })
    }

    if (!loadingProducts && notifCfg.notify_alertas_sistema !== '0') {
        const semEstoque = products.filter(p => p.estoque === 0)
        if (semEstoque.length > 0)
            alerts.push({
                icon: Package,
                color: 'bg-red-50 border-red-200 text-red-700 dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-300',
                title: `${semEstoque.length} produto${semEstoque.length > 1 ? 's' : ''} sem estoque`,
                description: semEstoque.slice(0, 2).map(p => p.nome).join(', ') + (semEstoque.length > 2 ? '...' : ''),
                to: '/admin/products',
            })
    }

    if (notifCfg.notify_novos_curriculos !== '0' && curriculosNovos > 0)
        alerts.push({
            icon: FileUser,
            color: 'bg-green-50 border-green-200 text-green-700 dark:bg-green-500/10 dark:border-green-500/30 dark:text-green-300',
            title: `${curriculosNovos} currículo${curriculosNovos > 1 ? 's' : ''} novo${curriculosNovos > 1 ? 's' : ''}`,
            description: 'Candidaturas aguardando análise',
            to: '/admin/curriculos',
        })

    return (
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote}     title="Faturamento"   info={fmt(dash?.faturamento_total ?? 0)} loading={loadingDash} />
                <CardInfo icon={Users}        title="Clientes"      info={clients.length}                          loading={loadingClients} />
                <CardInfo icon={ShoppingCart} title="Pedidos Novos" info={dash?.pedidos_novos ?? 0}                loading={loadingDash} />
                <CardInfo icon={Package}      title="Produtos"      info={products.length}                         loading={loadingProducts} />
            </section>

            {alerts.length > 0 && (
                <section className="mb-5">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                        <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent) font-medium text-sm mb-3">
                            <Bell size={15} /> Alertas
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {alerts.map((a, i) => <AlertCard key={i} {...a} />)}
                        </div>
                    </div>
                </section>
            )}

            <section className="mb-5">
                <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent) font-medium text-sm">
                            <Wand2 size={15} />
                            Análise IA
                        </div>
                        <button
                            onClick={fetchInsights}
                            disabled={insightsLoading || loading}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 hover:text-verde-escuro transition-all disabled:opacity-40"
                            title="Atualizar análise"
                        >
                            <RefreshCw size={14} className={insightsLoading ? 'animate-spin' : ''} />
                        </button>
                    </div>
                    {insightsLoading || loading ? (
                        <div className="space-y-2 animate-pulse">
                            {[90, 75, 85, 60].map((w, i) => (
                                <div key={i} className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded" style={{ width: `${w}%` }} />
                            ))}
                        </div>
                    ) : insights ? (
                        <p className="text-sm text-gray-600 dark:text-(--admin-text) whitespace-pre-line leading-relaxed">{insights}</p>
                    ) : (
                        <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Não foi possível gerar a análise.</p>
                    )}
                </div>
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Graph data={dash?.faturamento_anual ?? []} loading={loadingDash} />
                <ProductsChart data={dash?.produtos_vendidos ?? []} loading={loadingDash} />
            </section>

            <section className="mt-5">
                <RecentOrders />
            </section>
        </div>
    )
}
