import { adminApi } from '../api'

export function createProduct(form) {
    return adminApi.post('/admin/product', {
        nome:         form.name,
        categoria_id: form.categoria_id,
        preco:        form.price,
        estoque:      form.stock,
        descricao:    form.descricao || null,
        foto_url:     form.image || null,
        status:       form.status.toLowerCase(),
    })
}