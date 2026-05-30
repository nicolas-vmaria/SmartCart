import { useState, useEffect, useRef } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Search, SlidersHorizontal, Trash2, X, Download, FileText, Mail, Phone, Link2, ExternalLink } from 'lucide-react'
import { areaCor } from '../../data/vagas'
import { getCurriculos, getCurriculoById, updateCurriculoStatus, deleteCurriculo } from '../../lib/api/adminCurriculos'

const STATUS_LABEL = {
    novo:       'Novo',
    em_analise: 'Em análise',
    aprovado:   'Aprovado',
    reprovado:  'Reprovado',
}

const statusStyle = {
    novo:       'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    em_analise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300',
    aprovado:   'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    reprovado:  'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

function corArea(area) {
    return areaCor[area] ?? 'bg-gray-100 text-gray-600'
}

function fmtDate(str) {
    if (!str) return '—'
    return new Date(str).toLocaleDateString('pt-BR')
}



function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5 animate-pulse">
            <div className="h-3 w-20 bg-gray-200 dark:bg-(--admin-hover) rounded mb-3" />
            <div className="h-8 w-12 bg-gray-200 dark:bg-(--admin-hover) rounded" />
        </div>
    )
}

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
            <td className="py-3 pr-3"><div className="w-4 h-4 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
            <td className="py-3"><div className="h-4 w-32 bg-gray-200 dark:bg-(--admin-hover) rounded mb-1" /><div className="h-3 w-24 bg-gray-100 dark:bg-(--admin-hover) rounded" /></td>
            <td className="py-3"><div className="h-4 w-40 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
            <td className="py-3"><div className="h-5 w-20 bg-gray-200 dark:bg-(--admin-hover) rounded-full" /></td>
            <td className="py-3"><div className="h-3 w-20 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
            <td className="py-3"><div className="h-5 w-16 bg-gray-200 dark:bg-(--admin-hover) rounded-full" /></td>
            <td className="py-3"><div className="h-6 w-10 bg-gray-200 dark:bg-(--admin-hover) rounded-full" /></td>
        </tr>
    )
}

export default function AdminCurriculos() {
    const [curriculos, setCurriculos] = useState([])
    const [stats, setStats]           = useState({ total: 0, novos: 0, em_analise: 0, aprovados: 0 })
    const [loading, setLoading]       = useState(true)
    const [search, setSearch]         = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [showFilters, setShowFilters]   = useState(false)
    const [selected, setSelected]     = useState([])
    const [detalhe, setDetalhe]       = useState(null)
    const [loadingDetalhe, setLoadingDetalhe] = useState(false)
    const [loadingStatus, setLoadingStatus]   = useState(false)
    const [toast, setToast]           = useState(null)
    const [confirm, setConfirm]       = useState(null)
    const filterRef = useRef(null)

    useEffect(() => {
        const handler = e => {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false)
        }
        document.addEventListener('mousedown', handler)
        return () => document.removeEventListener('mousedown', handler)
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => fetchList(), search ? 400 : 0)
        return () => clearTimeout(timer)
    }, [search, filterStatus])

    async function fetchList() {
        setLoading(true)
        try {
            const params = {}
            if (search)       params.search = search
            if (filterStatus) params.status = filterStatus
            const res = await getCurriculos(params)
            setCurriculos(res.data.data  ?? [])
            setStats(res.data.stats ?? { total: 0, novos: 0, em_analise: 0, aprovados: 0 })
        } catch {
            setToast({ message: 'Erro ao buscar candidaturas.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    async function openDetalhe(id) {
        setDetalhe({ _loading: true })
        setLoadingDetalhe(true)
        try {
            const res = await getCurriculoById(id)
            setDetalhe(res.data.curriculo)
        } catch {
            setToast({ message: 'Erro ao carregar candidatura.', type: 'error' })
            setDetalhe(null)
        } finally {
            setLoadingDetalhe(false)
        }
    }

    async function handleUpdateStatus(id, status) {
        setLoadingStatus(true)
        try {
            await updateCurriculoStatus(id, status)
            setDetalhe(p => p ? { ...p, status } : null)
            setCurriculos(p => p.map(c => c.id === id ? { ...c, status } : c))
            setStats(await refetchStats())
            setToast({ message: 'Status atualizado.', type: 'success' })
        } catch (err) {
            const msg = err?.response?.data?.error ?? 'Erro ao atualizar status.'
            setToast({ message: msg, type: 'error' })
        } finally {
            setLoadingStatus(false)
        }
    }

    async function refetchStats() {
        try {
            const res = await getCurriculos({ status: filterStatus || undefined, search: search || undefined })
            setStats(res.data.stats ?? stats)
            return res.data.stats
        } catch { return stats }
    }

    function confirmDelete(ids) {
        setConfirm({
            title:        `Excluir ${ids.length > 1 ? `${ids.length} candidaturas` : 'candidatura'}?`,
            message:      'Essa ação não pode ser desfeita.',
            confirmLabel: 'Excluir',
            onConfirm:    () => handleDelete(ids),
        })
    }

    async function handleDelete(ids) {
        setConfirm(null)
        try {
            await Promise.all(ids.map(id => deleteCurriculo(id)))
            setCurriculos(p => p.filter(c => !ids.includes(c.id)))
            setSelected(p => p.filter(id => !ids.includes(id)))
            if (detalhe && ids.includes(detalhe.id)) setDetalhe(null)
            setToast({ message: `${ids.length > 1 ? `${ids.length} candidaturas excluídas` : 'Candidatura excluída'}.`, type: 'success' })
            await refetchStats()
        } catch {
            setToast({ message: 'Erro ao excluir candidatura.', type: 'error' })
        }
    }

    const allSelected = curriculos.length > 0 && curriculos.every(c => selected.includes(c.id))
    const toggleOne   = id => setSelected(p => p.includes(id) ? p.filter(s => s !== id) : [...p, id])
    const toggleAll   = () => allSelected
        ? setSelected(p => p.filter(id => !curriculos.map(c => c.id).includes(id)))
        : setSelected(p => [...new Set([...p, ...curriculos.map(c => c.id)])])

    const activeFilters = filterStatus ? 1 : 0

    const statsCards = [
        { label: 'Total',      valor: stats.total,      cor: 'text-gray-800 dark:text-(--admin-text)' },
        { label: 'Novos',      valor: stats.novos,      cor: 'text-blue-600'                          },
        { label: 'Em análise', valor: stats.em_analise, cor: 'text-yellow-600'                        },
        { label: 'Aprovados',  valor: stats.aprovados,  cor: 'text-green-600'                         },
    ]

    return (
        <main>
            <AdminHeader title="Currículos" description="Gerencie as candidaturas recebidas pelo site." />

            {/* Cards de resumo */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5">
                {loading
                    ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
                    : statsCards.map(({ label, valor, cor }) => (
                        <div key={label} className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                            <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                            <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
                        </div>
                    ))
                }
            </div>

            {/* Tabela */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">

                {/* Barra de ações */}
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted) shrink-0" />
                        <input
                            placeholder="Buscar por nome, e-mail ou cargo..."
                            className="outline-none dark:bg-(--admin-card) dark:text-(--admin-text) text-sm w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(p => !p)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all
                                ${activeFilters > 0
                                    ? 'border-verde-escuro text-verde-escuro bg-green-50 dark:bg-(--admin-accent-soft) dark:text-(--admin-accent) dark:border-(--admin-accent)'
                                    : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}
                        >
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFilters > 0 && (
                                <span className="bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                    {activeFilters}
                                </span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-11 left-0 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-xl shadow-lg dark:shadow-black/40 p-4 z-20 w-48 flex flex-col gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Status</label>
                                    {[
                                        { key: '',           label: 'Todos'      },
                                        { key: 'novo',       label: 'Novo'       },
                                        { key: 'em_analise', label: 'Em análise' },
                                        { key: 'aprovado',   label: 'Aprovado'   },
                                        { key: 'reprovado',  label: 'Reprovado'  },
                                    ].map(opt => (
                                        <button key={opt.key} onClick={() => { setFilterStatus(opt.key); setShowFilters(false) }}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all
                                                ${filterStatus === opt.key
                                                    ? 'bg-green-50 dark:bg-(--admin-accent-soft) text-verde-escuro dark:text-(--admin-accent) font-medium'
                                                    : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                {activeFilters > 0 && (
                                    <button onClick={() => setFilterStatus('')}
                                        className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button onClick={() => confirmDelete(selected)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all">
                            <Trash2 size={15} />
                            Excluir {selected.length}
                        </button>
                    )}

                    <span className="ml-auto text-sm text-gray-400 dark:text-(--admin-text-muted)">
                        {loading ? '...' : `${curriculos.length} candidatura(s)`}
                    </span>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full min-w-150 text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                <th className="pb-3 pr-3">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" disabled={loading} />
                                </th>
                                <th className="pb-3 font-medium">Candidato</th>
                                <th className="pb-3 font-medium">Cargo</th>
                                <th className="pb-3 font-medium">Área</th>
                                <th className="pb-3 font-medium">Data</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                                : curriculos.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={7} className="py-10 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                                Nenhuma candidatura encontrada.
                                            </td>
                                        </tr>
                                    )
                                    : curriculos.map(c => (
                                        <tr key={c.id}
                                            className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 transition-colors ${selected.includes(c.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                            <td className="py-3 pr-3">
                                                <input type="checkbox" checked={selected.includes(c.id)} onChange={() => toggleOne(c.id)} className="cursor-pointer" />
                                            </td>
                                            <td className="py-3">
                                                <p className="font-medium text-verde-escuro dark:text-(--admin-accent)">{c.nome}</p>
                                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{c.email}</p>
                                            </td>
                                            <td className="py-3 text-gray-600 dark:text-(--admin-text) max-w-48">
                                                <p className="truncate">{c.cargo ?? c.vaga_nome ?? '—'}</p>
                                            </td>
                                            <td className="py-3">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${corArea(c.area)}`}>
                                                    {c.area ?? '—'}
                                                </span>
                                            </td>
                                            <td className="py-3 text-gray-400 dark:text-(--admin-text-muted) text-xs">
                                                {fmtDate(c.created_at)}
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[c.status] ?? ''}`}>
                                                    {STATUS_LABEL[c.status] ?? c.status}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <button
                                                    onClick={() => openDetalhe(c.id)}
                                                    className="text-xs font-bold text-verde-escuro dark:text-(--admin-accent) border border-verde-escuro dark:border-(--admin-accent) px-3 py-1 rounded-full hover:bg-verde-escuro dark:hover:bg-(--admin-accent) hover:text-white dark:hover:text-black transition-all">
                                                    Ver
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal de detalhe */}
            {detalhe && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl w-full max-w-lg shadow-2xl dark:shadow-black/60 flex flex-col max-h-[90vh]">

                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-(--admin-border)">
                            <div>
                                <h2 className="font-bold text-lg text-verde-escuro dark:text-(--admin-accent)">
                                    {loadingDetalhe ? <span className="inline-block h-5 w-40 bg-gray-200 dark:bg-(--admin-hover) rounded animate-pulse" /> : detalhe.nome}
                                </h2>
                                <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">
                                    {loadingDetalhe ? <span className="inline-block h-3 w-28 bg-gray-100 dark:bg-(--admin-hover) rounded animate-pulse mt-1" /> : (detalhe.cargo ?? detalhe.vaga_nome ?? '—')}
                                </p>
                            </div>
                            <button onClick={() => setDetalhe(null)}
                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 transition-all">
                                <X size={18} />
                            </button>
                        </div>

                        {loadingDetalhe ? (
                            <div className="p-6 flex flex-col gap-4 animate-pulse">
                                <div className="grid grid-cols-2 gap-3">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="h-16 bg-gray-100 dark:bg-(--admin-hover) rounded-xl" />
                                    ))}
                                </div>
                                <div className="h-32 bg-gray-100 dark:bg-(--admin-hover) rounded-xl" />
                            </div>
                        ) : (
                            <>
                                <div className="overflow-y-auto p-6 flex flex-col gap-5">
                                    <div className="grid grid-cols-2 gap-3 text-sm">
                                        {[
                                            { icon: Mail,     label: 'E-mail',    valor: detalhe.email },
                                            { icon: Phone,    label: 'Telefone',  valor: detalhe.tel   },
                                            { icon: Link2,    label: 'LinkedIn',  valor: detalhe.portfolio_url || '—' },
                                            { icon: FileText, label: 'Enviado em',valor: fmtDate(detalhe.created_at) },
                                        ].map(({ icon: Icon, label, valor }) => (
                                            <div key={label} className="bg-gray-50 dark:bg-(--admin-input) rounded-xl p-3 flex items-start gap-2">
                                                <Icon size={14} className="text-gray-400 dark:text-(--admin-text-muted) mt-0.5 shrink-0" />
                                                <div className="min-w-0">
                                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                                                    <p className="font-medium text-gray-700 dark:text-(--admin-text) break-all text-xs">{valor}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${corArea(detalhe.area)}`}>{detalhe.area ?? '—'}</span>
                                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${statusStyle[detalhe.status] ?? ''}`}>{STATUS_LABEL[detalhe.status] ?? detalhe.status}</span>
                                    </div>

                                    {detalhe.carta_apresent && (
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Carta de apresentação</p>
                                            <p className="text-sm text-gray-600 dark:text-(--admin-text) leading-relaxed bg-gray-50 dark:bg-(--admin-input) rounded-xl p-4">
                                                {detalhe.carta_apresent}
                                            </p>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Atualizar status</p>
                                        <div className="flex gap-2 flex-wrap">
                                            {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                                <button key={key}
                                                    onClick={() => handleUpdateStatus(detalhe.id, key)}
                                                    disabled={loadingStatus || detalhe.status === key}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
                                                        ${detalhe.status === key
                                                            ? statusStyle[key]
                                                            : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                                    {label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-3 p-6 border-t border-gray-100 dark:border-(--admin-border)">
                                    {detalhe.curriculo_url ? (
                                        <a href={detalhe.curriculo_url} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 flex-1 justify-center border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                            <Download size={15} /> Baixar currículo
                                        </a>
                                    ) : (
                                        <span className="flex items-center gap-2 flex-1 justify-center border border-gray-100 dark:border-(--admin-border) text-gray-300 dark:text-(--admin-text-muted) py-2.5 rounded-xl text-sm font-medium opacity-50 cursor-not-allowed">
                                            <Download size={15} /> Sem currículo
                                        </span>
                                    )}
                                    <button
                                        onClick={() => confirmDelete([detalhe.id])}
                                        className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all">
                                        <Trash2 size={15} /> Excluir
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {confirm && (
                <ConfirmDialog
                    title={confirm.title}
                    message={confirm.message}
                    confirmLabel={confirm.confirmLabel}
                    onConfirm={confirm.onConfirm}
                    onCancel={() => setConfirm(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
