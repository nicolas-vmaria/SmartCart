import api, { adminApi } from "../api"

export function getCoupons() {
    return adminApi.get('/admin/coupon')
}

export function createCoupon(data) {
    return adminApi.post('/admin/coupon', data)
}

export function updateCoupon(id, data) {
    return adminApi.put(`/admin/coupon/${id}`, data)
}

export function deleteCoupon(id) {
    return adminApi.delete(`/admin/coupon/${id}`)
}

export function validateCoupon(codigo) {
    return api.post('/coupon/validate', { codigo })
}
