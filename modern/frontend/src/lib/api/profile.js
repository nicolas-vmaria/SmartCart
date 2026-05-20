import { adminApi } from "../api";

export function getProfile() {
    return adminApi.get('/admin/profile')
}

export function updateProfile(data) {
    return adminApi.put('/admin/profile', data)
}

export function changePassword(data) {
    return adminApi.put('/admin/profile/password', data)
}
