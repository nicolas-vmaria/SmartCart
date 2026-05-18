import { adminApi } from "../api";

export function getRoles() {
    return adminApi.get('/admin/role')
}

export function createRole(data) {
    return adminApi.post('/admin/role', data)
}

export function updateRole(id, data) {
    return adminApi.put(`/admin/role/${id}`, data)
}

export function deleteRole(id) {
    return adminApi.delete(`/admin/role/${id}`)
}

