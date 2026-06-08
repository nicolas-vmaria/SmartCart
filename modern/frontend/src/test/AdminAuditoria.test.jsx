import { render, within, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import AdminAuditoria from '../pages/admin/AdminAuditoria'
import { getAuditLogs } from '../lib/api/adminAuditoria'

vi.mock('../lib/api/adminAuditoria', () => ({
    getAuditLogs: vi.fn()
}))

const mockLog = (overrides = {}) => ({
    id: 1,
    created_at: '2024-06-07T10:00:00',
    admin_nome: 'João Silva',
    acao: 'criar',
    entidade: 'produto',
    entidade_id: 42,
    detalhes: null,
    ...overrides
})

beforeEach(() => {
    getAuditLogs.mockResolvedValue({ data: { logs: [], admins: [], roles: [] } })
})

afterEach(() => vi.clearAllMocks())

describe('AdminAuditoria', () => {
    it('exibe skeletons durante o carregamento', () => {
        getAuditLogs.mockReturnValue(new Promise(() => {}))
        const { container } = render(<AdminAuditoria />)
        const rows = within(container).getAllByRole('row')
        // 1 header + 8 skeleton rows
        expect(rows.length).toBe(9)
    })

    it('exibe mensagem quando não há registros', async () => {
        const { container } = render(<AdminAuditoria />)
        await waitFor(() =>
            expect(within(container).getByText('Nenhum registro encontrado.')).toBeInTheDocument()
        )
    })

    it('renderiza logs retornados pela API', async () => {
        getAuditLogs.mockResolvedValue({
            data: {
                logs: [
                    mockLog(),
                    mockLog({ id: 2, admin_nome: 'Maria Santos', acao: 'deletar' })
                ],
                admins: [],
                roles: []
            }
        })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('João Silva')).toBeInTheDocument())
        expect(within(container).getByText('Maria Santos')).toBeInTheDocument()
    })

    it('AcaoBadge exibe label correto para cada ação', async () => {
        const casos = [
            { acao: 'criar',            label: 'Criou' },
            { acao: 'editar',           label: 'Editou' },
            { acao: 'deletar',          label: 'Deletou' },
            { acao: 'login',            label: 'Login' },
            { acao: 'logout',           label: 'Logout' },
            { acao: 'toggle_ativo',     label: 'Ativou/Desativou' },
            { acao: 'atualizar_status', label: 'Atualizou status' },
        ]
        for (const { acao, label } of casos) {
            getAuditLogs.mockResolvedValue({ data: { logs: [mockLog({ id: 1, acao })], admins: [], roles: [] } })
            const { container, unmount } = render(<AdminAuditoria />)
            await waitFor(() => expect(within(container).getByText(label)).toBeInTheDocument())
            unmount()
            vi.clearAllMocks()
        }
    })

    it('AcaoBadge usa o valor bruto para ação desconhecida', async () => {
        getAuditLogs.mockResolvedValue({
            data: { logs: [mockLog({ acao: 'acao_desconhecida' })], admins: [], roles: [] }
        })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('acao_desconhecida')).toBeInTheDocument())
    })

    it('entidade é traduzida corretamente na tabela', async () => {
        getAuditLogs.mockResolvedValue({
            data: { logs: [mockLog({ entidade: 'cliente' })], admins: [], roles: [] }
        })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('Cliente')).toBeInTheDocument())
    })

    it('DetalhesRow exibe — quando detalhes é nulo', async () => {
        getAuditLogs.mockResolvedValue({ data: { logs: [mockLog({ detalhes: null })], admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('João Silva')).toBeInTheDocument())
        expect(within(container).getAllByText('—').length).toBeGreaterThan(0)
    })

    it('DetalhesRow expande ao clicar e colapsa ao clicar novamente', async () => {
        const detalhes = JSON.stringify({ nome: 'Produto X', preco: 99.9 })
        getAuditLogs.mockResolvedValue({ data: { logs: [mockLog({ detalhes })], admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('João Silva')).toBeInTheDocument())

        const expandBtn = within(container).getByRole('button', { name: /nome: Produto X/i })

        expect(within(container).queryByText('99.9')).toBeNull()
        await userEvent.click(expandBtn)
        expect(within(container).getByText('99.9')).toBeInTheDocument()

        await userEvent.click(expandBtn)
        expect(within(container).queryByText('99.9')).toBeNull()
    })

    it('filtro de entidade chama API com parâmetro correto', async () => {
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(getAuditLogs).toHaveBeenCalledTimes(1))

        const [entidadeSelect] = within(container).getAllByRole('combobox')
        await userEvent.selectOptions(entidadeSelect, 'produto')
        await userEvent.click(within(container).getByRole('button', { name: /filtrar/i }))

        expect(getAuditLogs).toHaveBeenLastCalledWith({ entidade: 'produto' })
    })

    it('botão limpar reseta filtros e rebusca sem parâmetros', async () => {
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(getAuditLogs).toHaveBeenCalledTimes(1))

        const [entidadeSelect] = within(container).getAllByRole('combobox')
        await userEvent.selectOptions(entidadeSelect, 'produto')

        await userEvent.click(within(container).getByRole('button', { name: /limpar/i }))
        expect(getAuditLogs).toHaveBeenLastCalledWith({})
    })

    it('não exibe paginação com 25 ou menos registros', async () => {
        const logs = Array.from({ length: 10 }, (_, i) => mockLog({ id: i + 1 }))
        getAuditLogs.mockResolvedValue({ data: { logs, admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getAllByText('João Silva').length).toBe(10))
        expect(within(container).queryByText('Próximo')).toBeNull()
    })

    it('exibe paginação e contagem quando há mais de 25 registros', async () => {
        const logs = Array.from({ length: 30 }, (_, i) => mockLog({ id: i + 1, admin_nome: `Admin ${i + 1}` }))
        getAuditLogs.mockResolvedValue({ data: { logs, admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('30 registro(s)')).toBeInTheDocument())
        expect(within(container).getByText('1 / 2')).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: 'Anterior' })).toBeDisabled()
        expect(within(container).getByRole('button', { name: 'Próximo' })).not.toBeDisabled()
    })

    it('paginação avança para a próxima página e desabilita Próximo na última', async () => {
        const logs = Array.from({ length: 30 }, (_, i) => mockLog({ id: i + 1, admin_nome: `Admin ${i + 1}` }))
        getAuditLogs.mockResolvedValue({ data: { logs, admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('1 / 2')).toBeInTheDocument())

        await userEvent.click(within(container).getByRole('button', { name: 'Próximo' }))

        expect(within(container).getByText('2 / 2')).toBeInTheDocument()
        expect(within(container).getByRole('button', { name: 'Próximo' })).toBeDisabled()
        expect(within(container).getByRole('button', { name: 'Anterior' })).not.toBeDisabled()
    })

    it('paginação volta para a página anterior', async () => {
        const logs = Array.from({ length: 30 }, (_, i) => mockLog({ id: i + 1, admin_nome: `Admin ${i + 1}` }))
        getAuditLogs.mockResolvedValue({ data: { logs, admins: [], roles: [] } })
        const { container } = render(<AdminAuditoria />)
        await waitFor(() => expect(within(container).getByText('1 / 2')).toBeInTheDocument())

        await userEvent.click(within(container).getByRole('button', { name: 'Próximo' }))
        expect(within(container).getByText('2 / 2')).toBeInTheDocument()

        await userEvent.click(within(container).getByRole('button', { name: 'Anterior' }))
        expect(within(container).getByText('1 / 2')).toBeInTheDocument()
    })
})
