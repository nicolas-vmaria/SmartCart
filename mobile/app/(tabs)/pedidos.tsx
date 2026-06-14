import { View, Text, ScrollView, TextInput, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import StatusBadge from "../../components/StatusBadge";
import OrderModal from "../../components/OrderModal";
import { getOrders } from "../../lib/api";

type Order = {
    id: number;
    cliente: string;
    total: number;
    status: string;
    created_at: string;
    metodo_pagamento: string;
};

const STATUS_FILTERS = ["Todos", "Aguardando", "Pago", "Enviado", "Entregue", "Cancelado"] as const;
type StatusFilter = typeof STATUS_FILTERS[number];

export default function Pedidos() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("Todos");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    async function fetchOrders(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const { data } = await getOrders();
            const arr = data?.orders ?? data;
            setOrders(Array.isArray(arr) ? arr : []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => { fetchOrders(); }, []);

    const filtered = orders.filter(o => {
        const matchSearch =
            String(o.id).includes(search) ||
            o.cliente?.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "Todos" ||
            o.status?.toLowerCase() === statusFilter.toLowerCase();
        return matchSearch && matchStatus;
    });

    function formatCurrency(value: number) {
        const n = (parseFloat(value as any) || 0).toFixed(2);
        const [intPart, decPart] = n.split(".");
        return `R$ ${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
    }

    function formatDate(dateStr: string) {
        const d = new Date(dateStr);
        const day = String(d.getDate()).padStart(2, "0");
        const month = String(d.getMonth() + 1).padStart(2, "0");
        return `${day}/${month}/${d.getFullYear()}`;
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchOrders(true)} tintColor="#18572C" />}
            >
                <TitleHeader title="Pedidos" subtitle={`${orders.length} pedidos no total`} />

                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-3 bg-gray-50">
                    <Feather name="search" size={16} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 py-3 px-2 text-gray-800"
                        placeholder="Buscar por ID ou cliente..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                        keyboardType="default"
                    />
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-5" contentContainerStyle={{ gap: 8 }}>
                    {STATUS_FILTERS.map(f => (
                        <TouchableOpacity
                            key={f}
                            onPress={() => setStatusFilter(f)}
                            style={{ backgroundColor: statusFilter === f ? "#18572C" : "#F3F4F6" }}
                            className="px-4 py-2 rounded-full"
                        >
                            <Text style={{ color: statusFilter === f ? "#E9FF75" : "#6B7280" }} className="text-sm font-semibold">{f}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                <View className="gap-3">
                    {loading ? (
                        <>
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                            <SkeletonCard />
                        </>
                    ) : filtered.length === 0 ? (
                        <Text className="text-center text-gray-400 mt-8">Nenhum pedido encontrado.</Text>
                    ) : (
                        filtered.map(order => (
                            <TouchableOpacity
                                key={order.id}
                                onPress={() => setSelectedId(order.id)}
                                className="border border-gray-100 rounded-2xl p-4"
                                activeOpacity={0.7}
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-bold text-gray-900">#{String(order.id).padStart(5, "0")}</Text>
                                    <StatusBadge status={order.status} />
                                </View>
                                <Text className="text-gray-700 font-medium mb-1">{order.cliente}</Text>
                                <View className="flex-row justify-between items-center">
                                    <Text className="text-gray-400 text-sm">{formatDate(order.created_at)}</Text>
                                    <Text className="font-bold text-verdeEscuro">{formatCurrency(order.total)}</Text>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <OrderModal
                orderId={selectedId}
                visible={selectedId !== null}
                onClose={() => setSelectedId(null)}
                onStatusUpdate={() => fetchOrders()}
            />
        </View>
    );
}
