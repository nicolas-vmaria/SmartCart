import { useState, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import { imgUrl } from '../../lib/cloudinaryUrl'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'
import { Trash2, Search, Star, X, Plus, MessageSquare, TrendingUp, Calendar, Eye, EyeOff, Wand2, ChevronDown, ChevronUp } from 'lucide-react'
import { getAllReviews, deleteReview, bulkDeleteReviews, getPalavras, addPalavra, deletePalavra } from '../../lib/api/adminReviews'
import { analyzeReviews } from '../../lib/IaAssistant'
import { formatDate as fmt } from '../../lib/date'

function StatCard({ icon: Icon, label, value, loading }) {
    if (loading) return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border) animate-pulse">
            <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-1/2 mb-3" />
            <div className="h-8 bg-gray-200 dark:bg-(--admin-hover) rounded w-1/3" />
        </div>
    )
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-5 border border-gray-200 dark:border-(--admin-border)">
            <div className="flex items-center gap-2 text-gray-400 dark:text-(--admin-text-muted) text-sm mb-1">
                <Icon size={15} />
                {label}
            </div>
            <p className="text-2xl font-bold text-verde-escuro dark:text-(--admin-accent)">{value}</p>
        </div>
    )
}

function StarRow({ nota }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
                <Star key={n} size={13}
                    className={n <= nota ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 dark:text-gray-600'} />
            ))}
        </div>
    )
}

function TableSkeleton() {
    return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse border-b border-gray-100 dark:border-(--admin-border)">
            <td className="p-3"><div className="w-4 h-4 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
            <td className="p-3">
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-(--admin-hover) rounded-lg shrink-0" />
                    <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-28" />
                </div>
            </td>
            <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-20" /></td>
            <td className="p-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-16" /></td>
            <td className="p-3"><div className="h-4 bg-gray-100 dark:bg-(--admin-border) rounded w-40" /></td>
            <td className="p-3"><div className="h-4 bg-gray-100 dark:bg-(--admin-border) rounded w-16" /></td>
            <td className="p-3"><div className="w-7 h-7 bg-gray-100 dark:bg-(--admin-border) rounded-md" /></td>
        </tr>
    ))
}

export default function AdminReviews() {
    const [reviews, setReviews]         = useState([])
    const [stats, setStats]             = useState(null)
    const [loading, setLoading]         = useState(true)
    const [search, setSearch]           = useState('')
    const [filterNota, setFilterNota]   = useState(null)
    const [selected, setSelected]       = useState([])
    const [expanded, setExpanded]       = useState(null)
    const [confirmId, setConfirmId]     = useState(null)
    const [confirmBulk, setConfirmBulk] = useState(false)
    const [deleting, setDeleting]       = useState(false)
    const [toast, setToast]             = useState(null)

    const [analyzing, setAnalyzing]         = useState(false)
    const [analysisResult, setAnalysisResult] = useState(null)
    const [showAnalysis, setShowAnalysis]   = useState(false)

    const [palavras, setPalavras]           = useState([])
    const [novaPalavra, setNovaPalavra]     = useState('')
    const [addingPalavra, setAddingPalavra] = useState(false)
    const [deletingPalavra, setDeletingPalavra] = useState(null)
    const [revealedPalavras, setRevealedPalavras] = useState(false)
    const [loadingPalavras, setLoadingPalavras]   = useState(true)

    useEffect(() => {
        fetchReviews()
        getPalavras()
            .then(({ data }) => setPalavras(data.palavras ?? []))
            .catch(() => {})
            .finally(() => setLoadingPalavras(false))
    }, [])

    function fetchReviews(s = search, n = filterNota) {
        setLoading(true)
        const params = {}
        if (s)  params.search = s
        if (n)  params.nota   = n
        getAllReviews(params)
            .then(({ data }) => {
                setReviews(data.reviews ?? [])
                setStats(data.stats ?? null)
                setSelected([])
            })
            .catch(() => setToast({ message: 'Erro ao carregar reviews', type: 'error' }))
            .finally(() => setLoading(false))
    }

    function handleSearchChange(e) {
        setSearch(e.target.value)
        fetchReviews(e.target.value, filterNota)
    }

    function handleNotaFilter(nota) {
        const next = filterNota === nota ? null : nota
        setFilterNota(next)
        fetchReviews(search, next)
    }

    const allSelected = reviews.length > 0 && selected.length === reviews.length
    function toggleAll() {
        setSelected(allSelected ? [] : reviews.map(r => r.id))
    }
    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    async function handleDelete(id) {
        setDeleting(true)
        try {
            await deleteReview(id)
            setReviews(prev => prev.filter(r => r.id !== id))
            setSelected(prev => prev.filter(x => x !== id))
            setToast({ message: 'Review excluído', type: 'success' })
            if (stats) setStats(s => ({ ...s, total: s.total - 1 }))
        } catch {
            setToast({ message: 'Erro ao excluir review', type: 'error' })
        } finally {
            setDeleting(false)
            setConfirmId(null)
        }
    }

    async function handleBulkDelete() {
        setDeleting(true)
        try {
            await bulkDeleteReviews(selected)
            const count = selected.length
            setReviews(prev => prev.filter(r => !selected.includes(r.id)))
            setSelected([])
            setToast({ message: `${count} review(s) excluído(s)`, type: 'success' })
            if (stats) setStats(s => ({ ...s, total: s.total - count }))
        } catch {
            setToast({ message: 'Erro ao excluir reviews', type: 'error' })
        } finally {
            setDeleting(false)
            setConfirmBulk(false)
        }
    }

    async function handleAddPalavra(e) {
        e.preventDefault()
        const p = novaPalavra.trim()
        if (!p) return
        setAddingPalavra(true)
        try {
            const { data } = await addPalavra(p)
            setPalavras(prev => [...prev, data.palavra].sort((a, b) => a.palavra.localeCompare(b.palavra)))
            setNovaPalavra('')
            setToast({ message: 'Palavra adicionada', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao adicionar palavra', type: 'error' })
        } finally {
            setAddingPalavra(false)
        }
    }

    async function handleDeletePalavra(id) {
        setDeletingPalavra(id)
        try {
            await deletePalavra(id)
            setPalavras(prev => prev.filter(p => p.id !== id))
            setToast({ message: 'Palavra removida', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao remover palavra', type: 'error' })
        } finally {
            setDeletingPalavra(null)
        }
    }

    return (
        <main>
            <AdminHeader title="Reviews" description="Gerencie avaliações de produtos e palavras proibidas." />

            {/* Stats */}
            <section className="my-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <StatCard icon={MessageSquare} label="Total de reviews"   value={stats?.total ?? '—'}       loading={loading} />
                <StatCard icon={Star}          label="Média geral"         value={stats?.media_nota ? `★ ${stats.media_nota}` : '—'} loading={loading} />
                <StatCard icon={Calendar}      label="Reviews este mês"    value={stats?.reviews_mes ?? '—'} loading={loading} />
            </section>

            {/* Toolbar */}
            <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                <div className="p-4 flex flex-wrap items-center gap-3 border-b border-gray-100 dark:border-(--admin-border)">
                    <div className="flex items-center gap-2 flex-1 min-w-48 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 bg-gray-50 dark:bg-(--admin-input)">
                        <Search size={15} className="text-gray-400 shrink-0" />
                        <input
                            value={search}
                            onChange={handleSearchChange}
                            placeholder="Buscar por produto ou usuário..."
                            className="bg-transparent text-sm outline-none w-full dark:text-(--admin-text)"
                        />
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(n => (
                            <button key={n} onClick={() => handleNotaFilter(n)}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all border
                                    ${filterNota === n
                                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                        : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'
                                    }`}>
                                <Star size={11} className={filterNota === n ? 'fill-yellow-400 text-yellow-400' : ''} />
                                {n}
                            </button>
                        ))}
                    </div>
                    {selected.length > 0 && (
                        <button onClick={() => setConfirmBulk(true)}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all">
                            <Trash2 size={14} />
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}
                    <button
                        disabled={reviews.length === 0 || analyzing}
                        onClick={async () => {
                            if (analysisResult) { setShowAnalysis(v => !v); return }
                            setAnalyzing(true)
                            setShowAnalysis(true)
                            try {
                                const result = await analyzeReviews(reviews)
                                setAnalysisResult(result)
                            } catch {
                                setToast({ message: 'Erro ao analisar reviews com IA', type: 'error' })
                                setShowAnalysis(false)
                            } finally {
                                setAnalyzing(false)
                            }
                        }}
                        className="ml-auto flex items-center gap-2 px-3 py-2 rounded-lg border border-verde-escuro text-verde-escuro text-sm font-medium hover:bg-verde-escuro hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                        {analyzing
                            ? <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            : <Wand2 size={14} />
                        }
                        {analyzing ? 'Analisando...' : 'Analisar com IA'}
                        {analysisResult && !analyzing && (showAnalysis ? <ChevronUp size={13} /> : <ChevronDown size={13} />)}
                    </button>
                </div>

                {showAnalysis && (
                    <div className="border-b border-gray-100 dark:border-(--admin-border) p-4 bg-green-50 dark:bg-green-900/10">
                        {analyzing
                            ? <div className="flex items-center gap-3 animate-pulse">
                                <div className="w-4 h-4 bg-gray-300 rounded-full" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-full" />
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                    <div className="h-3 bg-gray-200 rounded w-4/5" />
                                </div>
                              </div>
                            : <div className="text-sm text-gray-700 dark:text-(--admin-text) whitespace-pre-line leading-relaxed">
                                <div className="flex items-center gap-2 mb-2 text-verde-escuro dark:text-(--admin-accent) font-medium text-xs uppercase tracking-wide">
                                    <Wand2 size={13} /> Análise com IA
                                </div>
                                {analysisResult}
                              </div>
                        }
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-(--admin-hover)">
                            <tr>
                                <th className="p-3 w-10">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll}
                                        className="rounded accent-verde-escuro cursor-pointer" />
                                </th>
                                <th className="p-3 text-left text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Produto</th>
                                <th className="p-3 text-left text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Usuário</th>
                                <th className="p-3 text-left text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Nota</th>
                                <th className="p-3 text-left text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Review</th>
                                <th className="p-3 text-left text-xs text-gray-500 dark:text-(--admin-text-muted) font-medium uppercase tracking-wide">Data</th>
                                <th className="p-3 w-10" />
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? <TableSkeleton /> : reviews.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center text-gray-400 dark:text-(--admin-text-muted)">
                                        Nenhum review encontrado.
                                    </td>
                                </tr>
                            ) : reviews.map(r => (
                                <tr key={r.id}
                                    className={`border-b border-gray-100 dark:border-(--admin-border) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-colors
                                        ${selected.includes(r.id) ? 'bg-green-50/50 dark:bg-green-900/10' : ''}`}>
                                    <td className="p-3">
                                        <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggleOne(r.id)}
                                            className="rounded accent-verde-escuro cursor-pointer" />
                                    </td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-(--admin-hover) shrink-0">
                                                {r.foto_url
                                                    ? <img src={imgUrl(r.foto_url, 100)} alt={r.produto_nome} loading="lazy" className="w-full h-full object-cover" />
                                                    : <div className="w-full h-full" />
                                                }
                                            </div>
                                            <span className="font-medium text-gray-800 dark:text-(--admin-text) line-clamp-1 max-w-36">{r.produto_nome}</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-gray-600 dark:text-(--admin-text-muted)">{r.user_nome}</td>
                                    <td className="p-3"><StarRow nota={r.nota} /></td>
                                    <td className="p-3 max-w-xs">
                                        <button onClick={() => setExpanded(expanded === r.id ? null : r.id)}
                                            className="text-left text-gray-600 dark:text-(--admin-text-muted) hover:text-gray-900 dark:hover:text-(--admin-text) transition-colors">
                                            <span className={expanded === r.id ? '' : 'line-clamp-1'}>{r.descricao}</span>
                                        </button>
                                    </td>
                                    <td className="p-3 text-gray-400 dark:text-(--admin-text-muted) whitespace-nowrap">{fmt(r.created_at)}</td>
                                    <td className="p-3">
                                        <button onClick={() => setConfirmId(r.id)}
                                            className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500">
                                            <Trash2 size={15} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Palavras Proibidas */}
            <section className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center justify-between mb-1">
                    <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-lg">Palavras Proibidas</h2>
                    <button onClick={() => setRevealedPalavras(v => !v)}
                        className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-700 dark:hover:text-(--admin-text) transition-colors">
                        {revealedPalavras ? <EyeOff size={14} /> : <Eye size={14} />}
                        {revealedPalavras ? 'Ocultar' : 'Revelar'}
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) mb-4">
                    Reviews contendo estas palavras serão bloqueados automaticamente.
                </p>

                <form onSubmit={handleAddPalavra} className="flex gap-2 mb-4">
                    <input
                        value={novaPalavra}
                        onChange={e => setNovaPalavra(e.target.value)}
                        placeholder="Digite uma palavra..."
                        className="flex-1 border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                    />
                    <button type="submit" disabled={addingPalavra || !novaPalavra.trim()}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
                        {addingPalavra
                            ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            : <Plus size={15} />
                        }
                        Adicionar
                    </button>
                </form>

                {loadingPalavras ? (
                    <div className="flex flex-wrap gap-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-7 rounded-full bg-gray-100 dark:bg-(--admin-hover) animate-pulse" style={{ width: `${60 + i * 15}px` }} />
                        ))}
                    </div>
                ) : palavras.length === 0 ? (
                    <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Nenhuma palavra cadastrada.</p>
                ) : (
                    <div className={`flex flex-wrap gap-2 transition-all duration-200 ${revealedPalavras ? '' : 'blur-sm select-none pointer-events-none'}`}>
                        {palavras.map(p => (
                            <span key={p.id}
                                className="flex items-center gap-1.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700/40 text-xs px-3 py-1.5 rounded-full font-medium">
                                {p.palavra}
                                <button onClick={() => handleDeletePalavra(p.id)} disabled={deletingPalavra === p.id}
                                    className="hover:opacity-70 transition-opacity disabled:opacity-40">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </section>

            {confirmId && (
                <ConfirmDialog
                    title="Excluir review"
                    message="Este review será removido permanentemente. Deseja continuar?"
                    confirmLabel="Excluir"
                    onConfirm={() => handleDelete(confirmId)}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            {confirmBulk && (
                <ConfirmDialog
                    title={`Excluir ${selected.length} review(s)`}
                    message="Os reviews selecionados serão removidos permanentemente. Deseja continuar?"
                    confirmLabel="Excluir todos"
                    onConfirm={handleBulkDelete}
                    onCancel={() => setConfirmBulk(false)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
