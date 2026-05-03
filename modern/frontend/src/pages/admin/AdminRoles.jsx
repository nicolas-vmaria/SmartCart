import { useState } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import { Plus, Pencil, Trash2, X, Check, ShieldCheck, Shield, ChevronDown, ChevronUp, Users } from 'lucide-react'

const SECTIONS = [
    { key: 'dashboard',     label: 'Dashboard' },
    { key: 'clientes',      label: 'Clientes' },
    { key: 'produtos',      label: 'Produtos' },
    { key: 'pedidos',       label: 'Pedidos' },
    { key: 'categorias',    label: 'Categorias' },
    { key: 'papeis',        label: 'Papéis' },
    { key: 'usuarios',      label: 'Usuários' },
    { key: 'configuracoes', label: 'Configurações' },
]

const ACTIONS = [
    { key: 'ver',     label: 'Ver' },
    { key: 'criar',   label: 'Criar' },
    { key: 'editar',  label: 'Editar' },
    { key: 'excluir', label: 'Excluir' },
]

function emptyPerms() {
    return Object.fromEntries(SECTIONS.map(s => [s.key, { ver: false, criar: false, editar: false, excluir: false }]))
}

function fullPerms() {
    return Object.fromEntries(SECTIONS.map(s => [s.key, { ver: true, criar: true, editar: true, excluir: true }]))
}

const initialRoles = [
    {
        id: 1,
        name: 'Administrador',
        description: 'Acesso total ao sistema. Pode gerenciar todos os recursos e configurações.',
        color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300',
        users: 2,
        permissions: fullPerms(),
    },
    {
        id: 2,
        name: 'Gerente',
        description: 'Gerencia produtos, pedidos e clientes. Não acessa papéis nem configurações.',
        color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',
        users: 4,
        permissions: Object.fromEntries(SECTIONS.map(s => [
            s.key,
            s.key === 'papeis' || s.key === 'configuracoes' || s.key === 'usuarios'
                ? { ver: false, criar: false, editar: false, excluir: false }
                : { ver: true, criar: true, editar: true, excluir: s.key !== 'dashboard' }
        ])),
    },
    {
        id: 3,
        name: 'Funcionário',
        description: 'Visualiza e atualiza pedidos e produtos. Sem permissão para criar ou excluir.',
        color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/25 dark:text-yellow-300',
        users: 8,
        permissions: Object.fromEntries(SECTIONS.map(s => [
            s.key,
            { ver: ['dashboard', 'pedidos', 'produtos'].includes(s.key), criar: false, editar: s.key === 'pedidos', excluir: false }
        ])),
    },
]

function buildEmptyForm() {
    return { name: '', description: '', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-200', permissions: emptyPerms() }
}

const colorOptions = [
    { value: 'bg-purple-100 text-purple-700 dark:bg-purple-500/25 dark:text-purple-300', dot: 'bg-purple-400' },
    { value: 'bg-blue-100 text-blue-700 dark:bg-blue-500/25 dark:text-blue-300',     dot: 'bg-blue-400' },
    { value: 'bg-green-100 text-green-700 dark:bg-green-500/25 dark:text-green-300',   dot: 'bg-green-500' },
    { value: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/25 dark:text-yellow-300', dot: 'bg-yellow-400' },
    { value: 'bg-red-100 text-red-700 dark:bg-red-500/25 dark:text-red-300',       dot: 'bg-red-400' },
    { value: 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-200',     dot: 'bg-gray-400' },
]

function permCount(permissions) {
    return Object.values(permissions).reduce((acc, section) => acc + Object.values(section).filter(Boolean).length, 0)
}

export default function AdminRoles() {
    const [roles, setRoles] = useState(initialRoles)
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(buildEmptyForm())
    const [expanded, setExpanded] = useState(null)

    function openCreate() {
        setEditing(null)
        setForm(buildEmptyForm())
        setShowModal(true)
    }

    function openEdit(role) {
        setEditing(role.id)
        setForm({ name: role.name, description: role.description, color: role.color, permissions: JSON.parse(JSON.stringify(role.permissions)) })
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(buildEmptyForm())
    }

    function handleSubmit(e) {
        e.preventDefault()
        if (!form.name) return
        if (editing) {
            setRoles(prev => prev.map(r => r.id === editing ? { ...r, ...form } : r))
        } else {
            setRoles(prev => [...prev, { ...form, id: Date.now(), users: 0 }])
        }
        closeModal()
    }

    function deleteRole(id) {
        setRoles(prev => prev.filter(r => r.id !== id))
    }

    function togglePerm(section, action) {
        setForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [section]: { ...prev.permissions[section], [action]: !prev.permissions[section][action] }
            }
        }))
    }

    function toggleAllSection(section) {
        const allOn = ACTIONS.every(a => form.permissions[section][a.key])
        setForm(prev => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [section]: Object.fromEntries(ACTIONS.map(a => [a.key, !allOn]))
            }
        }))
    }

    function toggleAllPerms() {
        const total = permCount(form.permissions)
        const max = SECTIONS.length * ACTIONS.length
        setForm(prev => ({ ...prev, permissions: total === max ? emptyPerms() : fullPerms() }))
    }

    return (
        <main>
            <AdminHeader title="Papéis e Permissões" description="Defina os papéis do sistema e controle o que cada um pode acessar." />

            <div className="mt-5 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{roles.length} papel(is) cadastrado(s)</span>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                    <Plus size={15} />
                    Novo papel
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {roles.map(role => (
                    <div key={role.id} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 dark:text-(--admin-text-muted) shrink-0">
                                <Shield size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{role.name}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color}`}>{role.name}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) leading-relaxed">{role.description || 'Sem descrição.'}</p>
                                <div className="flex items-center gap-4 mt-2">
                                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-(--admin-text-muted)">
                                        <Users size={13} />
                                        {role.users} usuário(s)
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-gray-400 dark:text-(--admin-text-muted)">
                                        <ShieldCheck size={13} />
                                        {permCount(role.permissions)} permissão(ões) ativas
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => setExpanded(expanded === role.id ? null : role.id)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)"
                                    title="Ver permissões">
                                    {expanded === role.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                                </button>
                                <button onClick={() => openEdit(role)}
                                    className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-verde-escuro dark:hover:text-(--admin-accent)">
                                    <Pencil size={15} />
                                </button>
                                <button onClick={() => deleteRole(role.id)}
                                    className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {expanded === role.id && (
                            <div className="border-t border-gray-100 dark:border-(--admin-border) px-5 pb-5 pt-4">
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium mb-3 uppercase tracking-wide">Permissões detalhadas</p>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr>
                                                <th className="pb-2 text-left text-xs font-medium text-gray-400 dark:text-(--admin-text-muted) w-40">Seção</th>
                                                {ACTIONS.map(a => (
                                                    <th key={a.key} className="pb-2 text-center text-xs font-medium text-gray-400 dark:text-(--admin-text-muted) w-20">{a.label}</th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SECTIONS.map(s => (
                                                <tr key={s.key} className="border-t border-gray-50 dark:border-(--admin-border)">
                                                    <td className="py-2 text-xs font-medium text-gray-600 dark:text-(--admin-text)">{s.label}</td>
                                                    {ACTIONS.map(a => (
                                                        <td key={a.key} className="py-2 text-center">
                                                            {role.permissions[s.key][a.key]
                                                                ? <Check size={14} className="mx-auto text-verde-escuro dark:text-(--admin-accent)" />
                                                                : <X size={14} className="mx-auto text-gray-200 dark:text-(--admin-border)" />
                                                            }
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {roles.length === 0 && (
                    <div className="py-16 text-center text-gray-400 dark:text-(--admin-text-muted) bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border)">
                        Nenhum papel cadastrado.
                    </div>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-(--admin-card) rounded-2xl p-6 w-full max-w-2xl shadow-xl dark:shadow-black/40 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-verde-escuro dark:text-(--admin-accent) font-bold text-xl">
                                {editing ? 'Editar papel' : 'Novo papel'}
                            </h2>
                            <button onClick={closeModal} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-(--admin-hover) transition-all text-gray-400 dark:text-(--admin-text-muted)">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                            <div className="flex gap-3 items-end">
                                <div className="flex flex-col gap-1 flex-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Nome *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all"
                                        placeholder="Ex: Gerente, Funcionário..."
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Cor do badge</label>
                                    <div className="flex gap-2 h-9 items-center">
                                        {colorOptions.map(opt => (
                                            <button key={opt.value} type="button"
                                                onClick={() => setForm(prev => ({ ...prev, color: opt.value }))}
                                                className={`w-6 h-6 rounded-full transition-all ${opt.dot} ${form.color === opt.value ? 'ring-2 ring-offset-1 ring-gray-500 scale-110' : 'opacity-60 hover:opacity-100'}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {form.name && (
                                <div>
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Pré-visualização</label>
                                    <div className="mt-1">
                                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${form.color}`}>{form.name}</span>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Descrição</label>
                                <textarea
                                    value={form.description}
                                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                                    className="border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-lg px-3 py-2 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all resize-none"
                                    placeholder="Descreva o que este papel pode fazer..."
                                    rows={2}
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Permissões</label>
                                    <button type="button" onClick={toggleAllPerms}
                                        className="text-xs text-verde-escuro dark:text-(--admin-accent) hover:underline transition-all">
                                        {permCount(form.permissions) === SECTIONS.length * ACTIONS.length ? 'Remover todas' : 'Selecionar todas'}
                                    </button>
                                </div>

                                <div className="border border-gray-200 dark:border-(--admin-border) rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 dark:bg-(--admin-hover)">
                                            <tr>
                                                <th className="py-2 px-4 text-left text-xs font-medium text-gray-400 dark:text-(--admin-text-muted)">Seção</th>
                                                {ACTIONS.map(a => (
                                                    <th key={a.key} className="py-2 text-center text-xs font-medium text-gray-400 dark:text-(--admin-text-muted) w-20">{a.label}</th>
                                                ))}
                                                <th className="py-2 text-center text-xs font-medium text-gray-400 dark:text-(--admin-text-muted) w-16">Todos</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {SECTIONS.map((s, i) => {
                                                const allOn = ACTIONS.every(a => form.permissions[s.key][a.key])
                                                return (
                                                    <tr key={s.key} className={i % 2 !== 0 ? 'bg-gray-50/50 dark:bg-(--admin-hover)/30' : ''}>
                                                        <td className="py-2.5 px-4 text-xs font-medium text-gray-600 dark:text-(--admin-text)">{s.label}</td>
                                                        {ACTIONS.map(a => (
                                                            <td key={a.key} className="py-2.5 text-center">
                                                                <input type="checkbox"
                                                                    checked={form.permissions[s.key][a.key]}
                                                                    onChange={() => togglePerm(s.key, a.key)}
                                                                    className="cursor-pointer accent-green-700 w-4 h-4"
                                                                />
                                                            </td>
                                                        ))}
                                                        <td className="py-2.5 text-center">
                                                            <input type="checkbox"
                                                                checked={allOn}
                                                                onChange={() => toggleAllSection(s.key)}
                                                                className="cursor-pointer accent-green-700 w-4 h-4"
                                                            />
                                                        </td>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-1">
                                <button type="button" onClick={closeModal}
                                    className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-(--admin-border) text-sm text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover) transition-all">
                                    Cancelar
                                </button>
                                <button type="submit"
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                                    <Check size={15} />
                                    {editing ? 'Salvar' : 'Criar papel'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </main>
    )
}
