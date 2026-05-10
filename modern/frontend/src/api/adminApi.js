import axios from 'axios'
import { API_URL } from './config'

const adminApi = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
})

adminApi.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default adminApi
