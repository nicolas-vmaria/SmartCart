import { useState, useEffect, useRef } from 'react'
import { Loader2, Megaphone, Truck, Star, Upload, X, Zap, Percent, ShoppingBag, Plus, Trash2 } from 'lucide-react'
import AdminHeader from '../../components/admin/AdminHeader'
import Toast from '../../components/Toast'
import { getAdminConfiguracoes, updateConfiguracoes } from '../../lib/api/adminConfiguracoes'
import { toggleDestaque as apiToggleDestaque, getAdminCompraJuntos, setAdminCompraJunto, deleteAdminCompraJunto } from '../../lib/api/adminMarketing'
import { getProducts } from '../../lib/api/products'
import { invalidateConfiguracoes } from '../../hooks/useConfiguracoes'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

const TABS = [
    { key: 'flash',     label: 'Flash Sale',        Icon: Zap },
    { key: 'popup',     label: 'Popup',             Icon: Megaphone },
    { key: 'desconto',  label: 'Desc. Progressivo', Icon: Percent },
    { key: 'frete',     label: 'Frete Grátis',      Icon: Truck },
    { key: 'destaques', label: 'Destaques',          Icon: Star },
    { key: 'comprando', label: 'Compre Junto',       Icon: ShoppingBag },
]

const EMPTY = {
    flash_ativo: '0', flash_titulo: '', flash_fim: '', flash_cor: '#dc2626', flash_link: '',
    popup_ativo: '0', popup_titulo: '', popup_texto: '', popup_imagem: '', popup_botao_texto: '', popup_botao_link: '',
    desconto_ativo: '0',
    desconto_faixa_1_minimo: '300', desconto_faixa_1_pct: '5',
    desconto_faixa_2_minimo: '500', desconto_faixa_2_pct: '10',
    desconto_faixa_3_minimo: '800', desconto_faixa_3_pct: '15',
    frete_gratis_minimo: '500',
}

const FLASH_KEYS   = ['flash_ativo','flash_titulo','flash_fim','flash_cor','flash_link']
const POPUP_KEYS   = ['popup_ativo','popup_titulo','popup_texto','popup_imagem','popup_botao_texto','popup_botao_link']
const DESCONTO_KEYS= ['desconto_ativo','desconto_faixa_1_minimo','desconto_faixa_1_pct','desconto_faixa_2_minimo','desconto_faixa_2_pct','desconto_faixa_3_minimo','desconto_faixa_3_pct']
const FRETE_KEYS   = ['frete_gratis_minimo']

function SkeletonForm({ rows = 4 }) {
    return (
        <div className="flex flex-col gap-5 animate-pulse">
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1.5">
                    <div className="h-4 w-32 bg-gray-200 dark:bg-(--admin-hover) rounded" />
                    <div className="h-3 w-48 bg-gray-100 dark:bg-(--admin-border) rounded" />
                </div>
                <div className="w-12 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-full" />
            </div>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                    <div className="h-3 w-20 bg-gray-100 dark:bg-(--admin-border) rounded" />
                    <div className="h-10 bg-gray-200 dark:bg-(--admin-hover) rounded-xl" />
                </div>
            ))}
            <div className="h-10 bg-gray-200 dark:bg-(--admin-hover) rounded-xl" />
        </div>
    )
}

function Toggle({ value, onChange }) {
    return (
        <button type="button" onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-all shrink-0 cursor-pointer ${value ? 'bg-verde-escuro' : 'bg-gray-200 dark:bg-(--admin-border)'}`}>
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${value ? 'left-7' : 'left-1'}`} />
        </button>
    )
}

export default function AdminMarketing() {
    const [activeTab, setActiveTab] = useState('flash')
    const [configs, setConfigs]     = useState(EMPTY)
    const [loadingConfigs, setLoadingConfigs] = useState(true)
    const [saving, setSaving]       = useState(false)
    const [uploading, setUploading] = useState(false)

    const [produtos, setProdutos]             = useState([])
    const [loadingProdutos, setLoadingProdutos] = useState(true)
    const [togglingId, setTogglingId]         = useState(null)

    const [compraJuntos, setCompraJuntos]     = useState([])
    const [loadingCJ, setLoadingCJ]           = useState(true)
    const [newCJ, setNewCJ]                   = useState({ produto_id: '', sugerido_id: '' })
    const [savingCJ, setSavingCJ]             = useState(false)
    const [deletingCJId, setDeletingCJId]     = useState(null)

    const [toast, setToast] = useState(null)
    const fileRef = useRef(null)

    useEffect(() => {
        getAdminConfiguracoes()
            .then(({ data }) => setConfigs(prev => ({ ...prev, ...(data.configuracoes ?? {}) })))
            .catch(() => setToast({ message: 'Erro ao carregar configurações', type: 'error' }))
            .finally(() => setLoadingConfigs(false))

        getProducts()
            .then(({ data }) => setProdutos(data.products ?? []))
            .catch(() => {})
            .finally(() => setLoadingProdutos(false))

        getAdminCompraJuntos()
            .then(({ data }) => setCompraJuntos(data.pares ?? []))
            .catch(() => {})
            .finally(() => setLoadingCJ(false))
    }, [])

    function set(key, val) { setConfigs(prev => ({ ...prev, [key]: val })) }

    async function uploadImagem(e) {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        try {
            const form = new FormData()
            form.append('file', file)
            form.append('upload_preset', UPLOAD_PRESET)
            const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: 'POST', body: form })
            const data = await res.json()
            if (data.secure_url) set('popup_imagem', data.secure_url)
        } catch {
            setToast({ message: 'Erro ao fazer upload da imagem', type: 'error' })
        } finally {
            setUploading(false)
            if (fileRef.current) fileRef.current.value = ''
        }
    }

    async function handleSave(keys) {
        setSaving(true)
        try {
            const payload = Object.fromEntries(keys.map(k => [k, configs[k]]))
            await updateConfiguracoes(payload)
            invalidateConfiguracoes()
            setToast({ message: 'Salvo com sucesso', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao salvar', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    async function handleToggleDestaque(id) {
        setTogglingId(id)
        try {
            const { data } = await apiToggleDestaque(id)
            setProdutos(prev => prev.map(p => p.id === id ? { ...p, destaque: data.destaque ? 1 : 0 } : p))
        } catch {
            setToast({ message: 'Erro ao atualizar destaque', type: 'error' })
        } finally {
            setTogglingId(null)
        }
    }

    async function handleAddCJ() {
        if (!newCJ.produto_id || !newCJ.sugerido_id) return
        setSavingCJ(true)
        try {
            await setAdminCompraJunto({ produto_id: Number(newCJ.produto_id), sugerido_id: Number(newCJ.sugerido_id) })
            const { data } = await getAdminCompraJuntos()
            setCompraJuntos(data.pares ?? [])
            setNewCJ({ produto_id: '', sugerido_id: '' })
            setToast({ message: 'Par salvo', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar par', type: 'error' })
        } finally {
            setSavingCJ(false)
        }
    }

    async function handleDeleteCJ(produtoId) {
        setDeletingCJId(produtoId)
        try {
            await deleteAdminCompraJunto(produtoId)
            setCompraJuntos(prev => prev.filter(p => p.produto_id !== produtoId))
            setToast({ message: 'Par removido', type: 'success' })
        } catch {
            setToast({ message: 'Erro ao remover par', type: 'error' })
        } finally {
            setDeletingCJId(null)
        }
    }

    const destaquesCount = produtos.filter(p => p.destaque).length
    const freteMinimo    = Number(configs.frete_gratis_minimo)
    const inputClass     = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-3 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"

    const SaveBtn = ({ keys }) => (
        <button onClick={() => handleSave(keys)} disabled={saving || loadingConfigs}
            className="flex items-center justify-center gap-2 bg-verde-escuro text-white rounded-xl py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer">
            {saving && <Loader2 size={15} className="animate-spin" />}
            {saving ? 'Salvando...' : 'Salvar'}
        </button>
    )

    return (
        <main>
            <AdminHeader title="Marketing" description="Gerencie promoções, frete grátis e produtos em destaque." />

            <div className="flex gap-1 mt-6 border-b border-gray-200 dark:border-(--admin-border) overflow-x-auto scrollbar-hide">
                {TABS.map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => setActiveTab(key)}
                        className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all border-b-2 -mb-px whitespace-nowrap
                            ${activeTab === key
                                ? 'border-verde-escuro text-verde-escuro dark:border-(--admin-accent) dark:text-(--admin-accent) bg-white dark:bg-(--admin-card)'
                                : 'border-transparent text-gray-500 dark:text-(--admin-text-muted) hover:text-gray-700 dark:hover:text-(--admin-text)'
                            }`}>
                        <Icon size={15} />{label}
                    </button>
                ))}
            </div>

            <div className="mt-6">

                {/* FLASH SALE */}
                {activeTab === 'flash' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
                        {loadingConfigs ? <SkeletonForm rows={3} /> : <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm dark:text-(--admin-text)">Flash Sale ativa</p>
                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Exibe barra na parte inferior do site</p>
                                </div>
                                <Toggle value={configs.flash_ativo === '1'} onChange={() => set('flash_ativo', configs.flash_ativo === '1' ? '0' : '1')} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Título</label>
                                <input type="text" value={configs.flash_titulo} onChange={e => set('flash_titulo', e.target.value)}
                                    placeholder="Ex: Oferta relâmpago! 20% em tudo" className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Fim da promoção</label>
                                <input type="datetime-local" value={configs.flash_fim} onChange={e => set('flash_fim', e.target.value)} className={inputClass} />
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Cor de fundo</label>
                                <div className="flex items-center gap-3">
                                    <input type="color" value={configs.flash_cor} onChange={e => set('flash_cor', e.target.value)}
                                        className="w-10 h-10 rounded-lg border border-gray-200 dark:border-(--admin-border) cursor-pointer p-0.5" />
                                    <input type="text" value={configs.flash_cor} onChange={e => set('flash_cor', e.target.value)}
                                        className={`${inputClass} flex-1`} placeholder="#dc2626" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Link do botão (opcional)</label>
                                <input type="text" value={configs.flash_link} onChange={e => set('flash_link', e.target.value)}
                                    placeholder="/produtos ou https://..." className={inputClass} />
                            </div>

                            <SaveBtn keys={FLASH_KEYS} />
                        </>}
                        </div>

                        {/* Preview flash */}
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wide font-medium mb-4">Preview</p>
                            <div className="rounded-xl overflow-hidden" style={{ backgroundColor: configs.flash_cor || '#dc2626' }}>
                                <div className="flex items-center justify-between px-4 py-3 gap-4">
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Zap size={16} className="text-white shrink-0" />
                                        <span className="text-white text-sm font-medium truncate">{configs.flash_titulo || 'Título da promoção'}</span>
                                        <span className="text-white/80 text-sm font-mono shrink-0">00:59:59</span>
                                    </div>
                                    {configs.flash_link && (
                                        <div className="bg-white/20 text-white text-xs px-3 py-1 rounded-full shrink-0">Ver oferta</div>
                                    )}
                                    <X size={14} className="text-white/70 shrink-0" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-3">Barra fixa na parte inferior do site com contador regressivo</p>
                        </div>
                    </div>
                )}

                {/* POPUP */}
                {activeTab === 'popup' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
                        {loadingConfigs ? <SkeletonForm rows={4} /> : <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm dark:text-(--admin-text)">Popup ativo</p>
                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Exibe na primeira visita da sessão</p>
                                </div>
                                <Toggle value={configs.popup_ativo === '1'} onChange={() => set('popup_ativo', configs.popup_ativo === '1' ? '0' : '1')} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Título</label>
                                <input type="text" value={configs.popup_titulo} onChange={e => set('popup_titulo', e.target.value)}
                                    placeholder="Ex: Oferta especial!" className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Texto</label>
                                <textarea value={configs.popup_texto} onChange={e => set('popup_texto', e.target.value)}
                                    placeholder="Descrição do popup..." rows={3} className={`${inputClass} resize-none`} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Imagem</label>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={uploadImagem} />
                                {configs.popup_imagem ? (
                                    <div className="relative w-full h-32 rounded-xl overflow-hidden border border-gray-200 dark:border-(--admin-border)">
                                        <img src={configs.popup_imagem} className="w-full h-full object-cover" alt="" />
                                        <button onClick={() => set('popup_imagem', '')}
                                            className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition-all cursor-pointer">
                                            <X size={12} />
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => fileRef.current?.click()} disabled={uploading}
                                        className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 dark:border-(--admin-border) rounded-xl h-20 text-gray-400 dark:text-(--admin-text-muted) text-sm hover:border-verde-escuro hover:text-verde-escuro transition-all disabled:opacity-50 cursor-pointer">
                                        {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                        {uploading ? 'Enviando...' : 'Upload de imagem'}
                                    </button>
                                )}
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Texto do botão</label>
                                <input type="text" value={configs.popup_botao_texto} onChange={e => set('popup_botao_texto', e.target.value)}
                                    placeholder="Ex: Ver ofertas" className={inputClass} />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Link do botão</label>
                                <input type="text" value={configs.popup_botao_link} onChange={e => set('popup_botao_link', e.target.value)}
                                    placeholder="/produtos ou https://..." className={inputClass} />
                            </div>
                            <SaveBtn keys={POPUP_KEYS} />
                        </>}
                        </div>
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wide font-medium mb-4">Preview</p>
                            <div className="bg-black/30 rounded-xl p-6 flex items-center justify-center min-h-56">
                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-72 relative">
                                    {configs.popup_imagem && <img src={configs.popup_imagem} className="w-full h-36 object-cover" alt="" />}
                                    <div className="p-5">
                                        <h3 className="font-bold text-lg text-gray-800">{configs.popup_titulo || 'Título do popup'}</h3>
                                        {configs.popup_texto && <p className="text-gray-500 text-sm mt-1 leading-relaxed">{configs.popup_texto}</p>}
                                        {configs.popup_botao_texto && (
                                            <div className="mt-3 bg-verde-escuro text-white text-center py-2.5 rounded-xl text-sm font-medium">{configs.popup_botao_texto}</div>
                                        )}
                                        <div className="mt-2 text-center text-xs text-gray-400">Fechar</div>
                                    </div>
                                    <div className="absolute top-2 right-2 bg-white/80 rounded-full p-1"><X size={14} className="text-gray-500" /></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* DESCONTO PROGRESSIVO */}
                {activeTab === 'desconto' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
                        {loadingConfigs ? <SkeletonForm rows={3} /> : <>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-sm dark:text-(--admin-text)">Desconto progressivo ativo</p>
                                    <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Mostra faixas de desconto no carrinho</p>
                                </div>
                                <Toggle value={configs.desconto_ativo === '1'} onChange={() => set('desconto_ativo', configs.desconto_ativo === '1' ? '0' : '1')} />
                            </div>

                            {[1, 2, 3].map(n => (
                                <div key={n} className="flex gap-3 items-end">
                                    <div className="flex flex-col gap-1 flex-1">
                                        <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Faixa {n} — mínimo (R$)</label>
                                        <input type="number" min="0" value={configs[`desconto_faixa_${n}_minimo`]}
                                            onChange={e => set(`desconto_faixa_${n}_minimo`, e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="flex flex-col gap-1 w-28">
                                        <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Desconto (%)</label>
                                        <input type="number" min="0" max="100" value={configs[`desconto_faixa_${n}_pct`]}
                                            onChange={e => set(`desconto_faixa_${n}_pct`, e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                            ))}

                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">O desconto é exibido como informação no carrinho. Para aplicá-lo, use junto de um cupom.</p>
                            <SaveBtn keys={DESCONTO_KEYS} />
                        </>}
                        </div>

                        {/* Preview desconto */}
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wide font-medium mb-4">Preview no carrinho</p>
                            <div className="bg-gray-50 dark:bg-(--admin-bg) rounded-xl p-4 flex flex-col gap-2">
                                {[1, 2, 3].map(n => {
                                    const min = Number(configs[`desconto_faixa_${n}_minimo`])
                                    const pct = Number(configs[`desconto_faixa_${n}_pct`])
                                    if (!min || !pct) return null
                                    return (
                                        <div key={n} className="flex items-center gap-3 py-2 border-b border-gray-200 last:border-0">
                                            <div className="w-2 h-2 rounded-full bg-gray-300 shrink-0" />
                                            <span className="text-sm text-gray-600 flex-1">
                                                Acima de {min.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                            <span className="text-sm font-bold text-verde-escuro">{pct}% off</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* FRETE */}
                {activeTab === 'frete' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
                        {loadingConfigs ? <SkeletonForm rows={1} /> : <>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Valor mínimo para frete grátis</label>
                                <div className="flex items-center border border-gray-200 dark:border-(--admin-border) rounded-xl overflow-hidden">
                                    <span className="px-3 py-2.5 bg-gray-50 dark:bg-(--admin-hover) text-sm text-gray-400 dark:text-(--admin-text-muted) border-r border-gray-200 dark:border-(--admin-border)">R$</span>
                                    <input type="number" min="0" step="1" value={configs.frete_gratis_minimo}
                                        onChange={e => set('frete_gratis_minimo', e.target.value)}
                                        className="flex-1 px-3 py-2.5 text-sm dark:bg-(--admin-input) dark:text-(--admin-text) outline-none" />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">
                                    {freteMinimo === 0 ? 'Frete grátis em todas as compras'
                                        : `Pedidos acima de ${freteMinimo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} recebem frete grátis`}
                                </p>
                            </div>
                            <SaveBtn keys={FRETE_KEYS} />
                        </>}
                        </div>
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) uppercase tracking-wide font-medium mb-4">Preview no carrinho</p>
                            <div className="bg-gray-50 dark:bg-(--admin-bg) rounded-xl p-4">
                                {freteMinimo === 0 ? (
                                    <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                                        <Truck size={15} /> Frete grátis em todas as compras!
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2">
                                            <p className="text-xs text-green-700 mb-1.5">
                                                Faltam <strong>{freteMinimo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</strong> para frete grátis!
                                            </p>
                                            <div className="h-1.5 bg-green-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-green-500 rounded-full w-[35%]" />
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-400">Barra aparece quando o total não atingir o mínimo</p>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* DESTAQUES */}
                {activeTab === 'destaques' && (
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                        <div className="p-5 border-b border-gray-100 dark:border-(--admin-border)">
                            <h3 className="font-semibold text-verde-escuro dark:text-(--admin-accent)">Produtos em destaque</h3>
                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) mt-0.5">{destaquesCount} produto(s) exibido(s) na home</p>
                        </div>
                        {loadingProdutos ? (
                            <div className="flex flex-col divide-y divide-gray-100 dark:divide-(--admin-border)">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                        <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-(--admin-hover) shrink-0" />
                                        <div className="flex-1 flex flex-col gap-1.5">
                                            <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-48" />
                                            <div className="h-3 bg-gray-100 dark:bg-(--admin-border) rounded w-24" />
                                        </div>
                                        <div className="w-12 h-6 rounded-full bg-gray-200 dark:bg-(--admin-hover)" />
                                    </div>
                                ))}
                            </div>
                        ) : produtos.length === 0 ? (
                            <div className="py-16 text-center text-gray-400 text-sm">Nenhum produto encontrado.</div>
                        ) : (
                            <div className="flex flex-col divide-y divide-gray-100 dark:divide-(--admin-border)">
                                {produtos.map(p => (
                                    <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                        <div className="w-12 h-12 rounded-xl border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) overflow-hidden shrink-0 flex items-center justify-center">
                                            {p.foto_url ? <img src={p.foto_url} className="w-full h-full object-contain p-1" alt="" /> : <Star size={16} className="text-gray-300" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium dark:text-(--admin-text) truncate">{p.nome}</p>
                                            <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{Number(p.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                        </div>
                                        <button onClick={() => handleToggleDestaque(p.id)} disabled={togglingId === p.id}
                                            className={`relative w-12 h-6 rounded-full transition-all shrink-0 disabled:opacity-50 cursor-pointer ${p.destaque ? 'bg-verde-escuro' : 'bg-gray-200 dark:bg-(--admin-border)'}`}>
                                            {togglingId === p.id
                                                ? <Loader2 size={12} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin text-white" />
                                                : <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${p.destaque ? 'left-7' : 'left-1'}`} />}
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* COMPRE JUNTO */}
                {activeTab === 'comprando' && (
                    <div className="flex flex-col gap-6">
                        {/* Adicionar novo par */}
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                            <h3 className="font-semibold text-verde-escuro dark:text-(--admin-accent) mb-4">Adicionar par</h3>
                            <div className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Produto principal</label>
                                    <select value={newCJ.produto_id} onChange={e => setNewCJ(prev => ({ ...prev, produto_id: e.target.value }))} className={inputClass}>
                                        <option value="">Selecione...</option>
                                        {produtos.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </select>
                                </div>
                                <Plus size={18} className="text-gray-400 shrink-0 mb-2.5 hidden sm:block" />
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Produto sugerido</label>
                                    <select value={newCJ.sugerido_id} onChange={e => setNewCJ(prev => ({ ...prev, sugerido_id: e.target.value }))} className={inputClass}>
                                        <option value="">Selecione...</option>
                                        {produtos.filter(p => String(p.id) !== newCJ.produto_id).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                                    </select>
                                </div>
                                <button onClick={handleAddCJ} disabled={savingCJ || !newCJ.produto_id || !newCJ.sugerido_id}
                                    className="flex items-center justify-center gap-2 bg-verde-escuro text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 cursor-pointer shrink-0">
                                    {savingCJ ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                                    {savingCJ ? 'Salvando...' : 'Adicionar'}
                                </button>
                            </div>
                        </div>

                        {/* Lista de pares */}
                        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                            <div className="p-5 border-b border-gray-100 dark:border-(--admin-border)">
                                <h3 className="font-semibold text-verde-escuro dark:text-(--admin-accent)">Pares configurados</h3>
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) mt-0.5">{compraJuntos.length} par(es)</p>
                            </div>
                            {loadingCJ ? (
                                <div className="flex flex-col divide-y divide-gray-100 dark:divide-(--admin-border)">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-(--admin-hover) shrink-0" />
                                            <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-32" />
                                            <Plus size={14} className="text-gray-300 shrink-0" />
                                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-(--admin-hover) shrink-0" />
                                            <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-32" />
                                            <div className="ml-auto w-7 h-7 rounded-md bg-gray-200 dark:bg-(--admin-hover)" />
                                        </div>
                                    ))}
                                </div>
                            ) : compraJuntos.length === 0 ? (
                                <div className="py-12 text-center text-gray-400 dark:text-(--admin-text-muted) text-sm">
                                    Nenhum par configurado. Adicione acima.
                                </div>
                            ) : (
                                <div className="flex flex-col divide-y divide-gray-100 dark:divide-(--admin-border)">
                                    {compraJuntos.map(par => (
                                        <div key={par.produto_id} className="flex items-center gap-3 p-4 hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                            <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) overflow-hidden shrink-0 flex items-center justify-center">
                                                {par.produto_foto ? <img src={par.produto_foto} className="w-full h-full object-contain p-1" alt="" /> : <ShoppingBag size={14} className="text-gray-300" />}
                                            </div>
                                            <p className="text-sm dark:text-(--admin-text) truncate flex-1 min-w-0">{par.produto_nome}</p>
                                            <Plus size={14} className="text-gray-400 shrink-0" />
                                            <div className="w-10 h-10 rounded-xl border border-gray-200 dark:border-(--admin-border) bg-white dark:bg-(--admin-input) overflow-hidden shrink-0 flex items-center justify-center">
                                                {par.sugerido_foto ? <img src={par.sugerido_foto} className="w-full h-full object-contain p-1" alt="" /> : <ShoppingBag size={14} className="text-gray-300" />}
                                            </div>
                                            <p className="text-sm dark:text-(--admin-text) truncate flex-1 min-w-0">{par.sugerido_nome}</p>
                                            <button onClick={() => handleDeleteCJ(par.produto_id)} disabled={deletingCJId === par.produto_id}
                                                className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-all text-gray-400 hover:text-red-500 disabled:opacity-50 shrink-0 cursor-pointer">
                                                {deletingCJId === par.produto_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
