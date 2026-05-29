import { useState, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import CardInfo from '../../components/admin/CardInfo'
import { Banknote, Users, ShoppingCart, Package } from 'lucide-react'
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

    return (
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote}     title="Faturamento"   info={fmt(dash?.faturamento_total ?? 0)} loading={loadingDash} />
                <CardInfo icon={Users}        title="Clientes"      info={clients.length}                          loading={loadingClients} />
                <CardInfo icon={ShoppingCart} title="Pedidos Novos" info={dash?.pedidos_novos ?? 0}                loading={loadingDash} />
                <CardInfo icon={Package}      title="Produtos"      info={products.length}                         loading={loadingProducts} />
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
