import { useState, useRef, useEffect } from 'react'
import { useAdminData } from '../../hooks/useAdminData'
import AdminHeader from "../../components/admin/AdminHeader"
import Toast from '../../components/Toast'
import { Loader2, Search, Trash2, Pencil, X, UserPlus, SlidersHorizontal, Check, Shield, KeyRound, AlertTriangle } from 'lucide-react'
import { getUsers, createUser, updateUser, deleteUser, resetUserPassword } from '../../lib/api/users'
import { getRoles } from '../../lib/api/roles'
import { formatDate } from '../../lib/date'

const DEFAULT_BADGE = 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-200'

const emptyForm = { name: '', email: '', tel: '', papel_id: '' }

function maskPhone(val) {
    const d = (val || '').replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

function mapUser(u) {
    return {
        id: u.id,
        name: u.nome,
        email: u.email,
        tel: maskPhone(u.tel || ''),
        role: u.nome_papel,
        createdAt: formatDate(u.created_at ?? ''),
    }
}

export default function AdminManageUsers() {
    const { data: users, loading, setData: setUsers } = useAdminData(
        'admin_users',
        async () => { const { data } = await getUsers(); return (data.usuarios || []).map(mapUser) }
    )
    const { data: roles, setData: setRoles } = useAdminData(
        'admin_roles_list',
        async () => { const { data } = await getRoles(); return data.roles.filter(r => r.nome_papel.toLowerCase() !== 'cliente') }
    )
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editing, setEditing] = useState(null)
    const [filters, setFilters] = useState({ role: 'Todos' })
    const [resetTarget, setResetTarget] = useState(null)
    const [resetLoading, setResetLoading] = useState(false)
    const [resetDone, setResetDone] = useState(false)
    const [deleteTarget, setDeleteTarget] = useState(null)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [toast, setToast] = useState(null)
    const [saving, setSaving] = useState(false)
    const [deletingIds, setDeletingIds] = useState([])
    const filterRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])


    const roleColorMap = Object.fromEntries(roles.map(r => [r.nome_papel, (r.badge && r.badge.startsWith('bg-')) ? r.badge : DEFAULT_BADGE]))

    const activeFiltersCount = [filters.role !== 'Todos'].filter(Boolean).length

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = filters.role === 'Todos' || u.role === filters.role
        return matchSearch && matchRole
    })

    const allSelected = filtered.length > 0 && filtered.every(u => selected.includes(u.id))

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    function toggleAll() {
        if (allSelected) setSelected(prev => prev.filter(id => !filtered.map(u => u.id).includes(id)))
        else setSelected(prev => [...new Set([...prev, ...filtered.map(u => u.id)])])
    }

    async function confirmDelete() {
        setDeleteLoading(true)
        try {
            await deleteUser(deleteTarget.id)
            setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
            setSelected(prev => prev.filter(id => id !== deleteTarget.id))
            setToast({ message: 'Usuário removido com sucesso', type: 'success' })
            setDeleteTarget(null)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao remover usuário', type: 'error' })
        } finally {
            setDeleteLoading(false)
        }
    }

    async function deleteSelected() {
        const ids = [...selected]
        setDeletingIds(ids)
        try {
            await Promise.all(ids.map(id => deleteUser(id)))
            setUsers(prev => prev.filter(u => !ids.includes(u.id)))
            setToast({ message: `${ids.length} usuário(s) removido(s)`, type: 'success' })
            setSelected([])
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao remover usuários', type: 'error' })
        } finally {
            setDeletingIds([])
        }
    }

    function openCreate() {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    function openEdit(user) {
        setEditing(user.id)
        const role = roles.find(r => r.nome_papel === user.role)
        setForm({ name: user.name, email: user.email, tel: user.tel, papel_id: role?.id || '' })
        setShowModal(true)
    }

    function openReset(user) {
        setResetTarget(user)
        setResetDone(false)
    }

    function closeReset() {
        setResetTarget(null)
        setResetDone(false)
    }

    async function handleReset() {
        setResetLoading(true)
        try {
            await resetUserPassword(resetTarget.id)
            setResetDone(true)
            setTimeout(closeReset, 1500)
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao resetar senha', type: 'error' })
            closeReset()
        } finally {
            setResetLoading(false)
        }
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(emptyForm)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        setSaving(true)
        try {
            if (editing) {
                await updateUser(editing, { nome: form.name, email: form.email, tel: form.tel.replace(/\D/g, ''), papel_id: Number(form.papel_id) })
                const role = roles.find(r => r.id === Number(form.papel_id))
                setUsers(prev => prev.map(u => u.id === editing
                    ? { ...u, name: form.name, email: form.email, tel: maskPhone(form.tel), role: role?.nome_papel || u.role }
                    : u
                ))
                setToast({ message: 'Usuário atualizado com sucesso', type: 'success' })
            } else {
                const { data } = await createUser({
                    nome:     form.name,
                    email:    form.email,
                    senha:    'Smartcart$123',
                    tel:      form.tel.replace(/\D/g, ''),
                    papel_id: Number(form.papel_id),
                })
                const role = roles.find(r => r.id === Number(form.papel_id))
                setUsers(prev => [
                    ...prev,
                    {
                        id:        data.usuario.id,
                        name:      data.usuario.nome,
                        email:     data.usuario.email,
                        tel:       maskPhone(form.tel),
                        role:      role?.nome_papel || '',
                        createdAt: new Date().toLocaleDateString('pt-BR'),
                    },
                ])
                setToast({ message: 'Usuário criado com sucesso', type: 'success' })
            }
            closeModal()
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar usuário', type: 'error' })
        } finally {
            setSaving(false)
        }
    }

    return (
        <main>
            <AdminHeader title="Gerenciar Usuários" description="Controle quem tem acesso ao painel administrativo e seus papéis." />

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex flex-wrap items-center gap-3 mb-5">
                    <div className="flex items-center gap-2 border border-gray-200 dark:border-(--admin-border) rounded-lg px-3 py-2 w-full max-w-sm">
                        <Search size={16} className="text-gray-400 dark:text-(--admin-text-muted)" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email..."
                            className="outline-none dark:bg-(--admin-card) dark:text-(--admin-text) text-sm w-full"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div className="relative" ref={filterRef}>
                        <button
                            onClick={() => setShowFilters(prev => !prev)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${activeFiltersCount > 0 ? 'border-verde-escuro text-verde-escuro bg-green-50' : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                            <SlidersHorizontal size={15} />
                            Filtros
                            {activeFiltersCount > 0 && (
                                <span className="bg-verde-escuro text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">{activeFiltersCount}</span>
                            )}
                        </button>

                        {showFilters && (
                            <div className="absolute top-11 left-0 bg-white dark:bg-(--admin-card) border border-gray-200 dark:border-(--admin-border) rounded-xl shadow-lg dark:shadow-black/40 p-4 z-20 w-48 flex flex-col gap-4">
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Papel</label>
                                    {['Todos', ...roles.map(r => r.nome_papel)].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, role: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.role === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button onClick={() => setFilters({ role: 'Todos' })} className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button
                            onClick={deleteSelected}
                            disabled={deletingIds.length > 0}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all disabled:opacity-60">
                            {deletingIds.length > 0 ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                            Excluir {selected.length} selecionado(s)
                        </button>
                    )}

                    <button onClick={openCreate}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all ml-auto">
                        <UserPlus size={15} />
                        Novo usuário
                    </button>

                    <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{filtered.length} usuário(s)</span>
                </div>

                <div className="overflow-x-auto -mx-5 px-5">
                <table className="w-full min-w-160 text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Telefone</th>
                            <th className="pb-3 font-medium">Papel</th>
                            <th className="pb-3 font-medium">Criado em</th>
                            <th className="pb-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading && users.length === 0 && Array.from({ length: 8 }).map((_, i) => (
                            <tr key={i} className="border-b border-gray-50 dark:border-(--admin-border) animate-pulse">
                                <td className="py-3 pr-3"><div className="w-4 h-4 bg-gray-200 dark:bg-(--admin-hover) rounded" /></td>
                                <td className="py-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-32" /></td>
                                <td className="py-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-40" /></td>
                                <td className="py-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-28" /></td>
                                <td className="py-3"><div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded-full w-20" /></td>
                                <td className="py-3"><div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-20" /></td>
                                <td className="py-3 flex gap-1">
                                    <div className="w-6 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-md" />
                                    <div className="w-6 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-md" />
                                    <div className="w-6 h-6 bg-gray-200 dark:bg-(--admin-hover) rounded-md" />
                                </td>
                            </tr>
                        ))}
                        {!loading && filtered.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum usuário encontrado.</td>
                            </tr>
                        ) : filtered.map(user => (
                            <tr key={user.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 ${selected.includes(user.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleOne(user.id)} className="cursor-pointer" />
                                </td>
                                <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{user.name}</td>
                                <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{user.email}</td>
                                <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{user.tel || '—'}</td>
                                <td className="py-3">
                                    <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${roleColorMap[user.role] || 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-300'}`}>
                                        <Shield size={11} />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3 text-gray-400 dark:text-(--admin-text-muted)">{user.createdAt}</td>
                                <td className="py-3 flex items-center gap-1">
                                    <button onClick={() => openEdit(user)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)" title="Editar usuário">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => openReset(user)} className="p-1.5 rounded-md hover:bg-orange-50 dark:hover:bg-orange-950/30 cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-orange-500 dark:hover:text-orange-400" title="Resetar senha">
                                        <KeyRound size={15} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-all text-gray-500 dark:text-(--admin-text-muted) hover:text-red-500 dark:hover:text-red-400" title="Remover usuário">
                                        <Trash2 size={15} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                </div>
            </div>

            {deleteTarget && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-sm shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-red-500 font-bold text-xl flex items-center gap-2"><AlertTriangle size={20} /> Remover usuário</h2>
                            <button onClick={() => setDeleteTarget(null)} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) mb-5">
                            Tem certeza que deseja remover <span className="font-semibold text-gray-700 dark:text-(--admin-text)">{deleteTarget.name}</span>? Esta ação não pode ser desfeita.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setDeleteTarget(null)}
                                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                Cancelar
                            </button>
                            <button onClick={confirmDelete} disabled={deleteLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                {deleteLoading ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                Remover
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {resetTarget && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-sm shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">Resetar senha</h2>
                            <button onClick={closeReset} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        {resetDone ? (
                            <div className="flex items-center justify-center gap-2 py-4 text-verde-escuro dark:text-(--admin-accent) font-medium">
                                <Check size={18} /> Senha redefinida com sucesso!
                            </div>
                        ) : (
                            <>
                                <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) mb-2">
                                    A senha de <span className="font-semibold text-gray-700 dark:text-(--admin-text)">{resetTarget.name}</span> será redefinida para a senha padrão:
                                </p>
                                <div className="bg-gray-50 dark:bg-(--admin-hover) border border-gray-200 dark:border-(--admin-border) rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
                                    <span className="font-mono text-sm text-gray-700 dark:text-(--admin-text) tracking-widest">admin123</span>
                                    <KeyRound size={14} className="text-gray-400 dark:text-(--admin-text-muted)" />
                                </div>
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) mb-5">
                                    O usuário deverá alterar a senha no primeiro acesso.
                                </p>
                                <div className="flex gap-3">
                                    <button onClick={closeReset}
                                        className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                        Cancelar
                                    </button>
                                    <button onClick={handleReset} disabled={resetLoading}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                        {resetLoading ? <Loader2 size={14} className="animate-spin" /> : <KeyRound size={14} />}
                                        Confirmar reset
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">{editing ? 'Editar usuário' : 'Novo usuário'}</h2>
                            <button onClick={closeModal} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Nome *</label>
                                <input type="text" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="Nome completo" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="email@smartcart.com" required />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Telefone</label>
                                <input type="text" value={form.tel} onChange={e => setForm(prev => ({ ...prev, tel: maskPhone(e.target.value) }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="(11) 99999-9999" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Papel *</label>
                                <select value={form.papel_id} onChange={e => setForm(prev => ({ ...prev, papel_id: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    required>
                                    <option value="">Selecione um papel</option>
                                    {roles.map(r => <option key={r.id} value={r.id}>{r.nome_papel}</option>)}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit" disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                    {editing ? 'Salvar' : 'Criar usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
