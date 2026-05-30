import { adminApi } from '../api'

export const getDashboard = () => adminApi.get('/admin/dashboard')
