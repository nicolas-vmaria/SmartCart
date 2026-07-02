import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Link2, FileText, Download, Trash2, Wand2, RefreshCw, CheckCircle, AlertTriangle, ExternalLink } from 'lucide-react'
import { getCurriculoById, updateCurriculoStatus, deleteCurriculo } from '../../lib/api/adminCurriculos'
import { analyzeCurriculo } from '../../lib/IaAssistant'
import { areaCor } from '../../lib/areaColors'
import { formatDateLong as fmtDate } from '../../lib/date'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'

const STATUS_LABEL = {
    novo:       'Novo',
    em_analise: 'Em análise',
    aprovado:   'Aprovado',
    reprovado:  'Reprovado',
}

const statusStyle = {
    novo:       'bg-blue-100 text-blue-700',
    em_analise: 'bg-yellow-100 text-yellow-700',
    aprovado:   'bg-green-100 text-green-700',
    reprovado:  'bg-red-100 text-red-700',
}

const recomendacaoStyle = {
    positivo: 'bg-green-100 text-green-700 border-green-200',
    neutro:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    negativo: 'bg-red-100 text-red-700 border-red-200',
}


function AnalyseSkeleton() {
    return (
        <div className="flex flex-col gap-5 animate-pulse">
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-24 mb-3" />
                <div className="h-3 bg-gray-200 rounded w-full" />
                <div className="h-3 bg-gray-200 rounded w-4/5" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-32 mb-3" />
                <div className="flex flex-wrap gap-2">
                    {[80, 100, 65, 90, 75].map((w, i) => (
                        <div key={i} className="h-6 bg-gray-200 rounded-full" style={{ width: `${w}px` }} />
                    ))}
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-28 mb-3" />
                {[1, 2, 3].map(i => <div key={i} className="h-3 bg-gray-200 rounded w-full" />)}
            </div>
        </div>
    )
}

export default function AdminCurriculoDetalhe() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [curriculo, setCurriculo] = useState(null)
    const [loading, setLoading]     = useState(true)
    const [analysis, setAnalysis]   = useState(null)
    const [analysisLoading, setAnalysisLoading] = useState(false)
    const [updatingStatus, setUpdatingStatus]   = useState(false)
    const [confirm, setConfirm]     = useState(false)
    const [toast, setToast]         = useState(null)
    const [cartaExpanded, setCartaExpanded] = useState(false)

    useEffect(() => {
        getCurriculoById(id)
            .then(res => {
                const c = res.data.curriculo
                setCurriculo(c)
                if (c?.carta_apresent) runAnalysis(c)
            })
            .catch(() => setToast({ message: 'Erro ao carregar candidatura.', type: 'error' }))
            .finally(() => setLoading(false))
    }, [id])

    async function runAnalysis(c) {
        setAnalysisLoading(true)
        setAnalysis(null)
        try {
            const result = await analyzeCurriculo(c ?? curriculo)
            setAnalysis(result)
        } catch {
            setAnalysis(null)
        } finally {
            setAnalysisLoading(false)
        }
    }

    async function handleStatus(status) {
        setUpdatingStatus(true)
        try {
            await updateCurriculoStatus(id, status)
            setCurriculo(p => ({ ...p, status }))
            window.dispatchEvent(new CustomEvent('curriculos:updated'))
            setToast({ message: 'Status atualizado.', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao atualizar status.', type: 'error' })
        } finally {
            setUpdatingStatus(false)
        }
    }

    async function handleDelete() {
        setConfirm(false)
        try {
            await deleteCurriculo(id)
            navigate('/admin/curriculos')
        } catch {
            setToast({ message: 'Erro ao excluir candidatura.', type: 'error' })
        }
    }

    if (loading) {
        return (
            <main className="p-6">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-8" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-4 animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-48" />
                        <div className="grid grid-cols-2 gap-3">
                            {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
                        </div>
                        <div className="h-32 bg-gray-100 rounded-xl" />
                    </div>
                    <div className="h-64 bg-gray-100 rounded-2xl animate-pulse" />
                </div>
            </main>
        )
    }

    if (!curriculo) return null

    const cartaLonga = curriculo.carta_apresent?.length > 400

    return (
        <main className="p-6">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <button
                    onClick={() => navigate('/admin/curriculos')}
                    className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent) transition-colors"
                >
                    <ArrowLeft size={16} /> Candidaturas
                </button>
                <span className="text-gray-300 dark:text-(--admin-border)">/</span>
                <span className="text-sm text-gray-700 dark:text-(--admin-text) font-medium truncate">{curriculo.nome}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Coluna esquerda — dados do candidato */}
                <div className="flex flex-col gap-5">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                            <h1 className="text-2xl font-bold text-verde-escuro dark:text-(--admin-accent)">{curriculo.nome}</h1>
                            <p className="text-gray-500 dark:text-(--admin-text-muted) text-sm mt-0.5">
                                {curriculo.cargo ?? curriculo.vaga_nome ?? 'Candidatura espontânea'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {curriculo.area && (
                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${areaCor[curriculo.area] ?? 'bg-gray-100 text-gray-600'}`}>
                                    {curriculo.area}
                                </span>
                            )}
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusStyle[curriculo.status] ?? ''}`}>
                                {STATUS_LABEL[curriculo.status] ?? curriculo.status}
                            </span>
                        </div>
                    </div>

                    {/* Contato */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        {[
                            { icon: Mail,     label: 'E-mail',     valor: curriculo.email },
                            { icon: Phone,    label: 'Telefone',   valor: curriculo.tel || '—' },
                            { icon: Link2,    label: 'LinkedIn',   valor: curriculo.portfolio_url || '—', href: curriculo.portfolio_url },
                            { icon: FileText, label: 'Enviado em', valor: fmtDate(curriculo.created_at) },
                        ].map(({ icon: Icon, label, valor, href }) => (
                            <div key={label} className="bg-gray-50 dark:bg-(--admin-input) rounded-xl p-3 flex items-start gap-2">
                                <Icon size={14} className="text-gray-400 dark:text-(--admin-text-muted) mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                                    {href
                                        ? <a href={href} target="_blank" rel="noopener noreferrer" className="font-medium text-verde-escuro dark:text-(--admin-accent) break-all text-xs flex items-center gap-1 hover:underline">
                                            {valor} <ExternalLink size={10} />
                                          </a>
                                        : <p className="font-medium text-gray-700 dark:text-(--admin-text) break-all text-xs">{valor}</p>
                                    }
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Carta de apresentação */}
                    {curriculo.carta_apresent && (
                        <div className="bg-gray-50 dark:bg-(--admin-input) rounded-xl p-4">
                            <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Carta de apresentação</p>
                            <p className="text-sm text-gray-600 dark:text-(--admin-text) leading-relaxed">
                                {cartaLonga && !cartaExpanded
                                    ? `${curriculo.carta_apresent.slice(0, 400)}...`
                                    : curriculo.carta_apresent
                                }
                            </p>
                            {cartaLonga && (
                                <button onClick={() => setCartaExpanded(v => !v)}
                                    className="text-xs text-verde-escuro dark:text-(--admin-accent) mt-2 hover:underline">
                                    {cartaExpanded ? 'Ver menos' : 'Ver completo'}
                                </button>
                            )}
                        </div>
                    )}

                    {/* Atualizar status */}
                    <div>
                        <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Atualizar status</p>
                        <div className="flex gap-2 flex-wrap">
                            {Object.entries(STATUS_LABEL).map(([key, label]) => (
                                <button key={key}
                                    onClick={() => handleStatus(key)}
                                    disabled={updatingStatus || curriculo.status === key}
                                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all disabled:opacity-50 disabled:cursor-not-allowed
                                        ${curriculo.status === key
                                            ? statusStyle[key]
                                            : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Ações */}
                    <div className="flex gap-3">
                        {curriculo.curriculo_url ? (
                            <a href={curriculo.curriculo_url} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 flex-1 justify-center border border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                <Download size={15} /> Baixar currículo
                            </a>
                        ) : (
                            <span className="flex items-center gap-2 flex-1 justify-center border border-gray-100 dark:border-(--admin-border) text-gray-300 py-2.5 rounded-xl text-sm opacity-50 cursor-not-allowed">
                                <Download size={15} /> Sem currículo
                            </span>
                        )}
                        <button onClick={() => setConfirm(true)}
                            className="flex items-center gap-2 justify-center px-4 py-2.5 rounded-xl bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all">
                            <Trash2 size={15} /> Excluir
                        </button>
                    </div>
                </div>

                {/* Coluna direita — análise IA */}
                <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-2 text-verde-escuro dark:text-(--admin-accent) font-medium text-sm">
                            <Wand2 size={15} /> Análise IA
                        </div>
                        {curriculo.carta_apresent && (
                            <button onClick={() => runAnalysis(curriculo)}
                                disabled={analysisLoading}
                                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 hover:text-verde-escuro transition-all disabled:opacity-40"
                                title="Regenerar análise">
                                <RefreshCw size={14} className={analysisLoading ? 'animate-spin' : ''} />
                            </button>
                        )}
                    </div>

                    {!curriculo.carta_apresent ? (
                        <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                            <FileText size={32} className="text-gray-300" />
                            <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Sem carta de apresentação</p>
                            <p className="text-xs text-gray-300 dark:text-(--admin-text-muted)">A análise IA requer a carta de apresentação do candidato.</p>
                        </div>
                    ) : analysisLoading ? (
                        <AnalyseSkeleton />
                    ) : !analysis ? (
                        <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">Não foi possível gerar a análise.</p>
                    ) : (
                        <div className="flex flex-col gap-5">

                            {/* Resumo */}
                            <div>
                                <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Resumo do perfil</p>
                                <p className="text-sm text-gray-600 dark:text-(--admin-text) leading-relaxed">{analysis.resumo}</p>
                            </div>

                            {/* Habilidades */}
                            {analysis.habilidades?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Habilidades identificadas</p>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.habilidades.map(h => (
                                            <span key={h} className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 px-2.5 py-1 rounded-full font-medium">
                                                {h}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Pontos fortes */}
                            {analysis.pontosFortes?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Pontos fortes</p>
                                    <ul className="flex flex-col gap-1.5">
                                        {analysis.pontosFortes.map(p => (
                                            <li key={p} className="flex items-start gap-2 text-sm text-gray-600 dark:text-(--admin-text)">
                                                <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Pontos de atenção */}
                            {analysis.pontosAtencao?.length > 0 && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Pontos de atenção</p>
                                    <ul className="flex flex-col gap-1.5">
                                        {analysis.pontosAtencao.map(p => (
                                            <li key={p} className="flex items-start gap-2 text-sm text-gray-600 dark:text-(--admin-text)">
                                                <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                                {p}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Fit com a vaga */}
                            {analysis.fitVaga && (
                                <div>
                                    <p className="text-xs font-bold text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wider mb-2">Fit com a vaga</p>
                                    <p className="text-sm text-gray-600 dark:text-(--admin-text) leading-relaxed">{analysis.fitVaga}</p>
                                </div>
                            )}

                            {/* Recomendação */}
                            {analysis.recomendacao && (
                                <div className={`border rounded-xl p-3 text-sm font-medium ${recomendacaoStyle[analysis.recomendacaoNivel] ?? recomendacaoStyle.neutro}`}>
                                    {analysis.recomendacao}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {confirm && (
                <ConfirmDialog
                    title="Excluir candidatura?"
                    message="Essa ação não pode ser desfeita."
                    confirmLabel="Excluir"
                    onConfirm={handleDelete}
                    onCancel={() => setConfirm(false)}
                />
            )}
        </main>
    )
}
