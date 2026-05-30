import { adminApi } from "../api";

export function getUsers() {
    return adminApi.get('/admin/employee')
}

export function createUser(data) {
    return adminApi.post('/admin/employee', data)
}

export function updateUser(id, data) {
    return adminApi.put(`/admin/employee/${id}`, data)
}

export function deleteUser(id) {
    return adminApi.delete(`/admin/employee/${id}`)
}

export function resetUserPassword(id) {
    return adminApi.put(`/admin/employee/${id}/reset-password`)
}
