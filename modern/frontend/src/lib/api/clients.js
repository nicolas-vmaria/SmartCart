import { adminApi } from "../api"

export function getClients() {
    return adminApi.get('/admin/client')
}

export function deleteClient(id) {
    return adminApi.delete(`/admin/client/${id}`)
}
