import api from '../api'

export function addToCart(slug, produto_id, quantidade) {
    return api.post(`/cart/item/${slug}`, { produto_id, quantidade })
}

export function getCart() {
    return api.get('/cart')
}

export function updateCartItem(id, quantidade) {
    return api.put(`/cart/item/${id}`, { quantidade })
}

export function removeCartItem(id) {
    return api.delete(`/cart/item/${id}`)
}

export function clearCart() {
    return api.delete('/cart')
}
