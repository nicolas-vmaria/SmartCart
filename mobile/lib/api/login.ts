import api from "../apiConfig";

export function login(email: string, password: string) {
        return api.post("/admin/auth/login", { email, senha: password });
}