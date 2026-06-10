import { render, within, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import AdminManageUsers from '../pages/admin/AdminManageUsers'
import { useAdminData } from '../hooks/useAdminData'

vi.mock('../hooks/useAdminData')

const mockUser = (overrides = {}) => ({
    id: 1,
    name: 'João Silva',
    email: 'joao@test.com',
    tel: '(11) 99999-9999',
    role: 'Gerente',
    createdAt: '01/01/2024',
    ...overrides,
})

beforeEach(() => {
    localStorage.setItem('admin_user', JSON.stringify({ nome: 'Admin Teste', nome_papel: 'Root', permissions: null }))
})

afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
})

describe('AdminManageUsers — skeleton', () => {
    it('exibe skeletons na primeira carga quando não há dados em cache', () => {
        useAdminData.mockReturnValue({ data: [], loading: true, setData: vi.fn(), refetch: vi.fn(), setLoading: vi.fn() })

        const { container } = render(<AdminManageUsers />)

        expect(container.querySelectorAll('tr.animate-pulse').length).toBeGreaterThan(0)
    })

    it('não exibe skeletons ao recarregar quando já existem dados carregados', async () => {
        useAdminData
            .mockReturnValueOnce({ data: [mockUser()], loading: true, setData: vi.fn(), refetch: vi.fn(), setLoading: vi.fn() })
            .mockReturnValueOnce({ data: [], loading: false, setData: vi.fn(), refetch: vi.fn(), setLoading: vi.fn() })

        const { container } = render(<AdminManageUsers />)

        expect(container.querySelectorAll('tr.animate-pulse').length).toBe(0)
        expect(within(container).getByText('João Silva')).toBeInTheDocument()
    })
})
