import api from "../apiConfig";

export function getDashboard() {
    return api.get("/admin/dashboard");
}

export function getClients() {
    return api.get("/admin/client");
}
