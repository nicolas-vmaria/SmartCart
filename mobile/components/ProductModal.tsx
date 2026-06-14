import { View, Text, Modal, ScrollView, TouchableOpacity, Image } from "react-native";
import Feather from "@expo/vector-icons/Feather";
import StatusBadge from "./StatusBadge";
import { formatDate } from "../lib/date";

type Product = {
    id: number;
    nome: string;
    categoria: string;
    preco: number;
    estoque: number;
    status: string;
    foto_url?: string;
    descricao?: string;
    desconto_percentual?: number;
    created_at?: string;
};

function StockBadge({ estoque }: { estoque: number }) {
    let bg = "#DCFCE7", text = "#166534", label = `${estoque} un.`;
    if (estoque === 0) { bg = "#FEE2E2"; text = "#991B1B"; label = "Sem estoque"; }
    else if (estoque <= 10) { bg = "#FEF9C3"; text = "#854D0E"; }
    return (
        <View style={{ backgroundColor: bg }} className="px-3 py-1 rounded-full">
            <Text style={{ color: text }} className="text-sm font-semibold">{label}</Text>
        </View>
    );
}

function formatCurrency(value: number) {
    const n = (parseFloat(value as any) || 0).toFixed(2);
    const [intPart, decPart] = n.split(".");
    return `R$ ${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
}


export default function ProductModal({ product, visible, onClose }: {
    product: Product | null;
    visible: boolean;
    onClose: () => void;
}) {
    if (!product) return null;

    const precoComDesconto = product.desconto_percentual
        ? product.preco * (1 - product.desconto_percentual / 100)
        : null;

    return (
        <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
            <View className="flex-1 bg-white">
                <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                    <Text className="text-xl font-bold text-gray-900" numberOfLines={1} style={{ flex: 1, marginRight: 12 }}>
                        {product.nome}
                    </Text>
                    <TouchableOpacity onPress={onClose} hitSlop={8}>
                        <Feather name="x" size={24} color="#374151" />
                    </TouchableOpacity>
                </View>

                <ScrollView className="flex-1 px-5 py-4" showsVerticalScrollIndicator={false}>
                    {product.foto_url ? (
                        <Image
                            source={{ uri: product.foto_url }}
                            style={{ width: "100%", height: 220, borderRadius: 16, marginBottom: 20 }}
                            resizeMode="cover"
                        />
                    ) : (
                        <View style={{ width: "100%", height: 220, borderRadius: 16, marginBottom: 20, backgroundColor: "#F3F4F6" }}
                            className="items-center justify-center">
                            <Feather name="image" size={48} color="#D1D5DB" />
                        </View>
                    )}

                    <View className="flex-row gap-2 mb-4">
                        <StatusBadge status={product.status} />
                        <StockBadge estoque={product.estoque} />
                    </View>

                    <Text className="text-gray-500 text-sm mb-1">{product.categoria}</Text>

                    <View className="flex-row items-baseline gap-3 mb-4">
                        {precoComDesconto ? (
                            <>
                                <Text className="text-3xl font-bold text-verdeEscuro">{formatCurrency(precoComDesconto)}</Text>
                                <Text className="text-gray-400 text-base line-through">{formatCurrency(product.preco)}</Text>
                                <View style={{ backgroundColor: "#DCFCE7" }} className="px-2 py-0.5 rounded-full">
                                    <Text style={{ color: "#166534" }} className="text-xs font-bold">-{product.desconto_percentual}%</Text>
                                </View>
                            </>
                        ) : (
                            <Text className="text-3xl font-bold text-verdeEscuro">{formatCurrency(product.preco)}</Text>
                        )}
                    </View>

                    {product.descricao ? (
                        <View className="mb-4">
                            <Text className="text-sm font-semibold text-gray-500 mb-2">DESCRIÇÃO</Text>
                            <Text className="text-gray-700 leading-6">{product.descricao}</Text>
                        </View>
                    ) : null}

                    {product.created_at ? (
                        <Text className="text-gray-400 text-xs mt-2">Cadastrado em {formatDate(product.created_at)}</Text>
                    ) : null}
                </ScrollView>
            </View>
        </Modal>
    );
}
