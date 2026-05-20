import AdminHeader from "../../components/admin/AdminHeader";
import CardInfo from "../../components/admin/CardInfo";
import { Banknote, Users, ShoppingCart, Package } from 'lucide-react'
import Graph from "../../components/admin/Chart";
import ProductsChart from '../../components/admin/ProductsChart'
import RecentOrders from '../../components/admin/RecentOrders'
import { useEffect, useState } from "react";
import { getProduct } from "../../lib/api/products";
import { getClients } from "../../lib/api/clients";

export default function AdminHome(){

    const [products, setProducts] = useState([])
    const [clientCount, setClientCount] = useState(null)
    const [toast, setToast] = useState()
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            try {
                const [productsRes, clientsRes] = await Promise.all([getProduct(), getClients()])
                setProducts(productsRes.data.products ?? productsRes.data)
                setClientCount((clientsRes.data.clients ?? clientsRes.data).length)
            } catch(err) {
                setToast({ message: "Erro ao puxar dados", type: "error" })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    return(
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote} title="Faturamento" info="R$153.932,33" />
                <CardInfo icon={Users} title="Clientes" info={loading ? '...' : (clientCount ?? 0)} />
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