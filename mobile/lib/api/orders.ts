import api from "../apiConfig";

export function getOrders() {
    return api.get("/admin/order");
}

export function getOrderById(id: number) {
    return api.get(`/admin/order/${id}`);
}

export function updateOrderStatus(id: number, status: string) {
    return api.put(`/admin/order/${id}/status`, { status });
}
