import api from '../api'

export function registerUser(nome, email, senha) {
    return api.post('/auth/register', { nome, email, senha })
}

export function loginUser(email, senha) {
    return api.post('/auth/login', { email, senha })
}
