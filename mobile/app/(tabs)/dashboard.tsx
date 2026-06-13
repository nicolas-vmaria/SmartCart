import { View, ScrollView } from "react-native";
import { useEffect, useState } from "react";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import TitleHeader from "../../components/titleHeader";
import Card from "../../components/card";
import SkeletonCard from "../../components/SkeletonCard";
import { getDashboard, getProducts, getClients } from "../../lib/api";

type DashboardData = {
    faturamento_total: number;
    pedidos_novos: number;
    total_clientes: number;
    total_produtos: number;
};

export default function Dashboard() {
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [dashRes, prodRes, clientRes] = await Promise.all([
                    getDashboard(),
                    getProducts(),
                    getClients(),
                ]);
                const produtos = prodRes.data?.products ?? prodRes.data;
                const clientes = clientRes.data?.clients ?? clientRes.data;
                setData({
                    faturamento_total: dashRes.data?.faturamento_total ?? 0,
                    pedidos_novos: dashRes.data?.pedidos_novos ?? 0,
                    total_produtos: Array.isArray(produtos) ? produtos.length : 0,
                    total_clientes: Array.isArray(clientes) ? clientes.length : 0,
                });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 32 }}>
            <TitleHeader title="Dashboard" subtitle="Visão geral do sistema" />
            <View className="gap-4">
                {loading ? (
                    <>
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </>
                ) : (
                    <>
                        <Card
                            title="Faturamento"
                            icon={<FontAwesome6 name="money-bill-trend-up" size={24} color="#E9FF75" />}
                            color="#18572C"
                            value={formatCurrency(data?.faturamento_total ?? 0)}
                        />
                        <Card
                            title="Clientes"
                            icon={<FontAwesome6 name="users" size={24} color="#E9FF75" />}
                            color="#18572C"
                            value={String(data?.total_clientes ?? 0)}
                        />
                        <Card
                            title="Pedidos Novos"
                            icon={<FontAwesome6 name="bag-shopping" size={24} color="#E9FF75" />}
                            color="#18572C"
                            value={String(data?.pedidos_novos ?? 0)}
                        />
                        <Card
                            title="Produtos Cadastrados"
                            icon={<FontAwesome6 name="box-open" size={24} color="#E9FF75" />}
                            color="#18572C"
                            value={String(data?.total_produtos ?? 0)}
                        />
                    </>
                )}
            </View>
        </ScrollView>
    );
}
