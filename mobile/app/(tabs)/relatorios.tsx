import { View, Text, ScrollView, TouchableOpacity, RefreshControl } from "react-native";
import { useEffect, useState } from "react";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import SkeletonCard from "../../components/SkeletonCard";
import { getOrderAnalytics, getHighlights } from "../../lib/api";

const MONTHS = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

type DayData = { dia: number; pedidos: number; valor: number };
type Highlight = { nome: string; total_vendido: number };

function formatCurrency(value: number) {
    const n = (parseFloat(value as any) || 0).toFixed(2);
    const [intPart, decPart] = n.split(".");
    return `R$ ${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".")},${decPart}`;
}

export default function Relatorios() {
    const now = new Date();
    const [mes, setMes] = useState(now.getMonth() + 1);
    const [ano, setAno] = useState(now.getFullYear());
    const [analytics, setAnalytics] = useState<DayData[]>([]);
    const [highlights, setHighlights] = useState<Highlight[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    async function fetchData(isRefresh = false) {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        try {
            const [analyticsRes, highlightsRes] = await Promise.all([
                getOrderAnalytics(mes, ano),
                getHighlights(),
            ]);
            setAnalytics(Array.isArray(analyticsRes.data?.analytics) ? analyticsRes.data.analytics : []);
            setHighlights(Array.isArray(highlightsRes.data?.best_sellers) ? highlightsRes.data.best_sellers : []);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }

    useEffect(() => { fetchData(); }, [mes, ano]);

    function prevMonth() {
        if (mes === 1) { setMes(12); setAno(a => a - 1); }
        else setMes(m => m - 1);
    }

    function nextMonth() {
        if (isCurrentMonth) return;
        if (mes === 12) { setMes(1); setAno(a => a + 1); }
        else setMes(m => m + 1);
    }

    const isCurrentMonth = mes === now.getMonth() + 1 && ano === now.getFullYear();

    const totalFaturamento = analytics.reduce((sum, d) => sum + (parseFloat(d.valor as any) || 0), 0);
    const totalPedidos = analytics.reduce((sum, d) => sum + (Number(d.pedidos) || 0), 0);
    const ticketMedio = totalPedidos > 0 ? totalFaturamento / totalPedidos : 0;

    const maxValor = analytics.reduce((max, d) => Math.max(max, parseFloat(d.valor as any) || 0), 1);
    const maxHighlights = highlights.reduce((max, h) => Math.max(max, h.total_vendido), 1);
    const BAR_HEIGHT = 80;

    return (
        <View className="flex-1 bg-white">
            <ScrollView
                contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 120 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} tintColor="#18572C" />}
            >
                <TitleHeader title="Relatórios" subtitle="Análise por período" />

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

                        {/* Gráfico de barras diário */}
                        {analytics.length > 0 && (
                            <View className="mb-6">
                                <Text className="font-bold text-gray-900 text-base mb-4">Faturamento por dia</Text>
                                <View style={{ height: BAR_HEIGHT + 28 }}>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: "flex-end", gap: 4, paddingBottom: 0 }}>
                                        {analytics.map((d) => {
                                            const valor = parseFloat(d.valor as any) || 0;
                                            const barH = Math.max(4, Math.round((valor / maxValor) * BAR_HEIGHT));
                                            return (
                                                <View key={d.dia} style={{ width: 28, alignItems: "center", justifyContent: "flex-end", height: BAR_HEIGHT + 28 }}>
                                                    <View style={{ width: 20, height: barH, backgroundColor: "#18572C", borderRadius: 4, marginBottom: 4 }} />
                                                    <Text style={{ fontSize: 9, color: "#9CA3AF", textAlign: "center" }}>{String(d.dia).padStart(2, "0")}</Text>
                                                </View>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            </View>
                        )}

                        {analytics.length === 0 && (
                            <View className="border border-gray-100 rounded-2xl py-8 items-center mb-6">
                                <Text className="text-gray-400">Sem dados para este período.</Text>
                            </View>
                        )}

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
                                            <Text className="text-gray-500 text-sm">{item.total_vendido} un.</Text>
                                        </View>
                                        <View className="bg-gray-100 rounded-full h-1.5">
                                            <View
                                                style={{ width: `${(item.total_vendido / maxHighlights) * 100}%`, backgroundColor: "#18572C" }}
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
