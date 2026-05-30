import api from "../api";

export function getCategories(){
    return api.get('/category')
}

export function getCategoryBySlug(slug){
    return api.get(`/category/${slug}`)
}
