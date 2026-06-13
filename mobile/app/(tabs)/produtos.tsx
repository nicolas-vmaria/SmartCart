import { View, Text, ScrollView, TextInput, Image } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import StatusBadge from "../../components/StatusBadge";
import { getProducts } from "../../lib/api";

type Product = {
    id: number;
    nome: string;
    categoria: string;
    preco: number;
    estoque: number;
    status: string;
    imagem_url?: string;
};

function StockBadge({ estoque }: { estoque: number }) {
    let bg = "#DCFCE7", text = "#166534", label = `${estoque} un.`;
    if (estoque === 0) { bg = "#FEE2E2"; text = "#991B1B"; label = "Sem estoque"; }
    else if (estoque <= 10) { bg = "#FEF9C3"; text = "#854D0E"; label = `${estoque} un.`; }
    return (
        <View style={{ backgroundColor: bg }} className="px-2 py-1 rounded-full">
            <Text style={{ color: text }} className="text-xs font-semibold">{label}</Text>
        </View>
    );
}

export default function Produtos() {
    const [products, setProducts] = useState<Product[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getProducts()
            .then(({ data }) => {
                const arr = data?.products ?? data;
                setProducts(Array.isArray(arr) ? arr : []);
            })
            .finally(() => setLoading(false));
    }, []);

    const filtered = products.filter(p =>
        p.nome?.toLowerCase().includes(search.toLowerCase()) ||
        p.categoria?.toLowerCase().includes(search.toLowerCase())
    );

    function formatCurrency(value: number) {
        return value?.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 32 }}>
                <TitleHeader title="Produtos" subtitle={`${products.length} produtos cadastrados`} />

                <View className="flex-row items-center border border-gray-200 rounded-xl px-3 mb-6 bg-gray-50">
                    <Feather name="search" size={16} color="#9CA3AF" />
                    <TextInput
                        className="flex-1 py-3 px-2 text-gray-800"
                        placeholder="Buscar por nome ou categoria..."
                        placeholderTextColor="#9CA3AF"
                        value={search}
                        onChangeText={setSearch}
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
                        <Text className="text-center text-gray-400 mt-8">Nenhum produto encontrado.</Text>
                    ) : (
                        filtered.map(product => (
                            <View key={product.id} className="flex-row items-center border border-gray-100 rounded-2xl p-3 gap-3">
                                {product.imagem_url ? (
                                    <Image source={{ uri: product.imagem_url }} className="w-14 h-14 rounded-xl bg-gray-100" resizeMode="cover" />
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
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    );
}
