import { adminApi } from '../api'

export function sendAdminReport(data) {
    return adminApi.post('/admin/report', data)
}
