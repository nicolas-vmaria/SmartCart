import { render, within, waitFor, cleanup } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import AdminRoles from '../pages/admin/AdminRoles'
import { getRoles, createRole, deleteRole } from '../lib/api/roles'

vi.mock('../lib/api/roles', () => ({
    getRoles:   vi.fn(),
    createRole: vi.fn(),
    updateRole: vi.fn(),
    deleteRole: vi.fn(),
}))

const mockRole = (overrides = {}) => ({
    id: 1,
    nome_papel: 'Gerente',
    badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
    descricao: 'Gerencia o sistema',
    total_usuarios: 2,
    ver_dashboard: 1, ver_clientes: 1, ver_categorias: 0,
    ver_produtos: 1,  ver_pedidos: 0,  ver_admin: 0,
    ver_curriculos: 0, ver_trabalhos: 0, ver_cupons: 0,
    ver_relatorios: 0, ver_customizacao: 0, ver_usuarios: 0,
    ver_configuracoes: 0, ver_marketing: 0, ver_reviews: 0, ver_auditoria: 0,
    ...overrides,
})

beforeEach(() => {
    getRoles.mockResolvedValue({ data: { roles: [] } })
    localStorage.setItem('admin_user', JSON.stringify({ nome: 'Admin Teste', nome_papel: 'Root', permissions: null }))
})

afterEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    cleanup()
})

describe('AdminRoles', () => {
    it('exibe skeletons durante o carregamento', () => {
        getRoles.mockReturnValue(new Promise(() => {}))
        const { container } = render(<AdminRoles />)
        expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
    })

    it('renderiza papéis carregados da API', async () => {
        getRoles.mockResolvedValue({ data: { roles: [mockRole()] } })
        const { container } = render(<AdminRoles />)
        // 'Gerencia o sistema' é a descrição única — aparece apenas uma vez no card
        await waitFor(() => expect(within(container).getByText('Gerencia o sistema')).toBeInTheDocument())
    })

    it('deleteRole chama a API e exibe toast de sucesso', async () => {
        getRoles.mockResolvedValue({ data: { roles: [mockRole()] } })
        deleteRole.mockResolvedValue({ data: { message: 'Papel 1 removido' } })

        const { container } = render(<AdminRoles />)
        await waitFor(() => expect(within(container).getByText('Gerencia o sistema')).toBeInTheDocument())

        const toggleBtn = within(container).getByTitle('Ver permissões')
        const actionBtns = Array.from(toggleBtn.parentElement.querySelectorAll('button'))
        await userEvent.click(actionBtns[actionBtns.length - 1])

        await userEvent.click(within(container).getByRole('button', { name: 'Excluir' }))

        await waitFor(() => expect(deleteRole).toHaveBeenCalledWith(1))
        await waitFor(() => expect(within(container).getByText('Papel removido')).toBeInTheDocument())
    })

    it('deleteRole exibe toast de erro quando a API rejeita', async () => {
        getRoles.mockResolvedValue({ data: { roles: [mockRole()] } })
        deleteRole.mockRejectedValue({ response: { data: { error: 'Papel em uso por usuários' } } })

        const { container } = render(<AdminRoles />)
        await waitFor(() => expect(within(container).getByText('Gerencia o sistema')).toBeInTheDocument())

        const toggleBtn = within(container).getByTitle('Ver permissões')
        const actionBtns = Array.from(toggleBtn.parentElement.querySelectorAll('button'))
        await userEvent.click(actionBtns[actionBtns.length - 1])

        await userEvent.click(within(container).getByRole('button', { name: 'Excluir' }))

        await waitFor(() => expect(within(container).getByText('Papel em uso por usuários')).toBeInTheDocument())
        expect(within(container).getByText('Gerencia o sistema')).toBeInTheDocument()
    })

    it('botão submit fica desabilitado e exibe spinner durante criação', async () => {
        createRole.mockReturnValue(new Promise(() => {}))

        const { container } = render(<AdminRoles />)
        await userEvent.click(within(container).getByRole('button', { name: /novo papel/i }))

        await userEvent.type(within(container).getByPlaceholderText(/ex: gerente/i), 'Supervisor')

        const submitBtn = within(container).getByRole('button', { name: /criar papel/i })
        await userEvent.click(submitBtn)

        await waitFor(() => expect(submitBtn).toBeDisabled())
        expect(container.querySelector('.animate-spin')).not.toBeNull()
    })

    it('cria papel com sucesso, fecha o modal e exibe toast', async () => {
        createRole.mockResolvedValue({
            data: { role: mockRole({ id: 2, nome_papel: 'Supervisor', total_usuarios: 0 }) }
        })

        const { container } = render(<AdminRoles />)
        await userEvent.click(within(container).getByRole('button', { name: /novo papel/i }))
        await userEvent.type(within(container).getByPlaceholderText(/ex: gerente/i), 'Supervisor')
        await userEvent.click(within(container).getByRole('button', { name: /criar papel/i }))

        await waitFor(() => expect(within(container).queryByRole('button', { name: /criar papel/i })).toBeNull())
        expect(within(container).getByText('Papel criado com sucesso')).toBeInTheDocument()
    })

    it('exibe toast de erro quando criação falha e mantém o modal aberto', async () => {
        createRole.mockRejectedValue({ response: { data: { error: 'Nome já existe' } } })

        const { container } = render(<AdminRoles />)
        await userEvent.click(within(container).getByRole('button', { name: /novo papel/i }))
        await userEvent.type(within(container).getByPlaceholderText(/ex: gerente/i), 'Duplicado')
        await userEvent.click(within(container).getByRole('button', { name: /criar papel/i }))

        await waitFor(() => expect(within(container).getByText('Nome já existe')).toBeInTheDocument())
        expect(within(container).getByRole('button', { name: /criar papel/i })).toBeInTheDocument()
    })
})
