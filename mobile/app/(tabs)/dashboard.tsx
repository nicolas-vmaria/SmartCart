import { View, ScrollView, RefreshControl, TouchableOpacity } from "react-native";
import { Text } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import Card from "../../components/card";
import SkeletonCard from "../../components/SkeletonCard";
import StatusBadge from "../../components/StatusBadge";
import { getDashboard, getOrders } from "../../lib/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeJwt } from "../../lib/jwt";

const MONTHS_SHORT = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const BAR_HEIGHT = 72;

type UserInfo = { nome: string; email: string; tel?: string };
type MonthData = { mes: number; pedidos: number; valor: number };
type TopProduct = { nome: string; total_vendido: number };
type Order = { id: number; cliente: string; total: number; status: string };

type DashboardData = {
    faturamento_total: number;
    pedidos_novos: number;
    faturamento_anual: MonthData[];
    produtos_vendidos: TopProduct[];
};

function formatCurrency(value: number) {
    const n = (parseFloat(value as any) || 0).toFixed(2);
    const [intPart, decPart] = n.split(".");
    return `R$ ${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
}

function SectionTitle({ label, onPress }: { label: string; onPress?: () => void }) {
    return (
        <View className="flex-row justify-between items-center mb-3 mt-6">
            <Text className="font-bold text-gray-900 text-base">{label}</Text>
            {onPress && (
                <TouchableOpacity onPress={onPress}>
                    <Text style={{ color: "#18572C" }} className="text-sm font-semibold">Ver todos</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

export default function Dashboard() {
    const [dash, setDash] = useState<DashboardData | null>(null);
    const [user, setUser] = useState<UserInfo | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem("admin_token").then(token => {
            if (!token) return;
            const payload = decodeJwt(token);
            if (payload) setUser({ nome: payload.nome, email: payload.email });
        });
    }, []);

    async function fetchData(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(false);
        try {
            const [dashRes, ordersRes] = await Promise.all([
                getDashboard(),
                getOrders(),
            ]);
            setDash(dashRes.data ?? null);
            const arr = ordersRes.data?.orders ?? ordersRes.data;
            setRecentOrders(Array.isArray(arr) ? arr.slice(0, 3) : []);
        } catch {
            setError(true);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => { fetchData(); }, []);

    if (error) {
        return (
            <View className="flex-1 bg-white items-center justify-center px-6">
                <Text className="text-gray-500 text-base text-center mb-4">Não foi possível conectar ao servidor.</Text>
                <TouchableOpacity onPress={() => fetchData()} className="bg-verdeEscuro px-6 py-3 rounded-xl">
                    <Text className="text-verdeClaro font-semibold">Tentar novamente</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const now = new Date();
    const mesAtual = now.getMonth() + 1;
    const anoAtual = now.getFullYear();

    const anual = dash?.faturamento_anual ?? [];
    const mesAtualData = anual.find(m => m.mes === mesAtual);
    const receitaMes = mesAtualData ? parseFloat(mesAtualData.valor as any) || 0 : 0;
    const pedidosAno = anual.reduce((s, m) => s + (Number(m.pedidos) || 0), 0);

    const maxValor = anual.reduce((max, m) => Math.max(max, parseFloat(m.valor as any) || 0), 1);
    const topProdutos = dash?.produtos_vendidos ?? [];
    const maxVendido = topProdutos.reduce((max, p) => Math.max(max, p.total_vendido), 1);

    return (
        <ScrollView
            className="flex-1 bg-white"
            contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 120 }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#18572C" />}
        >

            <Text className="text-3xl mb-4">Bem-vindo, <Text className="font-bold">{(user?.nome.split(' ')[0])}</Text>!👋</Text>

            <TitleHeader title="Dashboard" subtitle={`${MONTHS_SHORT[mesAtual - 1]} ${anoAtual}`} />

            {/* KPI Cards */}
            {loading ? (
                <View className="gap-4">
                    <SkeletonCard />
                    <SkeletonCard />
                    <View className="flex-row gap-3">
                        <View className="flex-1"><SkeletonCard /></View>
                        <View className="flex-1"><SkeletonCard /></View>
                    </View>
                </View>
            ) : (
                <View className="gap-3">
                    <Card
                        title="Faturamento Total"
                        icon={<FontAwesome6 name="money-bill-trend-up" size={22} color="#E9FF75" />}
                        color="#18572C"
                        value={formatCurrency(dash?.faturamento_total ?? 0)}
                        onPress={() => router.push("/(tabs)/pedidos")}
                    />
                    <Card
                        title="Receita do Mês"
                        icon={<FontAwesome6 name="calendar-check" size={22} color="#E9FF75" />}
                        color="#1a6b35"
                        value={formatCurrency(receitaMes)}
                        onPress={() => router.push("/(tabs)/relatorios")}
                    />
                    <View className="flex-row gap-3">
                        <View className="flex-1">
                            <Card
                                title="Aguardando"
                                icon={<FontAwesome6 name="hourglass-half" size={18} color="#E9FF75" />}
                                color="#18572C"
                                value={String(dash?.pedidos_novos ?? 0)}
                                onPress={() => router.push("/(tabs)/pedidos")}
                            />
                        </View>
                        <View className="flex-1">
                            <Card
                                title="No Ano"
                                icon={<FontAwesome6 name="bag-shopping" size={18} color="#E9FF75" />}
                                color="#18572C"
                                value={String(pedidosAno)}
                                onPress={() => router.push("/(tabs)/pedidos")}
                            />
                        </View>
                    </View>
                </View>
            )}

            {/* Gráfico anual */}
            {!loading && anual.length > 0 && (
                <>
                    <SectionTitle label={`Faturamento ${anoAtual}`} onPress={() => router.push("/(tabs)/relatorios")} />
                    <View className="bg-gray-50 rounded-2xl p-4">
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "flex-end", gap: 6 }}>
                            {anual.map((m) => {
                                const valor = parseFloat(m.valor as any) || 0;
                                const barH = Math.max(4, Math.round((valor / maxValor) * BAR_HEIGHT));
                                const isCurrent = m.mes === mesAtual;
                                return (
                                    <View key={m.mes} style={{ width: 32, alignItems: "center", justifyContent: "flex-end", height: BAR_HEIGHT + 24 }}>
                                        <View style={{
                                            width: 22,
                                            height: barH,
                                            backgroundColor: isCurrent ? "#E9FF75" : "#18572C",
                                            borderRadius: 4,
                                            marginBottom: 4,
                                        }} />
                                        <Text style={{ fontSize: 9, color: isCurrent ? "#18572C" : "#9CA3AF", fontWeight: isCurrent ? "700" : "400" }}>
                                            {MONTHS_SHORT[m.mes - 1]}
                                        </Text>
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>
                </>
            )}

            {/* Pedidos recentes */}
            {!loading && (
                <View className="border border-gray-100 rounded-2xl p-4 my-10">
                    <SectionTitle label="Pedidos Recentes" onPress={() => router.push("/(tabs)/pedidos")} />
                    {recentOrders.length === 0 ? (
                        <View className="border border-gray-100 rounded-2xl py-6 items-center">
                            <Text className="text-gray-400">Nenhum pedido ainda.</Text>
                        </View>
                    ) : (
                        <View className="gap-2">
                            {recentOrders.map(order => (
                                <TouchableOpacity
                                    key={order.id}
                                    onPress={() => router.push("/(tabs)/pedidos")}
                                    className="flex-row items-center border border-gray-100 rounded-2xl px-4 py-3 gap-3"
                                    activeOpacity={0.7}
                                >
                                    <View className="flex-1">
                                        <Text className="font-bold text-gray-900 text-sm">#{String(order.id).padStart(5, "0")}</Text>
                                        <Text className="text-gray-500 text-xs" numberOfLines={1}>{order.cliente}</Text>
                                    </View>
                                    <StatusBadge status={order.status} />
                                    <Text className="font-bold text-verdeEscuro text-sm">{formatCurrency(order.total)}</Text>
                                    <Feather name="chevron-right" size={14} color="#D1D5DB" />
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Top produtos */}
            {!loading && topProdutos.length > 0 && (
                <>
                    <SectionTitle label="Mais Vendidos" onPress={() => router.push("/(tabs)/relatorios")} />
                    <View className="gap-3">
                        {topProdutos.map((p, i) => (
                            <View key={i}>
                                <View className="flex-row justify-between mb-1">
                                    <Text className="text-gray-800 font-medium flex-1 pr-2" numberOfLines={1}>
                                        {i + 1}. {p.nome}
                                    </Text>
                                    <Text className="text-gray-500 text-sm">{p.total_vendido} un.</Text>
                                </View>
                                <View className="bg-gray-100 rounded-full h-1.5">
                                    <View
                                        style={{ width: `${(p.total_vendido / maxVendido) * 100}%`, backgroundColor: "#18572C" }}
                                        className="h-1.5 rounded-full"
                                    />
                                </View>
                            </View>
                        ))}
                    </View>
                </>
            )}

            {loading && (
                <View className="gap-4 mt-6">
                    <SkeletonCard />
                    <SkeletonCard />
                    <SkeletonCard />
                </View>
            )}
        </ScrollView>
    );
}
