import { useState, useEffect, useRef } from 'react'
import AdminHeader from '../../components/admin/AdminHeader'
import ConfirmDialog from '../../components/ConfirmDialog'
import Toast from '../../components/Toast'
import { ImageIcon, Plus, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight, Upload } from 'lucide-react'
import { getBanners, createBanner, deleteBanner, reorderBanners, toggleBanner } from '../../lib/api/adminBanners'
import { uploadImage } from '../../lib/cloudinary'

function SkeletonCard() {
    return (
        <div className="bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-[16/6] bg-gray-200 dark:bg-(--admin-border)" />
            <div className="p-4 flex items-center justify-between">
                <div className="h-4 bg-gray-200 dark:bg-(--admin-border) rounded w-20" />
                <div className="h-6 bg-gray-200 dark:bg-(--admin-border) rounded-full w-16" />
            </div>
        </div>
    )
}

export default function AdminBanners() {
    const [banners, setBanners]     = useState([])
    const [loading, setLoading]     = useState(true)
    const [uploading, setUploading] = useState(false)
    const [toggling, setToggling]   = useState(null)
    const [confirmId, setConfirmId] = useState(null)
    const [toast, setToast]         = useState(null)
    const fileRef                   = useRef(null)

    function showToast(message, type = 'success') {
        setToast({ message, type })
    }

    async function load() {
        setLoading(true)
        try {
            const { data } = await getBanners()
            setBanners(data.banners ?? [])
        } catch {
            showToast('Erro ao carregar banners', 'error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

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
            await reorderBanners(reindexed.map(b => b.id))
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
            showToast('Erro ao reordenar banners', 'error')
            load()
        }
    }

    async function handleToggle(id) {
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

    const ativos   = banners.filter(b => b.ativo == 1 || b.ativo === true).length
    const inativos = banners.length - ativos

    return (
        <main>
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <AdminHeader title="Carrossel" description="Gerencie as imagens exibidas no carrossel da página inicial." />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                {[
                    { label: 'Total',    valor: banners.length, cor: 'text-gray-800 dark:text-(--admin-text)' },
                    { label: 'Ativos',   valor: ativos,         cor: 'text-green-600 dark:text-green-400'     },
                    { label: 'Inativos', valor: inativos,       cor: 'text-gray-400 dark:text-(--admin-text-muted)' },
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

            <div className="mt-5 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-2xl p-5">
                <div className="flex items-center justify-between mb-5">
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

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}
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
                                <div
                                    key={banner.id}
                                    className="border border-gray-200 dark:border-(--admin-border) rounded-2xl overflow-hidden"
                                >
                                    <div className="relative aspect-[16/6] bg-gray-100 dark:bg-(--admin-hover)">
                                        <img
                                            src={banner.foto_url}
                                            alt={`Banner ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
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
                                            <button
                                                onClick={() => handleMove(index, 'up')}
                                                disabled={index === 0}
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 dark:text-(--admin-text-muted) disabled:opacity-30 transition-all"
                                                title="Mover para cima"
                                            >
                                                <ChevronUp size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleMove(index, 'down')}
                                                disabled={index === banners.length - 1}
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) text-gray-400 dark:text-(--admin-text-muted) disabled:opacity-30 transition-all"
                                                title="Mover para baixo"
                                            >
                                                <ChevronDown size={16} />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => handleToggle(banner.id)}
                                            disabled={toggling === banner.id}
                                            className="flex items-center gap-1.5 text-xs font-medium transition-all disabled:opacity-50"
                                        >
                                            {ativo
                                                ? <><ToggleRight size={20} className="text-green-500" /><span className="text-green-600 dark:text-green-400">Ativo</span></>
                                                : <><ToggleLeft size={20} className="text-gray-300 dark:text-gray-600" /><span className="text-gray-400 dark:text-(--admin-text-muted)">Inativo</span></>
                                            }
                                        </button>

                                        <button
                                            onClick={() => setConfirmId(banner.id)}
                                            className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 transition-all"
                                            title="Remover"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>

            {confirmId && (
                <ConfirmDialog
                    title="Remover banner?"
                    message="Esta imagem será removida do carrossel. Esta ação não pode ser desfeita."
                    onConfirm={handleDelete}
                    onCancel={() => setConfirmId(null)}
                />
            )}
        </main>
    )
}
