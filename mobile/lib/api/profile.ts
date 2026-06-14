import api from "../apiConfig";

export const getAdminProfile = () => api.get("/admin/profile");

export const updateAdminProfile = (data: { nome: string; email: string; tel?: string }) =>
    api.put("/admin/profile", data);

export const updateAdminPassword = (data: { senha_atual: string; senha_nova: string; senha_confirma: string }) =>
    api.put("/admin/profile/password", data);
