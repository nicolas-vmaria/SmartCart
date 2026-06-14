import { View, Text, Modal, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { getOrderById, updateOrderStatus } from "../lib/api";
import { useEffect, useState } from "react";
import StatusBadge from "./StatusBadge";
import Feather from "@expo/vector-icons/Feather";
import { formatDateTime } from "../lib/date";

const TIMELINE = ["Aguardando", "Pago", "Enviado", "Entregue"];

type OrderDetail = {
    id: number;
    status: string;
    nome: string;
    metodo_pagamento: string;
    codigo_rastreio?: string;
    cupom_codigo?: string;
    total: number;
    created_at: string;
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
    itens: { nome: string; quantidade: number; preco_unitario_historico: number }[];
};

export default function OrderModal({ orderId, visible, onClose, onStatusUpdate }: {
    orderId: number | null;
    visible: boolean;
    onClose: () => void;
    onStatusUpdate: () => void;
}) {
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [updatingStatus, setUpdatingStatus] = useState(false);

    useEffect(() => {
        if (visible && orderId) fetchOrder();
    }, [visible, orderId]);

    async function fetchOrder() {
        setLoading(true);
        try {
            const { data } = await getOrderById(orderId!);
            setOrder(data?.order ?? data);
        } catch {
            Alert.alert("Erro", "Não foi possível carregar o pedido.");
            onClose();
        } finally {
            setLoading(false);
        }
    }

    async function handleStatusUpdate(status: string) {
        if (!order) return;
        setUpdatingStatus(true);
        try {
            const statusLower = status.toLowerCase();
            await updateOrderStatus(order.id, statusLower);
            setOrder({ ...order, status: statusLower });
            onStatusUpdate();
        } catch {
            Alert.alert("Erro", "Não foi possível atualizar o status.");
        } finally {
            setUpdatingStatus(false);
        }
    }

    function handleCancel() {
        Alert.alert("Cancelar pedido", "Tem certeza que deseja cancelar este pedido?", [
            { text: "Não", style: "cancel" },
            { text: "Sim, cancelar", style: "destructive", onPress: () => handleStatusUpdate("cancelado") },
        ]);
    }

    function formatCurrency(value: number) {
        const n = (parseFloat(value as any) || 0).toFixed(2);
        const [intPart, decPart] = n.split(".");
        const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
        return `R$ ${formatted},${decPart}`;
    }

    const currentStep = TIMELINE.findIndex(s => s.toLowerCase() === order?.status?.toLowerCase());
    const isCanceled = order?.status?.toLowerCase() === "cancelado";

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900">
                        {order ? `Pedido #${String(order.id).padStart(5, "0")}` : "Carregando..."}
                    </Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Feather name="x" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                {loading || !order ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#18572C" />
                    </View>
                ) : (
                    <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>

                        {/* Timeline */}
                        {!isCanceled && (
                            <View className="mb-6">
                                <Text className="text-sm font-semibold text-gray-500 mb-3">STATUS</Text>
                                <View className="flex-row justify-between">
                                    {TIMELINE.map((step, i) => {
                                        const done = i <= currentStep;
                                        const isNext = i === currentStep + 1;
                                        return (
                                            <TouchableOpacity
                                                key={step}
                                                disabled={!isNext || updatingStatus}
                                                onPress={() => handleStatusUpdate(step)}
                                                className="items-center flex-1"
                                            >
                                                <View style={{ backgroundColor: done ? "#18572C" : "#E5E7EB" }} className="w-8 h-8 rounded-full items-center justify-center mb-1">
                                                    {done && <Feather name="check" size={14} color="#E9FF75" />}
                                                </View>
                                                <Text style={{ color: done ? "#18572C" : "#9CA3AF" }} className="text-xs text-center font-medium">{step}</Text>
                                                {isNext && !updatingStatus && (
                                                    <Text className="text-xs text-verdeEscuro font-bold mt-1">Avançar</Text>
                                                )}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>
                        )}

                        {isCanceled && (
                            <View className="bg-red-50 rounded-xl px-4 py-3 mb-6">
                                <Text className="text-red-700 font-semibold text-center">Pedido Cancelado</Text>
                            </View>
                        )}

                        {/* Info */}
                        <View className="bg-gray-50 rounded-2xl p-4 mb-4 gap-2">
                            <Row label="Cliente" value={order.nome} />
                            <Row label="Data" value={formatDateTime(order.created_at)} />
                            <Row label="Pagamento" value={order.metodo_pagamento} />
                            {order.codigo_rastreio && <Row label="Rastreio" value={order.codigo_rastreio} />}
                            {order.cupom_codigo && <Row label="Cupom" value={order.cupom_codigo} />}
                        </View>

                        {/* Endereço */}
                        {order.rua && (
                            <View className="bg-gray-50 rounded-2xl p-4 mb-4">
                                <Text className="text-sm font-semibold text-gray-500 mb-2">ENDEREÇO</Text>
                                <Text className="text-gray-800">
                                    {order.rua}, {order.numero}
                                    {order.complemento ? ` - ${order.complemento}` : ""}
                                </Text>
                                <Text className="text-gray-600 text-sm">{order.bairro} — {order.cidade}/{order.estado}</Text>
                                <Text className="text-gray-600 text-sm">CEP: {order.cep}</Text>
                            </View>
                        )}

                        {/* Itens */}
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-500 mb-3">ITENS</Text>
                            {(order.itens ?? []).map((item, i) => (
                                <View key={i} className="flex-row justify-between items-center py-2 border-b border-gray-100">
                                    <View className="flex-1 pr-2">
                                        <Text className="text-gray-800 font-medium" numberOfLines={1}>{item.nome}</Text>
                                        <Text className="text-gray-500 text-sm">{item.quantidade}x {formatCurrency(item.preco_unitario_historico)}</Text>
                                    </View>
                                    <Text className="font-semibold text-gray-900">{formatCurrency(item.quantidade * item.preco_unitario_historico)}</Text>
                                </View>
                            ))}
                            <View className="flex-row justify-between pt-3">
                                <Text className="font-bold text-gray-900 text-base">Total</Text>
                                <Text className="font-bold text-verdeEscuro text-base">{formatCurrency(order.total)}</Text>
                            </View>
                        </View>

                        {/* Cancelar */}
                        {!isCanceled && (
                            <TouchableOpacity onPress={handleCancel} className="border border-red-300 rounded-xl py-3 mb-8 items-center">
                                <Text className="text-red-600 font-semibold">Cancelar pedido</Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                )}
            </View>
        </Modal>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between">
            <Text className="text-gray-500 text-sm">{label}</Text>
            <Text className="text-gray-800 text-sm font-medium text-right flex-1 ml-4" numberOfLines={1}>{value}</Text>
        </View>
    );
}
