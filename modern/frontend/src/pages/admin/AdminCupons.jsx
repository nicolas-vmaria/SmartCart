import { useState } from 'react'
import { useAdminData } from '../../hooks/useAdminData'
import AdminHeader from "../../components/admin/AdminHeader"
import Toast from '../../components/Toast'
import { Plus, Pencil, Trash2, X, Check, Ticket, Loader2 } from 'lucide-react'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon } from '../../lib/api/coupons'

const emptyForm = { code: '', type: 'percent', value: '', expiry: '', maxUses: '', active: true }

function mapCoupon(c) {
    return {
        id: c.id,
        code: c.codigo,
        type: c.tipo_desconto === 'percentual' ? 'percent' : 'fixed',
        value: parseFloat(c.desconto),
        expiry: c.data_validade,
        maxUses: !c.max_usos ? null : parseInt(c.max_usos),
        uses: parseInt(c.quant_usos ?? 0),
        active: c.ativo == 1,
    }
}

function toApiBody(form, uses = 0) {
    return {
        codigo: form.code.toUpperCase().trim(),
        tipo_desconto: form.type === 'percent' ? 'percentual' : 'fixo',
        desconto: parseFloat(form.value),
        data_validade: form.expiry,
        ativo: form.active ? '1' : '0',
        quant_usos: uses,
        max_usos: form.maxUses !== '' && form.maxUses !== null ? parseInt(form.maxUses) : 0,
    }
}

function inputClass() {
    return "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
}

export default function AdminCupons() {
    const { data: cupons, loading, setData: setCupons } = useAdminData(
        'admin_cupons',
        async () => { const { data } = await getCoupons(); return (data.coupons ?? []).map(mapCoupon) }
    )
    const [saving, setSaving] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editing, setEditing] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [toast, setToast] = useState(null)


    function openCreate() {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    function openEdit(cupon) {
        setEditing(cupon.id)
        setForm({
            code: cupon.code,
            type: cupon.type,
            value: cupon.value,
            expiry: cupon.expiry,
            maxUses: cupon.maxUses ?? '',
            active: cupon.active,
        })
        setShowModal(true)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.code || !form.value || !form.expiry) return
        setSaving(true)
        try {
            if (editing) {
                const current = cupons.find(c => c.id === editing)
                await updateCoupon(editing, toApiBody(form, current?.uses ?? 0))
                setCupons(prev => prev.map(c => c.id === editing
                    ? { ...c, ...form, code: form.code.toUpperCase().trim(), value: parseFloat(form.value), maxUses: form.maxUses !== '' ? parseInt(form.maxUses) : null }
                    : c
                ))
                setToast({ message: 'Cupom atualizado com sucesso', type: 'success' })
            } else {
                const { data } = await createCoupon(toApiBody(form, 0))
                setCupons(prev => [...prev, mapCoupon(data.coupon)])
                setToast({ message: 'Cupom criado com sucesso', type: 'success' })
            }
            setShowModal(false)
            setEditing(null)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar cupom', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    async function toggleActive(cupon) {
        const toggled = !cupon.active
        setCupons(prev => prev.map(c => c.id === cupon.id ? { ...c, active: toggled } : c))
        try {
            await updateCoupon(cupon.id, toApiBody({ ...cupon, active: toggled }, cupon.uses))
        } catch (err) {
            setCupons(prev => prev.map(c => c.id === cupon.id ? cupon : c))
            setToast({ message: err.response?.data?.error || 'Erro ao atualizar cupom', type: 'error' })
        }
    }

    async function handleDelete(id) {
        setDeletingId(id)
        try {
            await deleteCoupon(id)
            setCupons(prev => prev.filter(c => c.id !== id))
            setToast({ message: 'Cupom excluído com sucesso', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao excluir cupom', type: 'error' })
        } finally {
            setDeletingId(null)
            setDeleteConfirm(null)
        }
    }

    function isExpired(expiry) {
        return expiry && new Date(expiry) < new Date()
    }

    function formatDiscount(cupon) {
        return cupon.type === 'percent' ? `${cupon.value}%` : `R$ ${cupon.value.toFixed(2)}`
    }

    function formatExpiry(expiry) {
        if (!expiry) return 'Sem validade'
        const [y, m, d] = expiry.split('-')
        return `${d}/${m}/${y}`
    }

    return (
        <main>
            <AdminHeader title="Cupons" description="Cadastre cupons e atribua descontos." />

            <div className="mt-5 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{cupons.length} cupom(ns)</span>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                    <Plus size={15} />
                    Novo cupom
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5 flex flex-col gap-3 animate-pulse">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-(--admin-hover)" />
                                <div className="flex flex-col gap-1.5">
                                    <div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded w-24" />
                                    <div className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded w-12" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="w-10 h-5 bg-gray-200 dark:bg-(--admin-hover) rounded-full" />
                                <div className="w-6 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-md" />
                                <div className="w-6 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-md" />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded-full w-14" />
                            <div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded-full w-28" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded w-32" />
                    </div>
                ))}
                {!loading && cupons.map(cupon => {
                        const expired = isExpired(cupon.expiry)
                        const exhausted = cupon.maxUses !== null && cupon.uses >= cupon.maxUses
                        return (
                            <div key={cupon.id} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5 flex flex-col gap-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-(--admin-hover) flex items-center justify-center text-verde-escuro dark:text-(--admin-accent)">
                                            <Ticket size={16} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-lg tracking-wide">{cupon.code}</h3>
                                            <span className="text-xs font-semibold text-green-600 dark:text-green-400">{formatDiscount(cupon)}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 items-center">
                                        <button
                                            onClick={() => toggleActive(cupon)}
                                            title={cupon.active ? 'Desativar' : 'Ativar'}
                                            className={`relative w-10 h-5 rounded-full transition-colors duration-300 focus:outline-none shrink-0 ${cupon.active ? 'bg-verde-escuro dark:bg-(--admin-accent)' : 'bg-gray-300 dark:bg-(--admin-border)'}`}>
                                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ${cupon.active ? 'translate-x-5' : 'translate-x-0'}`} />
                                        </button>
                                        <button onClick={() => openEdit(cupon)}
                                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                            <Pencil size={15} />
                                        </button>
                                        <button onClick={() => setDeleteConfirm(cupon.id)}
                                            className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 text-xs">
                                    <span className={`px-2 py-0.5 rounded-full font-medium ${cupon.active && !expired && !exhausted ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-(--admin-hover) dark:text-(--admin-text-muted)'}`}>
                                        {!cupon.active ? 'Inativo' : expired ? 'Expirado' : exhausted ? 'Esgotado' : 'Ativo'}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full ${expired ? 'bg-red-100 text-red-500 dark:bg-red-900/30' : 'bg-gray-100 text-gray-500 dark:bg-(--admin-hover) dark:text-(--admin-text-muted)'}`}>
                                        Válido até {formatExpiry(cupon.expiry)}
                                    </span>
                                </div>

                                <div className="text-xs text-gray-400 dark:text-(--admin-text-muted)">
                                    {cupon.uses} uso(s){cupon.maxUses !== null ? ` / ${cupon.maxUses} máx.` : ' (ilimitado)'}
                                </div>
                            </div>
                        )
                    })}

                {!loading && cupons.length === 0 && (
                    <div className="col-span-3 py-16 text-center text-gray-400 dark:text-(--admin-text-muted)">
                        Nenhum cupom cadastrado.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">
                                {editing ? 'Editar cupom' : 'Novo cupom'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Código *</label>
                                <input
                                    type="text"
                                    value={form.code}
                                    onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))}
                                    className={inputClass()}
                                    placeholder="Ex: PROMO10"
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Tipo *</label>
                                    <select
                                        value={form.type}
                                        onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                                        className={inputClass()}>
                                        <option value="percent">Porcentagem (%)</option>
                                        <option value="fixed">Valor fixo (R$)</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">
                                        {form.type === 'percent' ? 'Desconto (%) *' : 'Desconto (R$) *'}
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max={form.type === 'percent' ? 100 : undefined}
                                        step="0.01"
                                        value={form.value}
                                        onChange={e => setForm(prev => ({ ...prev, value: e.target.value }))}
                                        className={inputClass()}
                                        placeholder={form.type === 'percent' ? '10' : '20.00'}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Validade *</label>
                                    <input
                                        type="date"
                                        value={form.expiry}
                                        onChange={e => setForm(prev => ({ ...prev, expiry: e.target.value }))}
                                        className={inputClass()}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Usos máximos</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={form.maxUses}
                                        onChange={e => setForm(prev => ({ ...prev, maxUses: e.target.value }))}
                                        className={inputClass()}
                                        placeholder="Ilimitado"
                                    />
                                </div>
                            </div>

                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.active}
                                    onChange={e => setForm(prev => ({ ...prev, active: e.target.checked }))}
                                    className="accent-verde-escuro w-4 h-4"
                                />
                                <span className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Cupom ativo</span>
                            </label>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                    {editing ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-sm shadow-xl dark:shadow-black/40 flex flex-col gap-4">
                        <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">Excluir cupom</h2>
                        <p className="text-sm text-gray-500 dark:text-(--admin-text-muted)">
                            Tem certeza que deseja excluir este cupom? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                Cancelar
                            </button>
                            <button onClick={() => handleDelete(deleteConfirm)} disabled={!!deletingId}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                {deletingId ? <Loader2 size={15} className="animate-spin" /> : null}
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
