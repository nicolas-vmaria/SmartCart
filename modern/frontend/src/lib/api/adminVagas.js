import { adminApi } from '../api'

export const getVagas       = ()        => adminApi.get('/admin/vagas')
export const createVaga     = (body)    => adminApi.post('/admin/vagas', body)
export const updateVaga     = (id, body)=> adminApi.put(`/admin/vagas/${id}`, body)
export const toggleVaga     = (id)      => adminApi.patch(`/admin/vagas/${id}/toggle`)
export const deleteVaga     = (id)      => adminApi.delete(`/admin/vagas/${id}`)
