import { useState } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import Toast from '../../components/Toast'
import { sendAdminReport } from '../../lib/api/adminReports'
import { AlertTriangle, Bug, CheckCircle, ClipboardList, Globe, Send, ShieldAlert } from 'lucide-react'

const initialForm = {
    titulo: '',
    problemaCentral: 'Site / E-commerce',
    categoria: 'Erro no site',
    prioridade: 'Media',
    pagina: '',
    descricao: '',
    passos: '',
}

const problemasCentrais = [
    { value: 'TI interno', label: 'TI interno', description: 'Computadores, rede, acessos, sistemas internos e infraestrutura.' },
    { value: 'Site / E-commerce', label: 'Site / E-commerce', description: 'Loja online, painel admin, checkout, login, produtos e pedidos.' },
    { value: 'Carrinho inteligente', label: 'Carrinho inteligente', description: 'Hardware, sensores, tela, conectividade e leitura de produtos.' },
    { value: 'Operacao da loja', label: 'Operacao da loja', description: 'Processos, atendimento, estoque, separacao e rotina comercial.' },
]

const categorias = [
    'Erro no site',
    'Sistema fora do ar',
    'Acesso ou permissao',
    'Rede ou internet',
    'Equipamento com defeito',
    'Erro no fluxo',
    'Pagamento ou checkout',
    'Dados incorretos',
    'Lentidao',
    'Outro',
]

const prioridades = [
    { value: 'Baixa', label: 'Baixa', description: 'Nao bloqueia o uso' },
    { value: 'Media', label: 'Media', description: 'Atrasa ou confunde o uso' },
    { value: 'Alta', label: 'Alta', description: 'Bloqueia uma tarefa importante' },
    { value: 'Critica', label: 'Critica', description: 'Sistema indisponivel ou venda parada' },
]

function Section({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5 h-fit">
            <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{title}</h2>
            {children}
        </div>
    )
}

function Field({ label, children }) {
    return (
        <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">{label}</span>
            {children}
        </label>
    )
}

function InfoCard({ icon: Icon, title, text }) {
    return (
        <div className="flex items-start gap-3 rounded-xl border border-gray-200 dark:border-(--admin-border) bg-gray-50 dark:bg-(--admin-hover) p-4 min-h-24">
            <div className="w-9 h-9 rounded-lg bg-white dark:bg-(--admin-card) flex items-center justify-center text-verde-escuro dark:text-(--admin-accent) shrink-0">
                <Icon size={17} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-bold text-gray-800 dark:text-(--admin-text)">{title}</p>
                <p className="text-xs text-gray-500 dark:text-(--admin-text-muted) mt-1 leading-relaxed break-words">{text}</p>
            </div>
        </div>
    )
}

export default function AdminReports() {
    const [form, setForm] = useState(initialForm)
    const [loading, setLoading] = useState(false)
    const [toast, setToast] = useState(null)

    function setField(field, value) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    const contextoLabel = form.problemaCentral === 'TI interno'
        ? 'Local ou equipamento afetado'
        : form.problemaCentral === 'Carrinho inteligente'
            ? 'Carrinho ou unidade afetada'
            : form.problemaCentral === 'Operacao da loja'
                ? 'Setor ou processo afetado'
                : 'Pagina afetada'

    const contextoPlaceholder = form.problemaCentral === 'TI interno'
        ? 'Ex: Caixa 02, notebook financeiro, Wi-Fi da loja'
        : form.problemaCentral === 'Carrinho inteligente'
            ? 'Ex: Carrinho #12, tela, sensor de peso'
            : form.problemaCentral === 'Operacao da loja'
                ? 'Ex: Separacao, estoque, atendimento'
                : '/admin/orders'

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)

        try {
            await sendAdminReport({
                ...form,
                navegador: `${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`,
            })
            setToast({ message: 'Report enviado com sucesso.', type: 'success' })
            setForm(initialForm)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao enviar report.', type: 'error' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
            <AdminHeader title="Reports" description="Reporte problemas de TI, site, carrinho inteligente ou operacao da empresa." />

            <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-5 min-w-0">
                    <Section title="Detalhes do problema">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Field label="Titulo">
                                <input
                                    value={form.titulo}
                                    onChange={e => setField('titulo', e.target.value)}
                                    placeholder="Ex: Botao de finalizar pedido nao responde"
                                    className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors"
                                />
                            </Field>

                            <Field label={contextoLabel}>
                                <div className="relative">
                                    <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        value={form.pagina}
                                        onChange={e => setField('pagina', e.target.value)}
                                        placeholder={contextoPlaceholder}
                                        className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl pl-11 pr-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors"
                                    />
                                </div>
                            </Field>
                        </div>

                        <Field label="Problema central">
                            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 items-stretch">
                                {problemasCentrais.map(item => {
                                    const active = form.problemaCentral === item.value
                                    return (
                                        <button
                                            key={item.value}
                                            type="button"
                                            onClick={() => setField('problemaCentral', item.value)}
                                            className={`w-full min-w-0 text-left rounded-xl border p-4 h-24 flex flex-col justify-center transition-all ${
                                                active
                                                    ? 'border-verde-escuro dark:border-(--admin-accent) bg-green-50 dark:bg-(--admin-accent-soft)'
                                                    : 'border-gray-200 dark:border-(--admin-border) hover:border-gray-300 dark:hover:border-(--admin-text-muted)'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                {active ? <CheckCircle size={16} className="text-verde-escuro dark:text-(--admin-accent)" /> : <AlertTriangle size={16} className="text-gray-400" />}
                                                <p className="text-sm font-bold text-gray-800 dark:text-(--admin-text)">{item.label}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-(--admin-text-muted) mt-1 leading-snug line-clamp-2">{item.description}</p>
                                        </button>
                                    )
                                })}
                            </div>
                        </Field>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <Field label="Tipo do problema">
                                <select
                                    value={form.categoria}
                                    onChange={e => setField('categoria', e.target.value)}
                                    className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors"
                                >
                                    {categorias.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                </select>
                            </Field>

                            <Field label="Prioridade">
                                <select
                                    value={form.prioridade}
                                    onChange={e => setField('prioridade', e.target.value)}
                                    className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors"
                                >
                                    {prioridades.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                                </select>
                            </Field>
                        </div>
                    </Section>

                    <Section title="Descricao">
                        <Field label="O que aconteceu?">
                            <textarea
                                required
                                rows={6}
                                value={form.descricao}
                                onChange={e => setField('descricao', e.target.value)}
                                placeholder="Descreva o problema, o resultado esperado e o que apareceu na tela."
                                className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors resize-none"
                            />
                        </Field>

                        <Field label="Passos para reproduzir">
                            <textarea
                                rows={4}
                                value={form.passos}
                                onChange={e => setField('passos', e.target.value)}
                                placeholder={'1. Acesse...\n2. Clique em...\n3. Veja o erro...'}
                                className="w-full border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) text-gray-800 dark:text-(--admin-text) rounded-xl px-4 py-3 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors resize-none"
                            />
                        </Field>
                    </Section>

                    <Section title="Boas praticas">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                            <InfoCard icon={Bug} title="Escolha o centro certo" text="Separe problemas de TI, site, carrinho inteligente e operacao para acelerar o encaminhamento." />
                            <InfoCard icon={ClipboardList} title="Liste os passos" text="Quanto mais facil reproduzir, mais rapido a equipe consegue corrigir." />
                            <InfoCard icon={ShieldAlert} title="Priorize corretamente" text="Use Critica apenas quando uma venda ou area essencial estiver bloqueada." />
                        </div>
                    </Section>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading
                                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin dark:border-black dark:border-t-transparent" />
                                : <Send size={16} />
                            }
                            {loading ? 'Enviando...' : 'Enviar report'}
                        </button>
                    </div>
            </form>
        </main>
    )
}
