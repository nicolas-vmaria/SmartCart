import { adminApi } from "../api";

export function createCategory(nome, descricao){
    return adminApi.post('/admin/category', {nome, descricao})
}