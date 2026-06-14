import { View, Text, ScrollView, TextInput, Image, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import StatusBadge from "../../components/StatusBadge";
import ProductModal from "../../components/ProductModal";
import { getProducts } from "../../lib/api";

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

const STATUS_FILTERS = ["Todos", "Ativo", "Inativo"] as const;

function StockBadge({ estoque }: { estoque: number }) {
    let bg = "#DCFCE7", text = "#166534", label = `${estoque} un.`;
    if (estoque === 0) { bg = "#FEE2E2"; text = "#991B1B"; label = "Sem estoque"; }
    else if (estoque <= 10) { bg = "#FEF9C3"; text = "#854D0E"; }
    return (
        <View style={{ backgroundColor: bg }} className="px-2 py-1 rounded-full">
            <Text style={{ color: text }} className="text-xs font-semibold">{label}</Text>
        </View>
    );
}

export default function Produtos() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"Todos" | "Ativo" | "Inativo">("Todos");
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    async function fetchProducts(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const { data } = await getProducts();
            const arr = data?.products ?? data;
            setProducts(Array.isArray(arr) ? arr : []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => { fetchProducts(); }, []);

    const filtered = products.filter(p => {
        const matchSearch =
            p.nome?.toLowerCase().includes(search.toLowerCase()) ||
            p.categoria?.toLowerCase().includes(search.toLowerCase());
        const matchStatus =
            statusFilter === "Todos" ||
            (statusFilter === "Ativo" ? String(p.status) === "1" || p.status === "ativo" : String(p.status) === "0" || p.status === "inativo");
        return matchSearch && matchStatus;
    });

    function formatCurrency(value: number) {
        const n = (parseFloat(value as any) || 0).toFixed(2);
        const [intPart, decPart] = n.split(".");
        return `R$ ${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchProducts(true)} tintColor="#18572C" />}
            >
                <TitleHeader title="Produtos" subtitle={`${products.length} produtos cadastrados`} />

                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-3 bg-gray-50">
                    <Feather name="search" size={16} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 py-3 px-2 text-gray-800"
                        placeholder="Buscar por nome ou categoria..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
                    />
                </View>

                <View className="flex-row gap-2 mb-5">
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
                        <Text className="text-center text-gray-400 mt-8">Nenhum produto encontrado.</Text>
                    ) : (
                        filtered.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() => setSelectedProduct(product)}
                                className="flex-row items-center border border-gray-100 rounded-2xl p-3 gap-3"
                                activeOpacity={0.7}
                            >
                                {product.foto_url ? (
                                    <Image source={{ uri: product.foto_url }} className="w-14 h-14 rounded-xl bg-gray-100" resizeMode="cover" />
                                ) : (
                                    <View className="w-14 h-14 rounded-xl bg-gray-100 items-center justify-center">
                                        <Feather name="image" size={20} color="#D1D5DB" />
                                    </View>
                                )}
                                <View className="flex-1">
                                    <Text className="font-semibold text-gray-900" numberOfLines={1}>{product.nome}</Text>
                                    <Text className="text-gray-500 text-sm mb-1">{product.categoria}</Text>
                                    <Text className="text-verdeEscuro font-bold">{formatCurrency(product.preco)}</Text>
                                </View>
                                <View className="items-end gap-1">
                                    <StatusBadge status={product.status} />
                                    <StockBadge estoque={product.estoque} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            <ProductModal
                product={selectedProduct}
                visible={selectedProduct !== null}
                onClose={() => setSelectedProduct(null)}
            />
        </View>
    );
}
