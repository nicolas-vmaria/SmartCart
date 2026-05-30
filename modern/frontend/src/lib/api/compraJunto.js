import api from '../api'

export const getCompraJunto = (produtoId) => api.get(`/produto/${produtoId}/compra-junto`)
