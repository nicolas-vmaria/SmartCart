import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import AdminHeader from '../../components/admin/AdminHeader'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { getCurriculos, deleteCurriculo } from '../../lib/api/adminCurriculos'
import { areaCor } from '../../lib/areaColors'
import { formatDate as fmtDate } from '../../lib/date'

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
            setToast({ message: `${ids.length > 1 ? `${ids.length} candidaturas excluídas` : 'Candidatura excluída'}.`, type: 'success' })
            fetchList()
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
                                                <Link
                                                    to={`/admin/curriculos/${c.id}`}
                                                    className="text-xs font-bold text-verde-escuro dark:text-(--admin-accent) border border-verde-escuro dark:border-(--admin-accent) px-3 py-1 rounded-full hover:bg-verde-escuro dark:hover:bg-(--admin-accent) hover:text-white dark:hover:text-black transition-all">
                                                    Ver
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

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
