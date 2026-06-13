import api from "../apiConfig";

export function getOrderAnalytics(mes: number, ano: number) {
    return api.get(`/admin/order/analytics/monthly?mes=${mes}&ano=${ano}`);
}

export function getHighlights() {
    return api.get("/product/highlights");
}
