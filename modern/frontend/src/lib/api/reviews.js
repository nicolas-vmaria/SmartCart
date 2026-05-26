import api from '../api'

export const getReviews   = (productId)       => api.get(`/product/${productId}/review`)
export const createReview = (productId, body) => api.post(`/product/${productId}/review`, body)
export const markHelpful  = (reviewId)        => api.put(`/review/${reviewId}/helpful`)
