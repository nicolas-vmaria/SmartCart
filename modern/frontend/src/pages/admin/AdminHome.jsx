import AdminHeader from "../../components/admin/AdminHeader";
import CardInfo from "../../components/admin/CardInfo";
import { Banknote, Users, ShoppingCart, Package } from 'lucide-react'
import Graph from "../../components/admin/Chart";
import ProductsChart from '../../components/admin/ProductsChart'
import RecentOrders from '../../components/admin/RecentOrders'

export default function AdminHome(){
    return(
        <div>
            <AdminHeader title="Dashboard" description="Visão geral das vendas, pedidos e clientes da loja." />

            <section className="my-5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                <CardInfo icon={Banknote} title="Faturamento" info="R$153.932,33" />
                <CardInfo icon={Users} title="Clientes" info="1.265" />
                <CardInfo icon={ShoppingCart} title="Pedidos Novos" info="16" />
                <CardInfo icon={Package} title="Produtos" info="213" />
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