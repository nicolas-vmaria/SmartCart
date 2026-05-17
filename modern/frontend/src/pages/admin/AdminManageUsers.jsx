import { useState, useRef, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Search, Trash2, Pencil, X, UserPlus, SlidersHorizontal, Check, Shield, KeyRound } from 'lucide-react'

const initialUsers = [
    { id: 1, name: 'Ciclano da Silva', email: 'ciclano@smartcart.com', role: 'Administrador', roleColor: 'bg-purple-100 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300', status: 'Ativo', createdAt: '10/01/2025' },
    { id: 2, name: 'João Gerente',     email: 'joao@smartcart.com',    role: 'Gerente',       roleColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',   status: 'Ativo', createdAt: '15/02/2025' },
    { id: 3, name: 'Ana Paula',        email: 'ana@smartcart.com',     role: 'Funcionário',   roleColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/25 dark:text-yellow-300', status: 'Ativo', createdAt: '03/03/2025' },
    { id: 4, name: 'Carlos Souza',     email: 'carlos@smartcart.com',  role: 'Funcionário',   roleColor: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/25 dark:text-yellow-300', status: 'Inativo', createdAt: '20/04/2025' },
    { id: 5, name: 'Marina Costa',    email: 'marina@smartcart.com',  role: 'Gerente',       roleColor: 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',   status: 'Ativo', createdAt: '01/05/2025' },
]



const statusStyle = { 'Ativo': 'bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300', 'Inativo': 'bg-red-100 text-red-700 dark:bg-red-500/25 dark:text-red-300' }

const emptyForm = { name: '', email: '', role: 'Funcionário', status: 'Ativo' }

export default function AdminManageUsers() {
    const [users, setUsers] = useState(initialUsers)
    const [search, setSearch] = useState('')
    const [selected, setSelected] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [showFilters, setShowFilters] = useState(false)
    const [form, setForm] = useState(emptyForm)
    const [editing, setEditing] = useState(null)
    const [filters, setFilters] = useState({ role: 'Todos', status: 'Todos' })
    const [resetTarget, setResetTarget] = useState(null)
    const [resetDone, setResetDone] = useState(false)
    const filterRef = useRef(null)

    useEffect(() => {
        function handleClickOutside(e) {
            if (filterRef.current && !filterRef.current.contains(e.target)) setShowFilters(false)
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const activeFiltersCount = [filters.role !== 'Todos', filters.status !== 'Todos'].filter(Boolean).length

    const filtered = users.filter(u => {
        const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
        const matchRole = filters.role === 'Todos' || u.role === filters.role
        const matchStatus = filters.status === 'Todos' || u.status === filters.status
        return matchSearch && matchRole && matchStatus
    })

    const allSelected = filtered.length > 0 && filtered.every(u => selected.includes(u.id))

    function toggleOne(id) {
        setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])
    }

    function toggleAll() {
        if (allSelected) setSelected(prev => prev.filter(id => !filtered.map(u => u.id).includes(id)))
        else setSelected(prev => [...new Set([...prev, ...filtered.map(u => u.id)])])
    }

    function deleteSelected() {
        setUsers(prev => prev.filter(u => !selected.includes(u.id)))
        setSelected([])
    }

    function openCreate() {
        setEditing(null)
        setForm(emptyForm)
        setShowModal(true)
    }

    function openEdit(user) {
        setEditing(user.id)
        setForm({ name: user.name, email: user.email, role: user.role, status: user.status })
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

    function handleReset() {
        setResetDone(true)
        setTimeout(closeReset, 1500)
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(emptyForm)
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.name || !form.email) return
        if (editing) {
            setUsers(prev => prev.map(u => u.id === editing ? { ...u, ...form, roleColor: roleColors[form.role] } : u))
        } else {
            
        }
        closeModal()
    }

    return (
        <main>
            <AdminHeader title="Gerenciar Usuários" description="Controle quem tem acesso ao painel administrativo e seus papéis." />

            <div className="mt-5 bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5">
                <div className="flex items-center gap-3 mb-5">
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
                                    {['Todos', ...roles].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, role: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.role === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium">Status</label>
                                    {['Todos', 'Ativo', 'Inativo'].map(opt => (
                                        <button key={opt} onClick={() => setFilters(prev => ({ ...prev, status: opt }))}
                                            className={`text-left text-sm px-2 py-1 rounded-md transition-all ${filters.status === opt ? 'bg-green-50 text-verde-escuro font-medium' : 'text-gray-600 dark:text-(--admin-text) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'}`}>
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {activeFiltersCount > 0 && (
                                    <button onClick={() => setFilters({ role: 'Todos', status: 'Todos' })} className="text-xs text-red-400 hover:text-red-500 text-left transition-all">
                                        Limpar filtros
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {selected.length > 0 && (
                        <button onClick={deleteSelected}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-950/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-all">
                            <Trash2 size={15} />
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

                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-left text-gray-400 dark:text-(--admin-text-muted) border-b border-gray-100 dark:border-(--admin-border)">
                            <th className="pb-3 pr-3">
                                <input type="checkbox" checked={allSelected} onChange={toggleAll} className="cursor-pointer" />
                            </th>
                            <th className="pb-3 font-medium">Nome</th>
                            <th className="pb-3 font-medium">Email</th>
                            <th className="pb-3 font-medium">Papel</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Criado em</th>
                            <th className="pb-3 font-medium">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map(user => (
                            <tr key={user.id} className={`border-b border-gray-50 dark:border-(--admin-border) last:border-0 ${selected.includes(user.id) ? 'bg-gray-50 dark:bg-(--admin-hover)' : ''}`}>
                                <td className="py-3 pr-3">
                                    <input type="checkbox" checked={selected.includes(user.id)} onChange={() => toggleOne(user.id)} className="cursor-pointer" />
                                </td>
                                <td className="py-3 font-medium text-verde-escuro dark:text-(--admin-accent)">{user.name}</td>
                                <td className="py-3 text-gray-500 dark:text-(--admin-text-muted)">{user.email}</td>
                                <td className="py-3">
                                    <span className={`flex items-center gap-1 w-fit px-2 py-1 rounded-full text-xs font-medium ${user.roleColor}`}>
                                        <Shield size={11} />
                                        {user.role}
                                    </span>
                                </td>
                                <td className="py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyle[user.status]}`}>
                                        {user.status}
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
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && (
                            <tr>
                                <td colSpan={7} className="py-8 text-center text-gray-400 dark:text-(--admin-text-muted)">Nenhum usuário encontrado.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {resetTarget && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-sm shadow-xl dark:shadow-black/40">
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
                                    <span className="font-mono text-sm text-gray-700 dark:text-(--admin-text) tracking-widest">admin@1234</span>
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
                                    <button onClick={handleReset}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all">
                                        <KeyRound size={14} />
                                        Confirmar reset
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-md shadow-xl dark:shadow-black/40">
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
                                    placeholder="Nome completo" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Email *</label>
                                <input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                    placeholder="email@smartcart.com" />
                            </div>
                            <div className="flex gap-3">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Papel</label>
                                    <select value={form.role} onChange={e => setForm(prev => ({ ...prev, role: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all">
                                        {roles.map(r => <option key={r}>{r}</option>)}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Status</label>
                                    <select value={form.status} onChange={e => setForm(prev => ({ ...prev, status: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all">
                                        <option>Ativo</option>
                                        <option>Inativo</option>
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-2">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                                    <Check size={15} />
                                    {editing ? 'Salvar' : 'Criar usuário'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
