import { adminApi } from '../api'

export const toggleDestaque           = (id)   => adminApi.put(`/admin/marketing/destaque/${id}`)
export const getAdminCompraJuntos     = ()      => adminApi.get('/admin/compra-junto')
export const setAdminCompraJunto      = (data)  => adminApi.put('/admin/compra-junto', data)
export const deleteAdminCompraJunto   = (id)    => adminApi.delete(`/admin/compra-junto/${id}`)
