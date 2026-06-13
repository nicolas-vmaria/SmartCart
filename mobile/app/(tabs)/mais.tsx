import { View, Text, TouchableOpacity, Alert } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";

type UserInfo = { nome: string; email: string };

function decodeJwt(token: string): any {
    try {
        const payload = token.split(".")[1];
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64 + "==".slice(0, (4 - (base64.length % 4)) % 4);
        return JSON.parse(atob(padded));
    } catch {
        return null;
    }
}

export default function Mais() {
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("admin_token").then(token => {
            if (!token) return;
            const payload = decodeJwt(token);
            if (payload) setUser({ nome: payload.nome, email: payload.email });
        });
    }, []);

    function handleLogout() {
        Alert.alert("Sair", "Tem certeza que deseja sair?", [
            { text: "Cancelar", style: "cancel" },
            {
                text: "Sair",
                style: "destructive",
                onPress: async () => {
                    await AsyncStorage.removeItem("admin_token");
                    router.replace("/login");
                },
            },
        ]);
    }

    return (
        <View className="flex-1 bg-white px-5" style={{ paddingTop: 72 }}>
            <TitleHeader title="Mais" subtitle="Configurações da conta" />

            {/* Info do usuário */}
            <View className="bg-gray-50 rounded-2xl p-5 mb-6 flex-row items-center gap-4">
                <View style={{ backgroundColor: "#18572C" }} className="w-14 h-14 rounded-full items-center justify-center">
                    <Text className="text-white font-bold text-xl">
                        {user?.nome?.charAt(0).toUpperCase() ?? "A"}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="font-bold text-gray-900 text-base" numberOfLines={1}>{user?.nome ?? "Administrador"}</Text>
                    <Text className="text-gray-500 text-sm" numberOfLines={1}>{user?.email ?? ""}</Text>
                </View>
            </View>

            {/* Botão de logout */}
            <TouchableOpacity
                onPress={handleLogout}
                className="flex-row items-center gap-3 border border-red-200 rounded-2xl px-5 py-4"
                activeOpacity={0.7}
            >
                <Feather name="log-out" size={20} color="#DC2626" />
                <Text className="text-red-600 font-semibold text-base">Sair da conta</Text>
            </TouchableOpacity>

            <Text style={{ position: "absolute", bottom: 32, left: 0, right: 0, textAlign: "center" }} className="text-gray-300 text-sm">SmartCart App v1.0</Text>
        </View>
    );
}
