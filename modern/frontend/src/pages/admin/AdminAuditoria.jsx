import { useState, useEffect, useCallback } from 'react'
import { Search, ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import AdminHeader from '../../components/admin/AdminHeader'
import { getAuditLogs } from '../../lib/api/adminAuditoria'
import Toast from '../../components/Toast'
import { formatDateTime as formatDate } from '../../lib/date'

const ACAO_LABEL = {
    criar:            { label: 'Criou',            color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    editar:           { label: 'Editou',            color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    deletar:          { label: 'Deletou',           color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    atualizar_status: { label: 'Atualizou status',  color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
    login:            { label: 'Login',             color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
    logout:           { label: 'Logout',            color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    reordenar:        { label: 'Reordenou',         color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    toggle_ativo:     { label: 'Ativou/Desativou',  color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    toggle_destaque:  { label: 'Toggle destaque',   color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
    deletar_em_massa: { label: 'Deletou em massa',  color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    adicionar_palavra:{ label: 'Adicionou palavra', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
    deletar_palavra:  { label: 'Removeu palavra',   color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
    redefinir_senha:  { label: 'Redefiniu senha',   color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
    editar_perfil:    { label: 'Editou perfil',     color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
    alterar_senha:    { label: 'Alterou senha',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' },
}

const ENTIDADE_LABEL = {
    produto:     'Produto',
    pedido:      'Pedido',
    cupom:       'Cupom',
    categoria:   'Categoria',
    cliente:     'Cliente',
    funcionario: 'Funcionário',
    banner:      'Banner',
    curriculo:   'Currículo',
    review:      'Review',
    papel:       'Papel',
    vaga:        'Vaga',
    perfil:      'Perfil',
    sistema:     'Sistema',
}


function AcaoBadge({ acao }) {
    const info = ACAO_LABEL[acao] ?? { label: acao, color: 'bg-gray-100 text-gray-600' }
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${info.color}`}>{info.label}</span>
}

function DetalhesRow({ detalhes }) {
    const [open, setOpen] = useState(false)
    if (!detalhes) return <span className="text-gray-300 dark:text-gray-600">—</span>

    let parsed
    try { parsed = typeof detalhes === 'string' ? JSON.parse(detalhes) : detalhes } catch { return <span className="text-gray-400 text-xs">{String(detalhes)}</span> }

    const entries = Object.entries(parsed)
    if (!entries.length) return <span className="text-gray-300 dark:text-gray-600">—</span>

    const preview = entries.slice(0, 1).map(([k, v]) => `${k}: ${v}`).join(', ')
    return (
        <div>
            <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 hover:text-verde-escuro dark:hover:text-white transition-colors">
                <span className="truncate max-w-32">{preview}{entries.length > 1 ? '…' : ''}</span>
                {open ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {open && (
                <div className="mt-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 text-xs font-mono space-y-0.5">
                    {entries.map(([k, v]) => (
                        <div key={k} className="flex gap-2">
                            <span className="text-gray-400 dark:text-gray-500 shrink-0">{k}:</span>
                            <span className="text-gray-700 dark:text-gray-300 break-all">{String(v)}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

const ENTIDADES = ['', 'produto', 'pedido', 'cupom', 'categoria', 'cliente', 'funcionario', 'banner', 'curriculo', 'review', 'papel', 'vaga', 'perfil', 'sistema']
const PER_PAGE = 25

export default function AdminAuditoria() {
    const [logs, setLogs] = useState([])
    const [admins, setAdmins] = useState([])
    const [roles, setRoles] = useState([])
    const [loading, setLoading] = useState(true)
    const [toast, setToast] = useState(null)
    const [filters, setFilters] = useState({ entidade: '', admin_id: '', papel_id: '', data_inicio: '', data_fim: '' })
    const [page, setPage] = useState(1)

    const fetchLogs = useCallback(async (f) => {
        setLoading(true)
        try {
            const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''))
            const { data } = await getAuditLogs(params)
            setLogs(data.logs ?? [])
            setAdmins(data.admins ?? [])
            setRoles(data.roles ?? [])
        } catch {
            setLogs([])
            setAdmins([])
            setRoles([])
            setToast({ message: 'Erro ao carregar logs de auditoria.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { fetchLogs(filters) }, [])

    function handleFilter(e) {
        e.preventDefault()
        setPage(1)
        fetchLogs(filters)
    }

    function resetFilters() {
        const empty = { entidade: '', admin_id: '', papel_id: '', data_inicio: '', data_fim: '' }
        setFilters(empty)
        setPage(1)
        fetchLogs(empty)
    }

    const totalPages = Math.max(1, Math.ceil(logs.length / PER_PAGE))
    const paginated = logs.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <AdminHeader title="Auditoria" description="Registro de todas as ações realizadas por administradores." />

            <form onSubmit={handleFilter} className="mt-5 flex flex-wrap gap-3 items-end">
                <div className="flex flex-col gap-1 min-w-36">
                    <label className="text-xs text-gray-500 dark:text-(--admin-text-muted)">Entidade</label>
                    <select
                        value={filters.entidade}
                        onChange={e => setFilters(p => ({ ...p, entidade: e.target.value }))}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro"
                    >
                        {ENTIDADES.map(e => <option key={e} value={e}>{e ? ENTIDADE_LABEL[e] ?? e : 'Todas'}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-36">
                    <label className="text-xs text-gray-500 dark:text-(--admin-text-muted)">Papel</label>
                    <select
                        value={filters.papel_id}
                        onChange={e => setFilters(p => ({ ...p, papel_id: e.target.value }))}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro"
                    >
                        <option value="">Todos</option>
                        {roles.map(r => <option key={r.id} value={r.id}>{r.nome_papel}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1 min-w-36">
                    <label className="text-xs text-gray-500 dark:text-(--admin-text-muted)">Usuário</label>
                    <select
                        value={filters.admin_id}
                        onChange={e => setFilters(p => ({ ...p, admin_id: e.target.value }))}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro"
                    >
                        <option value="">Todos</option>
                        {admins.map(a => <option key={a.admin_id} value={a.admin_id}>{a.admin_nome}</option>)}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-(--admin-text-muted)">De</label>
                    <input type="date" value={filters.data_inicio}
                        onChange={e => setFilters(p => ({ ...p, data_inicio: e.target.value }))}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro"
                    />
                </div>

                <div className="flex flex-col gap-1">
                    <label className="text-xs text-gray-500 dark:text-(--admin-text-muted)">Até</label>
                    <input type="date" value={filters.data_fim}
                        onChange={e => setFilters(p => ({ ...p, data_fim: e.target.value }))}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro"
                    />
                </div>

                <button type="submit" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                    <Search size={14} />
                    Filtrar
                </button>

                <button type="button" onClick={resetFilters} className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                    <RotateCcw size={14} />
                    Limpar
                </button>
            </form>

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-(--admin-border) bg-gray-50 dark:bg-(--admin-hover)">
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Data</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Admin</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Ação</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Entidade</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">ID</th>
                                <th className="text-left px-4 py-3 text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Detalhes</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading && Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i} className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
                                    {Array.from({ length: 6 }).map((_, j) => (
                                        <td key={j} className="px-4 py-3"><div className="h-3 bg-gray-100 dark:bg-(--admin-hover) rounded w-full" /></td>
                                    ))}
                                </tr>
                            ))}
                            {!loading && paginated.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-16 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                        Nenhum registro encontrado.
                                    </td>
                                </tr>
                            )}
                            {!loading && paginated.map(log => (
                                <tr key={log.id} className="border-b border-gray-50 dark:border-(--admin-border) hover:bg-gray-50/50 dark:hover:bg-(--admin-hover) transition-colors">
                                    <td className="px-4 py-3 text-gray-500 dark:text-(--admin-text-muted) whitespace-nowrap text-xs">{formatDate(log.created_at)}</td>
                                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-(--admin-text) whitespace-nowrap">{log.admin_nome}</td>
                                    <td className="px-4 py-3"><AcaoBadge acao={log.acao} /></td>
                                    <td className="px-4 py-3 text-gray-600 dark:text-(--admin-text-muted) capitalize">{ENTIDADE_LABEL[log.entidade] ?? log.entidade}</td>
                                    <td className="px-4 py-3 text-gray-400 dark:text-(--admin-text-muted) text-xs">{log.entidade_id ?? '—'}</td>
                                    <td className="px-4 py-3 max-w-48"><DetalhesRow detalhes={log.detalhes} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {!loading && totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-(--admin-border)">
                        <span className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{logs.length} registro(s)</span>
                        <div className="flex items-center gap-2">
                            <button
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Anterior
                            </button>
                            <span className="text-xs text-gray-500 dark:text-(--admin-text-muted)">{page} / {totalPages}</span>
                            <button
                                disabled={page === totalPages}
                                onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 text-xs rounded-lg border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                            >
                                Próximo
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
