import axios from 'axios'
import { API_URL } from './config'

const api = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use(config => {
    const token = localStorage.getItem('user_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

api.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401 && !error.config?.url?.startsWith('/auth/')) {
            localStorage.removeItem('user_token')
            localStorage.removeItem('user_nome')
            window.dispatchEvent(new Event('storage'))

            const publicAuthPages = ['/login', '/register', '/forgot-password', '/reset-password']
            if (!publicAuthPages.includes(window.location.pathname)) {
                window.location.assign('/login')
            }
        }

        return Promise.reject(error)
    }
)

export const adminApi = axios.create({
    baseURL: API_URL,
    headers: { 'Content-Type': 'application/json' }
})

adminApi.interceptors.request.use(config => {
    const token = localStorage.getItem('admin_token')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

export default api
