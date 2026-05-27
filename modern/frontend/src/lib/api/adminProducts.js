import { adminApi } from '../api'

export function getProduct() {
    return adminApi.get('/admin/product')
}

export function createProduct(form) {
    return adminApi.post('/admin/product', {
        nome:                 form.name,
        categoria_id:         form.categoria_id,
        preco:                form.price,
        estoque:              form.stock,
        descricao:            form.descricao || null,
        foto_url:             form.image || null,
        status:               form.status === 'Ativo' ? 1 : 0,
        desconto_percentual:  Number(form.discount) || 0,
    })
}

export function editProduct(id, form) {
    return adminApi.put(`/admin/product/${id}`, {
        nome:                 form.name,
        categoria_id:         form.categoria_id,
        preco:                form.price,
        estoque:              form.stock,
        descricao:            form.descricao || null,
        foto_url:             form.image || null,
        status:               form.status === 'Ativo' ? 1 : 0,
        desconto_percentual:  Number(form.discount) || 0,
    })
}

export function deleteProduct(id) {
    return adminApi.delete(`/admin/product/${id}`)
}
