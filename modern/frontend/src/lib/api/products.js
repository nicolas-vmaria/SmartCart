import api from '../api'

export function getProducts() {
    return api.get('/product')
}

export function getProductBySlug(slug) {
    return api.get(`/product/${slug}`)
}

export function getProdutosDestaque() {
    return api.get('/product/destaques')
}
