import { adminApi } from '../api'

export const getCurriculos         = (params)  => adminApi.get('/admin/curriculo', { params })
export const getCurriculoById      = (id)      => adminApi.get(`/admin/curriculo/${id}`)
export const updateCurriculoStatus = (id, status) => adminApi.put(`/admin/curriculo/${id}`, { status })
export const deleteCurriculo       = (id)      => adminApi.delete(`/admin/curriculo/${id}`)
