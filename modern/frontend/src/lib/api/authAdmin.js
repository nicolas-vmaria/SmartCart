import { adminApi } from '../api'

export function loginAdmin(email, senha) {
    return adminApi.post('/admin/auth/login', { email, senha })
}
