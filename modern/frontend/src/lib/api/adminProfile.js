import { adminApi } from '../api'

export const getProfile      = ()     => adminApi.get('/profile')
export const updateProfile   = (body) => adminApi.put('/profile', body)
export const changePassword  = (body) => adminApi.put('/profile/password', body)
