import api from '../api'

export function sendContact(nome, email, mensagem) {
    return api.post('/contact', { nome, email, mensagem })
}
