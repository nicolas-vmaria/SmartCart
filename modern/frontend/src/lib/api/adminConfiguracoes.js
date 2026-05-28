import { adminApi } from '../api'

export const getAdminConfiguracoes = () => adminApi.get('/configuracoes')
export const updateConfiguracoes   = (data) => adminApi.put('/admin/configuracoes', data)
