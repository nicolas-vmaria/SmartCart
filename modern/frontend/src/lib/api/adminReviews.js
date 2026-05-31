import { adminApi } from '../api'

export const getAllReviews     = (params)  => adminApi.get('/admin/review', { params })
export const deleteReview      = (id)      => adminApi.delete(`/admin/review/${id}`)
export const bulkDeleteReviews = (ids)     => adminApi.post('/admin/review/bulk-delete', { ids })
export const getPalavras       = ()        => adminApi.get('/admin/review/palavras-proibidas')
export const addPalavra        = (palavra) => adminApi.post('/admin/review/palavras-proibidas', { palavra })
export const deletePalavra     = (id)      => adminApi.delete(`/admin/review/palavras-proibidas/${id}`)
