import api from '../api'

export const getTrabalho      = (id)   => api.get(`/trabalhos/${id}`)
export const submitCandidatura = (id, body) => api.post(`/trabalhos/${id}/candidatar`, body)
export const submitEspontanea  = (body)     => api.post('/trabalhos/espontanea', body)
