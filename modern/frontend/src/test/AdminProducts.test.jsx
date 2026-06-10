import { render, within, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import AdminProducts from '../pages/admin/AdminProducts'
import { getProduct } from '../lib/api/adminProducts'
import { getAdminCategories } from '../lib/api/adminCategories'

vi.mock('../lib/api/adminProducts', () => ({
    getProduct:    vi.fn(),
    createProduct: vi.fn(),
    deleteProduct: vi.fn(),
    editProduct:   vi.fn(),
}))

vi.mock('../lib/api/adminCategories', () => ({
    getAdminCategories: vi.fn(),
}))

vi.mock('../lib/IaAssistant', () => ({
    generateProductDescription: vi.fn(),
}))

vi.mock('../lib/cloudinary', () => ({
    uploadImage: vi.fn(),
}))

vi.mock('../lib/cloudinaryUrl', () => ({
    imgUrl: vi.fn((url) => url || ''),
}))

vi.mock('../components/admin/RichTextEditor', () => ({
    default: ({ value, onChange }) => (
        <textarea value={value} onChange={e => onChange(e.target.value)} />
    ),
}))

const mockProduct = (overrides = {}) => ({
    id: 1,
    nome: 'Produto Teste',
    categoria: 'Eletrônicos',
    categoria_id: 1,
    status: 1,
    estoque: 15,
    preco: 99.90,
    desconto_percentual: 0,
    foto_url: null,
    ...overrides,
})

const semEstoque = mockProduct({ id: 1, nome: 'Sem Estoque',   estoque: 0  })
const baixo      = mockProduct({ id: 2, nome: 'Baixo Estoque', estoque: 5  })
const normal     = mockProduct({ id: 3, nome: 'Estoque Normal', estoque: 15 })

beforeEach(() => {
    getProduct.mockResolvedValue({ data: { products: [semEstoque, baixo, normal] } })
    getAdminCategories.mockResolvedValue({ data: [] })
    localStorage.setItem('admin_user', JSON.stringify({ nome: 'Admin Teste', nome_papel: 'Root', permissions: null }))
})

afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
})

async function abrirFiltro(container) {
    await userEvent.click(within(container).getByRole('button', { name: /filtros/i }))
}

describe('AdminProducts — filtro de estoque', () => {
    it('exibe skeletons durante o carregamento', () => {
        getProduct.mockReturnValue(new Promise(() => {}))
        const { container } = render(<AdminProducts />)
        expect(container.querySelectorAll('tr.animate-pulse').length).toBeGreaterThan(0)
    })

    it('filtro padrão exibe todos os produtos', async () => {
        const { container } = render(<AdminProducts />)
        await waitFor(() => expect(within(container).getByText('Estoque Normal')).toBeInTheDocument())
        expect(within(container).getByText('Sem Estoque')).toBeInTheDocument()
        expect(within(container).getByText('Baixo Estoque')).toBeInTheDocument()
    })

    it('filtro "Sem estoque" exibe apenas produtos com estoque 0', async () => {
        const { container } = render(<AdminProducts />)
        await waitFor(() => expect(within(container).getByText('Estoque Normal')).toBeInTheDocument())

        await abrirFiltro(container)
        await userEvent.click(within(container).getByRole('button', { name: 'Sem estoque' }))

        await waitFor(() => expect(within(container).getByText('Sem Estoque')).toBeInTheDocument())
        expect(within(container).queryByText('Baixo Estoque')).toBeNull()
        expect(within(container).queryByText('Estoque Normal')).toBeNull()
    })

    it('filtro "Baixo (1-10)" exibe apenas produtos com estoque entre 1 e 10', async () => {
        const { container } = render(<AdminProducts />)
        await waitFor(() => expect(within(container).getByText('Estoque Normal')).toBeInTheDocument())

        await abrirFiltro(container)
        await userEvent.click(within(container).getByRole('button', { name: 'Baixo (1-10)' }))

        await waitFor(() => expect(within(container).getByText('Baixo Estoque')).toBeInTheDocument())
        expect(within(container).queryByText('Sem Estoque')).toBeNull()
        expect(within(container).queryByText('Estoque Normal')).toBeNull()
    })

    it('filtro "Normal" exibe apenas produtos com estoque maior que 10', async () => {
        const { container } = render(<AdminProducts />)
        await waitFor(() => expect(within(container).getByText('Estoque Normal')).toBeInTheDocument())

        await abrirFiltro(container)
        await userEvent.click(within(container).getByRole('button', { name: 'Normal' }))

        await waitFor(() => expect(within(container).getByText('Estoque Normal')).toBeInTheDocument())
        expect(within(container).queryByText('Sem Estoque')).toBeNull()
        expect(within(container).queryByText('Baixo Estoque')).toBeNull()
    })
})
