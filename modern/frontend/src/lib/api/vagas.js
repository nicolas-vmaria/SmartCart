import api from '../api'

export const getVagasPublicas = () => api.get('/vagas')
