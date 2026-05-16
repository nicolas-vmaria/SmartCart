import { adminApi } from "../api";

export function createCategory(nome, descricao){
    return adminApi.post('/admin/category', {nome, descricao})
}

export function getCategories(){
    return adminApi.get('/admin/category')
}

export function deleteCategory(id){
    return adminApi.delete(`/admin/category/${id}`)
}

export function editCategory(id, form){
    return adminApi.put(`/admin/category/${id}`, form)
}