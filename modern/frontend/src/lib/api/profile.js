import api from '../api'

export const getProfile     = ()     => api.get('/profile')
export const updateProfile  = (body) => api.put('/profile', body)
export const updateAddress  = (body) => api.put('/profile/address', body)
export const updatePassword = (body) => api.put('/profile/password', body)
export const updateAvatar   = (body) => api.post('/profile/avatar', body)
