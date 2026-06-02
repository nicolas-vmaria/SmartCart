import { useState, useEffect } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Plus, Pencil, Trash2, Briefcase, MapPin, Clock, Wifi, Wand2 } from 'lucide-react'
import { getVagas, createVaga, updateVaga, toggleVaga, deleteVaga } from '../../lib/api/adminVagas'
import { generateJobDescription } from '../../lib/IaAssistant'
import { areaCor } from '../../lib/areaColors'
import Toast from '../../components/Toast'

const TIPOS_CONTRATO    = ['CLT', 'PJ', 'Estágio', 'Freelance', 'CLT + Bônus']
const FORMATOS_TRABALHO = ['Presencial', 'Remoto', 'Híbrido']

const inputCls = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all w-full"
const labelCls = "text-xs font-medium text-gray-500 dark:text-(--admin-text-muted)"

const emptyForm = { nome: '', cargo: '', area: '', tipo_contrato: 'CLT', formato_trabalho: 'Presencial', local: '', requisitos: '', ativa: true }


function VagaModal({ vaga, onClose, onSaved }) {
    const [form, setForm]       = useState(vaga ?? emptyForm)
    const [loading, setLoading] = useState(false)
    const [toast, setToast]     = useState(null)
    const [generatingJob, setGeneratingJob] = useState(false)

    const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

    async function submit(e) {
        e.preventDefault()
        setLoading(true)
        try {
            if (vaga) {
                await updateVaga(vaga.id, form)
            } else {
                await createVaga(form)
            }
            onSaved()
        } catch {
            setToast({ message: 'Erro ao salvar vaga', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <div className="bg-white dark:bg-(--admin-card) rounded-2xl w-full max-w-lg shadow-2xl dark:shadow-black/60 flex flex-col max-h-[90vh]">

                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-(--admin-border)">
                    <h2 className="font-bold text-lg text-verde-escuro dark:text-(--admin-accent)">
                        {vaga ? 'Editar Vaga' : 'Nova Vaga'}
                    </h2>
                    <button onClick={onClose} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 transition-all text-xl leading-none">&times;</button>
                </div>

                <form onSubmit={submit} className="overflow-y-auto p-6 flex flex-col gap-4 scrollbar-hide">
                    <div className="flex flex-col gap-1">
                        <label className={labelCls}>Título da vaga *</label>
                        <input className={inputCls} placeholder="Ex: Desenvolvedor Full Stack Sênior" value={form.nome} onChange={e => set('nome', e.target.value)} required />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className={labelCls}>Cargo *</label>
                            <input className={inputCls} placeholder="Ex: Desenvolvedor(a) Full Stack" value={form.cargo} onChange={e => set('cargo', e.target.value)} required />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelCls}>Área *</label>
                            <select className={inputCls} value={form.area} onChange={e => set('area', e.target.value)} required>
                                <option value="">Selecione...</option>
                                {Object.keys(areaCor).map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className={labelCls}>Tipo de contrato *</label>
                            <select className={inputCls} value={form.tipo_contrato} onChange={e => set('tipo_contrato', e.target.value)}>
                                {TIPOS_CONTRATO.map(t => <option key={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className={labelCls}>Formato *</label>
                            <select className={inputCls} value={form.formato_trabalho} onChange={e => set('formato_trabalho', e.target.value)}>
                                {FORMATOS_TRABALHO.map(f => <option key={f}>{f}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className={labelCls}>Local *</label>
                        <input className={inputCls} placeholder="Ex: São Paulo — SP" value={form.local} onChange={e => set('local', e.target.value)} required />
                    </div>

                    <div className="flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                            <label className={labelCls}>Requisitos</label>
                            <button
                                type="button"
                                disabled={!form.cargo || !form.area || generatingJob}
                                onClick={async () => {
                                    setGeneratingJob(true)
                                    try {
                                        const text = await generateJobDescription(form.cargo, form.area, form.tipo_contrato, form.formato_trabalho)
                                        set('requisitos', text)
                                    } catch {
                                        setToast({ message: 'Erro ao gerar requisitos com IA', type: 'error' })
                                    } finally {
                                        setGeneratingJob(false)
                                    }
                                }}
                                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-verde-escuro text-verde-escuro hover:bg-verde-escuro hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {generatingJob
                                    ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                    : <Wand2 size={11} />
                                }
                                {generatingJob ? 'Gerando...' : 'Gerar com IA'}
                            </button>
                        </div>
                        <textarea
                            className={`${inputCls} resize-none`}
                            rows={4}
                            placeholder="Liste os requisitos da vaga..."
                            value={form.requisitos}
                            onChange={e => set('requisitos', e.target.value)}
                        />
                    </div>

                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input type="checkbox" checked={form.ativa} onChange={e => set('ativa', e.target.checked)} className="w-4 h-4 accent-verde-escuro" />
                        <span className="text-sm text-gray-600 dark:text-(--admin-text)">Publicar vaga imediatamente</span>
                    </label>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) text-sm font-medium hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                            Cancelar
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                            {loading && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                            {vaga ? 'Salvar alterações' : 'Criar vaga'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

function SkeletonRow() {
    return (
        <tr className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
            <td className="py-4 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-36" /></td>
            <td className="py-4 pr-4"><div className="h-5 bg-gray-200 dark:bg-(--admin-border) rounded-full w-20" /></td>
            <td className="py-4 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-16" /></td>
            <td className="py-4 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-20" /></td>
            <td className="py-4 pr-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-28" /></td>
            <td className="py-4 pr-4"><div className="h-6 bg-gray-200 dark:bg-(--admin-border) rounded-full w-16" /></td>
            <td className="py-4"><div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-16" /></td>
        </tr>
    )
}

export default function AdminVagas() {
    const [vagas, setVagas]         = useState([])
    const [loading, setLoading]     = useState(true)
    const [modal, setModal]         = useState(null)   // null | 'new' | vaga object
    const [confirmId, setConfirmId] = useState(null)
    const [toggling, setToggling]   = useState(null)
    const [toast, setToast]         = useState(null)

    function showToast(message, type = 'success') {
        setToast({ message, type })
    }

    async function load() {
        setLoading(true)
        try {
            const { data } = await getVagas()
            setVagas(data.vagas ?? [])
        } catch {
            showToast('Erro ao carregar vagas', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    async function handleToggle(id) {
        setToggling(id)
        try {
            await toggleVaga(id)
            setVagas(p => p.map(v => v.id === id ? { ...v, ativa: !v.ativa } : v))
        } catch {
            showToast('Erro ao alterar status', 'error')
        } finally {
            setToggling(null)
        }
    }

    async function handleDelete() {
        try {
            await deleteVaga(confirmId)
            setVagas(p => p.filter(v => v.id !== confirmId))
            showToast('Vaga removida com sucesso')
        } catch {
            showToast('Erro ao remover vaga', 'error')
        } finally {
            setConfirmId(null)
        }
    }

    function handleSaved() {
        setModal(null)
        showToast(modal === 'new' ? 'Vaga criada com sucesso' : 'Vaga atualizada com sucesso')
        load()
    }

    const ativas   = vagas.filter(v => v.ativa == 1 || v.ativa === true).length
    const inativas = vagas.length - ativas

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <AdminHeader title="Vagas" description="Gerencie as vagas abertas publicadas no site." />

            {/* Cards de resumo */}
            <div className="grid grid-cols-3 gap-4 mt-5">
                {[
                    { label: 'Total',    valor: vagas.length, cor: 'text-gray-800 dark:text-(--admin-text)' },
                    { label: 'Ativas',   valor: ativas,       cor: 'text-green-600 dark:text-green-400'     },
                    { label: 'Inativas', valor: inativas,     cor: 'text-gray-400 dark:text-(--admin-text-muted)' },
                ].map(({ label, valor, cor }) => (
                    <div key={label} className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                        <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                        {loading
                            ? <div className="h-8 w-12 mt-1 bg-gray-200 dark:bg-(--admin-border) rounded animate-pulse" />
                            : <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
                        }
                    </div>
                ))}
            </div>

            {/* Tabela */}
            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center justify-between mb-5">
                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{vagas.length} vaga(s)</span>
                    <button
                        onClick={() => setModal('new')}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all"
                    >
                        <Plus size={15} /> Nova vaga
                    </button>
                </div>

                <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full min-w-[700px] text-sm">
                        <thead>
                            <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                                <th className="pb-3 font-medium">Cargo</th>
                                <th className="pb-3 font-medium">Área</th>
                                <th className="pb-3 font-medium">Contrato</th>
                                <th className="pb-3 font-medium">Formato</th>
                                <th className="pb-3 font-medium">Local</th>
                                <th className="pb-3 font-medium">Status</th>
                                <th className="pb-3 font-medium">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                : vagas.map(v => {
                                    const ativa = v.ativa == 1 || v.ativa === true
                                    return (
                                        <tr key={v.id} className="border-b border-gray-50 dark:border-(--admin-border) last:border-0">
                                            <td className="py-3 pr-4">
                                                <p className="font-medium text-verde-escuro dark:text-(--admin-accent) truncate max-w-44">{v.cargo}</p>
                                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) truncate max-w-44">{v.nome}</p>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${areaCor[v.area] ?? 'bg-gray-100 text-gray-600'}`}>{v.area}</span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="flex items-center gap-1 text-gray-500 dark:text-(--admin-text-muted)">
                                                    <Clock size={13} />{v.tipo_contrato}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="flex items-center gap-1 text-gray-500 dark:text-(--admin-text-muted)">
                                                    <Wifi size={13} />{v.formato_trabalho}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <span className="flex items-center gap-1 text-gray-500 dark:text-(--admin-text-muted) text-xs">
                                                    <MapPin size={13} className="shrink-0" />{v.local}
                                                </span>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <button
                                                    onClick={() => handleToggle(v.id)}
                                                    disabled={toggling === v.id}
                                                    className="flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    <span className={`relative w-9 h-5 rounded-full transition-colors duration-300 shrink-0 ${ativa ? 'bg-verde-escuro dark:bg-(--admin-accent)' : 'bg-gray-300 dark:bg-(--admin-border)'}`}>
                                                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${ativa ? 'translate-x-4' : 'translate-x-0'}`} />
                                                    </span>
                                                    <span className={`text-xs font-medium ${ativa ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-(--admin-text-muted)'}`}>
                                                        {ativa ? 'Ativa' : 'Inativa'}
                                                    </span>
                                                </button>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => setModal(v)}
                                                        className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 dark:text-(--admin-text-muted) transition-all"
                                                    >
                                                        <Pencil size={15} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmId(v.id)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-all"
                                                    >
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                            {!loading && vagas.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-16 text-center">
                                        <Briefcase size={32} className="mx-auto text-gray-200 dark:text-(--admin-border) mb-3" />
                                        <p className="text-gray-400 dark:text-(--admin-text-muted)">Nenhuma vaga cadastrada.</p>
                                        <button onClick={() => setModal('new')} className="mt-3 text-sm text-verde-escuro dark:text-(--admin-accent) font-medium hover:underline">
                                            Criar primeira vaga
                                        </button>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <VagaModal
                    vaga={modal === 'new' ? null : modal}
                    onClose={() => setModal(null)}
                    onSaved={handleSaved}
                />
            )}

            {confirmId && (
                <ConfirmDialog
                    title="Remover vaga?"
                    message="Todos os candidatos vinculados a esta vaga também serão removidos. Esta ação não pode ser desfeita."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}
        </main>
    )
}
