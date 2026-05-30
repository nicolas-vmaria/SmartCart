import api from '../api'

export function registerUser(nome, email, senha, tel) {
    return api.post('/auth/register', { nome, email, senha, tel })
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

export function googleLogin(token, userInfo) {
    return api.post('/auth/google', { token, email: userInfo.email, name: userInfo.name })
}
