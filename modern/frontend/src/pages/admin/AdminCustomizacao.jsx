import { useState, useEffect, useRef } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'
import {
    ImageIcon, Plus, Trash2, ChevronUp, ChevronDown,
    Megaphone, Store, Star, Check, Truck, Clock, RefreshCw,
    CreditCard, Phone, Mail, FileText
} from 'lucide-react'
import { FaInstagram, FaFacebook, FaWhatsapp, FaYoutube } from 'react-icons/fa'
import { getBanners, createBanner, deleteBanner, reorderBanners, toggleBanner } from '../../lib/api/adminBanners'
import { getAdminConfiguracoes, updateConfiguracoes } from '../../lib/api/adminConfiguracoes'
import { uploadImage } from '../../lib/cloudinary'
import { invalidateConfiguracoes } from '../../hooks/useConfiguracoes'

const TABS = [
    { id: 'carrossel',   label: 'Carrossel',   icon: ImageIcon  },
    { id: 'anuncio',     label: 'Anúncio',     icon: Megaphone  },
    { id: 'loja',        label: 'Loja',        icon: Store      },
    { id: 'beneficios',  label: 'Benefícios',  icon: Star       },
]

const BENEFIT_ICONS = [Truck, Clock, RefreshCw, CreditCard]

const inputCls = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-colors w-full"
const labelCls = "text-xs font-bold text-gray-500 dark:text-(--admin-text-muted) uppercase tracking-wide mb-1.5 block"

function SectionCard({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-6 flex flex-col gap-5">
            {title && <h3 className="font-bold text-gray-800 dark:text-(--admin-text) text-sm">{title}</h3>}
            {children}
        </div>
    )
}

function SaveButton({ saving, onClick }) {
    return (
        <div className="flex justify-end">
            <button
                onClick={onClick}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
            >
                {saving
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Check size={15} />
                }
                {saving ? 'Salvando...' : 'Salvar'}
            </button>
        </div>
    )
}

function SkeletonBanner() {
    return (
        <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-16/6 bg-gray-200 dark:bg-(--admin-border)" />
            <div className="p-4 flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-20" />
                <div className="h-6 bg-gray-200 dark:bg-(--admin-border) rounded-full w-16" />
            </div>
        </div>
    )
}

function Toggle({ checked, onChange }) {
    return (
        <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${checked ? 'bg-verde-escuro dark:bg-(--admin-accent)' : 'bg-gray-200 dark:bg-(--admin-border)'}`}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
        </button>
    )
}

export default function AdminCustomizacao() {
    const [tab, setTab] = useState('carrossel')
    const [toast, setToast] = useState(null)

    // Banner state
    const [banners, setBanners]     = useState([])
    const [loadingBanners, setLoadingBanners] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [toggling, setToggling]   = useState(null)
    const [confirmId, setConfirmId] = useState(null)
    const fileRef = useRef(null)

    // Config state
    const [configs, setConfigs]         = useState({})
    const [loadingConfig, setLoadingConfig] = useState(true)
    const [saving, setSaving]           = useState(false)

    function showToast(message, type = 'success') {
        setToast({ message, type })
    }

    // ── Banners ──────────────────────────────────────────────────────────────

    async function loadBanners() {
        setLoadingBanners(true)
        try {
            const { data } = await getBanners()
            setBanners(data.banners ?? [])
        } catch {
            showToast('Erro ao carregar banners', 'error')
        } finally {
            setLoadingBanners(false)
        }
    }

    useEffect(() => { loadBanners() }, [])

    async function handleFileChange(e) {
        const file = e.target.files?.[0]
        if (!file) return
        e.target.value = ''
        setUploading(true)
        try {
            const url = await uploadImage(file)
            const { data } = await createBanner(url)
            setBanners(prev => [...prev, data.banner])
            showToast('Banner adicionado com sucesso')
        } catch {
            showToast('Erro ao adicionar banner', 'error')
        } finally {
            setUploading(false)
        }
    }

    async function handleDelete() {
        try {
            await deleteBanner(confirmId)
            const updated = banners.filter(b => b.id !== confirmId)
            const reindexed = updated.map((b, i) => ({ ...b, ordem: i }))
            if (reindexed.length > 0) await reorderBanners(reindexed.map(b => b.id))
            setBanners(reindexed)
            showToast('Banner removido')
        } catch {
            showToast('Erro ao remover banner', 'error')
        } finally {
            setConfirmId(null)
        }
    }

    async function handleMove(index, direction) {
        const next = [...banners]
        const swapWith = direction === 'up' ? index - 1 : index + 1
        ;[next[index], next[swapWith]] = [next[swapWith], next[index]]
        const reindexed = next.map((b, i) => ({ ...b, ordem: i }))
        setBanners(reindexed)
        try {
            await reorderBanners(reindexed.map(b => b.id))
        } catch {
            showToast('Erro ao reordenar', 'error')
            loadBanners()
        }
    }

    async function handleToggleBanner(id) {
        setToggling(id)
        try {
            const { data } = await toggleBanner(id)
            setBanners(prev => prev.map(b => b.id === id ? { ...b, ativo: data.banner.ativo } : b))
        } catch {
            showToast('Erro ao alterar status', 'error')
        } finally {
            setToggling(null)
        }
    }

    // ── Configurações ────────────────────────────────────────────────────────

    useEffect(() => {
        getAdminConfiguracoes()
            .then(({ data }) => setConfigs(data.configuracoes ?? {}))
            .catch(() => showToast('Erro ao carregar configurações', 'error'))
            .finally(() => setLoadingConfig(false))
    }, [])

    function setConfig(key, value) {
        setConfigs(prev => ({ ...prev, [key]: value }))
    }

    async function handleSave() {
        setSaving(true)
        try {
            await updateConfiguracoes(configs)
            invalidateConfiguracoes()
            showToast('Configurações salvas com sucesso')
        } catch {
            showToast('Erro ao salvar configurações', 'error')
        } finally {
            setSaving(false)
        }
    }

    // ── Render ───────────────────────────────────────────────────────────────

    const ativos   = banners.filter(b => b.ativo == 1 || b.ativo === true).length
    const inativos = banners.length - ativos

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <AdminHeader title="Customização" description="Gerencie banners, anúncios e informações do site." />

            {/* Tabs */}
            <div className="flex gap-2 mt-5 border-b border-gray-200 dark:border-(--admin-border)">
                {TABS.map(t => {
                    const Icon = t.icon
                    const active = tab === t.id
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl border-b-2 transition-all -mb-px ${
                                active
                                    ? 'border-verde-escuro dark:border-(--admin-accent) text-verde-escuro dark:text-(--admin-accent)'
                                    : 'border-transparent text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-600 dark:hover:text-(--admin-text)'
                            }`}
                        >
                            <Icon size={15} />
                            {t.label}
                        </button>
                    )
                })}
            </div>

            <div className="mt-5 flex flex-col gap-5">

                {/* ── Tab: Carrossel ──────────────────────────────────── */}
                {tab === 'carrossel' && (
                    <>
                        <div className="grid grid-cols-3 gap-4">
                            {[
                                { label: 'Total',    valor: banners.length, cor: 'text-gray-800 dark:text-(--admin-text)' },
                                { label: 'Ativos',   valor: ativos,         cor: 'text-green-600 dark:text-green-400'     },
                                { label: 'Inativos', valor: inativos,       cor: 'text-gray-400 dark:text-(--admin-text-muted)' },
                            ].map(({ label, valor, cor }) => (
                                <div key={label} className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                                    <p className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{label}</p>
                                    {loadingBanners
                                        ? <div className="h-8 w-12 mt-1 bg-gray-200 dark:bg-(--admin-border) rounded animate-pulse" />
                                        : <p className={`text-3xl font-bold mt-1 ${cor}`}>{valor}</p>
                                    }
                                </div>
                            ))}
                        </div>

                        <SectionCard>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{banners.length} imagem(s)</span>
                                <button
                                    onClick={() => fileRef.current?.click()}
                                    disabled={uploading}
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all disabled:opacity-60"
                                >
                                    {uploading
                                        ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                                        : <Plus size={15} />
                                    }
                                    {uploading ? 'Enviando...' : 'Adicionar imagem'}
                                </button>
                                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </div>

                            {loadingBanners ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Array.from({ length: 3 }).map((_, i) => <SkeletonBanner key={i} />)}
                                </div>
                            ) : banners.length === 0 ? (
                                <div className="py-16 text-center">
                                    <ImageIcon size={36} className="mx-auto text-gray-200 dark:text-(--admin-border) mb-3" />
                                    <p className="text-gray-400 dark:text-(--admin-text-muted)">Nenhuma imagem cadastrada.</p>
                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="mt-3 text-sm text-verde-escuro dark:text-(--admin-accent) font-medium hover:underline"
                                    >
                                        Adicionar primeira imagem
                                    </button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {banners.map((banner, index) => {
                                        const ativo = banner.ativo == 1 || banner.ativo === true
                                        return (
                                            <div key={banner.id} className="border border-gray-200 dark:border-(--admin-border) rounded-2xl overflow-hidden">
                                                <div className="relative aspect-16/6 bg-gray-100 dark:bg-(--admin-hover)">
                                                    <img src={banner.foto_url} alt={`Banner ${index + 1}`} className="w-full h-full object-cover" />
                                                    <span className="absolute top-2 left-2 bg-black/50 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                                        #{index + 1}
                                                    </span>
                                                    {!ativo && (
                                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                            <span className="text-white text-sm font-medium">Inativo</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="px-4 py-3 flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-1">
                                                        <button onClick={() => handleMove(index, 'up')} disabled={index === 0}
                                                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 disabled:opacity-30 transition-all">
                                                            <ChevronUp size={16} />
                                                        </button>
                                                        <button onClick={() => handleMove(index, 'down')} disabled={index === banners.length - 1}
                                                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 disabled:opacity-30 transition-all">
                                                            <ChevronDown size={16} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleToggleBanner(banner.id)}
                                                        disabled={toggling === banner.id}
                                                        className="flex items-center gap-1.5 disabled:opacity-50"
                                                    >
                                                        <Toggle checked={ativo} onChange={() => handleToggleBanner(banner.id)} />
                                                        <span className={`text-xs font-medium ${ativo ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-(--admin-text-muted)'}`}>
                                                            {ativo ? 'Ativo' : 'Inativo'}
                                                        </span>
                                                    </button>
                                                    <button onClick={() => setConfirmId(banner.id)}
                                                        className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-all">
                                                        <Trash2 size={15} />
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </SectionCard>
                    </>
                )}

                {/* ── Tab: Anúncio ────────────────────────────────────── */}
                {tab === 'anuncio' && (
                    <SectionCard title="Barra de anúncio">
                        {loadingConfig ? (
                            <div className="flex flex-col gap-4 animate-pulse">
                                {[1,2,3].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-(--admin-border) rounded-xl" />)}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-700 dark:text-(--admin-text)">Exibir barra de anúncio</p>
                                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted)">Aparece no topo do site para todos os visitantes</p>
                                    </div>
                                    <Toggle
                                        checked={configs.anuncio_ativo === '1'}
                                        onChange={v => setConfig('anuncio_ativo', v ? '1' : '0')}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Texto do anúncio</label>
                                    <input
                                        className={inputCls}
                                        placeholder="Ex: Frete grátis em compras acima de R$ 199"
                                        value={configs.anuncio_texto ?? ''}
                                        onChange={e => setConfig('anuncio_texto', e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className={labelCls}>Cor de fundo</label>
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="color"
                                            value={configs.anuncio_cor ?? '#166534'}
                                            onChange={e => setConfig('anuncio_cor', e.target.value)}
                                            className="w-10 h-10 rounded-lg border border-gray-200 dark:border-(--admin-border) cursor-pointer p-0.5"
                                        />
                                        <input
                                            className={`${inputCls} w-32`}
                                            value={configs.anuncio_cor ?? '#166534'}
                                            onChange={e => setConfig('anuncio_cor', e.target.value)}
                                            placeholder="#166534"
                                        />
                                    </div>
                                </div>

                                {/* Preview */}
                                {configs.anuncio_texto && (
                                    <div>
                                        <label className={labelCls}>Pré-visualização</label>
                                        <div
                                            className="h-9 flex items-center justify-center rounded-xl text-white text-sm font-medium"
                                            style={{ backgroundColor: configs.anuncio_cor || '#166534' }}
                                        >
                                            {configs.anuncio_texto}
                                        </div>
                                    </div>
                                )}

                                <SaveButton saving={saving} onClick={handleSave} />
                            </>
                        )}
                    </SectionCard>
                )}

                {/* ── Tab: Loja ───────────────────────────────────────── */}
                {tab === 'loja' && (
                    <>
                        <SectionCard title="Informações da loja">
                            {loadingConfig ? (
                                <div className="flex flex-col gap-4 animate-pulse">
                                    {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-(--admin-border) rounded-xl" />)}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><Phone size={11} /> Telefone 1</span></label>
                                            <input className={inputCls} placeholder="45 99999-9999"
                                                value={configs.loja_telefone1 ?? ''}
                                                onChange={e => setConfig('loja_telefone1', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><Phone size={11} /> Telefone 2</span></label>
                                            <input className={inputCls} placeholder="47 99999-9999"
                                                value={configs.loja_telefone2 ?? ''}
                                                onChange={e => setConfig('loja_telefone2', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><Mail size={11} /> Email SAC</span></label>
                                            <input type="email" className={inputCls} placeholder="sac@loja.com.br"
                                                value={configs.loja_email ?? ''}
                                                onChange={e => setConfig('loja_email', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><FileText size={11} /> CNPJ</span></label>
                                            <input className={inputCls} placeholder="00.000.000/0001-00"
                                                value={configs.loja_cnpj ?? ''}
                                                onChange={e => setConfig('loja_cnpj', e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </SectionCard>

                        <SectionCard title="Redes sociais">
                            {loadingConfig ? (
                                <div className="flex flex-col gap-4 animate-pulse">
                                    {[1,2,3,4].map(i => <div key={i} className="h-10 bg-gray-200 dark:bg-(--admin-border) rounded-xl" />)}
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><FaInstagram /> Instagram</span></label>
                                            <input className={inputCls} placeholder="https://instagram.com/..."
                                                value={configs.redes_instagram ?? ''}
                                                onChange={e => setConfig('redes_instagram', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><FaFacebook /> Facebook</span></label>
                                            <input className={inputCls} placeholder="https://facebook.com/..."
                                                value={configs.redes_facebook ?? ''}
                                                onChange={e => setConfig('redes_facebook', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><FaWhatsapp /> WhatsApp</span></label>
                                            <input className={inputCls} placeholder="https://wa.me/55..."
                                                value={configs.redes_whatsapp ?? ''}
                                                onChange={e => setConfig('redes_whatsapp', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className={labelCls}><span className="flex items-center gap-1"><FaYoutube /> YouTube</span></label>
                                            <input className={inputCls} placeholder="https://youtube.com/..."
                                                value={configs.redes_youtube ?? ''}
                                                onChange={e => setConfig('redes_youtube', e.target.value)} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </SectionCard>

                        {!loadingConfig && <SaveButton saving={saving} onClick={handleSave} />}
                    </>
                )}

                {/* ── Tab: Benefícios ─────────────────────────────────── */}
                {tab === 'beneficios' && (
                    <SectionCard title="Barra de benefícios">
                        <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) -mt-2">Exibida na página de produtos abaixo do carrossel.</p>
                        {loadingConfig ? (
                            <div className="flex flex-col gap-4 animate-pulse">
                                {[1,2,3,4].map(i => <div key={i} className="h-16 bg-gray-200 dark:bg-(--admin-border) rounded-xl" />)}
                            </div>
                        ) : (
                            <>
                                {[1,2,3,4].map(i => {
                                    const Icon = BENEFIT_ICONS[i - 1]
                                    return (
                                        <div key={i} className="flex items-start gap-4 p-4 border border-gray-100 dark:border-(--admin-border) rounded-xl">
                                            <div className="w-10 h-10 rounded-xl bg-verde-escuro/10 text-verde-escuro dark:bg-(--admin-accent-soft) dark:text-(--admin-accent) flex items-center justify-center shrink-0">
                                                <Icon size={18} />
                                            </div>
                                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                <div>
                                                    <label className={labelCls}>Título</label>
                                                    <input className={inputCls} placeholder="Ex: Frete Grátis"
                                                        value={configs[`beneficio_${i}_titulo`] ?? ''}
                                                        onChange={e => setConfig(`beneficio_${i}_titulo`, e.target.value)} />
                                                </div>
                                                <div>
                                                    <label className={labelCls}>Descrição</label>
                                                    <input className={inputCls} placeholder="Ex: Para todo o Brasil!"
                                                        value={configs[`beneficio_${i}_descricao`] ?? ''}
                                                        onChange={e => setConfig(`beneficio_${i}_descricao`, e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                                <SaveButton saving={saving} onClick={handleSave} />
                            </>
                        )}
                    </SectionCard>
                )}
            </div>

            {confirmId && (
                <ConfirmDialog
                    title="Remover banner?"
                    message="Esta imagem será removida do carrossel permanentemente."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}
        </main>
    )
}
