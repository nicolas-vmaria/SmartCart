import api from '../api'

export function loginAdmin(email, senha) {
    return api.post('/admin/auth/login', { email, senha })
}
