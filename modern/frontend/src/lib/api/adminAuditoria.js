import { adminApi } from '../api'

export function getAuditLogs(params = {}) {
    return adminApi.get('/admin/auditoria', { params })
}
