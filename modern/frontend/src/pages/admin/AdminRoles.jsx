import { useState } from 'react'
import { useAdminData } from '../../hooks/useAdminData'
import AdminHeader from "../../components/admin/AdminHeader"
import Toast from '../../components/Toast'
import ConfirmDialog from '../../components/ConfirmDialog'
import { Plus, Pencil, Trash2, X, Check, ShieldCheck, Shield, ChevronDown, ChevronUp, Users } from 'lucide-react'
import { createRole, getRoles as getRolesApi, updateRole } from '../../lib/api/roles'

const SECTIONS = [
    { key: 'dashboard',     label: 'Dashboard' },
    { key: 'clientes',      label: 'Clientes' },
    { key: 'produtos',      label: 'Produtos' },
    { key: 'pedidos',       label: 'Pedidos' },
    { key: 'categorias',    label: 'Categorias' },
    { key: 'papeis',        label: 'Papéis' },
    { key: 'curriculos',    label: 'Currículos'},
    { key: 'trabalhos',    label: 'Vagas' },
    { key: 'cupons',        label: 'Cupons' },
    { key: 'relatorios',    label: 'Relatórios' },
    { key: 'customizacao',  label: 'Customização' },
    { key: 'marketing',     label: 'Marketing' },
    { key: 'usuarios',      label: 'Usuários' },
    { key: 'configuracoes', label: 'Configurações' },
]

function emptyPerms() {
    return Object.fromEntries(SECTIONS.map(s => [s.key, false]))
}

function fullPerms() {
    return Object.fromEntries(SECTIONS.map(s => [s.key, true]))
}



function buildEmptyForm() {
    return { nome_papel: '', descricao: '', color: 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-200', permissions: emptyPerms() }
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
    if (!permissions) return 0
    return Object.values(permissions).filter(Boolean).length
}

function apiRoleToModel(r) {
    return {
        id: r.id,
        nome_papel: r.nome_papel ? r.nome_papel.charAt(0).toUpperCase() + r.nome_papel.slice(1) : '',
        descricao: r.descricao || '',
        color: (r.badge && r.badge.startsWith('bg-')) ? r.badge : 'bg-gray-100 text-gray-700 dark:bg-gray-500/25 dark:text-gray-200',
        users: parseInt(r.total_usuarios) || 0,
        permissions: {
            dashboard:     !!r.ver_dashboard,
            clientes:      !!r.ver_clientes,
            produtos:      !!r.ver_produtos,
            pedidos:       !!r.ver_pedidos,
            categorias:    !!r.ver_categorias,
            papeis:        !!r.ver_admin,
            curriculos:    !!r.ver_curriculos,
            trabalhos:     !!r.ver_trabalhos,
            cupons:        !!r.ver_cupons,
            relatorios:    !!r.ver_relatorios,
            customizacao:  !!r.ver_customizacao,
            marketing:     !!r.ver_marketing,
            usuarios:      !!r.ver_usuarios,
            configuracoes: !!r.ver_configuracoes,
        }
    }
}

export default function AdminRoles() {
    const { data: roles, setData: setRoles, loading } = useAdminData(
        'admin_roles',
        async () => { const { data } = await getRolesApi(); return data.roles.map(apiRoleToModel) }
    )
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form, setForm] = useState(buildEmptyForm())
    const [expanded, setExpanded] = useState(null)
    const [toast, setToast] = useState(null)
    const [confirmRoleId, setConfirmRoleId] = useState(null)


    function openCreate() {
        setEditing(null)
        setForm(buildEmptyForm())
        setShowModal(true)
    }

    function openEdit(role) {
        setEditing(role.id)
        const perms = Object.fromEntries(SECTIONS.map(s => [s.key, role.permissions[s.key] ?? false]))
        setForm({ nome_papel: role.nome_papel, descricao: role.descricao, color: role.color, permissions: perms })
        setShowModal(true)
    }

    function closeModal() {
        setShowModal(false)
        setEditing(null)
        setForm(buildEmptyForm())
    }

    async function handleSubmit(e) {
        e.preventDefault()
        if (!form.nome_papel) return
        const payload = {
            nome_papel:       form.nome_papel,
            badge:            form.color,
            descricao:        form.descricao,
            ver_dashboard:    form.permissions.dashboard     ? '1' : '0',
            ver_clientes:     form.permissions.clientes      ? '1' : '0',
            ver_categorias:   form.permissions.categorias    ? '1' : '0',
            ver_produtos:     form.permissions.produtos      ? '1' : '0',
            ver_pedidos:      form.permissions.pedidos       ? '1' : '0',
            ver_admin:        form.permissions.papeis        ? '1' : '0',
            ver_curriculos:   form.permissions.curriculos    ? '1' : '0',
            ver_trabalhos:    form.permissions.trabalhos     ? '1' : '0',
            ver_cupons:       form.permissions.cupons        ? '1' : '0',
            ver_relatorios:   form.permissions.relatorios    ? '1' : '0',
            ver_customizacao: form.permissions.customizacao  ? '1' : '0',
            ver_marketing:    form.permissions.marketing     ? '1' : '0',
            ver_usuarios:     form.permissions.usuarios      ? '1' : '0',
            ver_configuracoes:form.permissions.configuracoes ? '1' : '0',
        }
        if (editing) {
            try {
                await updateRole(editing, payload)
                setRoles(prev => prev.map(r => r.id === editing
                    ? { ...r, nome_papel: form.nome_papel, descricao: form.descricao, color: form.color, permissions: { ...form.permissions } }
                    : r
                ))
                setToast({ message: 'Papel editado com sucesso', type: 'success' })
            } catch (err) {
                setToast({ message: err.response?.data?.error || 'Erro ao editar papel', type: 'error' })
                return
            }
            
        } else {
            try {
                const { data } = await createRole(payload)
                setRoles(prev => [...prev, apiRoleToModel({ ...data.role })])
                setToast({ message: 'Papel criado com sucesso', type: 'success' })
            } catch (err) {
                setToast({ message: err.response?.data?.error || 'Erro ao criar papel', type: 'error' })
                return
            }
        }
        closeModal()
    }

    function deleteRole(id) {
        setRoles(prev => prev.filter(r => r.id !== id))
        setToast({ message: 'Papel removido', type: 'success' })
    }

    function togglePerm(section) {
        setForm(prev => ({
            ...prev,
            permissions: { ...prev.permissions, [section]: !prev.permissions[section] }
        }))
    }

    function toggleAllPerms() {
        setForm(prev => ({ ...prev, permissions: permCount(prev.permissions) === SECTIONS.length ? emptyPerms() : fullPerms() }))
    }

    return (
        <main>
            <AdminHeader title="Papéis e Permissões" description="Defina os papéis do sistema e controle o que cada um pode acessar." />

            <div className="mt-5 flex items-center justify-between mb-4">
                <span className="text-sm text-gray-400 dark:text-(--admin-text-muted)">{roles.filter(r => r.nome_papel.toLowerCase() !== 'cliente').length} papel(is) cadastrado(s)</span>
                <button onClick={openCreate}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-verde-escuro text-white text-sm font-medium hover:opacity-90 transition-all">
                    <Plus size={15} />
                    Novo papel
                </button>
            </div>

            <div className="flex flex-col gap-4">
                {loading && roles.length === 0 && Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-5 animate-pulse">
                        <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-(--admin-hover) shrink-0" />
                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex items-center gap-2">
                                    <div className="h-4 bg-gray-200 dark:bg-(--admin-hover) rounded w-28" />
                                    <div className="h-5 bg-gray-200 dark:bg-(--admin-hover) rounded-full w-16" />
                                </div>
                                <div className="h-3 bg-gray-100 dark:bg-(--admin-border) rounded w-3/4" />
                                <div className="flex gap-4 mt-1">
                                    <div className="h-3 bg-gray-100 dark:bg-(--admin-border) rounded w-20" />
                                    <div className="h-3 bg-gray-100 dark:bg-(--admin-border) rounded w-24" />
                                </div>
                            </div>
                            <div className="flex gap-1 shrink-0">
                                {Array.from({ length: 3 }).map((_, j) => (
                                    <div key={j} className="w-7 h-7 rounded-md bg-gray-100 dark:bg-(--admin-hover)" />
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                {roles.filter(r => r.nome_papel.toLowerCase() !== 'cliente').map(role => (
                    <div key={role.id} className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) overflow-hidden">
                        <div className="p-5 flex items-start gap-4">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-(--admin-hover) flex items-center justify-center text-gray-400 dark:text-(--admin-text-muted) shrink-0">
                                <Shield size={18} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{role.nome_papel}</h3>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${role.color}`}>{role.nome_papel}</span>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-(--admin-text-muted) leading-relaxed">{role.descricao || 'Sem descrição.'}</p>
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
                                <button onClick={() => setConfirmRoleId(role.id)}
                                    className="p-1.5 rounded-md hover:bg-red-950/40 transition-all text-gray-400 dark:text-(--admin-text-muted) hover:text-red-500">
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>

                        {expanded === role.id && (
                            <div className="border-t border-gray-100 dark:border-(--admin-border) px-5 pb-5 pt-4">
                                <p className="text-xs text-gray-400 dark:text-(--admin-text-muted) font-medium mb-3 uppercase tracking-wide">Permissões</p>
                                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                    {SECTIONS.map(s => (
                                        <div key={s.key} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium
                                            ${role.permissions[s.key]
                                                ? 'bg-green-50 dark:bg-green-900/20 text-verde-escuro dark:text-(--admin-accent)'
                                                : 'bg-gray-50 dark:bg-(--admin-hover) text-gray-400 dark:text-(--admin-text-muted)'
                                            }`}>
                                            {role.permissions[s.key]
                                                ? <Check size={12} />
                                                : <X size={12} />
                                            }
                                            {s.label}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}

                {!loading && roles.length === 0 && (
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
                                        value={form.nome_papel}
                                        onChange={e => { const v = e.target.value; setForm(prev => ({ ...prev, nome_papel: v.charAt(0).toUpperCase() + v.slice(1) })) }}
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
                                {form.nome_papel && (
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${form.color}`}>
                                        {form.nome_papel}
                                    </span>
                                )}
                            </div>

                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-500 dark:text-(--admin-text-muted)">Descrição</label>
                                <textarea
                                    value={form.descricao}
                                    onChange={e => setForm(prev => ({ ...prev, descricao: e.target.value }))}
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
                                        {permCount(form.permissions) === SECTIONS.length ? 'Remover todas' : 'Selecionar todas'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    {SECTIONS.map(s => {
                                        const on = form.permissions[s.key]
                                        return (
                                            <button key={s.key} type="button" onClick={() => togglePerm(s.key)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-xl border text-xs font-medium transition-all
                                                    ${on
                                                        ? 'border-verde-escuro/30 bg-green-50 dark:bg-green-900/20 dark:border-green-700/40 text-verde-escuro dark:text-(--admin-accent)'
                                                        : 'border-gray-200 dark:border-(--admin-border) text-gray-500 dark:text-(--admin-text-muted) hover:bg-gray-50 dark:hover:bg-(--admin-hover)'
                                                    }`}>
                                                {s.label}
                                                <div className={`relative w-9 h-5 rounded-full transition-all shrink-0 ${on ? 'bg-verde-escuro' : 'bg-gray-200 dark:bg-(--admin-border)'}`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all ${on ? 'left-4.5' : 'left-0.5'}`} />
                                                </div>
                                            </button>
                                        )
                                    })}
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

            {confirmRoleId && (
                <ConfirmDialog
                    title="Excluir papel"
                    message="Este papel será removido permanentemente. Deseja continuar?"
                    confirmLabel="Excluir"
                    onConfirm={() => { deleteRole(confirmRoleId); setConfirmRoleId(null) }}
                    onCancel={() => setConfirmRoleId(null)}
                />
            )}

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
