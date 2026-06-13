import api from "../apiConfig";

export function getProducts() {
    return api.get("/admin/product");
}
