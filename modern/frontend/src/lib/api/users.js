import { adminApi } from "../api";

export function getUsers() {
    return adminApi.get('/admin/user')
}

export function createUser(data) {
    return adminApi.post('/admin/user', data)
}

export function updateUserRole(id, roleId) {
    return adminApi.put(`/admin/user/${id}/role`, { role_id: roleId })
}

export function deleteUser(id) {
    return adminApi.delete(`/admin/user/${id}`)
}
