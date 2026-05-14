import api from '../api'

export function registerUser(nome, email, senha) {
    return api.post('/auth/register', { nome, email, senha })
}

export function loginUser(email, senha) {
    return api.post('/auth/login', { email, senha })
}

export function forgotUser(email){
    return api.post('/auth/forgot-password', {email})
}

export function resetPasswordUser(senha, token){
    return api.post('/auth/reset-password', {senha, token})
}
