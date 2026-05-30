import { adminApi } from '../api'

export const getProfile      = ()     => adminApi.get('/admin/profile')
export const updateProfile   = (body) => adminApi.put('/admin/profile', body)
export const changePassword  = (body) => adminApi.put('/admin/profile/password', body)
