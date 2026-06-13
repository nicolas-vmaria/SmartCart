import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
    try {
        const token = await AsyncStorage.getItem('admin_token');
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
    } catch {
        // sem token, prossegue sem header
    }
    return config;
})

export default api;