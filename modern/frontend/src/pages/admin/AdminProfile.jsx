import { useState, useEffect } from 'react'
import AdminHeader from "../../components/admin/AdminHeader"
import Toast from '../../components/Toast'
import { Loader2, Check, Eye, EyeOff, Lock, Mail, Phone, User, Briefcase } from 'lucide-react'
import { getProfile, updateProfile, changePassword } from '../../lib/api/profile'

function maskPhone(val) {
    const d = (val || '').replace(/\D/g, '').slice(0, 11)
    if (d.length <= 2) return d
    if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
    return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

const inputClass = "border border-gray-200 dark:border-(--admin-border) dark:bg-(--admin-input) dark:text-(--admin-text) rounded-xl px-4 py-2.5 text-sm outline-none focus:border-verde-escuro dark:focus:border-(--admin-accent) transition-all w-full"
const labelClass = "text-sm text-gray-500 dark:text-(--admin-text-muted) mb-1 block"

function Section({ title, children }) {
    return (
        <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6 flex flex-col gap-5">
            <h2 className="font-bold text-verde-escuro dark:text-(--admin-accent) text-base">{title}</h2>
            {children}
        </div>
    )
}

export default function AdminProfile() {
    const [loading, setLoading] = useState(true)
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
    const [toast, setToast] = useState(null)
    const [savingInfo, setSavingInfo] = useState(false)
    const [savingPass, setSavingPass] = useState(false)

    const [info, setInfo] = useState({ name: '', email: '', phone: '', role: '' })
    const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' })
    const [passError, setPassError] = useState('')

    useEffect(() => {
        getProfile()
            .then(({ data }) => {
                const p = data.profile
                setInfo({
                    name:  p.nome  || '',
                    email: p.email || '',
                    phone: maskPhone(p.tel || ''),
                    role:  p.nome_papel || '',
                })
            })
            .catch(() => setToast({ message: 'Erro ao carregar perfil', type: 'error' }))
            .finally(() => setLoading(false))
    }, [])

    async function handleSave(e) {
        e.preventDefault()
        setSavingInfo(true)
        try {
            const { data } = await updateProfile({ nome: info.name, email: info.email, tel: info.phone.replace(/\D/g, '') })
            const p = data.profile
            setInfo({ name: p.nome, email: p.email, phone: p.tel || '', role: p.nome_papel })
            setToast({ message: 'Perfil atualizado com sucesso', type: 'success' })
        } catch (err) {
            setToast({ message: err.response?.data?.error || 'Erro ao salvar perfil', type: 'error' })
        } finally {
            setSavingInfo(false)
        }
    }

    async function handlePasswordSave(e) {
        e.preventDefault()
        setPassError('')
        if (passwords.new.length < 8) return setPassError('A nova senha precisa ter ao menos 8 caracteres.')
        if (passwords.new !== passwords.confirm) return setPassError('As senhas não coincidem.')
        setSavingPass(true)
        try {
            await changePassword({ senha_atual: passwords.current, senha_nova: passwords.new, senha_confirma: passwords.confirm })
            setPasswords({ current: '', new: '', confirm: '' })
            setToast({ message: 'Senha alterada com sucesso', type: 'success' })
        } catch (err) {
            setPassError(err.response?.data?.error || 'Erro ao alterar senha')
        } finally {
            setSavingPass(false)
        }
    }

    function toggleShow(field) {
        setShowPass(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const initials = info.name.split(' ').map(w => w[0]).filter(Boolean).slice(0, 2).join('').toUpperCase()

    if (loading) {
        return (
            <main>
                <AdminHeader title="Meu Perfil" description="Gerencie suas informações pessoais e de acesso." />
                <div className="mt-10 flex justify-center">
                    <Loader2 size={28} className="animate-spin text-gray-400 dark:text-(--admin-text-muted)" />
                </div>
            </main>
        )
    }

    return (
        <main>
            <AdminHeader title="Meu Perfil" description="Gerencie suas informações pessoais e de acesso." />

            <div className="mt-5 flex flex-col gap-5">

                <div className="bg-white dark:bg-(--admin-card) rounded-2xl border border-gray-200 dark:border-(--admin-border) p-6">
                    <div className="flex items-center gap-6">
                        <div className="w-20 h-20 rounded-full bg-verde-escuro dark:bg-(--admin-accent-soft) flex items-center justify-center shrink-0">
                            <span className="text-white dark:text-(--admin-accent) text-2xl font-bold">{initials}</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 dark:text-(--admin-text)">{info.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-(--admin-text-muted)">{info.role}</p>
                            <p className="text-sm text-gray-400 dark:text-(--admin-text-muted) mt-0.5">{info.email}</p>
                        </div>
                    </div>
                </div>

                <Section title="Informações pessoais">
                    <form onSubmit={handleSave} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><User size={13} /> Nome completo</span>
                                </label>
                                <input type="text" value={info.name} onChange={e => setInfo(p => ({ ...p, name: e.target.value }))} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Briefcase size={13} /> Cargo</span>
                                </label>
                                <input type="text" value={info.role} className={`${inputClass} opacity-60 cursor-not-allowed`} readOnly />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Mail size={13} /> Email</span>
                                </label>
                                <input type="email" value={info.email} onChange={e => setInfo(p => ({ ...p, email: e.target.value }))} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Phone size={13} /> Telefone</span>
                                </label>
                                <input type="text" value={info.phone} onChange={e => setInfo(p => ({ ...p, phone: maskPhone(e.target.value) }))} className={inputClass} placeholder="(11) 99999-9999" />
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <button type="submit" disabled={savingInfo}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                {savingInfo ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                                Salvar alterações
                            </button>
                        </div>
                    </form>
                </Section>

                <Section title="Alterar senha">
                    <form onSubmit={handlePasswordSave} className="flex flex-col gap-4">
                        {[
                            { field: 'current', label: 'Senha atual' },
                            { field: 'new',     label: 'Nova senha' },
                            { field: 'confirm', label: 'Confirmar nova senha' },
                        ].map(({ field, label }) => (
                            <div key={field}>
                                <label className={labelClass}>
                                    <span className="flex items-center gap-1.5"><Lock size={13} /> {label}</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPass[field] ? 'text' : 'password'}
                                        value={passwords[field]}
                                        onChange={e => setPasswords(p => ({ ...p, [field]: e.target.value }))}
                                        className={`${inputClass} pr-10`}
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => toggleShow(field)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-(--admin-text-muted) hover:text-gray-600 dark:hover:text-(--admin-text) transition-all"
                                    >
                                        {showPass[field] ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                </div>
                            </div>
                        ))}

                        {passError && (
                            <p className="text-sm text-red-500 dark:text-red-400">{passError}</p>
                        )}

                        <div className="flex justify-end">
                            <button type="submit" disabled={savingPass}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-verde-escuro dark:bg-(--admin-accent) text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-60">
                                {savingPass ? <Loader2 size={14} className="animate-spin" /> : <Lock size={14} />}
                                Alterar senha
                            </button>
                        </div>
                    </form>
                </Section>

            </div>

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </main>
    )
}
