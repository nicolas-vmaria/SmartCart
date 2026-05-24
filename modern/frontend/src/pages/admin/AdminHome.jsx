import AdminHeader from "../../components/admin/AdminHeader";
import CardInfo from "../../components/admin/CardInfo";
import { Banknote, Users, ShoppingCart, Package } from 'lucide-react'
import Graph from "../../components/admin/Chart";
import ProductsChart from '../../components/admin/ProductsChart'
import RecentOrders from '../../components/admin/RecentOrders'
import { useState } from "react";
import { useAdminData } from "../../hooks/useAdminData";
import { getProduct } from "../../lib/api/adminProducts";
import { getClients } from "../../lib/api/clients";

export default function AdminHome(){

    const { data: products, loading: loadingProducts } = useAdminData(
        'admin_products',
        async () => { const { data } = await getProduct(); return data.products ?? data }
    )
    const { data: clients, loading: loadingClients } = useAdminData(
        'admin_clients',
        async () => { const { data } = await getClients(); return Array.isArray(data) ? data : [] }
    )
    const [toast, setToast] = useState()
    const loading = loadingProducts || loadingClients
    const clientCount = clients.length

    return(
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote} title="Faturamento" info="R$153.932,33" />
                <CardInfo icon={Users} title="Clientes" info={loading ? '...' : clientCount} />
                <CardInfo icon={ShoppingCart} title="Pedidos Novos" info="16" />
                <CardInfo icon={Package} title="Produtos" info={loading ? '...' : products.length} />
            </section>

            <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                <Graph />
                <ProductsChart />
            </section>

            <section className="mt-5">
                <RecentOrders />
            </section>
        </div>
    )
}