import { adminApi } from '../api'

export function getBanners() {
    return adminApi.get('/admin/banner')
}

export function createBanner(foto_url) {
    return adminApi.post('/admin/banner', { foto_url })
}

export function deleteBanner(id) {
    return adminApi.delete(`/admin/banner/${id}`)
}

export function reorderBanners(ids) {
    return adminApi.put('/admin/banner/reorder', { ids })
}

export function toggleBanner(id) {
    return adminApi.patch(`/admin/banner/${id}/toggle`)
}
