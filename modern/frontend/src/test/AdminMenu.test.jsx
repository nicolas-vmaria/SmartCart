import { render, within, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import AdminMenu from '../components/admin/AdminMenu'
import { getAdminOrders } from '../lib/api/adminOrders'
import { getCurriculos } from '../lib/api/adminCurriculos'
import { getAdminConfiguracoes } from '../lib/api/adminConfiguracoes'
import { getProduct } from '../lib/api/adminProducts'
import { adminApi } from '../lib/api'

vi.mock('../lib/api/adminOrders',        () => ({ getAdminOrders:        vi.fn() }))
vi.mock('../lib/api/adminCurriculos',    () => ({ getCurriculos:          vi.fn() }))
vi.mock('../lib/api/adminConfiguracoes', () => ({ getAdminConfiguracoes:  vi.fn() }))
vi.mock('../lib/api/adminProducts',      () => ({ getProduct:             vi.fn() }))
vi.mock('../lib/api', () => ({
    adminApi: { post: vi.fn(), get: vi.fn() }
}))

function renderMenu() {
    return render(
        <MemoryRouter initialEntries={['/admin']}>
            <Routes>
                <Route path="/admin" element={<AdminMenu isOpen={true} onClose={vi.fn()} />} />
                <Route path="/admin/login" element={<div>Tela de Login Admin</div>} />
            </Routes>
        </MemoryRouter>
    )
}

beforeEach(() => {
    localStorage.setItem('admin_user', JSON.stringify({ nome: 'Admin Teste', nome_papel: 'Root', permissions: null }))
    getAdminOrders.mockResolvedValue({ data: { orders: [] } })
    getCurriculos.mockResolvedValue({ data: { stats: { novos: 0 } } })
    getAdminConfiguracoes.mockResolvedValue({ data: { configuracoes: {} } })
    getProduct.mockResolvedValue({ data: [] })
    adminApi.post.mockResolvedValue({ data: {} })
})

afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
})

describe('AdminMenu — Logout', () => {
    it('botão Sair está presente no menu', () => {
        const { container } = renderMenu()
        expect(within(container).getByRole('button', { name: /sair/i })).toBeInTheDocument()
    })

    it('clicar em Sair abre o ConfirmDialog', async () => {
        const { container } = renderMenu()
        await userEvent.click(within(container).getByRole('button', { name: /sair/i }))
        expect(within(container).getByText('Deseja realmente sair?')).toBeInTheDocument()
        expect(within(container).getByText(/ao sair você perde o acesso/i)).toBeInTheDocument()
    })

    it('cancelar fecha o ConfirmDialog sem sair', async () => {
        const { container } = renderMenu()
        await userEvent.click(within(container).getByRole('button', { name: /sair/i }))
        expect(within(container).getByText('Deseja realmente sair?')).toBeInTheDocument()

        await userEvent.click(within(container).getByRole('button', { name: 'Cancelar' }))
        expect(within(container).queryByText('Deseja realmente sair?')).toBeNull()
    })

    it('confirmar logout limpa o localStorage e navega para /admin/login', async () => {
        localStorage.setItem('admin_token', 'fake-token')
        const { container } = renderMenu()

        await userEvent.click(within(container).getByRole('button', { name: /sair/i }))
        await userEvent.click(within(container).getByRole('button', { name: 'Confirmar' }))

        expect(localStorage.getItem('admin_token')).toBeNull()
        expect(localStorage.getItem('admin_user')).toBeNull()
        await waitFor(() =>
            expect(within(container).getByText('Tela de Login Admin')).toBeInTheDocument()
        )
    })

    it('confirmar logout chama a API de logout em background', async () => {
        const { container } = renderMenu()

        await userEvent.click(within(container).getByRole('button', { name: /sair/i }))
        await userEvent.click(within(container).getByRole('button', { name: 'Confirmar' }))

        await waitFor(() => expect(adminApi.post).toHaveBeenCalledWith('/admin/auth/logout'))
    })

    it('logout funciona mesmo se a API retornar erro', async () => {
        adminApi.post.mockRejectedValue(new Error('timeout'))
        localStorage.setItem('admin_token', 'fake-token')
        const { container } = renderMenu()

        await userEvent.click(within(container).getByRole('button', { name: /sair/i }))
        await userEvent.click(within(container).getByRole('button', { name: 'Confirmar' }))

        expect(localStorage.getItem('admin_token')).toBeNull()
        await waitFor(() =>
            expect(within(container).getByText('Tela de Login Admin')).toBeInTheDocument()
        )
    })
})

describe('AdminMenu — Renderização', () => {
    it('exibe o nome e papel do admin logado', () => {
        const { container } = renderMenu()
        expect(within(container).getByText('Admin Teste')).toBeInTheDocument()
        expect(within(container).getByText('Root')).toBeInTheDocument()
    })

    it('exibe as iniciais do admin no avatar', () => {
        const { container } = renderMenu()
        expect(within(container).getByText('AT')).toBeInTheDocument()
    })
})
