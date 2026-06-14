import { View, Text, TextInput, TouchableWithoutFeedback, Keyboard, TouchableOpacity, Image, ActivityIndicator, Alert, Platform } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { login } from "../lib/api/index";
import { savePushToken } from "../lib/api/notifications";
import Feather from '@expo/vector-icons/Feather';

async function registerPushToken() {
    try {
        const { status: existing } = await Notifications.getPermissionsAsync();
        const { status } = existing === 'granted'
            ? { status: existing }
            : await Notifications.requestPermissionsAsync();

        if (status !== 'granted') return;

        const { data: token } = await Notifications.getExpoPushTokenAsync();
        await savePushToken(token);
    } catch {
        // silencioso — não bloqueia o login se falhar
    }
}


export default function Login() {
    const [passwordVisible, setPasswordVisible] = useState(false);

    // Campos
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleLogin() {
        if (!email || !password) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }
        setLoading(true);
        try{
            const { data } = await login(email, password);
            await AsyncStorage.setItem('admin_token', data.token);
            registerPushToken(); // não bloqueia — roda em background
            router.replace("/(tabs)/dashboard");
        }catch(err: any){
            Alert.alert("Erro", "E-mail ou senha incorretos.");
        }finally{
            setLoading(false);
        }
    }
    
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        

            <View className="flex-1 justify-center px-6 bg-white">
                <Image source={require('../assets/images/smartcart-logo-transparente-preto.png')} resizeMode="contain" className="absolute top-10 self-center w-40 h-40" />
                <View className=" items-center mb-8">
                    
                    <Text className="text-3xl font-bold text-verdeEscuro">Bem-vindo de volta!</Text>
                    <Text className="text-gray-600 mt-2">Faça login na sua conta.</Text>
                </View>

                <View>
                    <TextInput 
                        placeholder="email@exemplo.com" 
                        placeholderTextColor="#b0b0b0" 
                        className="border border-gray-300 rounded-xl px-4 py-4 mt-4 w-full" 
                        value={email}
                        onChangeText={setEmail}
                    />
                    <View className="flex-row items-center border border-gray-300 rounded-xl px-4 mt-4">
                        <TextInput
                            placeholder="••••••••"
                            placeholderTextColor="#b0b0b0"
                            className="flex-1 py-4"
                            secureTextEntry={!passwordVisible}
                            value={password}
                            onChangeText={setPassword}
                        />
                        <TouchableOpacity activeOpacity={1} onPress={() => setPasswordVisible(!passwordVisible)} hitSlop={8}>
                            <Feather name={passwordVisible ? "eye" : "eye-off"} size={20} color="#18572C" />
                        </TouchableOpacity>
                    </View>

                </View>

                <TouchableOpacity onPress={handleLogin} activeOpacity={0.8}>
                    <Text className="bg-verdeEscuro text-verdeClaro font-bold text-center py-4 rounded-xl mt-6">Entrar</Text>
                </TouchableOpacity>

                <View className="absolute bottom-8 self-center">
                    <Text className=" text-gray-300 mt-4 text-center">Para criar uma conta contate um funcionário cadastrado no sistema.</Text>
                    <Text className=" text-gray-300 mt-2 text-center">SmartCart App v1.0</Text>
                </View>

            </View>
        </TouchableWithoutFeedback>
    )
}