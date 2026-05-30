import api from "../api";

export function createOrder(body) {
    return api.post('/order', body)
}

export function getUserOrders() {
    return api.get('/order')
}

export function getOrderById(id) {
    return api.get(`/order/${id}`)
}

export function cancelOrder(id) {
    return api.delete(`/order/${id}`)
}
