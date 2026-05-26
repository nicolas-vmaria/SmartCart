import { adminApi } from '../api'

export const getAdminOrders      = ()         => adminApi.get('/admin/order')
export const getAdminOrderById   = (id)       => adminApi.get(`/admin/order/${id}`)
export const updateOrderStatus   = (id, body) => adminApi.put(`/admin/order/${id}/status`, body)
export const getOrderAnalytics   = ()         => adminApi.get('/admin/order/analytics/monthly')
