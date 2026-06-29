import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import Toast from '../../components/Toast'
import { getAdminReports, updateAdminReport } from '../../lib/api/adminReports'
import { formatDateTime } from '../../lib/date'
import { AlertTriangle, CheckCircle, Clock, RefreshCw, Search, Wrench } from 'lucide-react'

const statusLabel = {
    novo: 'Novo',
    enviado: 'Aberto',
    erro: 'Erro no envio',
    em_atendimento: 'Em atendimento',
    resolvido: 'Resolvido',
    fechado: 'Fechado',
}

const statusStyle = {
    novo: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    enviado: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
    erro: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
    em_atendimento: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
    resolvido: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
    fechado: 'bg-gray-100 text-gray-700 dark:bg-gray-500/20 dark:text-gray-300',
}

const priorityStyle = {
    Baixa: 'bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-300',
    Media: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
    Alta: 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300',
    Critica: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
}

const statuses = [
    { value: '', label: 'Todos' },
    { value: 'enviado', label: 'Abertos' },
    { value: 'em_atendimento', label: 'Em atendimento' },
    { value: 'resolvido', label: 'Resolvidos' },
    { value: 'fechado', label: 'Fechados' },
    { value: 'erro', label: 'Erro no envio' },
]

function StatCard({ icon, label, value, tone }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
            <div className="flex items-center gap-2 text-gray-400 dark:text-(--admin-text-muted) text-sm">
                {icon}
                {label}
            </div>
            <p className={`text-3xl font-bold mt-2 ${tone}`}>{value}</p>
        </div>
    )
}

function Badge({ children, className }) {
    return <span className={`text-xs font-bold px-2 py-1 rounded-full whitespace-nowrap ${className}`}>{children}</span>
}

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-(--admin-text-muted)">{label}</span>
            {children}
        </label>
    )
}

function EmptyState() {
    return (
        <div className="py-16 text-center text-gray-400 dark:text-(--admin-text-muted)">
            <Wrench size={32} className="mx-auto mb-3 opacity-60" />
            Nenhum chamado encontrado.
        </div>
    )
}

export default function AdminReportTickets() {
    const [reports, setReports] = useState([])
    const [stats, setStats] = useState({ total: 0, abertos: 0, em_atendimento: 0, resolvidos: 0, criticos: 0 })
    const [selectedId, setSelectedId] = useState(null)
    const [search, setSearch] = useState('')
    const [status, setStatus] = useState('')
    const [priority, setPriority] = useState('')
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [toast, setToast] = useState(null)
    const [form, setForm] = useState({ status: 'em_atendimento', resolucao: '' })

    const selected = useMemo(
        () => reports.find(report => report.id === selectedId) ?? reports[0] ?? null,
        [reports, selectedId]
    )
    const selectedReportId = selected?.id ?? null
    const selectedRef = useRef(null)
    selectedRef.current = selected

    const fetchReports = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (search) params.search = search
            if (status) params.status = status
            if (priority) params.prioridade = priority

            const { data } = await getAdminReports(params)
            setReports(data.reports ?? [])
            setStats(data.stats ?? { total: 0, abertos: 0, em_atendimento: 0, resolvidos: 0, criticos: 0 })
        } catch {
            setToast({ message: 'Erro ao carregar chamados.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }, [priority, search, status])

    useEffect(() => {
        const timer = setTimeout(fetchReports, search ? 350 : 0)
        return () => clearTimeout(timer)
    }, [fetchReports, search])

    useEffect(() => {
        const current = selectedRef.current
        if (!current) return
        setSelectedId(current.id)
        setForm({
            status: current.status === 'novo' ? 'em_atendimento' : current.status,
            resolucao: current.resolucao ?? '',
        })
    }, [selectedReportId])

    async function handleSubmit(e) {
        e.preventDefault()
        if (!selected) return

        setSaving(true)
        try {
            const { data } = await updateAdminReport(selected.id, form)
            setReports(prev => prev.map(report => report.id === selected.id ? data.report : report))
            setToast({ message: 'Chamado atualizado.', type: 'success' })
            fetchReports()
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao atualizar chamado.', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            <AdminHeader title="Chamados tecnicos" description="Receba, acompanhe e resolva reports enviados pelos funcionarios." />

            <section className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-5">
                <StatCard icon={<Wrench size={15} />} label="Total" value={stats.total} tone="text-gray-800 dark:text-(--admin-text)" />
                <StatCard icon={<AlertTriangle size={15} />} label="Abertos" value={stats.abertos} tone="text-amber-600" />
                <StatCard icon={<Clock size={15} />} label="Em atendimento" value={stats.em_atendimento} tone="text-purple-600" />
                <StatCard icon={<CheckCircle size={15} />} label="Resolvidos" value={stats.resolvidos} tone="text-green-600" />
                <StatCard icon={<AlertTriangle size={15} />} label="Criticos" value={stats.criticos} tone="text-red-600" />
            </section>

            <section className="mt-5 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 flex-1 min-w-56 bg-gray-50 dark:bg-(--admin-input)">
                        <Search size={16} className="text-gray-400 shrink-0" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Buscar por titulo, descricao, funcionario..."
                            className="bg-transparent outline-none text-sm w-full dark:text-(--admin-text)"
                        />
                    </div>

                    <select value={status} onChange={e => setStatus(e.target.value)}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none">
                        {statuses.map(item => <option key={item.value} value={item.value}>{item.label}</option>)}
                    </select>

                    <select value={priority} onChange={e => setPriority(e.target.value)}
                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none">
                        <option value="">Todas prioridades</option>
                        {['Critica', 'Alta', 'Media', 'Baixa'].map(item => <option key={item} value={item}>{item}</option>)}
                    </select>

                    <button onClick={fetchReports} disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm font-medium text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all disabled:opacity-50">
                        <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        Atualizar
                    </button>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_420px] gap-5 mt-5">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-180 text-sm">
                            <thead>
                                <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                    <th className="pb-3 font-medium">Chamado</th>
                                    <th className="pb-3 font-medium">Central</th>
                                    <th className="pb-3 font-medium">Prioridade</th>
                                    <th className="pb-3 font-medium">Status</th>
                                    <th className="pb-3 font-medium">Aberto por</th>
                                    <th className="pb-3 font-medium">Data</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <tr key={i} className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
                                            <td className="py-4"><div className="h-4 w-48 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
                                            <td className="py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
                                            <td className="py-4"><div className="h-6 w-16 bg-gray-200 dark:bg-(--admin-hover) rounded-full" /></td>
                                            <td className="py-4"><div className="h-6 w-24 bg-gray-200 dark:bg-(--admin-hover) rounded-full" /></td>
                                            <td className="py-4"><div className="h-4 w-28 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
                                            <td className="py-4"><div className="h-4 w-24 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
                                        </tr>
                                    ))
                                ) : reports.length === 0 ? (
                                    <tr><td colSpan={6}><EmptyState /></td></tr>
                                ) : reports.map(report => (
                                    <tr key={report.id}
                                        onClick={() => setSelectedId(report.id)}
                                        className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-(--admin-hover) ${selected?.id === report.id ? 'bg-green-50/70 dark:bg-green-900/10' : ''}`}>
                                        <td className="py-3 pr-4">
                                            <p className="font-bold text-gray-800 dark:text-(--admin-text)">#{report.id} {report.titulo}</p>
                                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) line-clamp-1">{report.categoria}</p>
                                        </td>
                                        <td className="py-3 pr-4 text-gray-600 dark:text-(--admin-text-muted)">{report.problema_central}</td>
                                        <td className="py-3 pr-4"><Badge className={priorityStyle[report.prioridade] ?? priorityStyle.Media}>{report.prioridade}</Badge></td>
                                        <td className="py-3 pr-4"><Badge className={statusStyle[report.status] ?? statusStyle.novo}>{statusLabel[report.status] ?? report.status}</Badge></td>
                                        <td className="py-3 pr-4 text-gray-600 dark:text-(--admin-text-muted)">{report.admin_nome}</td>
                                        <td className="py-3 text-xs text-gray-400 dark:text-(--admin-text-muted) whitespace-nowrap">{formatDateTime(report.created_at)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <aside className="border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5 h-fit bg-gray-50 dark:bg-(--admin-hover)">
                        {selected ? (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted)">Chamado #{selected.id}</p>
                                        <h2 className="text-lg font-bold text-verde-escuro dark:text-(--admin-accent) break-words">{selected.titulo}</h2>
                                    </div>
                                    <Badge className={priorityStyle[selected.prioridade] ?? priorityStyle.Media}>{selected.prioridade}</Badge>
                                </div>

                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Funcionario</p>
                                        <p className="font-medium text-gray-700 dark:text-(--admin-text) break-words">{selected.admin_nome}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Central</p>
                                        <p className="font-medium text-gray-700 dark:text-(--admin-text)">{selected.problema_central}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Contexto</p>
                                        <p className="font-medium text-gray-700 dark:text-(--admin-text) break-words">{selected.contexto_afetado || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Tecnico</p>
                                        <p className="font-medium text-gray-700 dark:text-(--admin-text)">{selected.tecnico_nome || '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-(--admin-text-muted) mb-2">Descricao</p>
                                    <p className="text-sm text-gray-700 dark:text-(--admin-text) whitespace-pre-line leading-relaxed">{selected.descricao}</p>
                                </div>

                                {selected.passos && (
                                    <div>
                                        <p className="text-xs font-bold uppercase tracking-wide text-gray-400 dark:text-(--admin-text-muted) mb-2">Passos</p>
                                        <p className="text-sm text-gray-700 dark:text-(--admin-text) whitespace-pre-line leading-relaxed">{selected.passos}</p>
                                    </div>
                                )}

                                {selected.erro_envio && (
                                    <div className="rounded-xl border border-red-200 dark:border-red-700/50 bg-red-50 dark:bg-red-900/20 p-3 text-sm text-red-700 dark:text-red-300">
                                        {selected.erro_envio}
                                    </div>
                                )}

                                <Field label="Status do atendimento">
                                    <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-3 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent)">
                                        {['em_atendimento', 'resolvido', 'fechado', 'enviado', 'erro'].map(item => (
                                            <option key={item} value={item}>{statusLabel[item]}</option>
                                        ))}
                                    </select>
                                </Field>

                                <Field label="Resolucao ou observacao tecnica">
                                    <textarea
                                        rows={5}
                                        value={form.resolucao}
                                        onChange={e => setForm(prev => ({ ...prev, resolucao: e.target.value }))}
                                        placeholder="Descreva o que foi feito, causa encontrada ou proximo passo."
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-3 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) resize-none"
                                    />
                                </Field>

                                <button type="submit" disabled={saving}
                                    className="flex items-center justify-center gap-2 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black px-4 py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50">
                                    {saving ? <span className="w-4 h-4 border-2 border-white dark:border-black border-t-transparent dark:border-t-transparent rounded-full animate-spin" /> : <CheckCircle size={16} />}
                                    Salvar atendimento
                                </button>
                            </form>
                        ) : <EmptyState />}
                    </aside>
                </div>
            </section>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
