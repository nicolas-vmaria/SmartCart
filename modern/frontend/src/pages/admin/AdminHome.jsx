import { useState, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import CardInfo from '../../components/admin/CardInfo'
import { Banknote, Users, ShoppingCart, Package, Wand2, RefreshCw } from 'lucide-react'
import { generateDashboardInsights } from '../../lib/IaAssistant'
import Graph from '../../components/admin/Chart'
import ProductsChart from '../../components/admin/ProductsChart'
import RecentOrders from '../../components/admin/RecentOrders'
import { getDashboard } from '../../lib/api/adminDashboard'
import { useAdminData } from '../../hooks/useAdminData'
import { getProduct } from '../../lib/api/adminProducts'
import { getClients } from '../../lib/api/clients'

const fmt = v => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

export default function AdminHome() {
    const [dash, setDash]       = useState(null)
    const [loadingDash, setLoadingDash] = useState(true)

    const { data: products, loading: loadingProducts } = useAdminData(
        'admin_products',
        async () => { const { data } = await getProduct(); return data.products ?? data }
    )
    const { data: clients, loading: loadingClients } = useAdminData(
        'admin_clients',
        async () => { const { data } = await getClients(); return Array.isArray(data) ? data : [] }
    )

    useEffect(() => {
        getDashboard()
            .then(({ data }) => setDash(data))
            .catch(() => {})
            .finally(() => setLoadingDash(false))
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

    return (
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote}     title="Faturamento"   info={fmt(dash?.faturamento_total ?? 0)} loading={loadingDash} />
                <CardInfo icon={Users}        title="Clientes"      info={clients.length}                          loading={loadingClients} />
                <CardInfo icon={ShoppingCart} title="Pedidos Novos" info={dash?.pedidos_novos ?? 0}                loading={loadingDash} />
                <CardInfo icon={Package}      title="Produtos"      info={products.length}                         loading={loadingProducts} />
            </section>

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
