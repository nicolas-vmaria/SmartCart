import { useState, useRef, useEffect } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { areaCor } from '../data/vagas'
import { MapPin, Briefcase, Upload, CheckCircle, ChevronRight, User, Mail, Phone, Link2, FileText, LayoutGrid, Clock, Wifi } from 'lucide-react'
import { getTrabalho, submitCandidatura, submitEspontanea } from '../lib/api/candidacy'
import { uploadFile } from '../lib/cloudinary'
import Toast from '../components/Toast'

const inputCls = "border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro transition-colors w-full"
const labelCls = "text-sm font-bold text-gray-600 mb-1 block"

const AREAS = ['Tecnologia', 'Operações', 'Comercial', 'Suporte', 'Outra']

function Field({ label, icon: Icon, children }) {
    return (
        <div className="flex flex-col gap-1">
            <label className={labelCls}>
                <span className="flex items-center gap-1.5">
                    {Icon && <Icon size={13} />} {label}
                </span>
            </label>
            {children}
        </div>
    )
}

function SkeletonVagaCard() {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4 animate-pulse">
            <div className="w-12 h-12 rounded-xl bg-gray-200 shrink-0" />
            <div className="flex-1 flex flex-col gap-3">
                <div className="h-6 w-48 bg-gray-200 rounded" />
                <div className="flex gap-2">
                    <div className="h-5 w-20 bg-gray-200 rounded-full" />
                    <div className="h-5 w-32 bg-gray-200 rounded" />
                </div>
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
        </div>
    )
}

function Sucesso({ cargo }) {
    return (
        <div className="flex flex-col items-center gap-6 py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-verde-escuro flex items-center justify-center shadow-lg">
                <CheckCircle className="text-verde-claro" size={40} />
            </div>
            <div>
                <h2 className="text-2xl font-bold text-verde-escuro">Candidatura enviada!</h2>
                <p className="text-gray-500 mt-2 max-w-sm">
                    Recebemos sua candidatura{cargo ? <> para <strong>{cargo}</strong></> : ' espontânea'}. Nossa equipe de RH entrará em contato em breve.
                </p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 w-full max-w-sm flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-gray-400">Próximo passo</span>
                    <span className="font-bold text-gray-700">Análise de currículo</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-400">Prazo de retorno</span>
                    <span className="font-bold text-gray-700">Até 5 dias úteis</span>
                </div>
            </div>
            <div className="flex gap-3">
                <Link to="/sobre/trabalhe-conosco"
                    className="border border-gray-200 text-gray-600 px-6 py-2.5 rounded-full text-sm font-bold hover:border-gray-400 transition-all">
                    Ver outras vagas
                </Link>
                <Link to="/"
                    className="bg-verde-escuro text-white px-6 py-2.5 rounded-full text-sm font-bold hover:opacity-90 transition-all">
                    Voltar ao início
                </Link>
            </div>
        </div>
    )
}

export default function Candidatura() {
    const { slug } = useParams()
    const espontanea = slug === 'espontanea'

    const [vaga, setVaga]       = useState(null)
    const [loading, setLoading] = useState(!espontanea)
    const [notFound, setNotFound] = useState(false)
    const [enviado, setEnviado] = useState(false)
    const [submitting, setSubmitting] = useState(false)
    const [arquivo, setArquivo] = useState(null)
    const [toast, setToast]     = useState(null)
    const fileRef = useRef(null)

    const [form, setForm] = useState({
        nome: '', email: '', telefone: '', linkedin: '', carta: '', area: ''
    })
    const set = (campo, valor) => setForm(p => ({ ...p, [campo]: valor }))

    useEffect(() => {
        if (espontanea) return
        getTrabalho(slug)
            .then(({ data }) => setVaga(data.trabalho))
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false))
    }, [slug])

    if (notFound) return <Navigate to="/sobre/trabalhe-conosco" replace />

    function handleArquivo(e) {
        const file = e.target.files[0]
        if (file && file.size > 5 * 1024 * 1024) {
            setToast({ message: 'O arquivo deve ter no máximo 5MB', type: 'error' })
            return
        }
        if (file) setArquivo(file)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSubmitting(true)
        try {
            let curriculo_url = ''
            if (arquivo) {
                curriculo_url = await uploadFile(arquivo)
            }

            const payload = {
                nome:           form.nome,
                email:          form.email,
                tel:            form.telefone,
                portfolio_url:  form.linkedin,
                carta_apresent: form.carta,
                curriculo_url,
            }

            if (espontanea) {
                await submitEspontanea({ ...payload, area_interesse: form.area })
            } else {
                await submitCandidatura(slug, payload)
            }

            setEnviado(true)
        } catch {
            setToast({ message: 'Erro ao enviar candidatura. Tente novamente.', type: 'error' })
        } finally {
            setSubmitting(false)
        }
    }

    const cargo = espontanea ? 'Candidatura Espontânea' : (vaga?.cargo ?? '')

    return (
        <main className="min-h-screen bg-gray-50">
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="bg-verde-escuro py-12 px-6">
                <div className="max-w-3xl mx-auto">
                    <p className="text-verde-claro/60 text-sm mb-2 flex items-center gap-1 flex-wrap">
                        <Link to="/" className="hover:text-verde-claro transition-colors">Início</Link>
                        <ChevronRight size={14} />
                        <Link to="/sobre/trabalhe-conosco" className="hover:text-verde-claro transition-colors">Trabalhe Conosco</Link>
                        <ChevronRight size={14} />
                        <span className="text-verde-claro">{cargo}</span>
                    </p>
                    <h1 className="text-3xl font-bold text-white">Candidatura</h1>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-6 py-10 flex flex-col gap-6">

                {/* Card da vaga */}
                {loading ? <SkeletonVagaCard /> : (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 flex gap-4">
                        <div className="w-12 h-12 rounded-xl bg-verde-escuro/10 text-verde-escuro flex items-center justify-center shrink-0">
                            <Briefcase size={22} />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-gray-800">{cargo}</h2>
                            {!espontanea && vaga && (
                                <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${areaCor[vaga.area] ?? 'bg-gray-100 text-gray-600'}`}>{vaga.area}</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-400"><MapPin size={11} />{vaga.local}</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={11} />{vaga.tipo_contrato}</span>
                                    <span className="flex items-center gap-1 text-xs text-gray-400"><Wifi size={11} />{vaga.formato_trabalho}</span>
                                </div>
                            )}
                            {!espontanea && vaga?.requisitos && (
                                <p className="text-gray-500 text-sm mt-3 leading-relaxed whitespace-pre-line">{vaga.requisitos}</p>
                            )}
                            {espontanea && (
                                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                                    Não encontrou a vaga certa? Envie seu currículo e entraremos em contato quando surgir uma oportunidade alinhada ao seu perfil.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Formulário */}
                {!loading && (
                    <div className="bg-white rounded-2xl border border-gray-200 p-6">
                        {enviado ? <Sucesso cargo={espontanea ? null : cargo} /> : (
                            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                                <div>
                                    <h3 className="font-bold text-gray-800 mb-0.5">Seus dados</h3>
                                    <p className="text-xs text-gray-400">Preencha com atenção — usaremos para entrar em contato.</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Field label="Nome completo" icon={User}>
                                        <input required className={inputCls} placeholder="Seu nome"
                                            value={form.nome} onChange={e => set('nome', e.target.value)} />
                                    </Field>
                                    <Field label="E-mail" icon={Mail}>
                                        <input required type="email" className={inputCls} placeholder="seu@email.com"
                                            value={form.email} onChange={e => set('email', e.target.value)} />
                                    </Field>
                                    <Field label="Telefone" icon={Phone}>
                                        <input required className={inputCls} placeholder="(11) 99999-9999"
                                            value={form.telefone} onChange={e => set('telefone', e.target.value)} />
                                    </Field>
                                    <Field label="LinkedIn ou portfólio" icon={Link2}>
                                        <input className={inputCls} placeholder="linkedin.com/in/seu-perfil"
                                            value={form.linkedin} onChange={e => set('linkedin', e.target.value)} />
                                    </Field>
                                    {espontanea && (
                                        <Field label="Área de interesse" icon={LayoutGrid}>
                                            <select required className={inputCls} value={form.area} onChange={e => set('area', e.target.value)}>
                                                <option value="">Selecione uma área...</option>
                                                {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                                            </select>
                                        </Field>
                                    )}
                                </div>

                                <Field label="Carta de apresentação" icon={FileText}>
                                    <textarea
                                        required
                                        rows={5}
                                        className={`${inputCls} resize-none`}
                                        placeholder="Conte por que você quer fazer parte do time SmartCart e o que te diferencia para essa vaga..."
                                        value={form.carta}
                                        onChange={e => set('carta', e.target.value)}
                                    />
                                </Field>

                                {/* Upload currículo */}
                                <div className="flex flex-col gap-1">
                                    <label className={labelCls}>
                                        <span className="flex items-center gap-1.5"><Upload size={13} /> Currículo (PDF)</span>
                                    </label>
                                    <div
                                        onClick={() => fileRef.current.click()}
                                        className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center gap-2 cursor-pointer transition-colors
                                            ${arquivo ? 'border-verde-escuro bg-verde-escuro/5' : 'border-gray-200 hover:border-gray-300'}`}
                                    >
                                        {arquivo ? (
                                            <>
                                                <CheckCircle size={24} className="text-verde-escuro" />
                                                <p className="text-sm font-bold text-verde-escuro">{arquivo.name}</p>
                                                <p className="text-xs text-gray-400">{(arquivo.size / 1024).toFixed(0)} KB · Clique para trocar</p>
                                            </>
                                        ) : (
                                            <>
                                                <Upload size={24} className="text-gray-400" />
                                                <p className="text-sm text-gray-500">Clique para enviar seu currículo</p>
                                                <p className="text-xs text-gray-400">PDF · Máximo 5MB</p>
                                            </>
                                        )}
                                    </div>
                                    <input ref={fileRef} type="file" accept=".pdf" className="hidden" onChange={handleArquivo} />
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                    <Link to="/sobre/trabalhe-conosco"
                                        className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
                                        ← Voltar às vagas
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="bg-verde-escuro text-white px-8 py-3 rounded-full font-bold text-sm hover:opacity-90 transition-all disabled:opacity-60 flex items-center gap-2"
                                    >
                                        {submitting && <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />}
                                        {submitting ? 'Enviando...' : 'Enviar candidatura'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                )}
            </div>
        </main>
    )
}
