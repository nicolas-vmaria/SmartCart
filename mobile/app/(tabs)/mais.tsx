import { View, Text, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useEffect, useState } from "react";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Feather from "@expo/vector-icons/Feather";
import TitleHeader from "../../components/titleHeader";
import { getAdminProfile, updateAdminProfile, updateAdminPassword } from "../../lib/api";
import { decodeJwt } from "../../lib/jwt";

type UserInfo = { nome: string; email: string; tel?: string };

function MenuItem({ icon, label, onPress, danger }: { icon: string; label: string; onPress: () => void; danger?: boolean }) {
    return (
        <TouchableOpacity
            onPress={onPress}
            className="flex-row items-center gap-3 px-4 py-4 border-b border-gray-50"
            activeOpacity={0.7}
        >
            <View style={{ backgroundColor: danger ? "#FEE2E2" : "#F3F4F6" }} className="w-9 h-9 rounded-full items-center justify-center">
                <Feather name={icon as any} size={16} color={danger ? "#DC2626" : "#374151"} />
            </View>
            <Text style={{ color: danger ? "#DC2626" : "#111827" }} className="flex-1 font-medium text-base">{label}</Text>
            {!danger && <Feather name="chevron-right" size={16} color="#D1D5DB" />}
        </TouchableOpacity>
    );
}

export default function Mais() {
    const [user, setUser] = useState<UserInfo | null>(null);

    const [editVisible, setEditVisible] = useState(false);
    const [editNome, setEditNome] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editTel, setEditTel] = useState("");
    const [editLoading, setEditLoading] = useState(false);

    const [pwVisible, setPwVisible] = useState(false);
    const [pwAtual, setPwAtual] = useState("");
    const [pwNova, setPwNova] = useState("");
    const [pwConfirma, setPwConfirma] = useState("");
    const [pwLoading, setPwLoading] = useState(false);

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

    function openEdit() {
        setEditNome(user?.nome ?? "");
        setEditEmail(user?.email ?? "");
        setEditTel(user?.tel ?? "");
        setEditVisible(true);
        getAdminProfile().then(({ data }) => {
            if (data?.profile) {
                setEditNome(data.profile.nome ?? "");
                setEditEmail(data.profile.email ?? "");
                setEditTel(data.profile.tel ?? "");
            }
        }).catch(() => {});
    }

    async function handleSaveProfile() {
        if (!editNome.trim() || !editEmail.trim()) {
            Alert.alert("Erro", "Nome e email são obrigatórios.");
            return;
        }
        setEditLoading(true);
        try {
            await updateAdminProfile({ nome: editNome.trim(), email: editEmail.trim(), tel: editTel.trim() || undefined });
            setUser(u => u ? { ...u, nome: editNome.trim(), email: editEmail.trim() } : u);
            setEditVisible(false);
            Alert.alert("Sucesso", "Perfil atualizado com sucesso.");
        } catch (err: any) {
            Alert.alert("Erro", err?.response?.data?.error ?? "Não foi possível atualizar o perfil.");
        } finally {
            setEditLoading(false);
        }
    }

    async function handleChangePassword() {
        if (!pwAtual || !pwNova || !pwConfirma) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }
        setPwLoading(true);
        try {
            await updateAdminPassword({ senha_atual: pwAtual, senha_nova: pwNova, senha_confirma: pwConfirma });
            setPwVisible(false);
            setPwAtual(""); setPwNova(""); setPwConfirma("");
            Alert.alert("Sucesso", "Senha alterada com sucesso.");
        } catch (err: any) {
            Alert.alert("Erro", err?.response?.data?.error ?? "Não foi possível alterar a senha.");
        } finally {
            setPwLoading(false);
        }
    }

    return (
        <ScrollView className="flex-1 bg-white" contentContainerStyle={{ paddingTop: 72, paddingHorizontal: 20, paddingBottom: 120 }}>
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

            {/* Minha Conta */}
            <Text className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wider">Minha Conta</Text>
            <View className="border border-gray-100 rounded-2xl mb-6 overflow-hidden">
                <MenuItem icon="user" label="Editar Perfil" onPress={openEdit} />
                <MenuItem icon="lock" label="Trocar Senha" onPress={() => setPwVisible(true)} />
            </View>

            {/* Logout */}
            <View className="border border-red-100 rounded-2xl overflow-hidden">
                <MenuItem icon="log-out" label="Sair da conta" onPress={handleLogout} danger />
            </View>

            <Text style={{ textAlign: "center" }} className="text-gray-300 text-sm mt-8">SmartCart App v1.0</Text>

            {/* Modal: Editar Perfil */}
            <Modal visible={editVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <View className="flex-1 bg-white">
                        <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">Editar Perfil</Text>
                            <TouchableOpacity onPress={() => setEditVisible(false)} hitSlop={8}>
                                <Feather name="x" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="flex-1 px-5 py-5">
                            <Text className="text-sm text-gray-500 mb-1">Nome</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-4 text-gray-900"
                                value={editNome}
                                onChangeText={setEditNome}
                                placeholder="Seu nome"
                                placeholderTextColor="#b0b0b0"
                            />
                            <Text className="text-sm text-gray-500 mb-1">Email</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-4 text-gray-900"
                                value={editEmail}
                                onChangeText={setEditEmail}
                                placeholder="seu@email.com"
                                placeholderTextColor="#b0b0b0"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                            <Text className="text-sm text-gray-500 mb-1">Telefone (opcional)</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-6 text-gray-900"
                                value={editTel}
                                onChangeText={setEditTel}
                                placeholder="(00) 00000-0000"
                                placeholderTextColor="#b0b0b0"
                                keyboardType="phone-pad"
                            />
                            <TouchableOpacity
                                onPress={handleSaveProfile}
                                disabled={editLoading}
                                style={{ backgroundColor: editLoading ? "#9CA3AF" : "#18572C" }}
                                className="rounded-xl py-4 items-center"
                            >
                                {editLoading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text className="text-white font-bold text-base">Salvar</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* Modal: Trocar Senha */}
            <Modal visible={pwVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setPwVisible(false)}>
                <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
                    <View className="flex-1 bg-white">
                        <View className="flex-row items-center justify-between px-5 pt-12 pb-4 border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">Trocar Senha</Text>
                            <TouchableOpacity onPress={() => setPwVisible(false)} hitSlop={8}>
                                <Feather name="x" size={24} color="#374151" />
                            </TouchableOpacity>
                        </View>
                        <ScrollView className="flex-1 px-5 py-5">
                            <Text className="text-sm text-gray-500 mb-1">Senha atual</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-4 text-gray-900"
                                value={pwAtual}
                                onChangeText={setPwAtual}
                                placeholder="••••••••"
                                placeholderTextColor="#b0b0b0"
                                secureTextEntry
                            />
                            <Text className="text-sm text-gray-500 mb-1">Nova senha</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-4 text-gray-900"
                                value={pwNova}
                                onChangeText={setPwNova}
                                placeholder="Mínimo 8 caracteres"
                                placeholderTextColor="#b0b0b0"
                                secureTextEntry
                            />
                            <Text className="text-sm text-gray-500 mb-1">Confirmar nova senha</Text>
                            <TextInput
                                className="border border-gray-200 rounded-xl px-4 py-4 mb-6 text-gray-900"
                                value={pwConfirma}
                                onChangeText={setPwConfirma}
                                placeholder="Repita a nova senha"
                                placeholderTextColor="#b0b0b0"
                                secureTextEntry
                            />
                            <TouchableOpacity
                                onPress={handleChangePassword}
                                disabled={pwLoading}
                                style={{ backgroundColor: pwLoading ? "#9CA3AF" : "#18572C" }}
                                className="rounded-xl py-4 items-center"
                            >
                                {pwLoading
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text className="text-white font-bold text-base">Alterar Senha</Text>}
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </ScrollView>
    );
}
