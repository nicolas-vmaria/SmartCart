import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import { getOrderAnalytics, getHighlights } from "../../lib/api";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

type DayData = { dia: number; pedidos: number; valor: number };
type Highlight = { nome: string; quantidade: number };

export default function Relatorios() {
    const now = new Date();
    const [mes, setMes] = useState(now.getMonth() + 1);
    const [ano, setAno] = useState(now.getFullYear());
    const [analytics, setAnalytics] = useState<DayData[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [mes, ano]);

    async function fetchData() {
        setLoading(true);
        try {
            const [analyticsRes, highlightsRes] = await Promise.all([
                getOrderAnalytics(mes, ano),
                getHighlights(),
            ]);
            const analyticsArr = analyticsRes.data?.data ?? analyticsRes.data;
            const highlightsArr = highlightsRes.data?.products ?? highlightsRes.data;
            setAnalytics(Array.isArray(analyticsArr) ? analyticsArr : []);
            setHighlights(Array.isArray(highlightsArr) ? highlightsArr : []);
        } finally {
            setLoading(false);
        }
    }

    function prevMonth() {
        if (mes === 1) { setMes(12); setAno(a => a - 1); }
        else setMes(m => m - 1);
    }

    function nextMonth() {
        const isCurrentMonth = mes === now.getMonth() + 1 && ano === now.getFullYear();
        if (isCurrentMonth) return;
        if (mes === 12) { setMes(1); setAno(a => a + 1); }
        else setMes(m => m + 1);
    }

    const isCurrentMonth = mes === now.getMonth() + 1 && ano === now.getFullYear();

    const totalFaturamento = analytics.reduce((sum, d) => sum + (d.valor ?? 0), 0);
    const totalPedidos = analytics.reduce((sum, d) => sum + (d.pedidos ?? 0), 0);
    const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

    function formatCurrency(value: number) {
        return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    const maxHighlights = highlights.reduce((max, h) => Math.max(max, h.quantidade), 1);

    return (
        <View className="flex-1 bg-white">
            <ScrollView contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 32 }}>
                <TitleHeader title="Relatórios" subtitle="Análise por período" />

                {/* Seletor de mês */}
                <View className="flex-row items-center justify-between mb-6 bg-gray-50 rounded-2xl px-4 py-3">
                    <TouchableOpacity onPress={prevMonth} hitSlop={8}>
                        <Feather name="chevron-left" size={22} color="#18572C" />
                    </TouchableOpacity>
                    <Text className="font-bold text-gray-900 text-base">{MONTHS[mes - 1]} {ano}</Text>
                    <TouchableOpacity onPress={nextMonth} hitSlop={8} disabled={isCurrentMonth}>
                        <Feather name="chevron-right" size={22} color={isCurrentMonth ? "#D1D5DB" : "#18572C"} />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View className="gap-4">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </View>
                ) : (
                    <>
                        {/* KPI Cards */}
                        <View className="gap-3 mb-6">
                            <View style={{ backgroundColor: "#18572C" }} className="rounded-2xl px-5 py-5">
                                <Text style={{ color: "rgba(255,255,255,0.8)" }} className="text-sm mb-1">Faturamento</Text>
                                <Text className="text-white font-bold text-3xl">{formatCurrency(totalFaturamento)}</Text>
                                <Text style={{ color: "rgba(255,255,255,0.6)" }} className="text-xs mt-1">{totalPedidos} pedidos no mês</Text>
                            </View>
                            <View className="flex-row gap-3">
                                <View className="flex-1 border border-gray-100 rounded-2xl px-4 py-4">
                                    <Text className="text-gray-500 text-sm mb-1">Pedidos</Text>
                                    <Text className="font-bold text-2xl text-gray-900">{totalPedidos}</Text>
                                </View>
                                <View className="flex-1 border border-gray-100 rounded-2xl px-4 py-4">
                                    <Text className="text-gray-500 text-sm mb-1">Ticket Médio</Text>
                                    <Text className="font-bold text-2xl text-gray-900">{formatCurrency(ticketMedio)}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Produtos mais vendidos */}
                        <Text className="font-bold text-gray-900 text-base mb-3">Produtos mais vendidos</Text>
                        {highlights.length === 0 ? (
                            <Text className="text-gray-400 text-center py-4">Nenhum dado disponível.</Text>
                        ) : (
                            <View className="gap-3">
                                {highlights.slice(0, 10).map((item, i) => (
                                    <View key={i}>
                                        <View className="flex-row justify-between mb-1">
                                            <Text className="text-gray-800 font-medium flex-1 pr-2" numberOfLines={1}>
                                                {i + 1}. {item.nome}
                                            </Text>
                                            <Text className="text-gray-500 text-sm">{item.quantidade} un.</Text>
                                        </View>
                                        <View className="bg-gray-100 rounded-full h-1.5">
                                            <View
                                                style={{ width: `${(item.quantidade / maxHighlights) * 100}%`, backgroundColor: "#18572C" }}
                                                className="h-1.5 rounded-full"
                                            />
                                        </View>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
}
