import { View, Text, ScrollView, TextInput, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import StatusBadge from "../../components/StatusBadge";
import OrderModal from "../../components/OrderModal";
import { getOrders } from "../../lib/api";

type Order = {
    id: number;
    nome_cliente: string;
    total: number;
    status: string;
    created_at: string;
    metodo_pagamento: string;
};

export default function Pedidos() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    function fetchOrders() {
        setLoading(true);
        getOrders()
            .then(({ data }) => {
                const arr = data?.orders ?? data;
                setOrders(Array.isArray(arr) ? arr : []);
            })
            .finally(() => setLoading(false));
    }

    const filtered = orders.filter(o =>
        String(o.id).includes(search) ||
        o.nome_cliente?.toLowerCase().includes(search.toLowerCase())
    );

    function formatCurrency(value: number) {
        return value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function formatDate(dateStr: string) {
        return new Date(dateStr).toLocaleDateString("pt-BR");
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 32 }}>
                <TitleHeader title="Pedidos" subtitle={`${orders.length} pedidos no total`} />

                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-6 bg-gray-50">
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
                                <Text className="text-gray-700 font-medium mb-1">{order.nome_cliente}</Text>
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
                onStatusUpdate={fetchOrders}
            />
        </View>
    );
}
