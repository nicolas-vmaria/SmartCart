import { adminApi } from '../api'

export function sendAdminReport(data) {
    return adminApi.post('/admin/report', data)
}

export function getAdminReports(params) {
    return adminApi.get('/admin/report', { params })
}

export function getAdminReport(id) {
    return adminApi.get(`/admin/report/${id}`)
}

export function updateAdminReport(id, data) {
    return adminApi.put(`/admin/report/${id}`, data)
}
