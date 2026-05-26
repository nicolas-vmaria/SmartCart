import { useState } from 'react'
import { useAdminData } from '../../hooks/useAdminData'
import AdminHeader from "../../components/admin/AdminHeader"
import { Plus, Pencil, Trash2, X, Check, Tag } from 'lucide-react'
import { createCategory, getAdminCategories, deleteCategory as deleteCategoryApi, editCategory as editCategoryApi } from '../../lib/api/adminCategories'
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'



const emptyForm = { nome: '', descricao: '' }

export default function AdminCategories() {
    const { data: categories, loading, setData: setCategories, refetch: fetchCategories, setLoading } = useAdminData(
        'admin_categories',
        async () => { const { data } = await getAdminCategories(); return data }
    )
    const [showModal, setShowModal] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editing, setEditing] = useState(null)
    const [toast, setToast] = useState('')
    const [confirmId, setConfirmId] = useState(null)
    const [submitting, setSubmitting] = useState(false)

    function openCreate() {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    function openEdit(category) {
        setEditing(category.id)
        setForm({ nome: category.nome, descricao: category.descricao })
        setShowModal(true)
    }


    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.nome) return

        setSubmitting(true)
        try {
            if (editing) {
                await editCategoryApi(editing, form)
                setToast({message: 'Categoria editada', type: 'success'})
            } else {
                const { data } = await createCategory(form.nome, form.descricao)
                setToast({message: data.message, type: 'success'})
            }
            setForm(emptyForm)
            setShowModal(false)
            setEditing(null)
            fetchCategories()
        } catch(err){
            setToast({message: err.response?.data?.error || 'Erro ao conectar com o servidor', type: 'error'})
        } finally {
            setSubmitting(false)
        }
    }

    async function deleteCategory(id) {
        setLoading(true)
        try{
            await deleteCategoryApi(id)
            setToast({message: "Categoria removida com sucesso.", type: "success"})
            fetchCategories()
        } catch(err){
            setLoading(false)
            setToast({message: err.response?.data?.error || "Erro ao conectar ao servidor", type: "error"})
        }
    }

    return (
        <main>
            <AdminHeader title="Categorias" description="Crie, edite e organize as categorias de produtos." />

            <div className="mt-5 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{categories.length} categoria(s)</span>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                    <Plus size={15} />
                    Nova categoria
                </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5 flex flex-col gap-3 animate-pulse">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-(--admin-hover)" />
                            <div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded w-28" />
                        </div>
                        <div className="space-y-2">
                            <div className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded w-full" />
                            <div className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded w-3/4" />
                        </div>
                        <div className="h-3 bg-gray-200 dark:bg-(--admin-hover) rounded w-20" />
                    </div>
                ))}
                {!loading && categories.map(category => (
                    <div key={category.id} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5 flex flex-col gap-3">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-(--admin-hover) flex items-center justify-center text-verde-escuro dark:text-(--admin-accent)">
                                    <Tag size={16} />
                                </div>
                                <h3 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-lg">{category.nome}</h3>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(category)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => setConfirmId(category.id)}
                                    className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) leading-relaxed">{category.descricao || 'Sem descrição.'}</p>

                        <span className="text-xs text-gray-400 dark:text-(--admin-text-muted)">{category.total_produtos ?? 0} produto(s)</span>
                    </div>
                ))}

                {!loading && categories.length === 0 && (
                    <div className="col-span-3 py-16 text-center text-gray-400 dark:text-(--admin-text-muted)">
                        Nenhuma categoria cadastrada.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">
                                {editing ? 'Editar categoria' : 'Nova categoria'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Nome *</label>
                                <input
                                    type="text"
                                    value={form.nome}
                                    onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="Nome da categoria"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Descrição</label>
                                <textarea
                                    value={form.descricao}
                                    onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all resize-none"
                                    placeholder="Descrição da categoria"
                                    rows={3}
                                />
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={submitting}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                                    {submitting
                                        ? <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        : <Check size={15} />
                                    }
                                    {submitting ? 'Salvando...' : editing ? 'Salvar' : 'Criar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {confirmId && (
                <ConfirmDialog
                    title="Excluir categoria"
                    message="Todos os produtos desta categoria também serão removidos. Deseja continuar?"
                    confirmLabel="Excluir"
                    onConfirm={() => { deleteCategory(confirmId); setConfirmId(null) }}
                    onCancel={() => setConfirmId(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(false)}/>}
        </main>
    )
}
